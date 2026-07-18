import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { createInitialGameSession, gameSessionSchema, type GameSession } from "@brass-ledger/shared";
import { soloScenario } from "@brass-ledger/content";

import {
  createBrowserSaveStore,
  RevisionMismatchError as BrowserRevisionMismatchError,
  SaveStoreCorruptError,
  SessionExistsError as BrowserSessionExistsError,
  SessionNotFoundError,
} from "./browser.js";
import {
  RevisionMismatchError,
  SessionExistsError,
} from "./index.js";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function makeSession(overrides?: Partial<GameSession>): GameSession {
  return gameSessionSchema.parse({
    ...createInitialGameSession(soloScenario, "browser-test-seed"),
    ...overrides,
  });
}

describe("BrowserSaveStore", () => {
  it("shares exported error identities with the main package entry", () => {
    assert.equal(BrowserRevisionMismatchError, RevisionMismatchError);
    assert.equal(BrowserSessionExistsError, SessionExistsError);
  });

  it("supports CRUD with typed missing and duplicate errors", async () => {
    const storage = new MemoryStorage();
    const store = createBrowserSaveStore(storage);
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000101" });

    await store.create(session);
    assert.equal((await store.read(session.id)).id, session.id);
    await assert.rejects(() => store.create(session), BrowserSessionExistsError);
    await store.delete(session.id);
    await assert.rejects(() => store.read(session.id), SessionNotFoundError);
  });

  it("does not overwrite top-level corrupt storage", async () => {
    const storage = new MemoryStorage();
    storage.setItem("brass-ledger-saves", "{not json");
    const store = createBrowserSaveStore(storage);
    const session = makeSession({ id: "00000000-0000-1000-8000-000000000102" });

    await assert.rejects(() => store.create(session), SaveStoreCorruptError);
    assert.equal(storage.getItem("brass-ledger-saves"), "{not json");
  });

  it("lists valid entries but refuses to erase adjacent corrupt entries", async () => {
    const storage = new MemoryStorage();
    const valid = makeSession({ id: "00000000-0000-1000-8000-000000000103" });
    storage.setItem(
      "brass-ledger-saves",
      JSON.stringify({ [valid.id]: valid, corrupt: { id: "corrupt" } }),
    );
    const store = createBrowserSaveStore(storage);

    assert.deepEqual((await store.list()).map((session) => session.id), [valid.id]);
    await assert.rejects(
      () => store.create(makeSession({ id: "00000000-0000-1000-8000-000000000104" })),
      SaveStoreCorruptError,
    );
    assert.ok(storage.getItem("brass-ledger-saves")?.includes("corrupt"));
  });

  it("guarded writes cannot resurrect a deleted session", async () => {
    const storage = new MemoryStorage();
    const store = createBrowserSaveStore(storage);
    const session = makeSession({
      id: "00000000-0000-1000-8000-000000000105",
      revision: 3,
    });
    await store.create(session);
    await store.delete(session.id);

    await assert.rejects(
      () => store.write({ ...session, revision: 4 }, 3),
      SessionNotFoundError,
    );
  });

  it("serializes compare-and-swap across adapters sharing a Storage object", async () => {
    const storage = new MemoryStorage();
    const first = createBrowserSaveStore(storage);
    const second = createBrowserSaveStore(storage);
    const session = makeSession({
      id: "00000000-0000-1000-8000-000000000106",
      revision: 0,
    });
    await first.create(session);

    const results = await Promise.allSettled([
      first.write({ ...session, revision: 1, updatedAt: "2026-01-01T00:00:00.000Z" }, 0),
      second.write({ ...session, revision: 1, updatedAt: "2026-02-01T00:00:00.000Z" }, 0),
    ]);

    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    const rejected = results.find((result) => result.status === "rejected");
    assert.ok(rejected?.status === "rejected");
    assert.ok(rejected.reason instanceof RevisionMismatchError);
    assert.equal((await first.read(session.id)).revision, 1);
  });
});
