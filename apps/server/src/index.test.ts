import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const saveDir = await mkdtemp(path.join(tmpdir(), "brass-ledger-routes-"));
process.env.NODE_ENV = "test";
process.env.BRASS_LEDGER_NO_LISTEN = "1";
process.env.BRASS_LEDGER_SAVE_DIR = saveDir;

const { app } = await import("./index");

after(async () => {
  await app.close();
  await rm(saveDir, { recursive: true, force: true });
});

async function createSession() {
  const response = await app.inject({ method: "POST", url: "/api/sessions" });
  assert.equal(response.statusCode, 200);
  return response.json();
}

function firstOptionSelections(memos: Array<{ id: string; optional?: boolean; options: Array<{ id: string }> }>) {
  return memos
    .filter((memo) => !memo.optional)
    .map((memo) => ({
      memoId: memo.id,
      optionId: memo.options[0]?.id ?? "",
    }));
}

test("CORS accepts configured local origins and rejects unknown origins", async () => {
  const allowed = await app.inject({
    method: "OPTIONS",
    url: "/api/health",
    headers: {
      origin: "http://127.0.0.1:5173",
      "access-control-request-method": "GET",
    },
  });
  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers["access-control-allow-origin"], "http://127.0.0.1:5173");

  const rejected = await app.inject({
    method: "OPTIONS",
    url: "/api/health",
    headers: {
      origin: "https://example.invalid",
      "access-control-request-method": "GET",
    },
  });
  assert.notEqual(rejected.headers["access-control-allow-origin"], "https://example.invalid");
});

test("whole-session save is disabled and invalid session ids are rejected", async () => {
  const created = await createSession();
  const id = created.session.id;

  const disabled = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/save`,
    payload: { session: created.session },
  });
  assert.equal(disabled.statusCode, 410);

  const invalidId = await app.inject({
    method: "POST",
    url: "/api/sessions/not-a-uuid/save",
    payload: { session: created.session },
  });
  assert.equal(invalidId.statusCode, 400);
});

test("resolve-turn persists a revision and rejects stale expected revisions", async () => {
  const created = await createSession();
  const id = created.session.id;
  assert.equal(created.session.revision, 0);
  assert.equal(created.summary.revision, 0);

  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    selections: firstOptionSelections(created.memos),
  };

  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input, expectedRevision: 0 },
  });
  assert.equal(resolved.statusCode, 200);
  const resolvedBody = resolved.json();
  assert.equal(resolvedBody.session.revision, 1);
  assert.equal(resolvedBody.summary.revision, 1);
  assert.equal(resolvedBody.validation.ok, true);

  const stale = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: { ...input, turn: 2 }, expectedRevision: 0 },
  });
  assert.equal(stale.statusCode, 409);
  assert.match(stale.json().error, /revision mismatch/i);
});

test("chief conversation routes persist revisions and reject stale responses", async () => {
  const created = await createSession();
  const id = created.session.id;
  const memo = created.memos[0];
  const option = memo.options[0];
  const chiefId = created.session.advisorRoster[0].chiefId;

  const opened = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/chiefs/${chiefId}/conversation/open`,
    payload: { memoId: memo.id, optionId: option.id, expectedRevision: 0 },
  });
  assert.equal(opened.statusCode, 200);
  const openedBody = opened.json();
  assert.equal(openedBody.session.revision, 1);
  assert.equal(openedBody.conversation.status, "active");

  const responseId = openedBody.conversation.choices[0].id;
  const stale = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/chiefs/${chiefId}/respond`,
    payload: { responseId, expectedRevision: 0 },
  });
  assert.equal(stale.statusCode, 409);
  assert.match(stale.json().error, /revision mismatch/i);

  const responded = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/chiefs/${chiefId}/respond`,
    payload: { responseId, expectedRevision: 1 },
  });
  assert.equal(responded.statusCode, 200);
  assert.equal(responded.json().session.revision, 2);
});

test("import rejects forged session exports and accepts replayable exports under a fresh revision", async () => {
  const created = await createSession();
  const id = created.session.id;
  const exported = await app.inject({ method: "GET", url: `/api/sessions/${id}/export` });
  assert.equal(exported.statusCode, 200);
  const exportData = exported.json();

  const forged = structuredClone(exportData);
  forged.session.scenarioId = "forged-scenario";
  const rejected = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData: forged },
  });
  assert.equal(rejected.statusCode, 409);

  const accepted = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData },
  });
  assert.equal(accepted.statusCode, 200);
  const acceptedBody = accepted.json();
  assert.notEqual(acceptedBody.session.id, id);
  assert.equal(acceptedBody.session.revision, 0);
});

test("replay endpoint validates current session history", async () => {
  const created = await createSession();
  const replay = await app.inject({ method: "GET", url: `/api/sessions/${created.session.id}/replay` });

  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().validation.ok, true);
});

test("delete removes a session and rejects later reads", async () => {
  const created = await createSession();
  const id = created.session.id;

  const deleted = await app.inject({ method: "DELETE", url: `/api/sessions/${id}` });
  assert.equal(deleted.statusCode, 200);
  assert.equal(deleted.json().ok, true);

  const missing = await app.inject({ method: "GET", url: `/api/sessions/${id}` });
  assert.equal(missing.statusCode, 404);
});

test("static routes serve the client shell and do not expose traversed files", async () => {
  const shell = await app.inject({ method: "GET", url: "/" });
  assert.equal(shell.statusCode, 200);
  assert.match(shell.headers["content-type"] as string, /text\/html/);

  const traversed = await app.inject({ method: "GET", url: "/../../package.json" });
  assert.notEqual(traversed.statusCode, 200);
});
