import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, stat, utimes } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import {
  createFileSystemSaveStore,
  resolveDefaultSaveDir,
  InvalidSessionIdError,
  RevisionMismatchError,
  SaveStoreCorruptError,
  SaveStoreIOError,
  SessionNotFoundError,
  type SaveStore,
} from "./index.js";
import { createInitialGameSession, gameSessionSchema, type GameSession } from "@brass-ledger/shared";
import { soloScenario } from "@brass-ledger/content";
import { resolveTurn } from "@brass-ledger/sim";

function makeSession(overrides?: Partial<GameSession>): GameSession {
  const session = createInitialGameSession(soloScenario, "test-session-0000-0000-000000000000");
  return gameSessionSchema.parse({
    ...session,
    ...overrides,
  });
}

describe("FileSystemSaveStore CRUD", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-crud-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("creates and reads a session", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000001" });
    await store.create(session);
    const read = await store.read("00000000-0000-1000-8000-000000000001");
    assert.equal(read.id, session.id);
    assert.equal(read.revision, 0);
    assert.equal(read.saveFormatVersion, "5");
  });

  it("creating a duplicate session throws", async () => {
    const session = makeSession({ id: "00000000-0000-2000-8000-000000000002" });
    await store.create(session);
    await assert.rejects(() => store.create(session));
  });

  it("writes (updates) a session", async () => {
    const session = makeSession({ id: "00000000-0000-3000-8000-000000000003" });
    await store.create(session);
    const updated = { ...session, revision: 1, updatedAt: new Date().toISOString() };
    await store.write(updated);
    const read = await store.read("00000000-0000-3000-8000-000000000003");
    assert.equal(read.revision, 1);
  });

  it("deletes a session", async () => {
    const session = makeSession({ id: "00000000-0000-4000-8000-000000000004" });
    await store.create(session);
    await store.delete("00000000-0000-4000-8000-000000000004");
    await assert.rejects(() => store.read("00000000-0000-4000-8000-000000000004"));
  });

  it("lists sessions in reverse-chronological order", async () => {
    const s1 = makeSession({ id: "00000000-0000-5001-8000-000000000010", updatedAt: "2026-01-01T00:00:00.000Z" });
    const s2 = makeSession({ id: "00000000-0000-5002-8000-000000000011", updatedAt: "2026-02-01T00:00:00.000Z" });
    const s3 = makeSession({ id: "00000000-0000-5003-8000-000000000012", updatedAt: "2026-03-01T00:00:00.000Z" });
    await store.create(s1);
    await store.create(s2);
    await store.create(s3);
    const list = await store.list();
    const list3 = list.find((entry) => entry.id === "00000000-0000-5003-8000-000000000012");
    const list2 = list.find((entry) => entry.id === "00000000-0000-5002-8000-000000000011");
    const list1 = list.find((entry) => entry.id === "00000000-0000-5001-8000-000000000010");
    assert.ok(list3);
    assert.ok(list2);
    assert.ok(list1);
    const ourIds = [list3!.id, list2!.id, list1!.id];
    assert.deepStrictEqual(ourIds, [
      "00000000-0000-5003-8000-000000000012",
      "00000000-0000-5002-8000-000000000011",
      "00000000-0000-5001-8000-000000000010",
    ]);
  });

  it("throws on invalid session ID", async () => {
    await assert.rejects(() => store.read("../evil"), InvalidSessionIdError);
    await assert.rejects(
      () => store.write(makeSession({ id: "../evil" })),
      InvalidSessionIdError,
    );
  });

  it("throws when reading a non-existent session", async () => {
    await assert.rejects(
      () => store.read("ffffffff-ffff-1fff-8fff-ffffffffffff"),
      SessionNotFoundError,
    );
  });
});

describe("FileSystemSaveStore replay validation", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-replay-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("a campaign saved and resumed preserves replay hashes", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000020" });

    let current = session;
    const defaultSelections = soloScenario.memoTemplates.map((memo) => ({
      memoId: memo.id,
      optionId: memo.options[0].id,
    }));

    for (let turn = 1; turn <= 2; turn++) {
      const input = {
        turn,
        selectedActionIds: defaultSelections.map((s) => s.optionId),
        selections: defaultSelections,
        acceptedRiskOverrides: [],
        staffNegotiations: [],
      };
      const result = resolveTurn(soloScenario, current.state, input);
      current = gameSessionSchema.parse({
        ...current,
        state: result.nextState,
        turnInputs: [...current.turnInputs, input],
        history: [...current.history, result],
        revision: current.revision + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    await store.write(current);
    const resumed = await store.read("00000000-0000-1000-8000-000000000020");
    assert.equal(resumed.history.length, 2);
    assert.equal(resumed.history[0].replayHash, current.history[0].replayHash);
    assert.equal(resumed.history[1].replayHash, current.history[1].replayHash);
  });
});

describe("resolveDefaultSaveDir", () => {
  it("returns the BRASS_LEDGER_SAVE_DIR env var when set", async () => {
    process.env.BRASS_LEDGER_SAVE_DIR = "/custom/save/path";
    const dir = resolveDefaultSaveDir();
    assert.match(dir, /custom[/\\]save[/\\]path/);
    delete process.env.BRASS_LEDGER_SAVE_DIR;
  });

  it("returns a stable per-user path when env var is absent", () => {
    const dir = resolveDefaultSaveDir();
    assert.ok(dir.includes("Brass Ledger") || dir.includes("brass-ledger"));
  });
});

describe("File lock", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-lock-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("serializes concurrent writes with file lock", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000030", revision: 0 });
    await store.create(session);

    const writes = [];
    for (let i = 1; i <= 10; i++) {
      writes.push((async () => {
        const s = await store.read("00000000-0000-1000-8000-000000000030");
        // Simulate a read-modify-write cycle that races on the read side
        // but serialises on the write side due to the lock
        await store.write({ ...s, revision: i, updatedAt: new Date().toISOString() });
      })());
    }

    await Promise.all(writes);

    const final = await store.read("00000000-0000-1000-8000-000000000030");
    assert.ok(final.revision >= 1);
    assert.ok(final.revision <= 10);
  });
});

describe("Revision guard", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-revguard-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("rejects stale writes when expectedRevision does not match", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000040", revision: 0 });
    await store.create(session);
    await store.write({ ...session, revision: 1, updatedAt: new Date().toISOString() }, 0);
    await assert.rejects(() =>
      store.write({ ...session, revision: 1, updatedAt: new Date().toISOString() }, 0),
    );
  });

  it("accepts writes when expectedRevision matches current", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000041", revision: 3 });
    await store.create(session);
    await store.write({ ...session, revision: 4, updatedAt: new Date().toISOString() }, 3);
    const read = await store.read("00000000-0000-1000-8000-000000000041");
    assert.equal(read.revision, 4);
  });

  it("accepts write without expectedRevision (no guard)", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000042", revision: 0 });
    await store.create(session);
    await store.write({ ...session, revision: 1, updatedAt: new Date().toISOString() });
    const read = await store.read("00000000-0000-1000-8000-000000000042");
    assert.equal(read.revision, 1);
  });
});

describe("Cross-process lock", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-xproc-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("file lock prevents concurrent writes from a second store instance", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000050", revision: 0 });
    await store.create(session);
    const store2 = createFileSystemSaveStore(saveDir);

    await store.write({ ...session, revision: 1, updatedAt: new Date().toISOString() }, 0);
    await store2.write({ ...session, revision: 2, updatedAt: new Date().toISOString() }, 1);

    const read = await store.read("00000000-0000-1000-8000-000000000050");
    assert.equal(read.revision, 2);
  });
});

describe("resolveSaveDirWithMigration", () => {
  it("returns default when no legacy candidates have sessions", async () => {
    const { resolveSaveDirWithMigration } = await import("./index.js");
    const dir = resolveSaveDirWithMigration(["/tmp/does-not-exist-br-ledger"]);
    assert.ok(dir.includes("Brass Ledger") || dir.includes("brass-ledger"));
  });

  it("returns BRASS_LEDGER_SAVE_DIR override when set", async () => {
    process.env.BRASS_LEDGER_SAVE_DIR = "/custom/test/dir";
    const { resolveSaveDirWithMigration } = await import("./index.js");
    const dir = resolveSaveDirWithMigration(["/tmp/missing"]);
    assert.match(dir, /custom[/\\]test[/\\]dir/);
    delete process.env.BRASS_LEDGER_SAVE_DIR;
  });
});

describe("Child-process concurrency", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-child-"));
    store = createFileSystemSaveStore(saveDir);
    // Ensure dist is built so child workers can import it from a clean checkout
    const { execSync } = await import("node:child_process");
    const { fileURLToPath } = await import("node:url");
    const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..", "..");
    execSync("npm run build --workspace @brass-ledger/save-store", { cwd: repoRoot });
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("eight child processes all see a monotonically increasing revision", async () => {
    const { fork } = await import("node:child_process");
    const { writeFile, mkdir: mk } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000060", revision: 0 });
    await store.create(session);

    const childDir = path.join(saveDir, "child");
    await mk(childDir, { recursive: true });
    const childPath = path.join(childDir, "worker.mjs");
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(testDir, "..", "dist", "index.js");

    await writeFile(childPath, [
      `import { createFileSystemSaveStore } from ${JSON.stringify(distPath)};`,
      `const saveDir = ${JSON.stringify(saveDir)};`,
      `const store = createFileSystemSaveStore(saveDir);`,
      `const id = "00000000-0000-1000-8000-000000000060";`,
      `for (let i = 0; i < 5; i++) {`,
      `  while (true) {`,
      `    const s = await store.read(id);`,
      `    try {`,
      `      await store.write({ ...s, revision: s.revision + 1, updatedAt: new Date().toISOString() }, s.revision);`,
      `      break;`,
      `    } catch (e) {`,
      `      if (e.message && e.message.includes("revision mismatch")) continue;`,
      `      throw e;`,
      `    }`,
      `  }`,
      `}`,
      `process.exit(0);`,
    ].join("\n"), "utf8");

    const children: Promise<void>[] = [];
    for (let i = 0; i < 8; i++) {
      children.push(new Promise<void>((resolve, reject) => {
        const child = fork(childPath, {
          stdio: "pipe",
        });
        child.on("exit", (code, signal) => {
          code === 0 ? resolve() : reject(new Error(`child exit ${code} ${signal}`));
        });
        child.on("error", reject);
        child.stderr?.on("data", (d) => process.stderr.write(d));
      }));
    }

    await Promise.all(children);

    const final = await store.read("00000000-0000-1000-8000-000000000060");
    assert.equal(final.revision, 40);
  });
});

describe("Orphan lock cleanup", () => {
  let saveDir: string;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-orphan-"));
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("stale lock file does not block a fresh store instance", async () => {
    const lp = path.join(saveDir, "00000000-0000-1000-8000-000000000070.json.lock");
    await mkdir(lp);
    await utimes(lp, new Date(Date.now() - 120_000), new Date(Date.now() - 120_000));

    const store = createFileSystemSaveStore(saveDir);
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000070", revision: 0 });
    await store.create(session);
    const read = await store.read("00000000-0000-1000-8000-000000000070");
    assert.equal(read.revision, 0);
  });
});

describe("Lock resilience", () => {
  let saveDir: string;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-lockres-"));
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("does not steal a fresh lock and proceeds after its owner releases", async () => {
    const store = createFileSystemSaveStore(saveDir);
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000080", revision: 0 });
    const lp = path.join(saveDir, `${session.id}.json.lock`);
    await mkdir(lp);

    let settled = false;
    const create = store.create(session).finally(() => {
      settled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(settled, false);
    await rm(lp, { recursive: true });
    await create;

    const read = await store.read(session.id);
    assert.equal(read.revision, 0);
  });

  it("guarded write after delete rejects and does not resurrect the session", async () => {
    const store = createFileSystemSaveStore(saveDir);
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000082", revision: 5 });
    await store.create(session);
    await store.delete("00000000-0000-1000-8000-000000000082");

    const updated = { ...session, revision: 6, updatedAt: new Date().toISOString() };
    await assert.rejects(() => store.write(updated, 5), SessionNotFoundError);
    await assert.rejects(() => store.read(session.id), SessionNotFoundError);
  });
});

describe("Delete-vs-write CAS", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-delcas-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("write with expectedRevision rejects after delete and leaves the file absent", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000090", revision: 5 });
    await store.create(session);
    await store.delete("00000000-0000-1000-8000-000000000090");

    const updated = { ...session, revision: 6, updatedAt: new Date().toISOString() };
    await assert.rejects(() => store.write(updated, 5), SessionNotFoundError);
    await assert.rejects(() => stat(path.join(saveDir, `${session.id}.json`)), { code: "ENOENT" });
  });

  it("write with stale expectedRevision on existing file throws RevisionMismatchError", async () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000091", revision: 3 });
    await store.create(session);

    // Another write advances to rev 4
    await store.write({ ...session, revision: 4, updatedAt: new Date().toISOString() }, 3);

    // Writing with expectedRevision=3 on the now-rev-4 file should throw
    try {
      await store.write({ ...session, revision: 4, updatedAt: new Date().toISOString() }, 3);
      assert.fail("expected RevisionMismatchError");
    } catch (error) {
      assert.ok(error instanceof RevisionMismatchError);
      assert.equal(error.expectedRevision, 3);
      assert.equal(error.currentRevision, 4);
    }
  });

  it("delete a missing session throws SessionNotFoundError", async () => {
    try {
      await store.delete("ffffffff-ffff-1fff-8fff-ffffffffffff");
      assert.fail("expected SessionNotFoundError");
    } catch (error) {
      assert.ok(error instanceof SessionNotFoundError);
      assert.equal(error.sessionId, "ffffffff-ffff-1fff-8fff-ffffffffffff");
    }
  });
});

describe("Unreadable store", () => {
  it("list returns empty array when save directory does not exist", async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-unread-"));
    await rm(tmp, { recursive: true, force: true });
    const store = createFileSystemSaveStore(tmp);
    const list = await store.list();
    assert.deepStrictEqual(list, []);
  });

  it("list reports an inaccessible directory instead of pretending it is empty", async () => {
    if (process.platform === "win32") return;
    const tmp = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-noaccess-"));
    const store = createFileSystemSaveStore(tmp);
    await chmod(tmp, 0o000);
    try {
      await assert.rejects(() => store.list(), SaveStoreIOError);
    } finally {
      await chmod(tmp, 0o700);
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("read reports schema-invalid saves as corrupt", async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-corrupt-"));
    const id = "00000000-0000-1000-8000-000000000092";
    try {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(path.join(tmp, `${id}.json`), JSON.stringify({ id }), "utf8");
      const store = createFileSystemSaveStore(tmp);
      await assert.rejects(() => store.read(id), SaveStoreCorruptError);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});

describe("Typed error classes", () => {
  it("SessionNotFoundError carries the session id", async () => {
    const err = new SessionNotFoundError("test-id-1234");
    assert.equal(err.name, "SessionNotFoundError");
    assert.equal(err.sessionId, "test-id-1234");
    assert.ok(err.message.includes("test-id-1234"));
  });

  it("RevisionMismatchError carries expected and current", async () => {
    const err = new RevisionMismatchError(3, 7);
    assert.equal(err.name, "RevisionMismatchError");
    assert.equal(err.expectedRevision, 3);
    assert.equal(err.currentRevision, 7);
    assert.ok(err.message.includes("expected 3"));
    assert.ok(err.message.includes("current 7"));
  });
});
