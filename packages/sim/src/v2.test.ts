import test from "node:test";
import assert from "node:assert/strict";
import type { V2Identity, V2Session } from "@brass-ledger/shared";
import {
  V2ReplayValidationError,
  canonicalV2Json,
  v2FinalSessionDigest,
  v2InitialStateDigest,
  v2Sha256,
  validateV2ReplaySkeleton,
} from "./index";

const identity: V2Identity = {
  ruleset: "v2", rulesetVersion: "0.2.0-prototype", scenarioId: "kestrel-strait", contentVersion: "2026.09.02",
  contentDigest: "a".repeat(64),
};

function validSession(): V2Session {
  const initialState = { cycle: 1, seed: "kestrel-seed" } as const;
  const session = {
    id: "v2-save-1", campaignId: "v2-campaign-1", revision: 0, identity,
    initialState, state: initialState, actionLedger: [] as [], updatedAt: "2026-09-02T00:00:00.000Z",
  };
  return {
    ...session,
    initialStateDigest: v2InitialStateDigest(identity, initialState),
    finalStateDigest: v2FinalSessionDigest(session),
  };
}

test("V2 canonical SHA-256 has stable hard-coded vectors", () => {
  assert.equal(canonicalV2Json({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(v2Sha256({ b: 2, a: 1 }), "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777");
  assert.equal(canonicalV2Json({ é: 4, z: 1, ä: 3, Å: 2 }), '{"z":1,"Å":2,"ä":3,"é":4}');
  assert.equal(v2Sha256({ é: 4, z: 1, ä: 3, Å: 2 }), "997c7e2cf5d27456c0e6bfb9006a736c2f156f753e419c06ee6f61d7872d8190");
  const session = validSession();
  assert.equal(session.initialStateDigest, "935036bc2f04fc49feef8f9ecb59f10a832a28cc72018b243a9ce607e9beb739");
  assert.equal(session.finalStateDigest, "d6535e3bd3dd1bf41391f4a6a36ba15015c375a3b51d708c350c73575ca32024");
});

test("V2 digest evidence changes for every identity field", () => {
  const state = { cycle: 1, seed: "kestrel-seed" };
  const baseline = v2InitialStateDigest(identity, state);
  const changed: V2Identity[] = [
    { ...identity, rulesetVersion: "different" },
    { ...identity, scenarioId: "other-scenario" },
    { ...identity, contentVersion: "other-content" },
    { ...identity, contentDigest: "b".repeat(64) },
  ];
  for (const candidate of changed) assert.notEqual(v2InitialStateDigest(candidate, state), baseline);
});

test("V2 skeleton verifies matching identity and explicitly empty ledger", () => {
  const session = validSession();
  assert.deepEqual(validateV2ReplaySkeleton(session, identity), session);
});

test("V2 skeleton rejects registry, digest, state, and attempted-action tampering with stable codes", () => {
  const session = validSession();
  const cases: Array<[unknown, V2Identity, V2ReplayValidationError["code"]]> = [
    [session, { ...identity, contentDigest: "b".repeat(64) }, "v2_content_identity_mismatch"],
    [{ ...session, initialStateDigest: "0".repeat(64) }, identity, "v2_initial_state_digest_mismatch"],
    [{ ...session, state: { cycle: 1, seed: "other" } }, identity, "v2_state_changed_without_ledger"],
    [{ ...session, actionLedger: [{}] }, identity, "v2_nonempty_ledger_unsupported"],
    [{ ...session, finalStateDigest: "0".repeat(64) }, identity, "v2_final_state_digest_mismatch"],
  ];
  for (const [candidate, liveIdentity, code] of cases) {
    assert.throws(() => validateV2ReplaySkeleton(candidate, liveIdentity), (error: unknown) => error instanceof V2ReplayValidationError && error.code === code);
  }
});
