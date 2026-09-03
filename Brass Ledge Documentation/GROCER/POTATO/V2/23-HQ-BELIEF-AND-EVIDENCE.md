---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This document is the implementation authority for **#100 — headquarters belief / intelligence projection**. It is Kestrel-only prototype design. It must not become a generic intelligence framework before a second concrete scenario proves reuse.

## Product purpose

Intelligence should create a strategic question, not a probability-management minigame. The player should be able to understand four things in ordinary language:

1. **What does Intelligence currently think?**
2. **Why does it think that?**
3. **What remains weak or contradictory?**
4. **What could the commander do to learn more?**

The player never sees numeric probability, percentage confidence, confidence bars, High/Medium/Low labels, or the hidden Ravellan posture/preparation state.

## Information boundary

Keep four concepts distinct:

- **World truth:** actual Ravellan posture, preparation and external facts. Hidden except where an authored observation legitimately reveals evidence.
- **Authorised observation:** an engine/content-produced fact HQ is legally allowed to learn.
- **HQ evidence:** the persisted interpreted evidence item produced from an authorised observation or collection result.
- **HQ assessment:** a deterministic summary of active HQ evidence. It is the only intelligence state used by recommendation/player projections.

Changing world truth while holding authorised observations/evidence constant must leave HQ assessment and every player-facing intelligence projection deep-equal.

A collection rule may inspect the specific world facts it is authored to observe in order to produce an authorised evidence result. The resulting HQ evidence—not hidden world state—is what downstream staff/player paths receive.

## Primary Kestrel assessment

The prototype has one primary intelligence claim:

`ravellan-intent`

Its internal assessment has two dimensions.

### Direction

- `preparation` — current evidence points toward real Beacon-related operational preparation.
- `coercion` — current evidence points toward pressure/feint rather than an imminent prepared seizure.
- `unclear` — HQ cannot responsibly favour either interpretation.

### Picture state

- `weak` — the current view rests on limited or weakly diagnostic evidence.
- `conflicted` — active evidence points materially in both directions.
- `coherent` — specifically corroborating evidence supports one direction without a material active contradiction.

These identifiers are implementation-only. They are not player-facing labels.

Legal combinations are:

- `unclear + weak`
- `unclear + conflicted`
- `preparation + weak`
- `preparation + coherent`
- `coercion + weak`
- `coercion + coherent`

Do not create `preparation + conflicted` or `coercion + conflicted`; when material active evidence supports both interpretations, direction is `unclear`.

## Evidence contract

Each persisted Kestrel evidence item contains only the minimum required fields:

- stable `evidenceId`;
- claim ID (`ravellan-intent` for the prototype);
- implication: `preparation`, `coercion`, or `ambiguous`;
- diagnostic class: `indicator` or `corroborating`;
- source group/reference;
- observed cycle;
- active/superseded/expired lifecycle state or equivalent explicit lifecycle evidence;
- visible summary reference used by the Intelligence Chief projection.

`indicator` means the observation is legitimately suggestive but is not sufficient by itself to make the picture coherent. `corroborating` means the authored observation is specifically diagnostic enough to support a coherent view if the opposing interpretation has no active evidence.

These are internal evidence semantics, not UI confidence labels.

Evidence IDs and their implication/diagnostic class are authored content. The engine may not infer diagnostic weight from prose, source name, quantity of events, or hidden Ravellan state.

## Deterministic assessment reduction

Derive the current `ravellan-intent` assessment from active evidence only.

1. If no active non-ambiguous evidence exists: `unclear + weak`.
2. If active evidence supports both `preparation` and `coercion`: `unclear + conflicted`.
3. If evidence supports only `preparation`:
   - if at least one active authored `corroborating` preparation item exists: `preparation + coherent`;
   - otherwise: `preparation + weak`.
4. If evidence supports only `coercion`:
   - if at least one active authored `corroborating` coercion item exists: `coercion + coherent`;
   - otherwise: `coercion + weak`.
5. `ambiguous` evidence never chooses a direction. It may remain visible as a reason that the picture is incomplete, but it does not override contradictory directional evidence.

Do not sum weights, count votes, calculate odds, or normalise evidence into a score.

## Canonical ordinary Kestrel evidence timeline

The six-cycle slice has a small fixed ordinary evidence catalogue. These items exist so #100 has executable content and Cycle 3 reliably creates genuine doubt without reading hidden posture.

### Cycle 1 opening

Evidence ID: `opening-pressure-ambiguous`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- source group: `opening-situation`;
- active for Cycles 1–2; expires before the Cycle-3 belief update;
- player-safe meaning: patrol activity and messaging have increased, but the pattern does not distinguish coercion from preparation.

Initial assessment therefore remains `unclear + weak`.

### Cycle 2 shipping pressure

Evidence ID: `shipping-probe-ambiguous`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- source group: `shipping-pressure`;
- observed at Cycle 2;
- active for Cycles 2–3; expires before the Cycle-4 belief update;
- player-safe meaning: the shipping pressure is compatible with both coercive testing and cover for something more serious.

The Cycle-1 probe pressure persists into the Cycle-2 shipping issue regardless of the newly selected hidden Cycle-2 action; [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns that effect projection.

### Cycle 3 conflicting bundle — mandatory

Two directional evidence items become available together before the Cycle-3 command.

#### `staging-logistics-anomaly`

- implication: `preparation`;
- diagnostic class: `indicator`;
- source group: `regional-logistics`;
- observed Cycle 3;
- active during Cycles 3–4;
- expires before Cycle 5 unless explicitly superseded earlier;
- player-safe meaning: logistics activity near known staging areas has risen above the recent baseline.

#### `combat-elements-dispersed`

- implication: `coercion`;
- diagnostic class: `indicator`;
- source group: `force-disposition`;
- observed Cycle 3;
- active during Cycles 3–4;
- expires before Cycle 5 unless explicitly superseded earlier;
- player-safe meaning: major combat elements required for a rapid seizure remain visibly dispersed.

Both observations are legitimately true/observable under all three opening Ravellan situations at this point in the authored slice. Their meaning differs depending on what is actually happening, but HQ does not know that. They deliberately produce:

`unclear + conflicted`

This is the same HQ belief that drives the mandatory Intelligence/Operations disagreement. Hidden posture/current Ravellan action does not choose which chief is “correct”.

### Cycle 4 pressure-pattern change

Evidence ID: `cycle4-pressure-pattern-ambiguous`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- source group: `visible-pressure-pattern`;
- observed Cycle 4;
- active through Cycle 5; expires before the Cycle-6 current-assessment reduction;
- player-safe meaning is selected from the authorised manifestation of the actual Ravellan action under [[37-RAVELLAN-WORLD-EFFECT-MATRIX]]: lull, thinning/plateau, contradictory posture, or continuing pressure;
- every variant remains ambiguous and must not expose the hidden action ID.

It does not choose a direction. The same evidence ID keeps the HQ reducer stable while player-facing situation text truthfully reflects the observable pressure pattern.

## Cycle-3 focused-collection action

The ordinary Cycle-3 Intelligence intervention from [[25-KESTREL-CONSEQUENCE-MATRIX]] is **not Lattice**. It diverts existing collection at an immediate Beacon-coverage cost and targets exactly one fixed question:

`staging-area-focus`

The result arrives at the Cycle-4 belief update.

### If seizure preparation is `developing` or `ready` at resolution

Evidence ID: `focused-staging-buildup`

- implication: `preparation`;
- diagnostic class: `indicator`;
- source group: `focused-staging-collection`;
- observed Cycle 4;
- active through Cycle 6;
- supersedes `combat-elements-dispersed` because the newer focused observation shows relevant elements beginning to concentrate;
- summary: focused collection now shows movement consistent with staging activity rather than the earlier dispersed picture.

Resulting assessment is normally `preparation + weak` unless another active coercion item remains.

### If preparation is `none` and current Ravellan posture is `coercive_feint`

Evidence ID: `focused-staging-empty`

- implication: `coercion`;
- diagnostic class: `indicator`;
- source group: `focused-staging-collection`;
- observed Cycle 4;
- active through Cycle 6;
- supersedes `staging-logistics-anomaly` because the focused collection establishes that the anomaly is not accompanied by seizure-force staging;
- summary: focused collection finds no concentration of the force package needed for a rapid Beacon seizure.

Resulting assessment is normally `coercion + weak` unless another active preparation item remains.

### Otherwise — testing / unresolved world

Evidence ID: `focused-staging-inconclusive`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- source group: `focused-staging-collection`;
- observed Cycle 4;
- active through Cycle 5;
- supersedes nothing;
- summary: focused collection improves coverage but still cannot establish whether a seizure force is forming.

The original Cycle-3 conflict therefore remains active through Cycle 4.

The result rule is a legitimate world-to-observation function. Player/staff paths receive only the resulting evidence item.

## Cycle-5 information state without directed collection

The mandatory Cycle-3 directional conflict expires before the Cycle-5 belief update unless a focused-collection result superseded/refined it.

Therefore a player who does not invest in/focus collection may reach Cycle 5 with `unclear + weak`. This is intentional: uncertainty can persist because the commander chose not to spend scarce attention/institutional investment on resolving it.

Kestrel must still retain viable military/coalition recovery routes without a clear intelligence answer. Information is valuable, not mandatory for all success.

## Directed evidence from Lattice / liaison

[[26-LATTICE-COLLECTION-MATRIX]] owns the Cycle-5/6 directed-result catalogue. Those results use this same evidence schema and reduction function.

Unless that matrix states otherwise:

- Lattice/liaison directional results remain active through terminal resolution;
- ambiguous directed results remain active as visible unresolved gaps but never choose direction;
- a directed result does not automatically delete older contradictory evidence; only its explicit supersession rule may do so.

## Evidence lifecycle rules

No generic probabilistic decay exists.

Canonical lifecycle semantics:

- `opening-pressure-ambiguous`: expires before C3;
- `shipping-probe-ambiguous`: expires before C4;
- `staging-logistics-anomaly`: active C3–C4, expires before C5 unless superseded;
- `combat-elements-dispersed`: active C3–C4, expires before C5 unless superseded;
- `cycle4-pressure-pattern-ambiguous`: active C4–C5, expires before C6;
- `focused-staging-buildup` / `focused-staging-empty`: active through terminal;
- `focused-staging-inconclusive`: active C4–C5, expires before C6;
- Lattice/liaison results: active through terminal unless the result matrix explicitly supersedes them.

Expired/superseded evidence remains in replay/history but is inactive in current assessment reduction.

Contradictory active evidence is allowed and must produce `unclear + conflicted` rather than silently deleting the inconvenient item.

## Deterministic projection reason selection

The Intelligence Chief projection must be stable without a hidden reason score.

### `unclear + conflicted`

Show:

- newest active preparation evidence;
- newest active coercion evidence;
- if observed in the same cycle, stable `evidenceId` order resolves display order only.

### `preparation` or `coercion`

Show:

- newest active evidence supporting the direction;
- if a corroborating and indicator item have the same observation cycle, show the corroborating item first;
- optionally one newest active ambiguous/gap item where it materially explains why the picture is still weak/incomplete.

### `unclear + weak`

Show the newest active ambiguous item if one exists; otherwise show the authored unresolved-coverage statement.

This ordering controls explanation, not assessment weight.

## Player-facing Intelligence Chief judgement

Projection is authored natural language keyed from the internal assessment plus the selected active evidence/remainder references.

Canonical Kestrel tone examples:

- `preparation + weak`: **“I think they’re preparing something real, but our intelligence is weak.”**
- `preparation + coherent`: **“This looks like preparation. The reporting is starting to line up.”**
- `coercion + weak`: **“My read is that they’re trying to make us react. I don’t trust the picture yet.”**
- `coercion + coherent`: **“This increasingly looks like coercion rather than preparation.”**
- `unclear + conflicted`: **“There are signs both ways. I can’t call it.”**
- `unclear + weak`: **“We don’t have enough yet to say what the pressure is covering.”**

Exact final prose remains content-owned, but it must preserve the meaning above and never expose the internal identifiers.

Every projected assessment must expose, in ordinary language:

- the current judgement;
- one or more belief-safe reasons from active evidence;
- the most important unresolved gap or contradiction when one exists;
- an available collection target when the scenario provides one.

Do not expose hidden truth provenance as a reason.

## Ordinary observations versus directed collection

Normal world/activity observations create only the authored evidence above. Task Collection and partner liaison use the same evidence contract; they do not have a privileged truth-reveal path.

A collection result may be strongly diagnostic because the content authors it as `corroborating`, but it still enters HQ belief as evidence and is then reduced through the same assessment function.

No collection result may directly set:

- Ravellan posture;
- Ravellan preparation state;
- a player-facing probability;
- the final recommendation.

## Kestrel unresolved collection questions

The prototype recognises exactly these named questions for later #102 content:

- `landing-force-staging` — are units required for a Beacon seizure actually concentrating?
- `auxiliary-tasking` — are the vessels pressuring shipping operating as part of a military plan or primarily coercive pressure?
- `political-operational-sync` — are Ravellan political messages and operational activity aligned to a common timeline?

#100 must support these stable target IDs but does **not** implement Lattice availability or target-result content; #102 owns that.

## Timing

HQ belief is updated in the canonical cycle position after world/adversary advancement and consequence progression, using only observations legally available at that point.

A Cycle-N player action cannot retroactively change the Intelligence Chief judgement shown before that action. New evidence created by an order, focused collection, Task Collection, liaison or later observation becomes usable only at the authored next update point.

## Replay/state integrity

HQ evidence and current assessment are authoritative persisted V2 state or deterministic persisted-state derivatives according to the repository’s established V2 pattern. Replay must reconstruct the same assessment from the same verified evidence history.

If assessment is persisted for convenience, trusted replay must recompute and reject a mismatched saved assessment. Never trust a client-supplied assessment.

Changing evidence activity, implication, diagnostic class, observation cycle, supersession or source reference in a way that changes the recomputed assessment must be replay-detectable.

## Required #100 tests

At minimum prove:

- paired hidden-world states with identical authorised evidence produce identical HQ assessment and player-safe intelligence projection;
- C1 and C2 ordinary evidence remain `unclear + weak`;
- the mandatory C3 bundle produces `unclear + conflicted` identically across hidden Ravellan openings/current actions;
- C3 focused collection produces the exact C4 result/supersession branches above;
- absent directed collection allows stale C3 conflict to expire before C5 rather than persisting forever;
- every legal Cycle-4 Ravellan action produces the same ambiguous evidence ID while the visible summary varies only through authorised action manifestation;
- no active directional evidence → `unclear + weak`;
- one preparation indicator → `preparation + weak`;
- one coercion indicator → `coercion + weak`;
- corroborating preparation without contrary evidence → `preparation + coherent`;
- corroborating coercion without contrary evidence → `coercion + coherent`;
- active evidence in both directions → `unclear + conflicted` even if one side is corroborating;
- ambiguous evidence alone never chooses a direction;
- superseded/expired evidence no longer affects current assessment but remains in replay history;
- deterministic reason selection follows the stable rules above without becoming assessment scoring;
- directed collection enters through the same evidence path rather than setting hidden truth or recommendation directly;
- player-facing projection contains no percentage, numeric probability, confidence band/label, hidden posture/preparation/action ID or truth provenance;
- V1 information/state/replay contracts remain unchanged.

## Rejection conditions

Reject #100 if it introduces Bayesian probability, a generic intelligence score, player-facing confidence labels, hidden-truth-derived prose, raw Ravellan-action leakage, UI-owned assessment logic, permanent stale evidence, or a general multi-claim intelligence framework not required by Kestrel.
