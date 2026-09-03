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
- **Authorised observation:** an engine-produced fact HQ is legally allowed to learn.
- **HQ evidence:** the persisted interpreted evidence item produced from an authorised observation or collection result.
- **HQ assessment:** a deterministic summary of active HQ evidence. It is the only intelligence state used by recommendation/player projections.

Changing world truth while holding authorised observations/evidence constant must leave HQ assessment and every player-facing intelligence projection deep-equal.

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
- `coherent` — independent or specifically corroborating evidence now supports one direction without a material active contradiction.

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
- active/superseded/expired status or equivalent explicit lifecycle evidence;
- visible summary reference used by the Intelligence Chief projection.

`indicator` means the observation is legitimately suggestive but is not sufficient by itself to make the picture coherent. `corroborating` means the authored observation is independently or specifically diagnostic enough to support a coherent view if the opposing interpretation has no active evidence.

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

## Player-facing Intelligence Chief judgement

Projection is authored natural language keyed from the internal assessment plus the most relevant active evidence/remainder references.

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

## Evidence lifecycle

Evidence is not automatically permanent.

Kestrel content owns explicit expiry/supersession rules per evidence ID. The engine must not invent generic decay probabilities.

Rules:

- a newer observation may explicitly supersede an older evidence item;
- expiry occurs only from an authored lifecycle rule;
- expired/superseded evidence remains in replay/history but is inactive in current assessment reduction;
- contradictory active evidence is allowed and must produce `unclear + conflicted` rather than silently deleting the inconvenient item;
- collection can add, support, refute, supersede or expire specific evidence only through authored result rules.

## Ordinary observations versus directed collection

Normal world/activity observations may create evidence through authored Kestrel observation rules. Task Collection and partner liaison use the same evidence contract; they do not have a privileged truth-reveal path.

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

A Cycle-N player action cannot retroactively change the Intelligence Chief judgement shown before that action. New evidence created by an order, Task Collection, liaison or later observation becomes usable only at the authored next update point.

## Replay/state integrity

HQ evidence and current assessment are authoritative persisted V2 state or deterministic persisted-state derivatives according to the repository’s established V2 pattern. Replay must reconstruct the same assessment from the same verified evidence history.

If assessment is persisted for convenience, trusted replay must recompute and reject a mismatched saved assessment. Never trust a client-supplied assessment.

Changing evidence activity, implication, diagnostic class, observation cycle or source reference in a way that changes the recomputed assessment must be replay-detectable.

## Required #100 tests

At minimum prove:

- paired hidden-world states with identical authorised evidence produce identical HQ assessment and player-safe intelligence projection;
- no active evidence → `unclear + weak`;
- one preparation indicator → `preparation + weak`;
- one coercion indicator → `coercion + weak`;
- corroborating preparation without contrary evidence → `preparation + coherent`;
- corroborating coercion without contrary evidence → `coercion + coherent`;
- active evidence in both directions → `unclear + conflicted` even if one side is corroborating;
- ambiguous evidence alone never chooses a direction;
- superseded/expired evidence no longer affects current assessment but remains in replay history;
- directed collection enters through the same evidence path rather than setting hidden truth or recommendation directly;
- player-facing projection contains no percentage, numeric probability, confidence band/label, hidden posture/preparation ID or truth provenance;
- V1 information/state/replay contracts remain unchanged.

## Rejection conditions

Reject #100 if it introduces Bayesian probability, a generic intelligence score, player-facing confidence labels, hidden-truth-derived prose, UI-owned assessment logic, or a general multi-claim intelligence framework not required by Kestrel.
