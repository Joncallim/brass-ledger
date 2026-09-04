---
type: v2-hq-belief-state-space-audit
status: active
---

# HQ Belief State-Space Audit

Backlink: [[README]]

This is the single exhaustive state-space authority for **#100**.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft meaning.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns implementation/replay seams.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact evidence definitions, producer mappings and copy.
- [[26-LATTICE-COLLECTION-MATRIX]] owns future #102 task persistence and collection production.

This audit exists because prose examples and a few fixtures cannot prove totality. It separately closes:

1. **Reducer algebra** — every categorical input combination, including states canonical Kestrel producers cannot currently reach.
2. **Temporal producer envelope** — every #99 hidden history and authorised evidence schedule through C6.
3. **Player-information equivalence** — different private histories that must project identically when legitimate evidence/public state is identical.

Passing one layer never substitutes for another.

# 1. Independent reference model

The architecture reference model independently reimplements rather than calling:

- committed #99 posture/action/preparation policy;
- #99 observation timing, replacement and expiry;
- [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]];
- the exact #100/#102 producer semantics in [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] and [[26-LATTICE-COLLECTION-MATRIX]];
- role-specific currency, persistent supersession and the three #100 reducers.

Production #100 does **not** implement #102 task persistence merely to recreate this audit. Verification is staged:

- #100 proves reducer totality, all 19 definition semantics, its ordinary/reroute/focused producers, historical cuts and a test-only reference envelope;
- #102 proves the same envelope through real replay-valid Lattice/liaison task transitions;
- #107 proves the subset reachable through fully legal complete Kestrel command packages and tests dominance/fun-structure questions.

Hard-coding the counts below without independently generating histories is not proof.

# 2. Raw adversary/command envelope

The broad envelope intentionally over-approximates later package legality:

- 3 opening Ravellan postures;
- 4 C1 public signal packages (`2 watch × 2 partner`);
- 9 C2 packages (`3 shipping × 3 public posture`);
- 4 C3 packages (`2 reserve × 2 partner`);
- 3 C4 operational courses;
- 48 C5 public packages (`3 Beacon × 2 reserve × 4 authority × 2 attribution-use flags`).

Exact raw histories:

`3 × 4 × 9 × 4 × 3 × 48 = 62,208`

Every history executes the exact #99 policy; Ravellan actions are not freely sampled.

These collapse to **257** distinct #100-relevant trusted-history projections when keyed by:

- all six Ravellan decisions, including action, row, pre/post posture and pre/post preparation; and
- exact C2 shipping course, because `reroute-and-monitor` is an evidence trigger.

The 257 are not “all game states”; they are the private/history equivalence classes relevant to intelligence production.

# 3. Producer schedules

For each of 257 projections enumerate:

- C3 focused staging absent/present;
- Lattice unavailable without liaison;
- Lattice unavailable with C4 commander-only liaison; or
- operational Lattice with one target in C4 and one **different** target in C5.

Operational Lattice has no zero-cost `collect nothing` course while unused targets remain. HQ preselects one target from standing priority and the player may retarget at zero normal intervention.

The six ordered two-target schedules are:

- landing → auxiliary;
- landing → sequence;
- auxiliary → landing;
- auxiliary → sequence;
- sequence → landing;
- sequence → auxiliary.

Exact producer schedules:

`257 × 2 × (2 + 6) = 4,112`

Each target is one-shot in Kestrel. C6 creates no normal Ravellan action or preparation transition, so same-target C5 retasking produces the same authorised source fact as the C4→C5 result in all 257 private projections. It is mechanically fake and illegal.

C3 focused staging never consumes the Lattice landing target. A focused-positive result is only an indicator plus warning; Lattice landing is diagnostic. Across all **138** focused-positive private projections:

- 118 change `preparation / weak → preparation / coherent` at C5;
- 20 change `unclear / conflicted → preparation / weak` at C5.

Thus the landing upgrade changes assessment in **138/138** cases.

# 4. Exact evidence vocabulary

The producer envelope reaches all **19** definitions in [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

The following former branches are invalid/dead:

- `reroute-auxiliary-integrated`;
- `lattice-auxiliary-integrated`;
- `liaison-auxiliary-military-links`.

At every authorised auxiliary result cut, `preparation = developing|ready` cannot coexist with the required `probe_shipping` branch under committed #99. Keep no speculative dead content.

# 5. Reducer algebra

For assessment-current, non-superseded evidence define booleans:

- `Pdiag` — preparation diagnostic exists;
- `Cdiag` — coercion diagnostic exists;
- `Pind` — preparation indicator exists;
- `Cind` — coercion indicator exists.

All **16** combinations are mandatory:

| Pdiag | Cdiag | Pind | Cind | Assessment | Basis pattern |
| ---: | ---: | ---: | ---: | --- | --- |
| 0 | 0 | 0 | 0 | `unclear / weak` | `no-direction` |
| 0 | 0 | 0 | 1 | `coercion / weak` | `indicator-coercion` |
| 0 | 0 | 1 | 0 | `preparation / weak` | `indicator-preparation` |
| 0 | 0 | 1 | 1 | `unclear / conflicted` | `indicator-conflict` |
| 0 | 1 | 0 | 0 | `coercion / coherent` | `diagnostic-coercion-clear` |
| 0 | 1 | 0 | 1 | `coercion / coherent` | `diagnostic-coercion-clear` |
| 0 | 1 | 1 | 0 | `coercion / weak` | `diagnostic-coercion-qualified` |
| 0 | 1 | 1 | 1 | `coercion / weak` | `diagnostic-coercion-qualified` |
| 1 | 0 | 0 | 0 | `preparation / coherent` | `diagnostic-preparation-clear` |
| 1 | 0 | 0 | 1 | `preparation / weak` | `diagnostic-preparation-qualified` |
| 1 | 0 | 1 | 0 | `preparation / coherent` | `diagnostic-preparation-clear` |
| 1 | 0 | 1 | 1 | `preparation / weak` | `diagnostic-preparation-qualified` |
| 1 | 1 | 0 | 0 | `unclear / conflicted` | `diagnostic-conflict` |
| 1 | 1 | 0 | 1 | `unclear / conflicted` | `diagnostic-conflict` |
| 1 | 1 | 1 | 0 | `unclear / conflicted` | `diagnostic-conflict` |
| 1 | 1 | 1 | 1 | `unclear / conflicted` | `diagnostic-conflict` |

Evidence count never decides direction. A diagnostic direction survives lower-grade contrary indicators, but becomes `weak` and must show material contrary evidence.

Mutation tests reject both majority voting and “any contrary indicator always means unclear.”

# 6. Algebraic versus producer-reachable warning states

The reducer/brief layer must be total for **10 algebraically legal** assessment/warning pairs:

- unclear/weak + none;
- unclear/conflicted + none or usable;
- preparation/weak + none or usable;
- preparation/coherent + none or usable;
- coercion/weak + none or usable;
- coercion/coherent + none.

`coercion / weak + usable` is algebraically legitimate: a coercion diagnostic may coexist with a preparation warning indicator.

Canonical Kestrel producers currently reach **9/10**. They do not reach coercion/weak + usable because coercion diagnostic production requires the authorised preparation fact to be `none`, while warning-bearing preparation evidence and #99 preparation monotonicity prevent that combination in authored histories.

Do not conflate “currently unreachable” with “invalid reducer input.” The brief remains total rather than crashing or suppressing a warning.

# 7. Basis-pattern presentation state

Assessment label alone does not explain the analytical basis. `preparation / weak`, for example, may mean indicator-only preparation or diagnostic preparation qualified by a coercion indicator.

The internal snapshot therefore carries exactly nine basis patterns:

- `no-direction`;
- `indicator-preparation`;
- `indicator-coercion`;
- `indicator-conflict`;
- `diagnostic-preparation-clear`;
- `diagnostic-preparation-qualified`;
- `diagnostic-coercion-clear`;
- `diagnostic-coercion-qualified`;
- `diagnostic-conflict`.

Combined with valid warning overlays, the brief layer has **15 algebraically legal** presentation states. Canonical Kestrel producers reach **11/15**; the four absent states are both warning variants of diagnostic conflict and both warning variants of diagnostic-coercion-qualified.

[[23C-HQ-BELIEF-EVIDENCE-CATALOG]] must author all 15 so the reducer is total. Basis pattern is internal provenance, not a player confidence label.

# 8. Role-specific evidence currency

One universal “active-through” cycle is incorrect. Assessment, tactical warning and a public case answer different questions.

Each definition therefore has separate:

- `assessmentRelevance`;
- `warningRelevance`;
- `publicCaseRelevance`.

Canonical families:

| Family | Assessment | Warning | Public case |
| --- | --- | --- | --- |
| C1 opening pressure | C1–C2 | none | none |
| C2 shipping pressure | C2–C3 | none | none |
| C3 routine signposts | C3–C4 | none | none |
| C4 generic pressure pattern | C4–C5 | none | none |
| C2 reroute result | C3–C5 | none | none |
| focused buildup, observed C4 | C4–C6 | **C4–C5** | C4–C6 |
| focused empty, observed C4 | **C4–C5** | none | C4–C6 |
| C4 Lattice result, observed C5 | C5–C6 | C5–C6 if warning-bearing | C5–C6 if eligible |
| C5 Lattice result, observed C6 | C6 | C6 if warning-bearing | C6 if eligible |
| liaison result, observed C5 | C5–C6 | none | C5–C6 if eligible |

Consequences:

- an old focused buildup can still support an estimate/public case at C6 but no longer supplies clean tactical warning unless Lattice refreshed the physical picture;
- a focused-empty observation becomes assessment-stale at C6 because C5 could have begun preparation, while its historical/public relevance may remain;
- stale/superseded evidence remains reconstructible and never disappears from history.

# 9. Warning transition closure

Warning delta is total over:

- `initial`;
- `unchanged`;
- `gained`;
- `refreshed`;
- `lost-stale`;
- `lost-superseded`;
- `lost-mixed`.

Across all 4,112 schedules:

- warning gained: **1,656** adjacent transitions;
- warning refreshed by a newer landing observation: **552**;
- warning lost through staleness: **552**;
- warning lost through supersession/mixed causes: **0**;
- 24/156 semantic histories and 11/50 headline trajectories contain warning loss.

The former “zero warning-loss” invariant was wrong. At C5/C6, safe presentation must explicitly state either that current direct warning exists or that it does not; absence of a UI box is not sufficient.

# 10. Public-case reducer

Public attribution is stricter than internal assessment.

A credible case in direction D requires:

1. one public-current, source-sensitive diagnostic occurrence supporting D;
2. one additional public-current same-direction source-sensitive occurrence from a different `corroborationGroupId`;
3. no opposite-direction occurrence current for either assessment or public-case use.

The reducer returns exactly two deterministic support occurrences/groups:

- primary diagnostic: newest, then stable definition/instance ID;
- corroborator from another group: diagnostic before indicator, then newest, then stable IDs.

One diagnostic source is tentative, not credible. Two indicators are tentative. Directionless credible is invalid. Different `sourceGroupId` strings are not enough; independence uses explicit corroboration groups.

# 11. Persistent supersession

For query Q, occurrence A is superseded if a later-observed B by Q:

- uses `replace-older-same-question` and shares A’s question; or
- explicitly lists A’s definition ID.

Supersession is historical and permanent. A never returns merely because B becomes stale or is superseded by C.

Required chain:

```text
routine A
→ focused B replaces A
→ Lattice C replaces B
```

A and B remain historical but neither re-enters current reduction.

# 12. Exact generated results

With the role-specific currency and corroborated public-case rule above, the independent model yields:

- **156** distinct semantic evidence histories;
- **50** distinct headline product trajectories (`assessment × warning × public-case state/direction`);
- **53** distinct basis-pattern product trajectories;
- **18** distinct headline composite states across C1–C6;
- **20** distinct basis-pattern composite states;
- maximum evidence history size **9**;
- maximum occurrences current for any role **4**;
- maximum assessment-current **4**;
- maximum public-current **3**;
- maximum warning-current **1**.

Per-cycle counts:

| Cycle | Headline states | Basis-pattern states |
| --- | ---: | ---: |
| C1 | 1 | 1 |
| C2 | 1 | 1 |
| C3 | 1 | 1 |
| C4 | 4 | 4 |
| C5 | 13 | 15 |
| C6 | 11 | 11 |

All six assessment states and all nine assessment-change categories occur in canonical producer trajectories.

The architecture golden vectors are stored in `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`. Implementation must generate and compare them; it must not replace the generator with the fixture.

# 13. C6 relationship to terminal truth

The exact C6 sequence is:

```text
persist/replay hidden R6 decision
→ resolve C5 task result from authorised latest-normal/pre-manifestation facts
→ derive C6 HQ snapshot/current public case
→ project safe overt crisis family
→ derive terminal routes
```

R6 action/row is never evidence and never grants warning.

In the producer envelope, distinct C6 headline-state counts by hidden terminal action are:

- `attempt_seizure`: 9;
- `threshold_challenge`: 11;
- `abort_and_pressure`: 4.

A credible coercion case plus `attempt_seizure` is not reachable in canonical Kestrel, although terminal code remains direction-safe. Do not invent it as a required normal-play fixture.

The C6 player surface labels the assessment as the intelligence picture immediately before the confrontation became overt.

# 14. Player-information equivalence

Normal safe semantics include only:

- current assessment and basis-pattern-derived copy;
- current warning status/basis-safe summary;
- current public claim when actionably credible and source unspent;
- bounded evidence summaries/source contexts/limitations;
- adjacent evidence/product delta required to explain change;
- known public campaign state.

They exclude hidden posture/preparation/action/row, seed, raw source facts and authoritative origin hashes.

Different hidden histories with the same legitimate occurrences/public state must project deep-equal normal semantics.

Terminal debrief retains the complete historical occurrence ledger and every historical safe snapshot beside, never rewritten by, terminal truth.

# 15. Verification ownership

## #100 production tests

Must prove:

- all 16 reducer rows;
- all 10 algebraic assessment/warning pairs;
- all 15 algebraic basis-pattern/warning mappings;
- exact 19 definitions and validation;
- ordinary/reroute/focused producer correctness;
- role-specific currency and warning-loss semantics;
- historical cut/future non-interference;
- pure derivation/model digest/information boundary;
- test-only independent oracle reproduces the vectors without adding production #102 task logic.

## #102 production tests

Must prove real replay-valid task histories reproduce the six ordered target schedules, definition outputs, warning refresh/loss behavior and no same-target/no-task path.

## #107 full-game tests

Must reconcile the legal complete-package graph against this over-approximation and then test target/policy dominance, fairness, recovery and human-facing decision value.

# 16. Required mutation failures

The reference/implementation suite must detect deliberate introduction of:

- majority-vote reduction;
- “any contrary indicator means unclear” reduction;
- hidden posture or R6 action as evidence input;
- routine C3 reporting derived from hidden preparation;
- C4 prose parsed into evidence;
- historical producer reading current/future state;
- one universal evidence lifetime;
- missing warning-loss handling;
- focused-positive disabling Lattice landing;
- focused-empty assessment retained at C6;
- same-target retasking;
- zero-cost no-task;
- repeated same-question reports stacking as votes;
- an integrated auxiliary branch;
- one-source or directionless credible public case;
- source/corroboration groups conflated;
- stale evidence deleted;
- temporary supersession/resurrection;
- ambiguous/free-form occurrence identity;
- semantic-model mutation under unchanged digest;
- terminal action or narrative prose becoming evidence.

# 17. Review stop rule

This audit closes the authored #100 reducer/producer envelope, not game fun.

Further architecture change is justified only by:

- failure of the independent generated vectors;
- a concrete contradiction with another canonical subsystem;
- #102/#107 implemented reachability or dominance evidence;
- or fresh-player evidence.

An alternative mechanic being imaginable is not itself a defect.
