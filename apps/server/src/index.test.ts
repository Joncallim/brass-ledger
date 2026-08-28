import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { scenarioSummarySchema, chiefSpriteDeterministicSeed, gameSessionSchema, turnInputSchema } from "@brass-ledger/shared";
import { hashPromptText } from "@brass-ledger/headless";
import { soloScenario } from "@brass-ledger/content";
import { campaignStateHash, ineligibleStaffNegotiations, resolveTurn } from "@brass-ledger/sim";

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

async function exportConversationLedger() {
  const created = await createSession();
  const memo = created.memos[0];
  const option = memo.options[0];
  const chiefId = created.session.advisorRoster[0].chiefId;
  const opened = await app.inject({
    method: "POST",
    url: `/api/sessions/${created.session.id}/chiefs/${chiefId}/conversation/open`,
    payload: { memoId: memo.id, optionId: option.id, selections: [{ memoId: memo.id, optionId: option.id }], expectedRevision: 0 },
  });
  assert.equal(opened.statusCode, 200);
  const responseId = opened.json().conversation.choices[0].id;
  const responded = await app.inject({
    method: "POST",
    url: `/api/sessions/${created.session.id}/chiefs/${chiefId}/respond`,
    payload: { responseId, expectedRevision: 1 },
  });
  assert.equal(responded.statusCode, 200);
  const exported = await app.inject({ method: "GET", url: `/api/sessions/${created.session.id}/export` });
  assert.equal(exported.statusCode, 200);
  return { exportData: exported.json(), created, chiefId, memo, option };
}

async function assertImportRejected(exportData: unknown) {
  const rejected = await app.inject({ method: "POST", url: "/api/sessions/import", payload: { exportData } });
  assert.equal(rejected.statusCode, 409);
}

test("CORS accepts configured origins and rejects unlisted ports", async () => {
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
      origin: "http://127.0.0.1:9999",
      "access-control-request-method": "GET",
    },
  });
  assert.notEqual(rejected.statusCode, 500);
  assert.equal(rejected.headers["access-control-allow-origin"], undefined);
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

test("scenario response carries the schema-valid sprite visual language registry", async () => {
  const response = await app.inject({ method: "GET", url: "/api/scenario" });
  const payload = response.json().scenario;
  const summary = scenarioSummarySchema.parse(payload);
  assert.deepEqual(summary.spriteVisualLanguage, payload.spriteVisualLanguage);
});

test("scenario, preview, and resolve expose resolver-ordered module arrays", async () => {
  const scenario = (await app.inject({ method: "GET", url: "/api/scenario" })).json().scenario;
  const expected = scenario.staffModules.map((module: { id: string }) => module.id);
  assert.equal(expected.length, scenario.staffModules.length);
  const created = await createSession();
  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    selections: firstOptionSelections(created.memos),
  };
  const accepted = await withAcceptedRiskCandidates(created.session.id, input);
  const preview = await app.inject({ method: "POST", url: `/api/sessions/${created.session.id}/preview-turn`, payload: { input: accepted } });
  assert.equal(preview.statusCode, 200);
  assert.deepEqual(preview.json().projectedResult.staffModules.map((module: { id: string }) => module.id), expected);
  const resolved = await app.inject({ method: "POST", url: `/api/sessions/${created.session.id}/resolve-turn`, payload: { input: accepted, expectedRevision: 0 } });
  assert.equal(resolved.statusCode, 200);
  assert.deepEqual(resolved.json().result.staffModules.map((module: { id: string }) => module.id), expected);
});

test("session payload readouts carry doctrine 3 routing attention consistent with turn results", async () => {
  const created = await createSession();
  const id = created.session.id;

  // The standing-session readouts (no selections) still carry the composed routing
  // labels — S3 has ops=priority + training=underpriced, so the label is "priority" by
  // precedence, exactly as a resolve-turn result on the same scenario reports it.
  const s3Payload = created.staffFunctions.find((entry: { id: string }) => entry.id === "S3");
  assert.ok(s3Payload);
  assert.equal(s3Payload.routingAttention, "priority");

  const input = {
    turn: 1,
    selectedActionIds: [],
    selections: [
      { memoId: "posture", optionId: "measured-deterrence" },
      { memoId: "intelligence-focus", optionId: "deception-hunt" },
      { memoId: "sustainment-focus", optionId: "repair-first" },
      { memoId: "alliance-frame", optionId: "quiet-reassurance" },
      { memoId: "force-development", optionId: "training-reset" },
    ],
  };
  const acceptedInput = await withAcceptedRiskCandidates(id, input);
  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: acceptedInput, expectedRevision: 0 },
  });
  assert.equal(resolved.statusCode, 200);
  const body = resolved.json();
  const training = body.result.directorateBurden.find((entry: { directorate: string }) => entry.directorate === "training");
  assert.ok(training);
  assert.equal(training.burdenLevel, "strained");
  assert.equal(training.routingAttention, "underpriced");
  const s3Resolved = body.result.staffFunctions.find((entry: { id: string }) => entry.id === "S3");
  assert.ok(s3Resolved);
  assert.equal(s3Resolved.routingAttention, "priority");
  assert.ok(
    s3Resolved.warnings.some((warning: string) => warning.includes("This lane is one the staff underprices")),
    "the underpriced training warning must surface in the resolve-turn readouts",
  );
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
  assert.ok(body.turnSummaries[0].chiefPositions.length > 0);
  assert.ok(body.turnSummaries[0].chiefPositions.every((entry: { staffReadoutEvidence?: { rationale?: string } }) => entry.staffReadoutEvidence?.rationale?.includes("evidence")));
  assert.ok(body.turnSummaries[0].chiefCoalitions.length > 0);
  assert.ok(body.turnSummaries[0].chiefCoalitions.every((entry: { negotiationLevers: string[] }) => entry.negotiationLevers.length > 0));
  assert.equal(body.validation.ok, true);
});

test("headless API sprite output carries filled prompts and sibling hashes", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/api/headless/run",
    payload: { turns: 0, includeSprites: true },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.equal(body.sprites.length, 6);
  for (const sprite of body.sprites) {
    assert.ok(sprite.spec.temperament.length > 0, "temperament flows through the chief");
    assert.ok(sprite.spec.prompt.length > 0, "positive prompt is filled");
    assert.ok(sprite.spec.negativePrompt.length > 0, "negative prompt is filled");
    assert.ok(sprite.spec.variant, "variant render controls are present");
    assert.ok(Array.isArray(sprite.spec.variant.effects), "variant effects are an ordered array");
    assert.equal(sprite.promptHash, hashPromptText(sprite.spec.prompt), "promptHash is SHA-256 of the emitted prompt");
    assert.equal(sprite.negativePromptHash, hashPromptText(sprite.spec.negativePrompt), "negativePromptHash is SHA-256 of the emitted negative prompt");
    assert.match(sprite.promptHash, /^[0-9a-f]{64}$/);
    assert.match(sprite.negativePromptHash, /^[0-9a-f]{64}$/);
  }

  // The full result still carries a schema-valid raw session sibling that excludes sprite artifacts.
  assert.ok(body.sessionExport, "raw GameSession sibling remains");
  gameSessionSchema.parse(body.sessionExport);
  const forbidden = ["prompt", "negativePrompt", "promptHash", "negativePromptHash", "deterministicSeed", "temperament", "variant", "effects", "posture", "framing", "supportDetail", "saturation", "backgroundDarkenOpacity", "pixelGrid", "pixelMatrix", "pixels", "svg", "png"];
  const keys: string[] = [];
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        keys.push(key);
        collect(child);
      }
    }
  };
  collect(body.sessionExport);
  for (const key of forbidden) {
    assert.equal(keys.includes(key), false, `session JSON must not contain ${key}`);
  }

  // The sprites: true alias behaves identically.
  const alias = await app.inject({
    method: "POST",
    url: "/api/headless/run",
    payload: { turns: 0, sprites: true },
  });
  assert.equal(alias.statusCode, 200);
  assert.equal(alias.json().sprites.length, 6);
  assert.match(alias.json().sprites[0].promptHash, /^[0-9a-f]{64}$/);
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
    // Operations is strained (4/4) for these selections and appears in the
    // unnegotiated packet's relief candidates, so the negotiation is eligible
    // under the closing pass 6 P1 gate.
    staffNegotiations: [{ directorate: "operations", reliefPoints: 1, cost: "political_cover" }],
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
  assert.deepEqual(resolvedBody.result.input.staffNegotiations, input.staffNegotiations);
  assert.ok(resolvedBody.result.afterAction.some((entry: { heading: string }) => entry.heading === "Staff negotiations"));

  const stale = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: { ...input, turn: 2, acceptedRiskOverrides: previewBody.acceptedRiskCandidates }, expectedRevision: 0 },
  });
  assert.equal(stale.statusCode, 409);
  assert.match(stale.json().error, /revision mismatch/i);
});

test("resolve-turn rejects relief negotiations for directorates the current selections do not stretch (closing pass 6 P1)", async () => {
  const created = await createSession();
  const id = created.session.id;

  // The live repro: Training is LIGHT for this packet (deception-grid keeps it
  // below the strain threshold) and absent from the unnegotiated candidates,
  // yet the old server accepted a Training negotiation with HTTP 200 and
  // applied its costs (−2 political capital, −2 cabinet cover, +1 media heat).
  const trainingLightSelections = [
    ...firstOptionSelections(created.memos),
    { memoId: "force-development", optionId: "deception-grid" },
  ];
  const input = {
    turn: created.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [{ directorate: "training", reliefPoints: 1, cost: "political_cover" }],
    selections: trainingLightSelections,
  };

  // Sanity: the unnegotiated packet indeed offers NO Training relief, so the
  // negotiation is out of eligibility and must never reach the resolver.
  const probe = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/preview-turn`,
    payload: { input: { ...input, staffNegotiations: [] } },
  });
  assert.equal(probe.statusCode, 200);
  const probeBody = probe.json();
  assert.ok(
    !probeBody.chiefCoalitions.some(
      (entry: { staffConstraintDirectorates: string[] }) => entry.staffConstraintDirectorates.includes("training"),
    ),
    "training is absent from the unnegotiated relief candidates",
  );

  const rejected = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input, expectedRevision: 0 },
  });
  assert.equal(rejected.statusCode, 400);
  assert.match(rejected.json().error, /no longer stretch/i);
  assert.deepEqual(rejected.json().ineligibleNegotiations, input.staffNegotiations);
  assert.equal(rejected.json().session, undefined, "no session payload is returned for a rejected turn");

  // Positive control: the same packet WITHOUT the out-of-eligibility
  // negotiation resolves normally once the accepted-risk preconditions are
  // met — the gate rejects only the ineligible negotiation, not the turn.
  const accepted = await withAcceptedRiskCandidates(id, { ...input, staffNegotiations: [] });
  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: accepted, expectedRevision: 0 },
  });
  assert.equal(resolved.statusCode, 200);
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
    payload: { memoId: memo.id, optionId: option.id, selections: [{ memoId: memo.id, optionId: option.id }], expectedRevision: 0 },
  });
  assert.equal(opened.statusCode, 200);
  const openedBody = opened.json();
  assert.equal(openedBody.session.revision, 1);
  assert.equal(openedBody.conversation.status, "active");
  assert.ok(openedBody.conversation.staffReadoutEvidence.rationale.includes("evidence"));
  assert.ok(openedBody.conversation.transcript.some((entry: { text: string }) => entry.text.includes(openedBody.conversation.staffReadoutEvidence.rationale)));

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
  assert.equal(commitment.chiefId, chiefId);
  assert.equal(commitment.memoId, memo.id);
  assert.equal(commitment.optionId, option.id);
  assert.ok(["protected_boundary", "sequencing_promise", "bounded_concession", "accepted_risk", "recorded_dissent"].includes(commitment.term));
  assert.equal(commitment.turnMade, 1);
  assert.equal(commitment.fulfilled, null);
  assert.match(commitment.label, /bounded order/i);

  const input = {
    turn: responseBody.session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    selections: firstOptionSelections(responseBody.memos),
  };
  const acceptedInput = await withAcceptedRiskCandidates(id, input);
  const resolved = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/resolve-turn`,
    payload: { input: acceptedInput, expectedRevision: responseBody.session.revision },
  });
  assert.equal(resolved.statusCode, 200);
  assert.equal(resolved.json().validation.ok, true);

  const exported = await app.inject({ method: "GET", url: `/api/sessions/${id}/export` });
  assert.equal(exported.statusCode, 200);
  const imported = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData: exported.json() },
  });
  assert.equal(imported.statusCode, 200);
  assert.equal(imported.json().session.history.length, 1);
  assert.equal(imported.json().session.state.conversationHistory[0].status, "completed");
});

test("import rejects a conversation action whose ledger context is forged", async () => {
  const created = await createSession();
  const id = created.session.id;
  const memo = created.memos[0];
  const option = memo.options[0];
  const chiefId = created.session.advisorRoster[0].chiefId;
  const opened = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/chiefs/${chiefId}/conversation/open`,
    payload: { memoId: memo.id, optionId: option.id, selections: [{ memoId: memo.id, optionId: option.id }], expectedRevision: 0 },
  });
  assert.equal(opened.statusCode, 200);
  const exported = await app.inject({ method: "GET", url: `/api/sessions/${id}/export` });
  const forged = exported.json();
  forged.session.authoritativeActions[0].preStateHash = "0".repeat(64);
  const rejected = await app.inject({ method: "POST", url: "/api/sessions/import", payload: { exportData: forged } });
  assert.equal(rejected.statusCode, 409);
  assert.match(rejected.json().error, /authoritative_action_mismatch/i);
});

test("import re-executes action transitions instead of trusting recomputed action digests", async () => {
  const created = await createSession();
  const id = created.session.id;
  const memo = created.memos[0];
  const option = memo.options[0];
  const chiefId = created.session.advisorRoster[0].chiefId;
  await app.inject({
    method: "POST", url: `/api/sessions/${id}/chiefs/${chiefId}/conversation/open`,
    payload: { memoId: memo.id, optionId: option.id, selections: [{ memoId: memo.id, optionId: option.id }], expectedRevision: 0 },
  });
  const exported = (await app.inject({ method: "GET", url: `/api/sessions/${id}/export` })).json();
  // This is structurally valid and its post-action digest matches the forged
  // state. Replay must still calculate the real opening transition and reject.
  exported.session.state.chiefTrust[chiefId] += 9;
  exported.session.authoritativeActions[0].postStateHash = campaignStateHash(exported.session.state);
  const rejected = await app.inject({ method: "POST", url: "/api/sessions/import", payload: { exportData: exported } });
  assert.equal(rejected.statusCode, 409);
  assert.match(rejected.json().error, /authoritative_action_mismatch/i);
});

test("import rejects hostile ledger chronology and context changes", async () => {
  const { exportData, created, chiefId, memo, option } = await exportConversationLedger();
  const actions = exportData.session.authoritativeActions;
  assert.equal(actions.length, 2, "fixture has an open and its first response");

  const deleted = structuredClone(exportData);
  deleted.session.authoritativeActions.splice(0, 1);
  await assertImportRejected(deleted);

  const duplicated = structuredClone(exportData);
  duplicated.session.authoritativeActions.splice(1, 0, structuredClone(duplicated.session.authoritativeActions[0]));
  await assertImportRejected(duplicated);

  const reordered = structuredClone(exportData);
  reordered.session.authoritativeActions.reverse();
  await assertImportRejected(reordered);

  const wrongChief = structuredClone(exportData);
  wrongChief.session.authoritativeActions[0].chiefId = created.session.advisorRoster.find((entry: { chiefId: string }) => entry.chiefId !== chiefId).chiefId;
  await assertImportRejected(wrongChief);

  const wrongMemo = structuredClone(exportData);
  const otherMemo = created.memos.find((entry: { id: string }) => entry.id !== memo.id);
  wrongMemo.session.authoritativeActions[0].memoId = otherMemo.id;
  wrongMemo.session.authoritativeActions[0].optionId = otherMemo.options[0].id;
  wrongMemo.session.authoritativeActions[0].packetSelections = [{ memoId: otherMemo.id, optionId: otherMemo.options[0].id }];
  await assertImportRejected(wrongMemo);

  const wrongPacket = structuredClone(exportData);
  wrongPacket.session.authoritativeActions[0].packetSelections = [{ memoId: memo.id, optionId: created.memos.find((entry: { id: string }) => entry.id === memo.id).options.find((entry: { id: string }) => entry.id !== option.id).id }];
  await assertImportRejected(wrongPacket);

  const wrongState = structuredClone(exportData);
  wrongState.session.authoritativeActions[0].preStateHash = wrongState.session.authoritativeActions[1].preStateHash;
  await assertImportRejected(wrongState);

  const foreignTurn = structuredClone(exportData);
  foreignTurn.session.authoritativeActions.push({
    ...structuredClone(foreignTurn.session.authoritativeActions[0]),
    sequence: foreignTurn.session.authoritativeActions.length + 1,
    turn: 2,
  });
  await assertImportRejected(foreignTurn);

  const crossScenario = structuredClone(exportData);
  crossScenario.session.authoritativeActions[0].scenarioId = "another-scenario";
  await assertImportRejected(crossScenario);

  const crossContent = structuredClone(exportData);
  crossContent.session.authoritativeActions[0].contentVersion = "another-content-version";
  await assertImportRejected(crossContent);

  const impossiblePacket = structuredClone(exportData);
  impossiblePacket.session.authoritativeActions[0].packetSelections = [
    ...impossiblePacket.session.authoritativeActions[0].packetSelections,
    ...impossiblePacket.session.authoritativeActions[0].packetSelections,
  ];
  await assertImportRejected(impossiblePacket);

  const alternateResponse = exportData.session.state.conversationHistory[0].choices
    .find((choice: { id: string }) => choice.id !== exportData.session.authoritativeActions[1].responseId);
  assert.ok(alternateResponse, "fixture requires a structurally valid alternate response");
  const changedResponse = structuredClone(exportData);
  changedResponse.session.authoritativeActions[1].responseId = alternateResponse.id;
  await assertImportRejected(changedResponse);

  const foreignCampaign = await exportConversationLedger();
  const crossCampaign = structuredClone(exportData);
  crossCampaign.session.authoritativeActions[0] = structuredClone(foreignCampaign.exportData.session.authoritativeActions[0]);
  await assertImportRejected(crossCampaign);
});

test("import rejects forged relationship state and replays a valid v8 ledger repeatably", async () => {
  const { exportData, chiefId } = await exportConversationLedger();
  const variants: Array<[string, (session: any) => void]> = [
    ["trust", (session) => { session.state.chiefTrust[chiefId] += 3; }],
    ["agenda memory", (session) => { session.state.chiefAgendaMemory[chiefId] = { chiefId, lastTurn: 1, lastMemoId: "posture", lastOptionId: "surge-exercises", lastPosition: "support", notes: ["forged"] }; }],
    ["commitments", (session) => { session.state.activeCommitments.push({ id: "forged", chiefId, type: "doctrine", label: "forged", turnMade: 1, fulfilled: null }); }],
    ["conversation history", (session) => { session.state.conversationHistory[0].memoId = "intelligence-focus"; }],
  ];
  for (const [label, mutate] of variants) {
    const forged = structuredClone(exportData);
    mutate(forged.session);
    await assertImportRejected(forged);
    assert.ok(label);
  }

  const first = await app.inject({ method: "POST", url: "/api/sessions/import", payload: { exportData } });
  const second = await app.inject({ method: "POST", url: "/api/sessions/import", payload: { exportData } });
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(first.json().session.state, second.json().session.state);
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

test("imported copies keep byte-identical portraits under a new session id (deterministic seed namespace)", async () => {
  const created = await createSession();
  const source = created.session;
  const exported = await app.inject({ method: "GET", url: `/api/sessions/${source.id}/export` });
  assert.equal(exported.statusCode, 200);
  const exportData = exported.json();

  const imported = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData },
  });
  assert.equal(imported.statusCode, 200);
  const importedSession = imported.json().session;

  assert.notEqual(importedSession.id, source.id, "imported session must get a new id (new deterministic seed namespace)");
  assert.deepEqual(importedSession.advisorRoster, exportData.session.advisorRoster, "stored advisorRoster portraits must remain byte-identical across import");
  const chiefId = importedSession.advisorRoster[0].chiefId;
  assert.notEqual(
    chiefSpriteDeterministicSeed(importedSession.id, chiefId),
    chiefSpriteDeterministicSeed(source.id, chiefId),
    "the deterministic seed derived from the new session id must differ from the source's",
  );
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

test("import rejects replay-consistent exports whose recorded turn requested ineligible relief (closing pass 7 P1)", async () => {
  const created = await createSession();
  const session = created.session;

  // The live repro: Training is absent from the unnegotiated packet's relief
  // candidates for this packet, yet the sim resolver accepts the negotiation —
  // so a replay-consistent session containing it is constructible (the old
  // headless route did exactly that) and must now be rejected at import.
  const ineligibleInput = {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [{ directorate: "training", reliefPoints: 1, cost: "political_cover" }],
    selections: [
      ...firstOptionSelections(created.memos),
      { memoId: "force-development", optionId: "deception-grid" },
    ],
  };
  assert.deepEqual(
    ineligibleStaffNegotiations(soloScenario, session.initialState, ineligibleInput),
    ineligibleInput.staffNegotiations,
    "fixture must be ineligible under the shared validator",
  );

  // Replay consistency is NOT the gate: the sim boundary accepts the input, so
  // the hand-built session replays cleanly from its own history. The input is
  // parsed through the schema (as /resolve-turn does) so its serialized key
  // order — which the replay hash is computed over — matches what the server
  // stores.
  const parsedIneligibleInput = turnInputSchema.parse(ineligibleInput);
  const result = resolveTurn(soloScenario, session.initialState, parsedIneligibleInput);
  const replayConsistent = {
    ...session,
    revision: session.revision + 1,
    turnInputs: [parsedIneligibleInput],
    history: [result],
    state: result.nextState,
  };
  gameSessionSchema.parse(replayConsistent);

  const rejected = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData: { exportedAt: new Date().toISOString(), session: replayConsistent } },
  });
  assert.equal(rejected.statusCode, 409);
  assert.match(rejected.json().error, /did not offer/i);

  // Positive control: a replay-consistent export whose recorded turn requested
  // ELIGIBLE relief (Operations is strained for the default selections and
  // appears in the unnegotiated packet's relief candidates) still imports.
  const eligibleInput = {
    turn: session.state.turn,
    selectedActionIds: [],
    acceptedRiskOverrides: [],
    staffNegotiations: [{ directorate: "operations", reliefPoints: 1, cost: "political_cover" }],
    selections: firstOptionSelections(created.memos),
  };
  assert.deepEqual(
    ineligibleStaffNegotiations(soloScenario, session.initialState, eligibleInput),
    [],
    "fixture must be eligible under the shared validator",
  );
  const eligibleResult = resolveTurn(soloScenario, session.initialState, turnInputSchema.parse(eligibleInput));
  const eligibleSession = {
    ...session,
    revision: session.revision + 1,
    turnInputs: [turnInputSchema.parse(eligibleInput)],
    history: [eligibleResult],
    state: eligibleResult.nextState,
  };
  const accepted = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData: { exportedAt: new Date().toISOString(), session: eligibleSession } },
  });
  assert.equal(accepted.statusCode, 200);
  assert.equal(accepted.json().session.history.length, 1);
});

test("/api/scenario returns doctrineLens and doctrine event metadata", async () => {
  const scenario = await app.inject({ method: "GET", url: "/api/scenario" });
  assert.equal(scenario.statusCode, 200);
  const body = scenario.json().scenario;
  assert.ok(body.doctrineLens, "/api/scenario must return doctrineLens");
  assert.ok(body.doctrineLens.burdenBias);
  const doctrineEvents = body.events.filter((event: { doctrineTrigger?: unknown; causalContext?: unknown }) => event.doctrineTrigger && event.causalContext);
  assert.equal(doctrineEvents.length, 3);
  assert.ok(doctrineEvents.every((event: { doctrineTrigger: { sourceGeneLabel?: string } }) => event.doctrineTrigger.sourceGeneLabel));
  const sustainment = doctrineEvents.find((event: { id: string }) => event.id === "doctrine-sustainment-patience-gap");
  assert.ok(sustainment);
  assert.equal(sustainment.doctrineTrigger.sustainedTurns, 3);
  assert.deepEqual(sustainment.causalContext.staffFunctionRefs, ["S4", "S5"]);
});

test("import rejects old 0.9.0 content-version exports", async () => {
  const created = await createSession();
  const id = created.session.id;
  const exported = await app.inject({ method: "GET", url: `/api/sessions/${id}/export` });
  assert.equal(exported.statusCode, 200);
  const exportData = exported.json();
  exportData.session.contentVersion = "0.9.0";

  const rejected = await app.inject({
    method: "POST",
    url: "/api/sessions/import",
    payload: { exportData },
  });
  assert.equal(rejected.statusCode, 409);
  assert.match(rejected.json().error, /content version/i);
});

test("resolve-turn persists doctrine maturity and the after-action causal note", async () => {
  const created = await createSession();
  const id = created.session.id;
  const selections = [
    { memoId: "posture", optionId: "quiet-recovery" },
    { memoId: "intelligence-focus", optionId: "warning-net" },
    { memoId: "sustainment-focus", optionId: "repair-first" },
    { memoId: "alliance-frame", optionId: "quiet-reassurance" },
  ];
  let input = { turn: 1, selectedActionIds: [], acceptedRiskOverrides: [], staffNegotiations: [], selections };
  let body: { session: { state: { doctrineMaturity: Record<string, { consecutiveTurns: number; startedTurn: number }> } }; result: { afterAction: Array<{ heading: string; detail: string }> } };
  for (const turn of [1, 2, 3]) {
    const preview = await app.inject({ method: "POST", url: `/api/sessions/${id}/preview-turn`, payload: { input: { ...input, turn } } });
    assert.equal(preview.statusCode, 200);
    input = { ...input, turn, acceptedRiskOverrides: preview.json().acceptedRiskCandidates };
    const resolved = await app.inject({ method: "POST", url: `/api/sessions/${id}/resolve-turn`, payload: { input, expectedRevision: turn - 1 } });
    assert.equal(resolved.statusCode, 200, resolved.body as unknown as string);
    body = resolved.json();
    if (turn === 2) {
      const streak = body.session.state.doctrineMaturity["doctrine-sustainment-patience-gap"];
      assert.ok(streak, "mid-streak maturity persisted on the server session");
      assert.equal(streak.consecutiveTurns, 2);
      assert.equal(streak.startedTurn, 1);
    }
  }
  const note = body!.result.afterAction.find((entry: { heading: string }) => entry.heading === "Doctrine risk matured: The patience gap becomes policy blowback");
  assert.ok(note, "resolve-turn returns the doctrine after-action note");
  assert.match(note.detail, /Sustainment-First Operational Reach/);
  assert.match(note.detail, /slow-burn/);
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

test("delete removes an incompatible stale save that the canonical read refuses (round-2 F7)", async () => {
  const created = await createSession();
  const id = created.session.id;
  const savePath = path.join(saveDir, `${id}.json`);
  const persisted = JSON.parse(await readFile(savePath, "utf8"));
  persisted.contentVersion = "0.9.0"; // stale: the canonical read rejects it
  await writeFile(savePath, JSON.stringify(persisted), "utf8");

  // Load still refuses the stale save…
  const refused = await app.inject({ method: "GET", url: `/api/sessions/${id}` });
  assert.notEqual(refused.statusCode, 200);

  // …but deletion is id-level and must succeed without a canonical parse.
  const deleted = await app.inject({ method: "DELETE", url: `/api/sessions/${id}` });
  assert.equal(deleted.statusCode, 200);
  assert.equal(deleted.json().ok, true);

  const missing = await app.inject({ method: "GET", url: `/api/sessions/${id}` });
  assert.equal(missing.statusCode, 404);
});

test("invalid session identifiers are rejected as client errors", async () => {
  const response = await app.inject({ method: "GET", url: "/api/sessions/not-a-uuid" });
  assert.equal(response.statusCode, 400);
  assert.match(response.json().error, /not a valid campaign id/i);
});

test("session listing retains malformed persisted save files as manageable tombstones", async () => {
  await writeFile(path.join(saveDir, "malformed.json"), "{not valid json", "utf8");
  const listed = await app.inject({ method: "GET", url: "/api/sessions" });

  assert.equal(listed.statusCode, 200);
  const record = listed.json().sessions.find((entry: { id: string }) => entry.id === "malformed");
  assert.deepEqual(record, {
    id: "malformed",
    recordStatus: "corrupt",
    recordReason: "This campaign file is damaged or incomplete and was not opened.",
  });
});

test("session listing retains canonical-incompatible saves as manageable tombstones", async () => {
  const created = await createSession();
  const savePath = path.join(saveDir, `${created.session.id}.json`);
  const persisted = JSON.parse(await readFile(savePath, "utf8"));
  persisted.contentVersion = "0.9.0";
  await writeFile(savePath, JSON.stringify(persisted), "utf8");

  const listed = await app.inject({ method: "GET", url: "/api/sessions" });
  const record = listed.json().sessions.find((entry: { id: string }) => entry.id === created.session.id);
  assert.equal(record.recordStatus, "incompatible");
  assert.match(record.recordReason, /different engine, scenario, content set, or save format/i);
});

test("corrupt sessions return a storage failure rather than a misleading 404", async () => {
  const id = "00000000-0000-1000-8000-000000000099";
  await writeFile(path.join(saveDir, `${id}.json`), "{not valid json", "utf8");

  const response = await app.inject({ method: "GET", url: `/api/sessions/${id}` });

  assert.equal(response.statusCode, 500);
  assert.match(response.json().error, /save store/i);
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
      payload: { memoId: memo.id, optionId: option.id, selections: [{ memoId: memo.id, optionId: option.id }], expectedRevision: 0 },
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

test("static shell and asset routes accept any origin while API routes stay on the strict allow-list", async () => {
  const unlistedOrigin = "http://203.0.113.10:4000";

  const shell = await app.inject({ method: "GET", url: "/", headers: { origin: unlistedOrigin } });
  assert.equal(shell.statusCode, 200);
  assert.equal(shell.headers["access-control-allow-origin"], unlistedOrigin);

  const asset = await app.inject({ method: "GET", url: "/does-not-exist.js", headers: { origin: unlistedOrigin } });
  assert.equal(asset.headers["access-control-allow-origin"], unlistedOrigin);

  const api = await app.inject({ method: "GET", url: "/api/health", headers: { origin: unlistedOrigin } });
  assert.equal(api.statusCode, 200);
  assert.equal(api.headers["access-control-allow-origin"], undefined);
});

test("CORS rejects localhost origins not in the explicit allow list", async () => {
  const rejected = await app.inject({
    method: "OPTIONS",
    url: "/api/health",
    headers: {
      origin: "http://127.0.0.1:4001",
      "access-control-request-method": "GET",
    },
  });
  assert.notEqual(rejected.statusCode, 500);
  assert.equal(rejected.headers["access-control-allow-origin"], undefined);
});

// Keep this test last: it plants a save-dir entry that makes list() fail for the
// rest of the process, so it must run after every listing-dependent test above.
test("session listing surfaces storage I/O failures through the sanitized mapping", async () => {
  // A directory named like a save file makes readFile throw EISDIR (not ENOENT),
  // which list() must surface as SaveStoreIOError rather than skip as corrupt.
  await mkdir(path.join(saveDir, "00000000-0000-1000-8000-0000000000fe.json"));

  const response = await app.inject({ method: "GET", url: "/api/sessions" });

  assert.equal(response.statusCode, 500);
  assert.match(response.json().error, /save store/i);
  // Sanitized contract shape: { error } only, never Fastify's { statusCode, error, message }.
  assert.equal(response.json().statusCode, undefined);
  assert.equal(response.json().message, undefined);
});
