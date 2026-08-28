import { access, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { constants, copyFileSync, existsSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { gameSessionSchema, type GameSession } from "@brass-ledger/shared";
import { lock as acquireFileLock } from "proper-lockfile";

import { migrateSessionPayload } from "./migrations.js";

import {
  InvalidSessionIdError,
  LockTimeoutError,
  RevisionMismatchError,
  SaveStoreCorruptError,
  SaveStoreIOError,
  SessionExistsError,
  SessionNotFoundError,
  type SaveRecord,
  type SaveStore,
} from "./contracts.js";

export * from "./contracts.js";
export { migrateSessionPayload } from "./migrations.js";

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

  const result = gameSessionSchema.safeParse(migrateSessionPayload(parsed));
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
      const records = await this.listRecords();
      return records
        .filter((record): record is SaveRecord & { status: "healthy"; session: GameSession } =>
          record.status === "healthy" && record.session !== undefined,
        )
        .map((record) => record.session)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },

    async listRecords() {
      await ensureStore();
      let files: string[];
      try {
        files = (await readdir(dataDir)).filter((entry) => entry.endsWith(".json"));
      } catch (error) {
        throw new SaveStoreIOError("list", null, { cause: error });
      }

      const records: SaveRecord[] = [];
      for (const fileName of files) {
        const sessionId = fileName.slice(0, -".json".length);
        try {
          const session = await readSessionFile(path.join(dataDir, fileName), sessionId);
          records.push({ id: sessionId, fileName, status: "healthy", session });
        } catch (error) {
          if (error instanceof SaveStoreCorruptError || error instanceof SessionNotFoundError) {
            let status: SaveRecord["status"] = "corrupt";
            try {
              const raw = await readFile(path.join(dataDir, fileName), "utf8");
              const parsed = JSON.parse(raw) as { saveFormatVersion?: unknown };
              if (
                parsed &&
                typeof parsed === "object" &&
                "saveFormatVersion" in parsed &&
                parsed.saveFormatVersion !== "8"
              ) {
                status = "incompatible";
              }
            } catch {
              // It is already a corrupt record. Do not let an inspection failure hide it.
            }
            records.push({
              id: sessionId,
              fileName,
              status,
              reason: status === "incompatible"
                ? "This campaign was saved by an unsupported Brass Ledger version and was not opened."
                : "This campaign file is damaged or incomplete and was not opened.",
            });
            continue;
          }
          throw error;
        }
      }
      return records.sort((left, right) =>
        (right.session?.updatedAt ?? "").localeCompare(left.session?.updatedAt ?? ""),
      );
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
  const destination = resolveDefaultSaveDir();
  // Once the durable location contains any records it is authoritative.  This
  // prevents a repository checkout or a replaced release folder from taking
  // ownership back on a later launch.
  try {
    if (existsSync(destination) && readdirSync(destination).some((entry) => entry.endsWith(".json"))) return destination;
  } catch {
    return destination;
  }
  for (const candidate of legacyCandidates) {
    try {
      if (path.resolve(candidate) !== path.resolve(destination) && existsSync(candidate)) {
        const entries = readdirSync(candidate).filter((entry) => entry.endsWith(".json"));
        if (entries.length > 0) {
          mkdirSync(destination, { recursive: true });
          for (const entry of entries) {
            const source = path.join(candidate, entry);
            const target = path.join(destination, entry);
            if (existsSync(target)) continue;
            const staging = `${target}.migration-${process.pid}-${Date.now()}`;
            copyFileSync(source, staging);
            renameSync(staging, target);
          }
          return destination;
        }
      }
    } catch {
      // Keep the destination authoritative; a later startup can retry a
      // partially completed copy without ever serving directly from legacy.
    }
  }
  return destination;
}

export function isSaveStoreError(error: unknown): boolean {
  return isStorageError(error);
}
