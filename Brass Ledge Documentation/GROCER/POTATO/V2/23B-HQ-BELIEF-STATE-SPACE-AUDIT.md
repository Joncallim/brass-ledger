---
type: v2-hq-belief-state-space-audit
status: active
---

# HQ Belief State-Space Audit

Backlink: [[README]]

This is the executable state-space authority for **#100**. [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft meaning, [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns code/replay seams, and [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact evidence metadata.

The earlier prose-only reviews were insufficient. This audit treats the design as three separate state spaces that must all close:

1. **Combinatorial state** — every categorical reducer input/output.
2. **Temporal history** — every authorised producer schedule across C1–C6.
3. **Player-information equivalence** — different hidden histories that must project identically when legitimate information is identical.

Passing one never substitutes for the other two.

# 1. Independent reference model

The audit uses an independent reference model that reimplements rather than calls:

- the committed #99 Ravellan policy;
- #99 observation timing, replacement and expiry;
- the coalition-to-Ravellan emission rules in [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]];
- the #100 evidence producers, currency, supersession and reducers.

The implementation test must reproduce the invariants below from normal authoritative transitions. Hard-coding the expected snapshots/counts without generating the histories is rejected.

# 2. Raw command/adversary envelope

The producer envelope deliberately over-approximates later package legality so #100 does not omit a history merely because #98/#101/#103 are not implemented yet.

It enumerates:

- 3 opening Ravellan postures;
- 4 C1 signal packages (`2 watch × 2 partner`);
- 9 C2 packages (`3 shipping × 3 public posture`);
- 4 C3 packages (`2 reserve × 2 partner`);
- 3 C4 operational courses;
- 48 C5 packages (`3 Beacon × 2 reserve × 4 authority × 2 attribution-use flags`).

Exact raw count:

`3 × 4 × 9 × 4 × 3 × 48 = 62,208`

Each history executes the exact #99 C1–C6 policy rather than choosing Ravellan actions freely.

# 3. Trusted-history projection key

The 62,208 histories collapse to **257** distinct #100-relevant trusted-history projections when keyed by:

- all six Ravellan decisions, including action, matched policy row, pre/post posture and pre/post preparation; and
- the exact C2 shipping course.

C2 shipping remains in the key because `reroute-and-monitor` is a legitimate evidence trigger even when two other shipping courses generate no directed report.

Do not describe 257 as all game states. It is only the trusted hidden/history projection relevant to #100 producers.

# 4. Corrected producer schedule

For each of the 257 projections enumerate:

- C3 focused staging not ordered / ordered;
- Lattice unavailable without liaison;
- Lattice unavailable with C4 commander-only liaison; or
- Lattice operational with one target in C4 and a **different unused** target in C5.

Operational Lattice does not expose a zero-cost `collect nothing` choice while unresolved targets exist. HQ preselects one target from standing direction; the player may retarget without spending a normal intervention. This preserves command-by-exception without offering a dominated no-op.

Each Lattice target is one-shot in the six-cycle prototype. C6 adds neither a normal Ravellan action nor a preparation transition, so repeating the same C4 target in C5 produces the identical authorised result for every one of the 257 projections:

- landing sees the same C5/C6 preparation state;
- auxiliary sees the same latest normal C5 action and preparation state;
- sequence sees the same latest two normal actions C4/C5.

Same-target retasking is therefore a mechanically fake choice in Kestrel and is rejected.

All three unused targets remain eligible after ordinary focused collection. A positive `focused-staging-buildup` is only a preparation **indicator** with usable warning; Lattice landing replaces it with **diagnostic** preparation evidence. The independent model found **138/138** focused-positive projections where that upgrade changes the C5 intent assessment. Focused collection never consumes the Lattice landing target.

Exactly six ordered Lattice schedules exist:

- landing → auxiliary;
- landing → sequence;
- auxiliary → landing;
- auxiliary → sequence;
- sequence → landing;
- sequence → auxiliary.

Exact schedule count:

`257 × 2 focused states × (2 non-Lattice modes + 6 Lattice schedules) = 4,112`

# 5. Evidence-currency correction

Positive and negative physical observations do not have identical current relevance.

- `focused-staging-buildup`, observed C4, remains current through C6 because #99 preparation never regresses.
- `focused-staging-empty`, observed C4, remains current through C5 only. It is retained historically but is stale for the C6 estimate because C5 could have begun preparation after the report.

This is time-bounded analytic relevance, not deletion. If aging changes the assessment or public case, safe delta copy must explain that the older report is now too old to lean on.

# 6. Verified state-space results

The corrected independent model yields:

- **19** reachable evidence definitions;
- **156** distinct semantic evidence histories;
- **47** complete six-cycle product trajectories;
- **15** distinct composite product states;
- maximum **9** evidence occurrences in one history;
- maximum **4** current, non-superseded occurrences at one cycle;
- zero canonical warning-loss transitions;
- all nine assessment-change categories reachable.

Per-cycle composite-state counts:

| Cycle | Distinct states |
| --- | ---: |
| C1 | 1 |
| C2 | 1 |
| C3 | 1 |
| C4 | 4 |
| C5 | 13 |
| C6 | 10 |

A semantic history is keyed by evidence definition, observed cycle and canonical producer slot. Authoritative hashes/revisions are deliberately normalised out; varying a valid origin hash must not change analytical meaning.

# 7. Complete per-cycle composite states

State tuple:

`intent direction / picture / warning / public-case state / public-case direction`

## C1

- `unclear / weak / none / none / null`

## C2

- `unclear / weak / none / none / null`

## C3

- `unclear / conflicted / none / none / null`

## C4

- `coercion / weak / none / tentative / coercion`
- `preparation / weak / usable / tentative / preparation`
- `unclear / conflicted / none / none / null`
- `unclear / conflicted / usable / tentative / preparation`

## C5

- `coercion / coherent / none / credible-source-sensitive / coercion`
- `coercion / coherent / none / tentative / coercion`
- `coercion / weak / none / none / null`
- `coercion / weak / none / tentative / coercion`
- `preparation / coherent / none / tentative / preparation`
- `preparation / coherent / usable / credible-source-sensitive / preparation`
- `preparation / coherent / usable / tentative / preparation`
- `preparation / weak / none / tentative / preparation`
- `preparation / weak / usable / tentative / preparation`
- `unclear / conflicted / none / tentative / preparation`
- `unclear / conflicted / usable / tentative / null`
- `unclear / conflicted / usable / tentative / preparation`
- `unclear / weak / none / none / null`

## C6

- `coercion / coherent / none / credible-source-sensitive / coercion`
- `coercion / weak / none / tentative / coercion`
- `preparation / coherent / none / tentative / preparation`
- `preparation / coherent / usable / credible-source-sensitive / preparation`
- `preparation / coherent / usable / tentative / preparation`
- `preparation / weak / none / tentative / preparation`
- `preparation / weak / usable / tentative / null`
- `preparation / weak / usable / tentative / preparation`
- `unclear / conflicted / usable / tentative / null`
- `unclear / weak / none / none / null`

Implementation may narrow the envelope through fully legal package composition, but it may not create a new composite state without an explicit product amendment and model-identity change.

# 8. Exact 19-definition vocabulary

The canonical set is:

## Ordinary

1. `opening-pressure-ambiguous`
2. `shipping-probe-ambiguous`
3. `staging-logistics-anomaly`
4. `combat-elements-dispersed`
5. `cycle4-pressure-pattern-ambiguous`

## C2 reroute

6. `reroute-auxiliary-coercive`
7. `reroute-auxiliary-unclear`

## C3 focused staging

8. `focused-staging-buildup`
9. `focused-staging-empty`

## Lattice landing

10. `lattice-landing-concentration`
11. `lattice-landing-dispersed`

## Lattice auxiliary

12. `lattice-auxiliary-coercive`
13. `lattice-auxiliary-mixed`

## Lattice operational sequence

14. `lattice-sync-preparation-sequence`
15. `lattice-sync-preparation-signal`
16. `lattice-sync-coercive-sequence`
17. `lattice-sync-partial`

## Partner liaison

18. `liaison-auxiliary-coercive-links`
19. `liaison-auxiliary-unclear`

All 19 are reached in the producer envelope.

Removed dead definitions:

- `reroute-auxiliary-integrated`;
- `lattice-auxiliary-integrated`;
- `liaison-auxiliary-military-links`.

At every authorised auxiliary result cut, `preparation = developing|ready` cannot coexist with the required `probe_shipping` action under the committed #99 policy. The valid output is coercive or inconclusive/mixed, never an invented integrated branch.

# 9. Complete categorical reducer

For current non-superseded evidence define:

- `Pdiag` — preparation diagnostic exists;
- `Cdiag` — coercion diagnostic exists;
- `Pind` — preparation indicator exists;
- `Cind` — coercion indicator exists.

All 16 combinations are table-tested against `kestrel-binary-hypothesis-v1`.

| Pdiag | Cdiag | Pind | Cind | Assessment |
| ---: | ---: | ---: | ---: | --- |
| 0 | 0 | 0 | 0 | `unclear / weak` |
| 0 | 0 | 0 | 1 | `coercion / weak` |
| 0 | 0 | 1 | 0 | `preparation / weak` |
| 0 | 0 | 1 | 1 | `unclear / conflicted` |
| 0 | 1 | 0 | 0 | `coercion / coherent` |
| 0 | 1 | 0 | 1 | `coercion / coherent` |
| 0 | 1 | 1 | 0 | `coercion / weak` |
| 0 | 1 | 1 | 1 | `coercion / weak` |
| 1 | 0 | 0 | 0 | `preparation / coherent` |
| 1 | 0 | 0 | 1 | `preparation / weak` |
| 1 | 0 | 1 | 0 | `preparation / coherent` |
| 1 | 0 | 1 | 1 | `preparation / weak` |
| 1 | 1 | 0 | 0 | `unclear / conflicted` |
| 1 | 1 | 0 | 1 | `unclear / conflicted` |
| 1 | 1 | 1 | 0 | `unclear / conflicted` |
| 1 | 1 | 1 | 1 | `unclear / conflicted` |

Evidence count never determines direction. A diagnostic direction survives lower-grade opposite indicators, but they prevent `coherent` and the most material opposite indicator must appear in the bounded brief.

Mutation tests must reject both:

- majority-vote reduction; and
- “any contrary indicator automatically means unclear.”

# 10. Assessment/warning closure

The exact reachable pairs are:

1. `unclear / weak / none`
2. `unclear / conflicted / none`
3. `unclear / conflicted / usable`
4. `preparation / weak / none`
5. `preparation / weak / usable`
6. `preparation / coherent / none`
7. `preparation / coherent / usable`
8. `coercion / weak / none`
9. `coercion / coherent / none`

`coercion/* + usable` is reducer-logically constructible but canonical-content unreachable: usable warning requires a preparation-positive physical observation, while canonical coercion diagnostic production requires the authorised preparation fact to be `none`, and #99 preparation never regresses.

Warning delta is total over `initial | unchanged | acquired | lost`. Canonical histories contain zero `lost`; the total function still exists so a future semantic change cannot fall through an unhandled case.

# 11. Public-case state and corroboration

Possible basis states:

- `none / null`;
- `tentative / preparation`;
- `tentative / coercion`;
- `tentative / null` when eligible directions conflict;
- `credible-source-sensitive / preparation`;
- `credible-source-sensitive / coercion`.

Credible requires:

1. one current source-sensitive diagnostic occurrence;
2. no current opposite directional evidence of any class;
3. one additional current same-direction source-sensitive occurrence from a different corroboration group.

The reducer returns exactly two ordered supporting occurrence IDs/groups:

- primary diagnostic: newest, then stable definition/instance ID;
- corroborator from a different group: diagnostic before indicator, then newest, then stable IDs.

One diagnostic source alone is tentative. Two indicators without a diagnostic are tentative. Any current opposite directional evidence blocks credibility even where the internal assessment remains directional.

Reachable corroboration patterns include:

- preparation sequence diagnostic + focused buildup;
- landing diagnostic + sequence preparation evidence;
- auxiliary coercion diagnostic + focused empty;
- auxiliary coercion diagnostic + landing dispersed;
- auxiliary coercion diagnostic + sequence coercion indicator.

# 12. Assessment and product deltas

All nine assessment-change categories occur in canonical trajectories:

- initial;
- unchanged;
- narrowed;
- strengthened;
- weakened;
- conflicted;
- cleared-conflict;
- reopened;
- reversed.

The reducer must still table-test all 36 legal previous/current assessment pairs because totality and producer reachability are different obligations.

Assessment change alone is insufficient. A snapshot delta is compositionally total:

```ts
type V2HqBeliefDelta = {
  assessmentChange: V2HqAssessmentChange
  warningChange: "initial" | "unchanged" | "acquired" | "lost"
  publicCaseStateChange:
    | "initial" | "unchanged" | "opened" | "strengthened"
    | "weakened" | "closed"
  publicCaseDirectionChange:
    | "initial" | "unchanged" | "established" | "clarified"
    | "became-conflicted" | "reversed" | "cleared"
  evidenceChangeCause:
    | "none" | "new-evidence" | "staleness" | "supersession" | "mixed"
  addedInstanceIds: string[]
  becameStaleInstanceIds: string[]
  supersededInstanceIds: string[]
}
```

A required update cannot disappear merely because `assessmentChange` is unchanged while warning is acquired or public-case action space changes.

# 13. Source-use state

#100 does not persist a mutable opportunity mirror.

Current availability is:

```text
current credible-source-sensitive basis
+ source-use state unspent
→ public attribution available
```

#101 persists only irreversible use:

```ts
{ state: "unspent" }
| {
    state: "used"
    usedCycle: 5 | 6
    direction: "preparation" | "coercion"
    supportingEvidenceInstanceIds: [string, string]
    supportingCorroborationGroupIds: [string, string]
  }
```

Use freezes the exact claim and minimal supporting basis. Later evidence may change HQ analysis but cannot regenerate or rewrite a used source.

# 14. Supersession is persistent

At query cycle Q, A is superseded when any later-observed B by Q:

- uses `replace-older-same-question` and shares A’s question ID; or
- explicitly lists A’s definition ID.

Once superseded, A never re-enters a later current reducer merely because B becomes stale or is itself superseded. The full chain remains historical.

Required hostile chain:

```text
routine A
→ focused B supersedes A
→ Lattice C supersedes B
```

At the final query, A and B remain historical but neither becomes current again.

# 15. Runtime occurrence identity

State-space counts use semantic producer slots. Runtime occurrence identity must bind to authoritative origins without exposing them to the player.

Each origin is a strict discriminated canonical object:

- ordinary cycle slot; or
- derived producer slot carrying the authoritative command/task entry hash and the result-observation/Ravellan entry hash required by that producer.

No free-form or player-authored source string participates in authority.

`instanceId` is the canonical SHA-256 of:

```text
tag + belief-model semantic digest + definitionId + observedCycle + canonical origin object
```

Reject duplicate instance IDs, one ID with different semantics, or two directed occurrences for the same question/result cycle.

# 16. Historical cutoff and C6 information cut

Historical cycle Q uses:

- Ravellan decisions through Q;
- command sets through Q−1 only;
- evidence results due at/before Q;
- no command Q or future entry.

C6 order is exact:

```text
persist/replay hidden R6 decision
→ resolve C5 task result from authorised pre-manifestation facts
→ derive final pre-manifestation HQ snapshot/public case
→ project safe overt crisis family
→ derive terminal routes
```

The R6 action/policy row is never intelligence evidence and never grants warning.

On the C6 player surface, label this as **the intelligence picture immediately before the confrontation became overt**, not as if HQ is still debating whether a visible seizure exists.

# 17. Terminal-action/product relationship

The producer envelope yields:

- `abort_and_pressure` — 3 C6 product states; any credible case is coercion-direction;
- `attempt_seizure` — 9 C6 product states; any credible case is preparation-direction;
- `threshold_challenge` — all 10 C6 product states; credible cases may be preparation or coercion direction.

Therefore a normal-play `credible coercion case + seizure underway` fixture is impossible in canonical Kestrel. Generic terminal code may remain direction-safe, but #107 must not claim this impossible pair as a required reachable history.

# 18. Player-information equivalence

Normal safe equivalence includes:

- current assessment;
- warning;
- public-case state/direction/minimal supporting basis where actionable;
- selected bounded evidence summaries/context/limitations;
- adjacent product/evidence delta required to explain change.

It excludes hidden posture/preparation/action/policy row, raw source facts, seed and authoritative origin hashes.

Different hidden histories with the same legitimate evidence occurrences and public state must produce deep-equal safe projections.

Terminal debrief retains the complete derived historical occurrence ledger and every historical safe snapshot. Terminal truth may sit beside it but never rewrite it.

# 19. Mandatory generated tests

The implementation must independently reproduce:

- 62,208 raw histories;
- 257 trusted-history projections;
- 4,112 producer schedules;
- 156 semantic evidence histories;
- 47 product trajectories;
- 15 composite product states;
- per-cycle counts `1,1,1,4,13,10`;
- all 19 definitions;
- maximum history/current sizes `9/4`;
- all six assessment states;
- all nine assessment/warning pairs;
- all nine assessment-change categories;
- zero canonical warning-loss transitions;
- zero same-target retask value;
- 138/138 focused-positive histories where Lattice landing changes C5 assessment;
- no R6 action/action copy entering evidence;
- no directionless credible public case;
- no credible case without exactly two independent corroboration groups.

Mutation/self-tests must fail when deliberately introducing:

- majority-vote direction;
- any-contrary-indicator automatic veto;
- hidden posture as producer input;
- routine C3 report derived from preparation;
- C4 prose parsed into evidence;
- current-state lookup for historical collection;
- focused positive wrongly disabling Lattice landing;
- focused negative remaining current through C6;
- zero-cost Lattice no-task;
- repeated same-target task;
- repeated same-question occurrence stacking as votes;
- an integrated auxiliary branch;
- public credibility from one source;
- directionless credible case;
- stale evidence deleted from history;
- temporary rather than persistent supersession;
- unstructured/colliding occurrence origins;
- semantic-model mutation under unchanged digest;
- C6 terminal action treated as evidence or warning.

# 20. Separation from #107

This audit closes #100 evidence/product state space only. It does not prove:

- all complete command packages are legal;
- each target/order is non-dominated in final outcomes;
- information makes the game enjoyable;
- the two-intervention budget is right;
- humans understand the brief.

Those remain #107 and human smoke gates. Exact state-space closure is necessary, never sufficient.