import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, stat, utimes, writeFile } from "node:fs/promises";
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
  migrateSessionPayload,
  migrateLegacySaveFiles,
  type SaveStore,
} from "./index.js";
import { createInitialGameSession, gameSessionSchema, type GameSession } from "@brass-ledger/shared";
import { soloScenario } from "@brass-ledger/content";
import { previewTurn, resolveTurn } from "@brass-ledger/sim";

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
    assert.equal(read.saveFormatVersion, "8");
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

describe("Doctrine 4 mid-streak save/load", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-doctrine4-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  it("retains streak count, startedTurn, and refs across save/load; resumed resolution fires identically", async () => {
    const id = "00000000-0000-1000-8000-000000000040";
    const session = makeSession({ id });
    let current = session;
    const selections = [
      { memoId: "posture", optionId: "quiet-recovery" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    ];

    for (let turn = 1; turn <= 2; turn++) {
      const preview = previewTurn(soloScenario, current.state, { turn, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] });
      const input = { turn, selectedActionIds: [], selections, acceptedRiskOverrides: preview.acceptedRiskCandidates, staffNegotiations: [] };
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

    const streak = current.state.doctrineMaturity["doctrine-sustainment-patience-gap"];
    assert.ok(streak, "mid-streak state carries a sustainment streak");
    assert.equal(streak!.consecutiveTurns, 2);
    assert.equal(streak!.startedTurn, 1);

    await store.create(current);
    const loaded = await store.read(id);
    const loadedStreak = loaded.state.doctrineMaturity["doctrine-sustainment-patience-gap"];
    assert.equal(loadedStreak?.consecutiveTurns, 2, "streak count retained across save/load");
    assert.equal(loadedStreak?.startedTurn, 1, "startedTurn retained across save/load");
    assert.ok((loadedStreak?.acceptedRiskRefs ?? []).length > 0, "accepted-risk refs retained across save/load");

    const turnThreeInput = { turn: 3, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] };
    const fromLoaded = resolveTurn(soloScenario, loaded.state, turnThreeInput);
    const fromMemory = resolveTurn(soloScenario, current.state, turnThreeInput);
    assert.deepEqual(fromLoaded.nextState, fromMemory.nextState, "resumed resolution from the loaded session matches the never-saved session");
    assert.equal(fromLoaded.replayHash, fromMemory.replayHash);
    assert.ok(fromLoaded.triggeredEvents.some((event) => event.id === "doctrine-sustainment-patience-gap"), "resumed resolution fires the matured event on turn 3");
  });
});

describe("Doctrine 5 pre-module save boundary (issue #59 criterion 4)", () => {
  it("a 0.10.0 session whose history omits module fields parses, then fails the contentVersion check cleanly", async () => {
    const id = "00000000-0000-1000-8000-000000000050";
    const session = makeSession({ id, contentVersion: "0.10.0" });
    const selections = [
      { memoId: "posture", optionId: "quiet-recovery" },
      { memoId: "intelligence-focus", optionId: "warning-net" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
    ];
    const preview = previewTurn(soloScenario, session.state, { turn: 1, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] });
    const input = { turn: 1, selectedActionIds: [], selections, acceptedRiskOverrides: preview.acceptedRiskCandidates, staffNegotiations: [] };
    const result = resolveTurn(soloScenario, session.state, input);
    // Serialize exactly as 0.10.0 (Doctrine 4) would have: turn results carry no
    // staffModules readout and no coordinationLoad.
    const { staffModules: _moduleReadouts, coordinationLoad: _coordinationLoad, ...legacyResult } = result;
    const legacySession = gameSessionSchema.parse({
      ...session,
      contentVersion: "0.10.0",
      state: result.nextState,
      turnInputs: [input],
      history: [legacyResult],
      revision: 1,
    });

    // Schema-level replay/save-stability evidence: the old save PARSES with additive
    // defaults — it must not crash on the missing module fields.
    assert.equal(legacySession.history[0]?.coordinationLoad, 0, "omitted coordinationLoad defaults to 0");
    assert.deepEqual(legacySession.history[0]?.staffModules ?? [], [], "omitted staffModules readouts default to []");
    assert.notEqual(legacySession.contentVersion, soloScenario.contentVersion, "0.10.0 save is outside the current contentVersion boundary");

    // The canonical check (the server assertCanonicalImport/assertCanonicalSession
    // contentVersion arm) then rejects the parsed save cleanly — the boundary is the
    // contentVersion check, not the schema.
    assert.throws(
      () => {
        if (legacySession.scenarioId !== soloScenario.id || legacySession.contentVersion !== soloScenario.contentVersion) {
          throw new Error("This campaign file was played on a different scenario or a different content version, so it cannot be opened here.");
        }
      },
      /different content version/,
    );
  });
});

describe("Doctrine 5 module save/store round-trip (issue #59 test-plan Save/store/server #2)", () => {
  it("a 0.11.0 resolved session with historical module readouts migrates to the dialogue content version without changing state", async () => {
    const saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-d5modules-"));
    const store = createFileSystemSaveStore(saveDir);
    try {
      const id = "00000000-0000-1000-8000-000000000060";
      const session = makeSession({ id });
      assert.equal(session.contentVersion, "0.12.0", "the dialogue-only content migration must admit existing sessions");

      const selections = [
        { memoId: "posture", optionId: "quiet-recovery" },
        { memoId: "intelligence-focus", optionId: "warning-net" },
        { memoId: "sustainment-focus", optionId: "repair-first" },
        { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      ];
      const preview = previewTurn(soloScenario, session.state, { turn: 1, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] });
      const input = { turn: 1, selectedActionIds: [], selections, acceptedRiskOverrides: preview.acceptedRiskCandidates, staffNegotiations: [] };
      const result = resolveTurn(soloScenario, session.state, input);
      const resolved = gameSessionSchema.parse({
        ...session,
        state: result.nextState,
        turnInputs: [input],
        history: [result],
        revision: 1,
      });

      const writtenReadouts = resolved.history[0]!.staffModules;
      const writtenLoad = resolved.history[0]!.coordinationLoad;
      assert.equal(writtenReadouts.length, 4, "shipped J6/J8/J9/STRATCOM profile resolves four readouts");
      assert.equal(writtenLoad, 0.4, "four enabled modules coordinate at 0.40");

      const raw011 = gameSessionSchema.parse({ ...resolved, contentVersion: "0.11.0" });
      await store.create(raw011);
      const loaded = await store.read(id);
      assert.equal(loaded.contentVersion, "0.12.0", "raw 0.11.0 payload upgrades at the store boundary");
      assert.deepEqual(loaded.state, resolved.state, "dialogue migration must not alter campaign state");
      assert.equal(loaded.history.length, 1);
      assert.equal(JSON.stringify(loaded.history[0]!.staffModules), JSON.stringify(writtenReadouts), "historical staffModules readouts survive byte-exact");
      assert.equal(JSON.stringify(loaded.history[0]!.coordinationLoad), JSON.stringify(writtenLoad), "historical coordinationLoad survives byte-exact");
      assert.deepEqual(loaded.history[0]!.staffModules, writtenReadouts);

      // Replay from the loaded session matches the never-saved session.
      const turnTwo = { turn: 2, selectedActionIds: [], selections, acceptedRiskOverrides: [], staffNegotiations: [] };
      const fromLoaded = resolveTurn(soloScenario, loaded.state, turnTwo);
      const fromMemory = resolveTurn(soloScenario, resolved.state, turnTwo);
      assert.equal(fromLoaded.replayHash, fromMemory.replayHash, "resumed resolution replays identically");
    } finally {
      await rm(saveDir, { recursive: true, force: true });
    }
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

describe("legacy save-file migration", () => {
  let legacyDir: string;
  let durableDir: string;

  before(async () => {
    legacyDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-legacy-"));
    durableDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-durable-"));
  });

  after(async () => {
    await rm(legacyDir, { recursive: true, force: true });
    await rm(durableDir, { recursive: true, force: true });
  });

  it("copies source records atomically, preserves the source, and is idempotent after interruption/retry", async () => {
    const file = "00000000-0000-1000-8000-000000000210.json";
    const content = "{ not necessarily parseable yet }";
    await writeFile(path.join(legacyDir, file), content, "utf8");
    assert.equal(migrateLegacySaveFiles(durableDir, [legacyDir]), 1);
    assert.equal(await readFile(path.join(legacyDir, file), "utf8"), content, "source must remain recoverable");
    assert.equal(await readFile(path.join(durableDir, file), "utf8"), content);
    assert.equal(migrateLegacySaveFiles(durableDir, [legacyDir]), 0, "a retry must not replace the completed destination");
    assert.deepEqual((await readdir(durableDir)).filter((entry) => entry.includes(".migration-")), []);
  });

  it("does not overwrite a newer durable duplicate", async () => {
    const file = "00000000-0000-1000-8000-000000000211.json";
    await writeFile(path.join(legacyDir, file), "legacy", "utf8");
    await writeFile(path.join(durableDir, file), "durable", "utf8");
    assert.equal(migrateLegacySaveFiles(durableDir, [legacyDir]), 0);
    assert.equal(await readFile(path.join(durableDir, file), "utf8"), "durable");
    assert.equal(await readFile(path.join(legacyDir, file), "utf8"), "legacy");
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
      `      if (e.name === "RevisionMismatchError") continue;`,
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
    // Root bypasses POSIX directory mode bits, so chmod cannot create the condition
    // this integration test intends to exercise. The filesystem behavior is covered
    // on ordinary POSIX users; avoid a false negative in privileged CI containers.
    if (process.platform === "win32" || process.getuid?.() === 0) return;
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

  it("lists corrupt and incompatible files as records without loading them", async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-records-"));
    const corruptId = "00000000-0000-1000-8000-000000000093";
    const incompatibleId = "00000000-0000-1000-8000-000000000094";
    try {
      await writeFile(path.join(tmp, `${corruptId}.json`), "{truncated", "utf8");
      await writeFile(path.join(tmp, `${incompatibleId}.json`), JSON.stringify({ saveFormatVersion: "7" }), "utf8");
      const store = createFileSystemSaveStore(tmp);
      const records = await store.listRecords();
      assert.deepEqual(
        records.map((record) => ({ id: record.id, status: record.status, hasSession: Boolean(record.session) })),
        [
          { id: corruptId, status: "corrupt", hasSession: false },
          { id: incompatibleId, status: "incompatible", hasSession: false },
        ],
      );
      assert.deepEqual(await store.list(), []);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});

describe("v5 to v6 save migration", () => {
  let saveDir: string;
  let store: SaveStore;

  before(async () => {
    saveDir = await mkdtemp(path.join(os.tmpdir(), "brass-ledger-test-migration-"));
    store = createFileSystemSaveStore(saveDir);
  });

  after(async () => {
    await rm(saveDir, { recursive: true, force: true });
  });

  function toV5Readout(readout: Record<string, unknown>): Record<string, unknown> {
    const { activeWarning, standingRemit, ...rest } = readout;
    return { ...rest, consequence: activeWarning ?? standingRemit };
  }

  function defaultTurnInput() {
    const defaultSelections = soloScenario.memoTemplates.map((memo) => ({
      memoId: memo.id,
      optionId: memo.options[0].id,
    }));
    return {
      turn: 1,
      selectedActionIds: defaultSelections.map((s) => s.optionId),
      selections: defaultSelections,
      acceptedRiskOverrides: [],
      staffNegotiations: [],
    };
  }

  it("migrates a v5 session with warned and unwarned staff functions to v6", async () => {
    const id = "00000000-0000-1000-8000-000000000200";
    const session = makeSession({ id });
    const input = defaultTurnInput();
    const result = resolveTurn(soloScenario, session.state, input);
    const v6Session = gameSessionSchema.parse({
      ...session,
      state: result.nextState,
      turnInputs: [input],
      history: [result],
    });

    const v5Payload = {
      ...v6Session,
      saveFormatVersion: "5",
      history: v6Session.history.map((turnResult) => ({
        ...turnResult,
        staffFunctions: turnResult.staffFunctions.map(toV5Readout),
      })),
    };

    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(saveDir, `${id}.json`), JSON.stringify(v5Payload), "utf8");

    const migrated = await store.read(id);
    assert.equal(migrated.saveFormatVersion, "8");
    assert.equal(migrated.history.length, v6Session.history.length);
    for (const [index, turnResult] of migrated.history.entries()) {
      for (const readout of turnResult.staffFunctions) {
        assert.ok(!("consequence" in readout));
        const original = v6Session.history[index].staffFunctions.find((fn) => fn.id === readout.id);
        assert.ok(original);
        assert.equal(readout.activeWarning, original.activeWarning);
        assert.equal(readout.standingRemit, original.standingRemit);
      }
    }
  });

  it("v6-migrated saves remain replay-valid", async () => {
    const id = "00000000-0000-1000-8000-000000000201";
    const session = makeSession({ id });
    const input = defaultTurnInput();
    const result = resolveTurn(soloScenario, session.state, input);
    const v6Session = gameSessionSchema.parse({
      ...session,
      state: result.nextState,
      turnInputs: [input],
      history: [result],
    });
    const v5Payload = {
      ...v6Session,
      saveFormatVersion: "5",
      history: v6Session.history.map((turnResult) => ({
        ...turnResult,
        staffFunctions: turnResult.staffFunctions.map(toV5Readout),
      })),
    };

    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(saveDir, `${id}.json`), JSON.stringify(v5Payload), "utf8");

    const migrated = await store.read(id);
    assert.equal(migrated.history[0].replayHash, v6Session.history[0].replayHash);
  });
});

describe("v8 campaign-ledger migration", () => {
  it("safely assigns campaign identity to an action-free v8 save", () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000240" });
    const legacy = { ...session, campaignId: undefined, authoritativeActions: [] };
    const migrated = migrateSessionPayload(legacy) as Record<string, unknown>;
    assert.equal(migrated.campaignId, session.id);
    assert.ok(gameSessionSchema.safeParse(migrated).success);
  });

  it("does not manufacture campaign provenance for a pre-bound v8 conversation ledger", () => {
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000241" });
    const legacy = { ...session, campaignId: undefined, authoritativeActions: [{ type: "chief-conversation-open" }] };
    const migrated = migrateSessionPayload(legacy) as Record<string, unknown>;
    assert.equal(migrated.campaignId, undefined, "the missing provenance is not guessed");
    assert.equal(gameSessionSchema.safeParse(migrated).success, false, "the old ledger stays explicitly unreadable instead of trusted");
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
