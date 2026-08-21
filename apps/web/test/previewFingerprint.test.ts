import test from "node:test";
import assert from "node:assert/strict";
import type { MemoSelection, StaffNegotiation } from "@brass-ledger/shared";
import { previewFingerprint } from "../src/hooks/usePreview";

test("previewFingerprint is collision-free for delimiter-encoded lookalikes", () => {
  // Under `:`/`|` concatenation both selections serialize to `a:b:c` — the old
  // fingerprint collided. JSON tuple serialization must distinguish them.
  const selectionsA: MemoSelection[] = [{ memoId: "a", optionId: "b:c" }];
  const selectionsB: MemoSelection[] = [{ memoId: "a:b", optionId: "c" }];
  assert.notEqual(previewFingerprint(selectionsA, []), previewFingerprint(selectionsB, []));
});

test("previewFingerprint distinguishes negotiations that differ only by note", () => {
  const selections: MemoSelection[] = [{ memoId: "posture", optionId: "tempo-hold" }];
  const withoutNote: StaffNegotiation[] = [{ directorate: "operations", reliefPoints: 1, cost: "political_cover" }];
  const withNote: StaffNegotiation[] = [
    { directorate: "operations", reliefPoints: 1, cost: "political_cover", note: "offload the surge" },
  ];
  const differentNote: StaffNegotiation[] = [
    { directorate: "operations", reliefPoints: 1, cost: "political_cover", note: "offload the backlog" },
  ];
  assert.notEqual(previewFingerprint(selections, withoutNote), previewFingerprint(selections, withNote));
  assert.notEqual(previewFingerprint(selections, withNote), previewFingerprint(selections, differentNote));
});

test("previewFingerprint is order-independent: reversed selections/negotiations serialize identically", () => {
  const selections: MemoSelection[] = [
    { memoId: "posture", optionId: "tempo-hold" },
    { memoId: "readiness", optionId: "surge" },
  ];
  const negotiations: StaffNegotiation[] = [
    { directorate: "operations", reliefPoints: 1, cost: "political_cover", note: "first" },
    { directorate: "sustainment", reliefPoints: 2, cost: "budget_overtime" },
  ];
  assert.equal(
    previewFingerprint(selections, negotiations),
    previewFingerprint([...selections].reverse(), [...negotiations].reverse()),
  );
});
