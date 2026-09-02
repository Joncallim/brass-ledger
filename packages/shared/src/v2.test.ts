import test from "node:test";
import assert from "node:assert/strict";
import {
  gameSessionSchema,
  createInitialGameSession,
  isV2ExportPayload,
  isV2SessionPayload,
  v2AgendaIssueSchema,
  v2CommandSetSchema,
  v2FinalOrderSchema,
  v2IntentDeclarationSchema,
  v2IntentReasonRefs,
  v2CurrentRulesetVersion,
  v2SessionExportSchema,
  v2SessionSchema,
} from "./index";
import { soloScenario } from "@brass-ledger/content";

const digest = "a".repeat(64);
const v2Session = {
  id: "v2-save-1",
  campaignId: "v2-campaign-1",
  revision: 0,
  identity: { ruleset: "v2", rulesetVersion: v2CurrentRulesetVersion, scenarioId: "kestrel-strait", contentVersion: "2026.09.02", contentDigest: digest },
  initialState: { cycle: 1, seed: "kestrel-seed", standingIntent: null },
  state: { cycle: 1, seed: "kestrel-seed", standingIntent: null },
  actionLedger: [],
  initialStateDigest: digest,
  finalStateDigest: digest,
  updatedAt: "2026-09-02T00:00:00.000Z",
};

test("V2 identity/session/export roots round-trip with an explicit required empty ledger", () => {
  assert.deepEqual(v2SessionSchema.parse(v2Session), v2Session);
  assert.deepEqual(v2SessionExportSchema.parse({ exportedAt: "2026-09-02T00:00:00.000Z", session: v2Session }).session, v2Session);
  assert.equal(isV2SessionPayload(v2Session), true);
  assert.equal(isV2ExportPayload({ exportedAt: "2026-09-02T00:00:00.000Z", session: v2Session }), true);
});

test("V2 roots reject missing ledgers, unknown mechanics, malformed digests, and untagged lookalikes", () => {
  assert.throws(() => v2SessionSchema.parse(({ ...v2Session, actionLedger: undefined })), /actionLedger/i);
  assert.throws(() => v2SessionSchema.parse(({ ...v2Session, state: { ...v2Session.state, hiddenPosture: "testing" } })), /unrecognized key/i);
  assert.throws(() => v2SessionSchema.parse(({ ...v2Session, identity: { ...v2Session.identity, rulesetVersion: "0.2.0-prototype" }, initialState: { cycle: 1, seed: "legacy-v2" }, state: { cycle: 1, seed: "legacy-v2" } })), /0.3.0-prototype/i);
  assert.throws(() => v2SessionSchema.parse(({ ...v2Session, identity: { ...v2Session.identity, contentDigest: "not-a-digest" } })), /SHA-256/i);
  assert.equal(isV2SessionPayload({ ...v2Session, identity: { ...v2Session.identity, ruleset: "v1" } }), false);
});

test("V1 remains a distinct legacy path and does not gain a V2 ledger requirement", () => {
  const v1 = gameSessionSchema.parse(createInitialGameSession(soloScenario, "legacy"));
  assert.deepEqual(v1.authoritativeActions, []);
  assert.equal(isV2SessionPayload(v1), false);
});

test("V2 command contracts accept only explicit officers and one strict disposition shape", () => {
  const issue = {
    id: "shipping-probe", responsibleOfficer: "operations", recommendedOrderId: "quiet-escort",
    authoredOrders: [{ id: "quiet-escort" }, { id: "visible-surge" }], mayDefer: false,
  };
  assert.deepEqual(v2AgendaIssueSchema.parse(issue), issue);
  assert.deepEqual(v2CommandSetSchema.parse({
    cycle: 1, expectedRevision: 0,
    dispositions: [{ issueId: "shipping-probe", kind: "intervene", orderId: "visible-surge" }],
  }).dispositions[0], { issueId: "shipping-probe", kind: "intervene", orderId: "visible-surge" });
  assert.throws(() => v2AgendaIssueSchema.parse({ ...issue, responsibleOfficer: "browser" }), /operations|intelligence|political/i);
  assert.throws(() => v2AgendaIssueSchema.parse({ ...issue, authoredOrders: [{ id: "quiet-escort" }] }));
  assert.throws(() => v2AgendaIssueSchema.parse({ ...issue, authoredOrders: [{ id: "quiet-escort" }, { id: "visible-surge" }, { id: "reroute" }, { id: "extra" }] }));
  assert.throws(() => v2CommandSetSchema.parse({
    cycle: 1, expectedRevision: 0,
    dispositions: [{ issueId: "shipping-probe", kind: "delegate", orderId: "client-invented" }],
  }), /unrecognized key/i);
});

test("V2 persisted final orders cannot contradict their disposition or intervention cost", () => {
  assert.deepEqual(v2FinalOrderSchema.parse({
    issueId: "shipping-probe", responsibleOfficer: "operations", disposition: "delegate", orderId: "quiet-escort", interventionCost: 0,
  }).orderId, "quiet-escort");
  assert.throws(() => v2FinalOrderSchema.parse({
    issueId: "shipping-probe", responsibleOfficer: "operations", disposition: "delegate", orderId: null, interventionCost: 0,
  }));
  assert.throws(() => v2FinalOrderSchema.parse({
    issueId: "shipping-probe", responsibleOfficer: "operations", disposition: "defer", orderId: "quiet-escort", interventionCost: 0,
  }));
  assert.throws(() => v2FinalOrderSchema.parse({
    issueId: "shipping-probe", responsibleOfficer: "operations", disposition: "intervene", orderId: "visible-surge", interventionCost: 0,
  }));
});

test("V2 opening standing intent is complete, strictly mapped, and has one canonical reason reference per choice", () => {
  const intent = {
    mainPriority: "beacon-security",
    redLine: "civilian-shipping",
    toleratedCost: "political-friction",
    defaultStyle: "partner-consultation",
  } as const;
  const declaration = { cycle: 1, expectedRevision: 0, intent } as const;
  assert.deepEqual(v2IntentDeclarationSchema.parse(declaration), declaration);
  assert.deepEqual(v2IntentReasonRefs(intent), [
    { field: "redLine", value: "civilian-shipping" },
    { field: "mainPriority", value: "beacon-security" },
    { field: "defaultStyle", value: "partner-consultation" },
    { field: "toleratedCost", value: "political-friction" },
  ]);
  assert.throws(() => v2IntentDeclarationSchema.parse({ ...declaration, cycle: 2 }));
  assert.throws(() => v2IntentDeclarationSchema.parse({ ...declaration, intent: { ...intent, mainPriority: "protect-the-beacon" } }));
  assert.throws(() => v2SessionSchema.parse({ ...v2Session, initialState: { ...v2Session.initialState, standingIntent: intent, reasonRefs: [] } }), /unrecognized key/i);
});
