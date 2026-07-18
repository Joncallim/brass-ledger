import { gameSessionSchema, type GameSession } from "@brass-ledger/shared";

import {
  InvalidSessionIdError,
  RevisionMismatchError,
  SaveStoreCorruptError,
  SaveStoreIOError,
  SessionExistsError,
  SessionNotFoundError,
  type SaveStore,
} from "./contracts.js";

export * from "./contracts.js";

const storageQueues = new WeakMap<Storage, Promise<void>>();
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

async function withFallbackLock<T>(storage: Storage, operation: () => Promise<T>): Promise<T> {
  const previous = storageQueues.get(storage) ?? Promise.resolve();
  let resolveNext: () => void = () => {};
  const next = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });
  storageQueues.set(storage, next);

  await previous.catch(() => undefined);
  try {
    return await operation();
  } finally {
    resolveNext();
    if (storageQueues.get(storage) === next) storageQueues.delete(storage);
  }
}

async function withStorageLock<T>(storage: Storage, operation: () => Promise<T>): Promise<T> {
  const locks = browserLockManager();
  if (locks) {
    return locks.request("brass-ledger-save-store", { mode: "exclusive" }, operation);
  }
  return withFallbackLock(storage, operation);
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
      const result = gameSessionSchema.safeParse(entry);
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
      await withStorageLock(storage, async () => {
        const { sessions, hasCorruption } = readAll();
        assertSafeToMutate(hasCorruption);
        if (sessions.has(session.id)) throw new SessionExistsError(session.id);
        sessions.set(session.id, gameSessionSchema.parse(session));
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
      await withStorageLock(storage, async () => {
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
        writeAll(sessions);
      });
    },

    async delete(sessionId: string) {
      assertSessionId(sessionId);
      await withStorageLock(storage, async () => {
        const { sessions, hasCorruption } = readAll();
        assertSafeToMutate(hasCorruption);
        if (!sessions.has(sessionId)) throw new SessionNotFoundError(sessionId);
        sessions.delete(sessionId);
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
