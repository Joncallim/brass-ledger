import { access, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { constants, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { gameSessionSchema, type GameSession } from "@brass-ledger/shared";
import { lock as acquireFileLock } from "proper-lockfile";

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

export * from "./contracts.js";

const sessionIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const lockQueues = new Map<string, Promise<void>>();

function assertSessionId(sessionId: string) {
  if (!sessionIdPattern.test(sessionId)) {
    throw new InvalidSessionIdError(sessionId);
  }
}

function sessionPath(dataDir: string, sessionId: string) {
  assertSessionId(sessionId);
  return path.join(dataDir, `${sessionId}.json`);
}

function isErrno(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === code;
}

function isStorageError(error: unknown): boolean {
  return (
    error instanceof SessionNotFoundError ||
    error instanceof InvalidSessionIdError ||
    error instanceof SessionExistsError ||
    error instanceof RevisionMismatchError ||
    error instanceof LockTimeoutError ||
    error instanceof SaveStoreCorruptError ||
    error instanceof SaveStoreIOError
  );
}

async function acquireSessionLock(
  destination: string,
  sessionId: string,
): Promise<() => Promise<void>> {
  const key = path.resolve(destination);
  const previous = lockQueues.get(key) ?? Promise.resolve();
  let resolveNext: () => void = () => {};
  const next = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });
  lockQueues.set(key, next);

  await previous.catch(() => undefined);

  let compromised: Error | undefined;
  let releaseFileLock: (() => Promise<void>) | undefined;
  try {
    releaseFileLock = await acquireFileLock(destination, {
      realpath: false,
      stale: 10_000,
      update: 2_000,
      retries: {
        retries: 500,
        factor: 1,
        minTimeout: 20,
        maxTimeout: 50,
        randomize: true,
      },
      onCompromised(error) {
        compromised = error;
      },
    });
  } catch (error) {
    resolveNext();
    if (lockQueues.get(key) === next) lockQueues.delete(key);
    if (isErrno(error, "ELOCKED")) throw new LockTimeoutError(sessionId);
    throw new SaveStoreIOError("acquire the lock for", sessionId, { cause: error });
  }

  let released = false;
  return async () => {
    if (released) return;
    released = true;
    let releaseError: unknown;
    try {
      await releaseFileLock();
    } catch (error) {
      releaseError = error;
    } finally {
      resolveNext();
      if (lockQueues.get(key) === next) lockQueues.delete(key);
    }

    if (compromised) {
      throw new SaveStoreIOError("maintain the lock for", sessionId, {
        cause: compromised,
      });
    }
    if (releaseError) {
      throw new SaveStoreIOError("release the lock for", sessionId, {
        cause: releaseError,
      });
    }
  };
}

async function withSessionLock<T>(
  destination: string,
  sessionId: string,
  operation: () => Promise<T>,
): Promise<T> {
  const release = await acquireSessionLock(destination, sessionId);
  let operationFailed = false;
  try {
    return await operation();
  } catch (error) {
    operationFailed = true;
    throw error;
  } finally {
    try {
      await release();
    } catch (error) {
      if (!operationFailed) throw error;
    }
  }
}

async function readSessionFile(destination: string, sessionId: string): Promise<GameSession> {
  let raw: string;
  try {
    raw = await readFile(destination, "utf8");
  } catch (error) {
    if (isErrno(error, "ENOENT")) throw new SessionNotFoundError(sessionId);
    throw new SaveStoreIOError("read", sessionId, { cause: error });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new SaveStoreCorruptError(sessionId, undefined, { cause: error });
  }

  const result = gameSessionSchema.safeParse(parsed);
  if (!result.success) {
    throw new SaveStoreCorruptError(sessionId, undefined, { cause: result.error });
  }
  if (result.data.id !== sessionId) {
    throw new SaveStoreCorruptError(
      sessionId,
      `Saved session ${sessionId} contains a different session id`,
    );
  }
  return result.data;
}

async function destinationExists(destination: string, sessionId: string): Promise<boolean> {
  try {
    await access(destination, constants.F_OK);
    return true;
  } catch (error) {
    if (isErrno(error, "ENOENT")) return false;
    throw new SaveStoreIOError("inspect", sessionId, { cause: error });
  }
}

async function writeSessionFile(destination: string, session: GameSession): Promise<void> {
  const validated = gameSessionSchema.parse(session);
  const tempPath = `${destination}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, JSON.stringify(validated, null, 2), "utf8");
    await rename(tempPath, destination);
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw new SaveStoreIOError("write", session.id, { cause: error });
  }
}

/**
 * Creates a filesystem-backed store with atomic temp-file replacement,
 * per-session in-process queues, cross-process locks with a heartbeat, and
 * optional compare-and-swap revision checks.
 */
export function createFileSystemSaveStore(saveDir: string): SaveStore {
  const dataDir = path.resolve(saveDir);

  async function ensureStore() {
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      throw new SaveStoreIOError("open", null, { cause: error });
    }
  }

  return {
    async create(session: GameSession) {
      await ensureStore();
      const destination = sessionPath(dataDir, session.id);
      await withSessionLock(destination, session.id, async () => {
        if (await destinationExists(destination, session.id)) {
          throw new SessionExistsError(session.id);
        }
        await writeSessionFile(destination, session);
      });
    },

    async read(sessionId: string) {
      await ensureStore();
      return readSessionFile(sessionPath(dataDir, sessionId), sessionId);
    },

    async write(session: GameSession, expectedRevision?: number) {
      await ensureStore();
      const destination = sessionPath(dataDir, session.id);
      await withSessionLock(destination, session.id, async () => {
        if (expectedRevision !== undefined) {
          const current = await readSessionFile(destination, session.id);
          if (current.revision !== expectedRevision) {
            throw new RevisionMismatchError(expectedRevision, current.revision);
          }
        }
        await writeSessionFile(destination, session);
      });
    },

    async delete(sessionId: string) {
      await ensureStore();
      const destination = sessionPath(dataDir, sessionId);
      await withSessionLock(destination, sessionId, async () => {
        if (!(await destinationExists(destination, sessionId))) {
          throw new SessionNotFoundError(sessionId);
        }
        try {
          await rm(destination);
        } catch (error) {
          if (isErrno(error, "ENOENT")) throw new SessionNotFoundError(sessionId);
          throw new SaveStoreIOError("delete", sessionId, { cause: error });
        }
      });
    },

    async list() {
      await ensureStore();
      let files: string[];
      try {
        files = (await readdir(dataDir)).filter((entry) => entry.endsWith(".json"));
      } catch (error) {
        throw new SaveStoreIOError("list", null, { cause: error });
      }

      const sessions: GameSession[] = [];
      for (const fileName of files) {
        const sessionId = fileName.slice(0, -".json".length);
        try {
          sessions.push(await readSessionFile(path.join(dataDir, fileName), sessionId));
        } catch (error) {
          if (error instanceof SaveStoreCorruptError || error instanceof SessionNotFoundError) {
            continue;
          }
          throw error;
        }
      }
      return sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
  };
}

export function resolveDefaultSaveDir(): string {
  if (process.env.BRASS_LEDGER_SAVE_DIR) {
    return path.resolve(process.env.BRASS_LEDGER_SAVE_DIR);
  }

  const appName = "Brass Ledger";
  const platform = process.platform;

  if (platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", appName, "saves");
  }
  if (platform === "linux") {
    const xdgDataHome = process.env.XDG_DATA_HOME;
    if (xdgDataHome) return path.join(xdgDataHome, "brass-ledger", "saves");
    return path.join(os.homedir(), ".local", "share", "brass-ledger", "saves");
  }
  if (platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, appName, "saves");
  }

  return path.join(os.homedir(), ".brass-ledger", "saves");
}

export function resolveSaveDirWithMigration(legacyCandidates: string[]): string {
  if (process.env.BRASS_LEDGER_SAVE_DIR) {
    return path.resolve(process.env.BRASS_LEDGER_SAVE_DIR);
  }
  for (const candidate of legacyCandidates) {
    try {
      if (existsSync(candidate)) {
        const entries = readdirSync(candidate);
        if (entries.some((entry) => entry.endsWith(".json"))) return candidate;
      }
    } catch {
      // An inaccessible legacy directory cannot be safely migrated.
    }
  }
  return resolveDefaultSaveDir();
}

export function isSaveStoreError(error: unknown): boolean {
  return isStorageError(error);
}
