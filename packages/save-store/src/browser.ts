import { gameSessionSchema, type GameSession } from "@brass-ledger/shared";

import {
  InvalidSessionIdError,
  LockTimeoutError,
  RevisionMismatchError,
  SaveStoreCorruptError,
  SaveStoreIOError,
  SessionExistsError,
  SessionNotFoundError,
  type SaveStore,
} from "./contracts.js";
import { migrateSessionPayload } from "./migrations.js";

export * from "./contracts.js";

const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertSessionId(sessionId: string) {
  if (!sessionIdPattern.test(sessionId)) throw new InvalidSessionIdError(sessionId);
}

interface LockManagerLike {
  request<T>(
    name: string,
    options: { mode: "exclusive" },
    callback: () => Promise<T>,
  ): Promise<T>;
}

function browserLockManager(): LockManagerLike | undefined {
  const navigatorObject = globalThis.navigator as
    | (Navigator & { locks?: LockManagerLike })
    | undefined;
  return navigatorObject?.locks;
}

const LOCK_KEY = "brass-ledger-saves:lock";
const LOCK_LEASE_MS = 4_000;
const LOCK_ACQUIRE_TIMEOUT_MS = 8_000;
const LOCK_POLL_MIN_MS = 15;
const LOCK_POLL_MAX_MS = 60;

interface LockRecord {
  token: string;
  expiresAt: number;
}

function randomToken(): string {
  const cryptoObject = globalThis.crypto as Crypto | undefined;
  if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLockRecord(storage: Storage): LockRecord | null {
  let raw: string | null;
  try {
    raw = storage.getItem(LOCK_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LockRecord>;
    if (typeof parsed.token === "string" && typeof parsed.expiresAt === "number") {
      return { token: parsed.token, expiresAt: parsed.expiresAt };
    }
  } catch {
    // Not a lock record we understand; treat as unlocked rather than wedging every tab.
  }
  return null;
}

function writeLockRecord(storage: Storage, record: LockRecord | null): void {
  // Deliberately does not catch: a real write failure (quota exceeded, Safari
  // private-browsing restrictions, ...) must reach the caller so it can be
  // surfaced immediately instead of masked behind 8s of pointless polling
  // that can only ever end in a misleading LockTimeoutError.
  if (record) storage.setItem(LOCK_KEY, JSON.stringify(record));
  else storage.removeItem(LOCK_KEY);
}

function jitterDelayMs(): number {
  return LOCK_POLL_MIN_MS + Math.random() * (LOCK_POLL_MAX_MS - LOCK_POLL_MIN_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cross-tab-safe mutex over localStorage alone, used when the Web Locks API is
 * unavailable. Each tab holds a *distinct* `Storage` object, so no in-process
 * state (a WeakMap, a Promise queue) can coordinate them - the lock has to live
 * in the storage itself. This relies on the HTML Standard's per-origin
 * "storage mutex", which serializes localStorage access across every same-
 * origin browsing context: a write-then-read-back of a unique token is
 * therefore a valid compare-and-swap, even across tabs. A short lease bounds
 * how long a lock can wedge other tabs if its owning tab is closed, crashes,
 * or is suspended mid-operation.
 *
 * A lease alone is not enough: if a holder's operation runs long enough for
 * its lease to expire, another tab can legitimately take over while the first
 * tab is still mid-write, and both would otherwise commit. Callers must call
 * the returned `assertStillLocked` immediately before their mutating write so
 * a lease that expired out from under them fails loudly instead of silently
 * losing an update (a "fencing token" check, not just an acquire-time one).
 */
async function acquireStorageLock(
  storage: Storage,
  sessionId: string,
): Promise<{ token: string; assertStillLocked: () => void }> {
  const token = randomToken();
  const deadline = Date.now() + LOCK_ACQUIRE_TIMEOUT_MS;
  for (;;) {
    const now = Date.now();
    const current = readLockRecord(storage);
    if (!current || current.expiresAt <= now) {
      try {
        writeLockRecord(storage, { token, expiresAt: now + LOCK_LEASE_MS });
      } catch (error) {
        throw new SaveStoreIOError("acquire the lock for", sessionId, { cause: error });
      }
      const confirmed = readLockRecord(storage);
      if (confirmed?.token === token) {
        return {
          token,
          assertStillLocked: () => {
            const held = readLockRecord(storage);
            if (held?.token !== token || held.expiresAt <= Date.now()) {
              throw new LockTimeoutError(sessionId);
            }
          },
        };
      }
    }
    if (Date.now() >= deadline) throw new LockTimeoutError(sessionId);
    await sleep(jitterDelayMs());
  }
}

function releaseStorageLock(storage: Storage, token: string) {
  try {
    const current = readLockRecord(storage);
    if (current?.token === token) writeLockRecord(storage, null);
  } catch {
    // Best-effort: a failed release just lets the lease expire naturally.
  }
}

async function withFallbackLock<T>(
  storage: Storage,
  sessionId: string,
  operation: (assertStillLocked: () => void) => Promise<T>,
): Promise<T> {
  const { token, assertStillLocked } = await acquireStorageLock(storage, sessionId);
  try {
    return await operation(assertStillLocked);
  } finally {
    releaseStorageLock(storage, token);
  }
}

const noopAssertStillLocked = () => {};

async function withStorageLock<T>(
  storage: Storage,
  sessionId: string,
  operation: (assertStillLocked: () => void) => Promise<T>,
): Promise<T> {
  const locks = browserLockManager();
  if (locks) {
    // A native Web Locks hold is not lease-based - the browser holds it until
    // release, so there is nothing for the fencing check to verify.
    return locks.request("brass-ledger-save-store", { mode: "exclusive" }, () =>
      operation(noopAssertStillLocked));
  }
  return withFallbackLock(storage, sessionId, operation);
}

export function createBrowserSaveStore(_storage?: Storage): SaveStore {
  const storage = _storage ?? globalThis.localStorage;
  const key = "brass-ledger-saves";

  function readAll(): { sessions: Map<string, GameSession>; hasCorruption: boolean } {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      throw new SaveStoreIOError("read", null, { cause: error });
    }
    if (!raw) return { sessions: new Map(), hasCorruption: false };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new SaveStoreCorruptError(null, undefined, { cause: error });
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new SaveStoreCorruptError(null);
    }

    const sessions = new Map<string, GameSession>();
    let hasCorruption = false;
    for (const [id, entry] of Object.entries(parsed)) {
      const result = gameSessionSchema.safeParse(migrateSessionPayload(entry));
      if (result.success && result.data.id === id) sessions.set(id, result.data);
      else hasCorruption = true;
    }
    return { sessions, hasCorruption };
  }

  function writeAll(sessions: Map<string, GameSession>) {
    const object: Record<string, GameSession> = {};
    for (const [id, session] of sessions) object[id] = session;
    try {
      storage.setItem(key, JSON.stringify(object));
    } catch (error) {
      throw new SaveStoreIOError("write", null, { cause: error });
    }
  }

  function assertSafeToMutate(hasCorruption: boolean) {
    if (hasCorruption) {
      throw new SaveStoreCorruptError(
        null,
        "The save store contains corrupt entries and was not overwritten",
      );
    }
  }

  return {
    async create(session: GameSession) {
      assertSessionId(session.id);
      await withStorageLock(storage, session.id, async (assertStillLocked) => {
        const { sessions, hasCorruption } = readAll();
        assertSafeToMutate(hasCorruption);
        if (sessions.has(session.id)) throw new SessionExistsError(session.id);
        sessions.set(session.id, gameSessionSchema.parse(session));
        assertStillLocked();
        writeAll(sessions);
      });
    },

    async read(sessionId: string) {
      assertSessionId(sessionId);
      const { sessions, hasCorruption } = readAll();
      const session = sessions.get(sessionId);
      if (!session && hasCorruption) throw new SaveStoreCorruptError(sessionId);
      if (!session) throw new SessionNotFoundError(sessionId);
      return session;
    },

    async write(session: GameSession, expectedRevision?: number) {
      assertSessionId(session.id);
      await withStorageLock(storage, session.id, async (assertStillLocked) => {
        const { sessions, hasCorruption } = readAll();
        assertSafeToMutate(hasCorruption);
        const current = sessions.get(session.id);
        if (expectedRevision !== undefined) {
          if (!current) throw new SessionNotFoundError(session.id);
          if (current.revision !== expectedRevision) {
            throw new RevisionMismatchError(expectedRevision, current.revision);
          }
        }
        sessions.set(session.id, gameSessionSchema.parse(session));
        assertStillLocked();
        writeAll(sessions);
      });
    },

    async delete(sessionId: string) {
      assertSessionId(sessionId);
      await withStorageLock(storage, sessionId, async (assertStillLocked) => {
        const { sessions, hasCorruption } = readAll();
        assertSafeToMutate(hasCorruption);
        if (!sessions.has(sessionId)) throw new SessionNotFoundError(sessionId);
        sessions.delete(sessionId);
        assertStillLocked();
        writeAll(sessions);
      });
    },

    async list() {
      const { sessions } = readAll();
      return [...sessions.values()].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
    },
  };
}
