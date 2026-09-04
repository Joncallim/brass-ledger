---
type: v2-hq-belief-totality-origin-contract
status: active
---

# HQ Belief Totality And Origin Rules

Backlink: [[README]]

This document closes the remaining exact-state ambiguities in #100. It is narrower than [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] and therefore controls where an older phrase there is less precise.

- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns generated reachability/counts.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns evidence semantics and copy.

# 1. No #99 canonicalisation refactor

#100 creates and uses one browser-safe shared canonical-JSON helper for **new #100 identities only**.

It does **not** refactor or replace #99's private canonicalisation/hashing implementation.

Reason:

- #100 does not need to change #99 to compute model/occurrence identities;
- touching a closed replay-critical subsystem adds risk without product value;
- equivalence can be tested without changing #99 production code.

Create:

`packages/shared/src/canonical-json.ts`

It recursively sorts object keys and preserves array order for schema-parsed JSON values.

Use it for:

- #100 model semantic digest input;
- #100 occurrence instance-ID input;
- later #103 content identity where adopted explicitly.

Required tests:

- independent reference implementation and shared implementation agree on a nested adversarial JSON corpus;
- key insertion order never changes canonical output;
- array order always changes output where array order is semantic;
- duplicate/set-like semantic arrays are rejected by model validation rather than silently normalised;
- all existing #99 code and golden replay/hash vectors remain untouched and green.

Do not make #99's private `canonicalV2Json` delegate to the new helper during #100.

# 2. Evidence origin binds every authoritative input entry

A directed occurrence may depend on more than one Ravellan decision. A single `observationEntry` field is therefore insufficient for the operational-sequence target.

Use a strict origin equivalent to:

```ts
type V2HqEvidenceOrigin =
  | {
      kind: "ordinary"
      slotId: string
      cycle: 1 | 2 | 3 | 4
    }
  | {
      kind: "derived"
      producer: "reroute" | "focused" | "lattice" | "liaison"
      triggerEntry: V2CanonicalLedgerEntryRef
      observationEntries: readonly [
        V2CanonicalLedgerEntryRef,
        ...V2CanonicalLedgerEntryRef[],
      ]
      producerSlotId: string
    }
```

`observationEntries` is canonical ascending cycle order and contains **every replay entry whose authoritative fields the producer read**.

Exact origins:

| Producer/result | Trigger entry | Observation entries |
| --- | --- | --- |
| C2 reroute → C3 | C2 command-set | C2 Ravellan decision |
| C3 focused → C4 | C3 command-set | C4 Ravellan decision |
| C4 landing → C5 | C4 task-collection | C5 Ravellan decision |
| C4 auxiliary → C5 | C4 task-collection | C5 Ravellan decision |
| C4 sequence → C5 | C4 task-collection | C4 and C5 Ravellan decisions |
| C5 landing → C6 | C5 task-collection | C5 Ravellan decision |
| C5 auxiliary → C6 | C5 task-collection | C5 Ravellan decision |
| C5 sequence → C6 | C5 task-collection | C4 and C5 Ravellan decisions |
| C4 liaison → C5 | C4 command-set | C5 Ravellan decision |

The C6 terminal Ravellan entry is never an observation entry for intelligence.

Validation rejects:

- missing required entry;
- extra later/future entry;
- duplicate entry refs;
- non-canonical ordering;
- a ref whose kind/cycle is illegal for the producer;
- an origin whose entry hashes/revisions do not match the trusted session.

Instance identity hashes the complete origin object.

# 3. Exact tentative public-case shape

Use the strict discriminated public-case type:

```ts
type V2HqPublicCaseBasis =
  | {
      state: "none"
      direction: null
      blocker: "no-eligible-public-evidence"
    }
  | {
      state: "tentative"
      direction: "preparation" | "coercion" | null
      blocker:
        | "no-diagnostic-basis"
        | "no-independent-corroboration"
        | "contrary-current-evidence"
        | "competing-public-cases"
      candidateEvidenceInstanceIds: readonly string[] // length 1 or 2
      candidateCorroborationGroupIds: readonly string[] // same length
    }
  | {
      state: "credible-source-sensitive"
      direction: "preparation" | "coercion"
      blocker: null
      supportingEvidenceInstanceIds: readonly [string, string]
      supportingCorroborationGroupIds: readonly [string, string]
    }
```

A `tentative` result always has 1–2 deterministic candidate items. `none` has no candidate array. A credible result always has exactly two distinct corroboration groups.

# 4. Public-case candidate ranking

Eligible means current, non-superseded and `publicCaseRole = source-sensitive`.

Ranking inside one direction:

1. diagnostic before indicator;
2. newest observed cycle;
3. definition ID;
4. instance ID.

## No eligible evidence

Return `none / null / no-eligible-public-evidence`.

## Eligible evidence in both directions

Return:

- `tentative / null`;
- blocker `competing-public-cases`;
- exactly two candidate IDs: highest-ranked preparation item, then highest-ranked coercion item;
- candidate corroboration groups in the same order.

## Eligible evidence in one direction only

Let D be that direction.

Select the highest-ranked D item as primary candidate.

Then select the highest-ranked additional D item from a different corroboration group if one exists.

Blocker precedence:

1. any current opposite directional evidence of any public-role class → `contrary-current-evidence`;
2. no eligible diagnostic D item → `no-diagnostic-basis`;
3. no second D item from another corroboration group → `no-independent-corroboration`;
4. otherwise return credible with the deterministic diagnostic primary and independent corroborator defined in [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

For a tentative directional case, return the one primary candidate and the independent second candidate if one exists, maximum two.

Opposite-direction evidence is not included in candidate support; it is represented by the blocker and the normal Intelligence-Chief contrary-evidence slot.

# 5. Player-facing public-case handling

The internal blocker enum is not displayed verbatim.

At C5/C6, when a public action would otherwise be relevant:

- `none` may render nothing or a concise “we do not have a public case” line where explaining an absent course is necessary;
- `tentative / D` may render direction-specific ordinary language explaining the primary blocker;
- `tentative / null` says the public evidence itself points in both directions;
- credible exposes the exact directional claim and exact two support summaries/source contexts that would be spent.

When a credible case is actionable and source use is unspent, the public-claim panel must display the exact two support occurrences selected by the reducer. It may not advertise credibility using a different hidden basis than the player sees.

The normal Intel brief can retain its own bounded assessment reasons, but the action panel's support basis is authoritative for source use.

# 6. Exact public-case state delta

```ts
type V2HqPublicCaseStateChange =
  | "initial"
  | "unchanged"
  | "opened"
  | "strengthened"
  | "weakened"
  | "closed"
```

Total mapping:

1. no previous snapshot → `initial`;
2. same state → `unchanged`;
3. `none → tentative|credible` → `opened`;
4. `tentative → credible` → `strengthened`;
5. `credible → tentative` → `weakened`;
6. `tentative|credible → none` → `closed`.

No other state pair exists.

# 7. Exact public-case direction delta

```ts
type V2HqPublicCaseDirectionChange =
  | "initial"
  | "unchanged"
  | "established"
  | "clarified"
  | "became-conflicted"
  | "reversed"
  | "cleared"
```

Total mapping:

1. no previous snapshot → `initial`;
2. previous direction == current direction → `unchanged`;
3. previous direction null, current direction D:
   - previous state `tentative` → `clarified`;
   - previous state `none` → `established`;
4. previous direction D, current direction null:
   - current state `tentative` → `became-conflicted`;
   - current state `none` → `cleared`;
5. previous and current directions are different non-null values → `reversed`.

Schema-valid public-case states make this exhaustive. No fallback is permitted.

Table-test every schema-valid previous/current pair, not merely canonical producer trajectories.

# 8. Exact evidence-change cause

Evidence set comparison is between adjacent historical snapshots.

Classify current changes into three primitive causes:

- **new** — an added current occurrence that did not cause any replacement;
- **stale** — a previously current occurrence exceeded its relevance window;
- **replacement** — a new occurrence caused same-question or explicit supersession.

`addedInstanceIds` contains every new occurrence. Also derive:

- `nonReplacementAddedInstanceIds`;
- `replacementInstanceIds`;
- `becameStaleInstanceIds`;
- `supersededInstanceIds`.

Cause:

- no primitive cause → `none`;
- only new → `new-evidence`;
- only stale → `staleness`;
- only replacement → `supersession`;
- two or more primitive causes → `mixed`.

The replacement occurrence itself does not make the result `mixed`; replacement is one primitive event even though it is also newly observed.

# 9. Material-update rule

A safe update is material when any of these changes:

- assessment state;
- warning;
- public-case state/direction/blocker;
- exact credible support basis;
- selected bounded assessment basis/contrary evidence;
- a displayed report becomes stale or superseded.

Therefore an unchanged assessment sentence may still require an update line because warning was acquired, a public action opened/closed, or the evidence underpinning the same judgement materially changed.

# 10. Independent totality tests

Add tests independent from production reducer helpers for:

- all schema-valid public-case previous/current pairs and both delta mappings;
- every blocker precedence combination;
- deterministic candidate/support ranking under insertion-order permutations;
- candidate arrays bounded to 1–2 and credible arrays exactly two;
- public support groups distinct;
- action panel support deep-equal to frozen source-use support after use;
- replacement + unrelated new evidence → mixed;
- replacement alone → supersession;
- staleness + replacement → mixed;
- origin entry completeness for all nine directed result cuts above;
- C5 sequence occurrence identity changing if either C4 or C5 Ravellan entry changes;
- C5 task→C6 occurrence identity remaining independent of R6 action/row;
- shared #100 canonical JSON tests without modification to #99 production canonicalisation.

# 11. Rejection conditions

Reject #100 if it:

- refactors #99 canonicalisation merely for reuse;
- hashes only one observation entry for a multi-entry producer;
- accepts free-form source IDs as authoritative origin;
- returns a directionless or one-source credible case;
- leaves tentative candidate/support ordering unspecified;
- hides a different support basis behind the public action than the one shown;
- has a catch-all public-case delta;
- classifies every replacement as mixed merely because a replacement is new;
- suppresses warning/public-action-space changes because the assessment text is unchanged.
