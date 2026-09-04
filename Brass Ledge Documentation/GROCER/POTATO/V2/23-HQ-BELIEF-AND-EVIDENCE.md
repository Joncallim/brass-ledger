---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/tradecraft authority for **#100 — HQ belief / intelligence projection**. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact code/history/content integration. [[26-LATTICE-COLLECTION-MATRIX]] owns later Lattice/liaison production using this evidence vocabulary. [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns safe world manifestations.

# Product purpose

Intelligence should create useful uncertainty, not a probability-management minigame. The Intelligence Chief should answer compactly:

1. What do you think is happening?
2. What facts drive that judgement?
3. What does not fit / remain unknown?
4. What would change the picture?
5. Do we have direct tactical warning, or only an assessment?
6. If we can make a public case, what exactly can we substantiate?

No numeric probability/confidence bar, hidden posture/preparation, raw policy/action ID or oracle truth appears in normal player presentation.

# Tradecraft principles

Kestrel uses a bounded playable subset of professional analytic practice:

- competing hypotheses;
- observable indicators/signposts;
- stronger diagnostic evidence;
- contrary reporting retained and explained rather than averaged away or automatically vetoing every judgement;
- collection tied to named information gaps and decision windows;
- source/reporting separated from analyst judgement;
- source/method limitations legible in ordinary language;
- information currency treated as relevance, not forgetting;
- judgement changes explained;
- watch-for indicators;
- tactical indications-and-warning separated from estimative assessment;
- internal judgement separated from a public evidentiary case.

Do not implement full ACH, Bayesian inference, source-reliability dice, confidence taxonomy or a generic multi-claim framework.

# Command question

Stable claim: `ravellan-intent`.

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

Directional hypotheses:

- `preparation` — activity materially supports a real near-term seizure option;
- `coercion` — current pressure is primarily coercive/political rather than cover for imminent prepared seizure.

Hidden `testing` is not a third player hypothesis. It may generate evidence in either direction.

# Three separate products

## 1. Intent assessment

Direction:

- preparation
- coercion
- unclear

Internal picture:

- weak
- conflicted
- coherent

Exactly six legal states:

- unclear + weak
- unclear + conflicted
- preparation + weak
- preparation + coherent
- coercion + weak
- coercion + coherent

These are internal semantics, not player confidence labels.

### Meaning of picture

- `coherent` — one direction has diagnostic support and **no active opposite directional evidence**;
- directional `weak` — HQ has a best current direction, but it is based only on indicators **or** a diagnostic direction remains materially contested by lower-grade opposite indicators;
- `conflicted` — HQ cannot choose a responsible direction because evidence of comparable analytic class points both ways;
- unclear `weak` — no current directional basis.

Thus a weak contrary indicator does not automatically erase a diagnostic judgement, but it prevents calling the picture coherent.

## 2. Tactical warning

- none
- usable

`usable` means HQ has active authorised **physical warning evidence** that materially improves ability to act against a Beacon seizure.

A preparation assessment alone does not create warning. Physical warning may remain usable while wider assessment is conflicted.

## 3. Public-case basis

Derived internal basis:

```ts
{ state: "none"; direction: null }
| { state: "tentative"; direction: "preparation" | "coercion" | null }
| { state: "credible-source-sensitive"; direction: "preparation" | "coercion" }
```

`credible-source-sensitive` always has a specific claim direction:

- preparation — substantiate a real seizure-preparation sequence / physical preparation;
- coercion — substantiate a coercive/deceptive pressure operation.

This is not #101's persisted one-shot opportunity. #101 preserves the direction when it persists `credible` or `used`.

# Information boundary

Keep distinct:

- World truth — actual hidden state/history.
- Authorised source fact — exact physical/action-history fact a named observation rule may inspect.
- Evidence definition — canonical meaning of a kind of report.
- Evidence occurrence — one historical instance of that definition.
- HQ products — deterministic reductions of current-relevant occurrences.
- Player brief — bounded safe semantic refs.

Changing hidden truth while authorised source facts/occurrences remain fixed must leave every HQ product deep-equal.

# Evidence definition

A static definition owns:

- definitionId;
- claimId `ravellan-intent`;
- stable questionId;
- implication `preparation | coercion | ambiguous`;
- diagnosticity `indicator | diagnostic`;
- sourceGroup;
- player-safe sourceContextRef;
- player-safe summaryRef;
- warningRole `none | usable`;
- publicCaseRole `none | source-sensitive`;
- lifetime/current-relevance rule;
- supersession policy;
- explicit superseded definition IDs.

`sourceContextRef` explains collection/method context such as routine coverage, focused collection, Lattice or partner liaison. It is not a reliability score.

All definitions in this file and [[26-LATTICE-COLLECTION-MATRIX]] belong to canonical `kestrel-hq-belief-v1` identity.

# Runtime occurrence

A derived occurrence owns:

- deterministic unique instanceId;
- definitionId;
- stable source/task ref;
- actual observed cycle;
- derived current-through cycle;
- semantic fields copied from its canonical definition.

Runtime producers cannot override definition semantics. #100 evidence remains derived history, not persisted campaign state.

# Currency is relevance, not forgetting

An occurrence outside its current-relevance window is **stale for current analysis**, not erased. Stale/superseded occurrences remain available for historical reconstruction, consequence callbacks and terminal `What HQ believed`.

If a judgement changes because information aged out, player-facing change copy must explain the staleness instead of making the analysis appear to drift mysteriously.

# Same-question replacement

Directed questions include:

- landing-force-staging
- auxiliary-tasking
- political-operational-sync

A definition may use supersession policy `explicit-only` or `replace-older-same-question`.

With `replace-older-same-question`, a newer occurrence supersedes older active occurrences of that question, including an older occurrence of the same definition ID. Retasking updates the report; it never stacks another evidence vote.

Unrelated questions remain independent and may contradict.

# Indicator vs diagnostic

## Indicator

Suggestive but compatible with more than one reasonable explanation.

## Diagnostic

Substantially discriminates between Kestrel's two hypotheses. It still does not reveal hidden posture or guarantee future behaviour.

Diagnosticity is categorical, not a numeric weight.

# Intent assessment reducer

Use only current-relevant, non-superseded occurrences.

Let:

- `Pdiag` = any preparation diagnostic;
- `Cdiag` = any coercion diagnostic;
- `Pind` = any preparation indicator;
- `Cind` = any coercion indicator.

Apply exactly, in order:

1. `Pdiag && Cdiag` → `unclear + conflicted`.
2. `Pdiag && !Cdiag`:
   - if `Cind` → `preparation + weak`;
   - else → `preparation + coherent`.
3. `Cdiag && !Pdiag`:
   - if `Pind` → `coercion + weak`;
   - else → `coercion + coherent`.
4. no diagnostics:
   - `Pind && Cind` → `unclear + conflicted`;
   - `Pind` only → `preparation + weak`;
   - `Cind` only → `coercion + weak`;
   - neither → `unclear + weak`.

Ambiguous evidence never chooses direction.

This preserves contrary information without treating a lower-grade indicator as an automatic veto over diagnostic evidence. Evidence quantity still never outvotes evidence class: five indicators do not overpower one opposite diagnostic merely by count.

# Warning reducer

`usable` iff at least one current-relevant, non-superseded occurrence has preparation implication + warningRole usable.

Contrary intent evidence does not erase genuine physical warning. Coherent preparation without warning-role evidence remains warning none.

# Public-case reducer

Public attribution is deliberately more conservative than the internal estimate.

Ignore publicCaseRole none. Group eligible active directional evidence by direction.

- no eligible direction → none/null;
- eligible evidence on both directions → tentative/null;
- one direction, no diagnostic → tentative/that direction;
- one direction + diagnostic and **no active opposite directional evidence of any class** → credible-source-sensitive/that direction.

Thus an internal preparation judgement may remain directional despite a contrary indicator while the public case stays tentative. A credible case is always a specific clean claim.

# Ordinary evidence timeline

## C1 `opening-pressure-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- routine/opening observation;
- current C1–C2;
- no warning/public case.

## C2 `shipping-probe-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- routine maritime observation;
- current C2–C3;
- no warning/public case.

## C3 mandatory competing signposts

`staging-logistics-anomaly`:

- preparation indicator;
- routine regional logistics reporting;
- current C3–C4.

`combat-elements-dispersed`:

- coercion indicator;
- routine force-disposition coverage;
- current C3–C4;
- meaning: **within routine coverage**, expected major combat elements still appear dispersed.

This is not global truth. Together the fixed pair yields unclear/conflicted.

## C4 `cycle4-pressure-pattern-ambiguous`

- ambiguous indicator;
- visible pressure-pattern observation;
- current C4–C5.

Action-specific safe world prose may differ; analytic evidence stays generic/ambiguous.

# C2 reroute result observed C3

Only when C2 final order is `reroute-and-monitor`.

Question `auxiliary-tasking`; supersession `replace-older-same-question`; current C3–C5.

- `reroute-auxiliary-integrated` — preparation indicator;
- `reroute-auxiliary-coercive` — coercion indicator;
- `reroute-auxiliary-unclear` — ambiguous indicator.

No warning/public case. Reroute does not clear mandatory C3 conflict; its payoff persists after generic C3 signposts become stale.

# C3 focused staging result observed C4

Only when C3 final order is `focus-staging-collection`.

Question `landing-force-staging`; supersession `replace-older-same-question`.

`focused-staging-buildup`:

- preparation indicator;
- focused collection;
- current C4–C6;
- warning usable;
- public case source-sensitive;
- explicitly supersedes `combat-elements-dispersed`.

`focused-staging-empty`:

- coercion indicator;
- focused collection;
- current C4–C6;
- no warning;
- public case source-sensitive;
- explicitly supersedes `staging-logistics-anomaly`.

# Future Lattice / liaison evidence

All definitions in [[26-LATTICE-COLLECTION-MATRIX]] are predeclared in the same model; #100 does not produce them.

Important semantics:

- Lattice landing concentration can be diagnostic preparation + usable warning;
- auxiliary can diagnostically support coercion but never warning;
- sync can diagnostically support sustained preparation but never warning; negative sync remains a coercion indicator;
- liaison is indicator-only;
- newer same-question collection replaces older reroute/focused/liaison/Lattice occurrences;
- retasking a non-conclusive question is legal under #102 and never stacks votes.

# Reason selection

No hidden score.

## Conflicted

Show newest current preparation occurrence + newest current coercion occurrence. Same cycle: diagnostic before indicator; stable instance ID only final display tie.

## Directional

Show strongest/newest supporting occurrence + at most one material contrary occurrence/gap. If a diagnostic direction survives an opposite indicator, the contrary indicator **must** be surfaced in the bounded brief; otherwise `directional + weak` would be misleading.

## Unclear weak

Show newest ambiguous occurrence or authored coverage gap.

Basis copy should preserve source/method context where useful. Normal brief never dumps the full evidence history.

# Assessment-change taxonomy

Exactly:

- initial
- unchanged
- narrowed
- strengthened
- weakened
- conflicted
- cleared-conflict
- reopened
- reversed

Total previous→current mapping:

1. no previous → initial;
2. exact equality → unchanged;
3. preparation↔coercion directional flip → reversed;
4. same direction weak→coherent → strengthened;
5. same direction coherent→weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted + current unclear/weak → cleared-conflict;
8. previous any unclear + current directional → narrowed;
9. previous directional + current unclear/weak → reopened.

All 36 legal pairs resolve exactly once.

# Why did it change?

For changed assessments derive one bounded internal cause:

- new-evidence
- staleness
- supersession
- mixed

Player-facing copy explains the cause when material, e.g. “our earlier staging report is now too old to lean on” or “the new direct observation replaces the earlier routine picture.”

# Player-facing Intelligence Chief brief

Normal projection contains safe semantics equivalent to:

- 1 judgement;
- <=2 basis summaries with source/method context;
- <=1 contrary summary;
- exactly 1 key gap;
- <=1 watch-for;
- <=1 assessment-change line;
- <=1 tactical-warning line;
- when #101 exposes an actionable opportunity, a safe claim label matching its persisted direction.

Do not expose internal picture/diagnosticity/public-case enums, source facts, hidden state, confidence percentage/band or full evidence history.

Canonical judgement meanings:

- preparation weak — “My read is that they're preparing a real move. I don't trust the wider picture yet.”
- preparation coherent — “This now looks like real preparation. The reporting is starting to line up.”
- coercion weak — “I think the pressure itself is the operation. That's still a thin read.”
- coercion coherent — “This increasingly looks like coercion, not cover for an immediate seizure.”
- unclear conflicted — “The indicators disagree. The reporting points in both directions.”
- unclear weak — “We don't have enough to tell whether the pressure is the operation or cover for one.”

# Exact key-gap / watch-for matrix

| Assessment | Warning | Key gap | Watch for |
| --- | --- | --- | --- |
| unclear + weak | none | relationship between visible pressure and a real seizure force | physical concentration / military tasking |
| unclear + conflicted | none | reconcile competing reports | independent direct observation of force movement/tasking |
| unclear + conflicted | usable | wider meaning of an observed physical warning | corroboration of preparation or contrary coercive tasking |
| preparation + weak | none | whether the preparation read forms a clean executable picture | direct concentration / corroborating sequence evidence |
| preparation + weak | usable | whether physical warning belongs to a sustained preparation sequence | tasking/sequence corroboration; movement toward execution |
| preparation + coherent | none | physical timing and executable force movement | direct landing-force concentration / movement toward execution |
| preparation + coherent | usable | timing/threshold for execution | movement from staging into execution |
| coercion + weak | none | how quickly pressure could pivot into real preparation | new force concentration / preparation milestones |
| coercion + coherent | none | whether coercive campaign is changing character | new preparation signposts / physical concentration |

Exactly these nine assessment+warning combinations are reachable.

# Timing

HQ intelligence is queried at the pre-command point after current-cycle Ravellan decision exists. Player orders never retroactively change the brief already shown.

Queued results:

- C2 reroute → C3;
- C3 focused staging → C4;
- C4 Lattice task → C5;
- C5 Lattice task → C6;
- C4 liaison → C5.

All evidence due now is incorporated before #101 synchronizes the unspent attribution opportunity and before agenda/route legality.

# Persistence / replay

**#100 persists no evidence occurrence, assessment, warning or public-case basis and adds no ledger entry.**

All derive from trusted session/history + canonical `kestrel-hq-belief-v1` model. Persisted format remains `0.4.0-prototype`.

The model/content digest covers decision-significant definitions, source context refs, schedules, mappings, supersession and reducer semantics.

# Required #100 tests

## Reducers

- all six assessment states;
- diagnostic prep + opposite indicator → preparation weak, contrary surfaced;
- diagnostic coercion + opposite indicator → coercion weak, contrary surfaced;
- diagnostics on both sides → unclear conflicted;
- indicators on both sides with no diagnostic → unclear conflicted;
- evidence count does not override diagnosticity;
- prep assessment + warning none;
- conflicted assessment + warning usable;
- public-case state/direction exact and more conservative than internal estimate;
- directionless credible rejected.

## Definition / occurrence / currency

- full 23+26 vocabulary exactly once;
- every directional definition has sourceContextRef;
- runtime occurrence copies canonical semantics and has unique deterministic instanceId;
- stale occurrence retained historically but excluded from current reducer;
- ordinary schedule never auto-instantiates directed evidence.

## Retasking / supersession

- newer same-question occurrence replaces older one including same definition ID;
- no stacked votes;
- unrelated questions remain independent;
- reroute→liaison/Lattice auxiliary replacement exact;
- focused→later landing replacement exact.

## Change explanation

- all 36 assessment transitions exact;
- staleness/new-evidence/supersession/mixed cause deterministic;
- no unexplained timer-driven analytic drift.

## Timeline / fairness

- mandatory C3 conflict across hidden openings/actions;
- routine C3 disposition bounded/non-omniscient;
- reroute uses historical C2 facts;
- focused uses C4 result-time preparation;
- action-specific C4 prose cannot alter evidence;
- later state cannot rewrite earlier snapshots.

## Architecture

- same legitimate occurrences + changed hidden posture/truth → equal products/brief;
- raw hidden state only in authorised observation extractors;
- repeated derivation pure/deep-equal and state hash/revision unchanged;
- no #100 state/ledger/version change;
- semantic digest changes on decision-significant mutation;
- V1 unchanged.

# Rejection conditions

Reject #100 if it persists belief/evidence, treats any weak contrary indicator as an automatic veto over diagnostic evidence, hides material contrary evidence from a surviving directional judgement, forgets stale reports rather than retaining history, permits directionless credible public cases, stacks repeated same-question collection as votes, conflates definition with occurrence, lets runtime producers redefine evidence semantics, creates confidence scores/bands, infers warning from assessment, lets reducers read hidden state, treats routine C3 coverage as global truth, parses world prose into evidence, derives from untrusted saves, lets browser/server duplicate analysis or builds a generic multi-claim/plugin framework.
