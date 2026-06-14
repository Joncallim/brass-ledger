import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

async function withAcceptedRiskCandidates(sessionId: string, input: Record<string, unknown>) {
  const preview = await app.inject({
    method: "POST",
    url: `/api/sessions/${sessionId}/preview-turn`,
    payload: { input },
  });
  assert.equal(preview.statusCode, 200);
  return {
    ...input,
    acceptedRiskOverrides: preview.json().acceptedRiskCandidates,
  };
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

test("scenario and session payloads expose S1-S5 staff contracts", async () => {
  const scenario = await app.inject({ method: "GET", url: "/api/scenario" });
  assert.equal(scenario.statusCode, 200);
  assert.deepEqual(scenario.json().scenario.staffFunctions.map((entry: { id: string }) => entry.id), ["S1", "S2", "S3", "S4", "S5"]);
  assert.ok(scenario.json().scenario.staffCapacities.length >= 6);

  const created = await createSession();
  assert.deepEqual(created.staffFunctions.map((entry: { id: string }) => entry.id), ["S1", "S2", "S3", "S4", "S5"]);
});

test("headless API runs default turns with explicit accepted-risk records", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/headless/run",
    payload: { turns: 1, validate: true },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.scenario.id, "brass-ledger-jhq");
  assert.equal(body.turnSummaries.length, 1);
  assert.ok(body.turnSummaries[0].acceptedRisks.length > 0);
  assert.ok(body.turnSummaries[0].chiefCoalitions.length > 0);
  assert.ok(body.turnSummaries[0].chiefCoalitions.every((entry: { negotiationLevers: string[] }) => entry.negotiationLevers.length > 0));
  assert.equal(body.validation.ok, true);
});

test("headless API rejects supplied turns that omit accepted-risk overrides", async () => {
  const created = await createSession();
  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: firstOptionSelections(created.memos),
  };

  const rejected = await app.inject({
    method: "POST",
    url: "/api/headless/run",
    payload: { session: created.session, input },
  });

  assert.equal(rejected.statusCode, 428);
  assert.match(rejected.json().error, /acceptedRiskOverrides/i);
  assert.ok(rejected.json().acceptedRiskCandidates.length > 0);
});

test("resolve-turn persists a revision and rejects stale expected revisions", async () => {
  const created = await createSession();
  const id = created.session.id;
  assert.equal(created.session.revision, 0);
  assert.equal(created.summary.revision, 0);

  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: firstOptionSelections(created.memos),
  };

  const preview = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/preview-turn`,
    payload: { input },
  });
  assert.equal(preview.statusCode, 200);
  const previewBody = preview.json();
  assert.ok(previewBody.acceptedRiskCandidates.length > 0);
  assert.equal(previewBody.chiefCoalitions.length, input.selections.length);
  assert.ok(previewBody.chiefCoalitions.every((entry: { negotiationLevers: string[] }) => entry.negotiationLevers.length > 0));

  const unacceptedRisk = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input, expectedRevision: 0 },
  });
  assert.equal(unacceptedRisk.statusCode, 428);
  assert.match(unacceptedRisk.json().error, /acceptedRiskOverrides/i);

  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: { ...input, acceptedRiskOverrides: previewBody.acceptedRiskCandidates }, expectedRevision: 0 },
  });
  assert.equal(resolved.statusCode, 200);
  const resolvedBody = resolved.json();
  assert.equal(resolvedBody.session.revision, 1);
  assert.equal(resolvedBody.summary.revision, 1);
  assert.equal(resolvedBody.validation.ok, true);
  assert.deepEqual(resolvedBody.result.acceptedRisks.map((risk: { accepted: boolean }) => risk.accepted), previewBody.acceptedRiskCandidates.map(() => true));
  assert.deepEqual(resolvedBody.result.chiefCoalitions, previewBody.chiefCoalitions);

  const stale = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: { ...input, turn: 2, acceptedRiskOverrides: previewBody.acceptedRiskCandidates }, expectedRevision: 0 },
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
  let responseBody = responded.json();
  assert.equal(responseBody.session.revision, 2);
  assert.equal(responseBody.session.state.chiefAgendaMemory[chiefId], undefined);

  while (responseBody.conversation.status !== "completed") {
    const next = await app.inject({
      method: "POST",
      url: `/api/sessions/${id}/chiefs/${chiefId}/respond`,
      payload: {
        responseId: responseBody.conversation.choices[0].id,
        expectedRevision: responseBody.session.revision,
      },
    });
    assert.equal(next.statusCode, 200);
    responseBody = next.json();
  }

  const agendaMemory = responseBody.session.state.chiefAgendaMemory[chiefId];
  assert.ok(agendaMemory);
  assert.equal(agendaMemory.chiefId, chiefId);
  assert.equal(agendaMemory.lastMemoId, memo.id);
  assert.equal(agendaMemory.lastOptionId, option.id);
  assert.equal(agendaMemory.lastTurn, 1);
  assert.ok(agendaMemory.lastPosition);
  assert.ok(agendaMemory.notes.some((entry: string) => entry.includes("Conversation closed")));

  const commitment = responseBody.session.state.activeCommitments.find((entry: { id: string }) => entry.id === `conversation-1-${chiefId}-${memo.id}-${option.id}`);
  assert.ok(commitment);
  assert.equal(commitment.type, "doctrine");
  assert.equal(commitment.turnMade, 1);
  assert.equal(commitment.fulfilled, null);
  assert.match(commitment.label, /bounded order/i);
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

test("import rejects replay-corrupted session exports", async () => {
  const created = await createSession();
  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: firstOptionSelections(created.memos),
  };
  const acceptedInput = await withAcceptedRiskCandidates(created.session.id, input);
  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${created.session.id}/resolve-turn`,
    payload: { input: acceptedInput },
  });
  assert.equal(resolved.statusCode, 200);

  const exported = await app.inject({ method: "GET", url: `/api/sessions/${created.session.id}/export` });
  const exportData = exported.json();
  exportData.session.history[0].replayHash = "forged";
  const rejected = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData },
  });

  assert.equal(rejected.statusCode, 409);
  assert.match(rejected.json().error, /replay validation failed/i);
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

test("session listing skips malformed persisted save files", async () => {
  await writeFile(path.join(saveDir, "malformed.json"), "{not valid json", "utf8");
  const listed = await app.inject({ method: "GET", url: "/api/sessions" });

  assert.equal(listed.statusCode, 200);
  assert.ok(Array.isArray(listed.json().sessions));
});

test("simultaneous authoritative mutations do not both apply against one revision", async () => {
  const created = await createSession();
  const id = created.session.id;
  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: firstOptionSelections(created.memos),
  };
  const acceptedInput = await withAcceptedRiskCandidates(id, input);
  const memo = created.memos[0];
  const option = memo.options[0];
  const chiefId = created.session.advisorRoster[0].chiefId;

  const [resolved, opened] = await Promise.all([
    app.inject({
      method: "POST",
      url: `/api/sessions/${id}/resolve-turn`,
      payload: { input: acceptedInput, expectedRevision: 0 },
    }),
    app.inject({
      method: "POST",
      url: `/api/sessions/${id}/chiefs/${chiefId}/conversation/open`,
      payload: { memoId: memo.id, optionId: option.id, expectedRevision: 0 },
    }),
  ]);

  const statuses = [resolved.statusCode, opened.statusCode].sort();
  assert.deepEqual(statuses, [200, 409]);
});

test("static routes serve the client shell and do not expose traversed files", async () => {
  const shell = await app.inject({ method: "GET", url: "/" });
  assert.equal(shell.statusCode, 200);
  assert.match(shell.headers["content-type"] as string, /text\/html/);

  const traversed = await app.inject({ method: "GET", url: "/../../package.json" });
  assert.notEqual(traversed.statusCode, 200);
});
