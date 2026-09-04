---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/tradecraft authority for **#100 — HQ belief / intelligence projection**.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact code/history/content integration. [[26-LATTICE-COLLECTION-MATRIX]] owns future Lattice/liaison production using this same evidence vocabulary. [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns safe world manifestations.

# Product purpose

Intelligence should create useful uncertainty, not a probability-management minigame.

The Intelligence Chief must answer compactly:

1. **What do you think is happening?**
2. **What facts drive that judgement?**
3. **What does not fit / what remains unknown?**
4. **What would change the picture?**
5. **Do we have direct tactical warning, or only an assessment?**
6. **If we can make a public case, what exactly can we substantiate?**

No numeric probability, confidence bar/band, hidden Ravellan posture/preparation, raw policy/action ID or oracle truth appears in normal player presentation.

# Tradecraft principles

Kestrel deliberately uses a bounded playable subset of professional analytic practice:

- competing hypotheses;
- indicators/signposts;
- stronger diagnostic evidence;
- contrary reporting kept visible rather than averaged away;
- collection tied to a named information gap and decision window;
- source/reporting separated from analytic judgement;
- source/method limitations made legible in ordinary language;
- evidence currency treated as relevance, not forgetting;
- changes in judgement explained;
- “what would change my mind?” watch-for signposts;
- indications-and-warning separated from broader estimative assessment;
- internal judgement separated from a public evidentiary case.

Do not implement full ACH, Bayesian inference, source-reliability dice, confidence taxonomy or generic multi-claim framework.

# Command question

Stable claim:

`ravellan-intent`

Human meaning:

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

Directional analytic hypotheses:

- `preparation` — current activity materially supports a real near-term seizure option;
- `coercion` — current pressure is primarily a coercive/political operation rather than cover for an imminent prepared seizure.

Hidden `testing` is not a third player score/state. It can generate preparation, coercion or conflicted evidence depending on observable behavior.

# Three separate products

Never collapse these.

## 1. Intent assessment

Direction:

- `preparation`
- `coercion`
- `unclear`

Internal picture:

- `weak`
- `conflicted`
- `coherent`

Exactly six legal states:

- unclear + weak
- unclear + conflicted
- preparation + weak
- preparation + coherent
- coercion + weak
- coercion + coherent

These are internal semantics, not player confidence labels.

## 2. Tactical warning

- `none`
- `usable`

`usable` means HQ has an active authorised **physical warning signpost** that materially improves its ability to act against a Beacon seizure.

A preparation assessment alone does not create warning.

A physical warning can remain usable while the broader intent assessment is conflicted.

This intentionally supports both:

> “I think they are preparing, but we still lack direct warning.”

and:

> “We have movement worth acting on, but I still cannot settle the wider intent picture.”

[[27-KESTREL-TERMINAL-MATRIX]] and the C5 Operations professional tie consume warning separately.

## 3. Public-case basis

Derived internal basis:

```ts
{
  state: "none" | "tentative" | "credible-source-sensitive"
  direction: "preparation" | "coercion" | null
}
```

Rules:

- `none` → direction null;
- `tentative` may carry one supported direction, or null when the eligible public case itself is conflicted/unclear;
- `credible-source-sensitive` **must** carry `preparation` or `coercion`.

The direction is the claim HQ can substantiate publicly:

- preparation case — evidence of a real seizure-preparation sequence / physical preparation;
- coercion case — evidence of a coercive/deceptive pressure operation.

This is not #101's persisted one-shot opportunity. #101 preserves the claim direction when it persists `credible` or `used`.

Do not allow a generic directionless credible case.

# Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised source fact** — exact physical/action-history fact a named observation rule may inspect.
- **Evidence definition** — canonical meaning of a kind of report.
- **Evidence occurrence** — one historical instance of that definition in this run.
- **HQ products** — deterministic reductions of current-relevant occurrences.
- **Player brief** — bounded safe semantic refs.

Changing hidden truth while holding authorised source facts/occurrences fixed must leave every HQ product deep-equal.

# Evidence definition

A static canonical evidence definition owns:

- `definitionId`;
- claim ID `ravellan-intent`;
- stable `questionId`;
- implication `preparation | coercion | ambiguous`;
- diagnosticity `indicator | diagnostic`;
- source group;
- player-safe `sourceContextRef` describing the method/coverage in ordinary language;
- player-safe summary ref;
- `warningRole: none | usable`;
- `publicCaseRole: none | source-sensitive`;
- lifetime rule;
- supersession policy;
- any explicit superseded definition IDs.

`sourceContextRef` is not a quality score. It exists so the player can tell the difference between, for example, routine coverage, focused collection, a partner liaison and dedicated Lattice collection.

All semantic definitions from this file and [[26-LATTICE-COLLECTION-MATRIX]] belong to canonical `kestrel-hq-belief-v1` content identity.

# Runtime evidence occurrence

A derived historical occurrence owns:

- deterministic unique `instanceId`;
- `definitionId`;
- stable source/task reference;
- actual observed cycle;
- derived active-through cycle;
- semantic fields copied from its canonical definition.

A runtime producer may not supply a definition ID and then override its implication/diagnosticity/warning/public-case semantics.

Evidence is derived readout/history, not persisted #100 campaign state.

# Currency is relevance, not forgetting

An occurrence outside its current-relevance window is **stale for the current assessment**, not erased from history.

Expired/superseded occurrences remain available for:

- historical reconstruction;
- consequence callbacks;
- terminal “What HQ believed” debrief;
- explaining why the current judgement changed.

A judgement may weaken/reopen because an old report no longer describes the current situation. When this happens, the player-facing assessment-change copy must explicitly mention **staleness/currency** rather than making the judgement appear to change mysteriously.

# Same-question replacement

Directed collection definitions use stable question IDs such as:

- `landing-force-staging`;
- `auxiliary-tasking`;
- `political-operational-sync`.

A definition may use supersession policy:

- `explicit-only`; or
- `replace-older-same-question`.

For `replace-older-same-question`, a newer observed occurrence supersedes older active occurrences with the same `questionId`, including an older occurrence of the same definition ID.

This is how retasking works: a second look at the same question updates the picture; it does not become another weighted vote.

Unrelated questions remain independent and may legitimately contradict.

Explicit cross-definition supersession remains available for bounded asymmetric cases.

# Indicator vs diagnostic

## Indicator

Suggestive but compatible with more than one reasonable explanation.

## Diagnostic

Substantially discriminates between Kestrel's two analytic hypotheses. It still does not reveal hidden posture or guarantee future behavior.

Diagnosticity is not a numeric weight.

# Intent assessment reducer

Use only **current-relevant, non-superseded** occurrences.

1. no active non-ambiguous directional evidence → `unclear + weak`;
2. active preparation **and** coercion evidence → `unclear + conflicted`;
3. preparation only:
   - any preparation diagnostic → `preparation + coherent`;
   - otherwise → `preparation + weak`;
4. coercion only:
   - any coercion diagnostic → `coercion + coherent`;
   - otherwise → `coercion + weak`.

Ambiguous evidence never chooses direction.

Do not count votes, average contradiction or let evidence quantity overpower an opposing report.

# Warning reducer

`usable` iff at least one current-relevant, non-superseded occurrence has:

- implication preparation; and
- warningRole usable.

Contrary intent evidence does not erase a genuine physical warning signpost.

Coherent preparation without warning-role evidence remains warning none.

# Public-case reducer

Ignore evidence with publicCaseRole none.

Let eligible active directional evidence be grouped by direction.

- no eligible direction → `{ state: "none", direction: null }`;
- eligible evidence on both directions → `{ state: "tentative", direction: null }`;
- one eligible direction but no diagnostic basis → `{ state: "tentative", direction: thatDirection }`;
- one eligible direction with >=1 diagnostic occurrence and no active opposite directional evidence → `{ state: "credible-source-sensitive", direction: thatDirection }`.

A credible case is therefore always a **specific claim**.

This reducer never consumes the opportunity.

# Ordinary evidence timeline

These definitions are scheduled automatically and use fixed current-relevance windows.

## C1 `opening-pressure-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- routine/opening observation;
- relevant C1–C2;
- warning none;
- public case none.

## C2 `shipping-probe-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- routine maritime observation;
- relevant C2–C3;
- warning none;
- public case none.

## C3 mandatory competing signposts

### `staging-logistics-anomaly`

- question `ravellan-intent-general`;
- preparation indicator;
- routine regional logistics reporting;
- relevant C3–C4;
- warning none;
- public case none;
- explicit-only supersession.

### `combat-elements-dispersed`

- question `ravellan-intent-general`;
- coercion indicator;
- routine force-disposition coverage;
- relevant C3–C4;
- warning none;
- public case none;
- explicit-only supersession.

Meaning: **within routine coverage**, expected major combat elements still appear dispersed.

This is not omniscient global truth. Coverage can be incomplete/deceived or miss activity elsewhere.

Together the fixed pair yields `unclear + conflicted`.

## C4 `cycle4-pressure-pattern-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- visible pressure-pattern observation;
- relevant C4–C5;
- warning none;
- public case none.

Action-specific safe world prose may differ. The analytic evidence remains the same generic ambiguity.

# C2 reroute result observed C3

Only when authoritative C2 final order is `reroute-and-monitor`.

Question: `auxiliary-tasking`.

Supersession policy: `replace-older-same-question`.

Observation extractor may inspect only verified C2 normal Ravellan action + C2 post-decision preparation, never posture.

Exactly one C3 occurrence, relevant C3–C5:

- `reroute-auxiliary-integrated` — preparation indicator;
- `reroute-auxiliary-coercive` — coercion indicator;
- `reroute-auxiliary-unclear` — ambiguous indicator.

All warning none / public case none.

Reroute does not clear mandatory C3 conflict; its payoff is persistent information after generic C3 signposts become stale.

# C3 focused staging result observed C4

Only when C3 final order is `focus-staging-collection`.

Question: `landing-force-staging`.

Supersession policy: `replace-older-same-question`.

Observation extractor may inspect only **C4 result-time post-decision preparation**, never posture/action/policy row.

## `focused-staging-buildup`

- preparation indicator;
- focused collection;
- relevant C4–C6;
- warning usable;
- public case source-sensitive;
- explicitly supersedes `combat-elements-dispersed`.

It is an intent indicator but actionable physical warning.

## `focused-staging-empty`

- coercion indicator;
- focused collection;
- relevant C4–C6;
- warning none;
- public case source-sensitive;
- explicitly supersedes `staging-logistics-anomaly`.

A testing opponent with no observed concentration may legitimately look coercive through this sensor.

# Future Lattice / liaison evidence

All definitions in [[26-LATTICE-COLLECTION-MATRIX]] are predeclared in the same canonical model, but #100 does not produce them.

They use dynamic runtime observed cycles and normally remain current-relevant through C6 unless superseded by a newer same-question occurrence.

Important semantics:

- landing concentration can be diagnostic preparation + usable warning;
- auxiliary can diagnostically support coercion but never warning;
- sync can diagnostically support sustained preparation but never warning;
- negative sync is only a coercion indicator;
- liaison is indicator-only, never diagnostic/warning;
- newer same-question collection replaces older reroute/focused/liaison/Lattice occurrences;
- retasking a non-conclusive question is allowed under #102 and does not stack votes.

# Reason selection

No hidden reason score.

## Conflicted

Show newest current preparation occurrence + newest current coercion occurrence.

Same observed cycle: diagnostic before indicator; stable instance ID only final display tie.

## Directional

Show strongest/newest supporting directional occurrence + at most one material contrary/gap fact.

## Unclear weak

Show newest ambiguous occurrence or authored coverage gap.

Basis copy must make source/method context legible enough for the player to understand whether the claim comes from routine coverage, focused collection, Lattice or partner reporting.

Normal brief never dumps full evidence history.

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
4. same directional weak→coherent → strengthened;
5. same directional coherent→weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted + current unclear/weak → cleared-conflict;
8. previous unclear + current directional → narrowed;
9. previous directional + current unclear/weak → reopened.

All 36 legal pairs resolve exactly once.

## Why did it change?

When change is not unchanged/initial, derive one bounded internal cause class:

- `new-evidence`;
- `staleness`;
- `supersession`;
- `mixed`.

Player-facing change copy should explain the cause in ordinary language when material.

Examples:

- “Focused collection has narrowed the picture toward preparation.”
- “Our earlier staging report is now too old to lean on.”
- “The new direct observation supersedes the earlier routine picture.”

This is not an extra meter; it prevents unexplained analytic drift.

# Player-facing Intelligence Chief brief

Normal projection contains safe semantics equivalent to:

- 1 judgement;
- <=2 basis evidence summaries with source/method context;
- <=1 contrary evidence summary;
- exactly 1 key gap;
- <=1 watch-for;
- <=1 assessment-change message when changed;
- <=1 safe tactical-warning statement where material;
- when a public case is actually actionable through #101, a safe claim label such as “we can substantiate seizure preparation” or “we can substantiate a coercive pressure operation.”

Do not expose internal picture/diagnosticity/public-case enums, source facts, hidden state, confidence percentage/band or full evidence history.

Canonical judgement meanings remain:

- preparation weak — “My read is that they're preparing a real move. I don't trust the wider picture yet.”
- preparation coherent — “This now looks like real preparation. The reporting is starting to line up.”
- coercion weak — “I think the pressure itself is the operation. That's still a thin read.”
- coercion coherent — “This increasingly looks like coercion, not cover for an immediate seizure.”
- unclear conflicted — “The indicators disagree. The reporting points in both directions.”
- unclear weak — “We don't have enough to tell whether the pressure is the operation or cover for one.”

Final prose is content-owned but preserves meaning.

# Exact key-gap / watch-for matrix

| Assessment | Warning | Key gap | Watch for |
| --- | --- | --- | --- |
| unclear + weak | none | relationship between visible pressure and a real seizure force | physical concentration / military tasking |
| unclear + conflicted | none | reconcile logistics activity with apparently dispersed force elements | independent direct observation of force movement/tasking |
| unclear + conflicted | usable | wider meaning of an already-observed physical warning sign | corroboration that force movement belongs to broader preparation, or contrary coercive tasking |
| preparation + weak | none | whether suggestive activity forms an executable force package | direct concentration / independent preparation signpost |
| preparation + weak | usable | whether physical warning reflects wider sustained preparation and timing | tasking/sequence corroboration; movement toward execution |
| preparation + coherent | none | physical timing and executable force movement | direct landing-force concentration / movement toward execution |
| preparation + coherent | usable | timing/threshold for execution | movement from staging into execution |
| coercion + weak | none | how quickly pressure could pivot into real preparation | new force concentration / preparation milestones |
| coercion + coherent | none | whether coercive campaign is changing character | new preparation signposts / physical concentration |

Exactly these nine assessment+warning combinations are reachable.

# Timing

HQ intelligence is queried at the pre-command point after current-cycle Ravellan decision exists.

Player orders never retroactively change the brief already shown.

Queued results:

- C2 reroute → C3;
- C3 focused staging → C4;
- C4 Lattice task → C5;
- C5 Lattice task → C6;
- C4 liaison → C5.

At a pre-command point, all evidence due now is incorporated **before** #101 synchronizes the unspent attribution opportunity and before agenda/route legality.

# Persistence / replay

**#100 persists no evidence occurrence, assessment, warning or public-case basis and adds no ledger entry.**

All derive from trusted session/history + canonical `kestrel-hq-belief-v1` model.

No #100 schema/ruleset bump; persisted format remains `0.4.0-prototype`.

Pure derivation still has historical semantics, so the model/content digest covers decision-significant definitions, source context refs, schedules, mappings, supersession rules and reducer semantics.

# Required #100 tests

## Reducers

- all six assessment states;
- contradiction preserved regardless evidence count;
- preparation assessment + warning none;
- conflicted assessment + warning usable;
- public-case state **and direction** exact;
- directionless credible case rejected;
- coherent preparation without warning-role evidence → warning none.

## Definition / occurrence

- full 23+26 evidence vocabulary predeclared exactly once;
- sourceContextRef present for every directional definition;
- runtime occurrence copies canonical semantics;
- deterministic unique instance ID;
- fixed vs dynamic lifetime exact;
- stale occurrence remains historical but not current-relevant;
- runtime producer cannot override implication/diagnosticity/warning/public-case role;
- ordinary schedule never auto-instantiates directed evidence.

## Same-question supersession / retasking seam

- newer same-question occurrence replaces older active same-question occurrence, including same definition ID;
- unrelated questions remain active independently;
- reroute→liaison/Lattice auxiliary replacement exact;
- focused→later landing replacement exact;
- same-question replacement cannot create duplicate votes;
- explicit supersession graph remains acyclic.

## Change explanation

- all 36 previous/current assessment pairs exact;
- staleness-only weakening/reopen produces staleness-aware change copy;
- supersession-only change produces supersession-aware copy;
- new evidence/mixed causes deterministic;
- no hidden score.

## Timeline / fairness

- mandatory C3 conflict across hidden openings/actions;
- routine C3 disposition is bounded/non-omniscient;
- reroute uses historical C2 facts;
- focused uses C4 result-time preparation;
- action-specific C4 prose cannot alter generic evidence;
- later state cannot rewrite earlier snapshots.

## Architecture

- same legitimate occurrences + changed hidden posture/truth → equal products/brief;
- raw hidden state only in authorised observation extractors;
- repeated derivation pure/deep-equal and state hash/revision unchanged;
- no #100 state/ledger/version change;
- semantic model digest changes on decision-significant mutation;
- V1 unchanged.

# Rejection conditions

Reject #100 if it persists belief/evidence, forgets stale reports instead of retaining historical occurrences, permits a generic directionless credible public case, stacks repeated collection of the same question as extra votes, conflates definition with occurrence, lets runtime producers redefine evidence semantics, bumps ruleset for derived types, changes semantics without content identity, creates confidence scores/bands, infers warning from assessment, lets reducers read hidden state, treats routine C3 coverage as global truth, parses world prose into evidence, directly sets analysis from collection, derives from untrusted saves, lets browser/server duplicate analysis or builds a generic multi-claim/plugin framework.
