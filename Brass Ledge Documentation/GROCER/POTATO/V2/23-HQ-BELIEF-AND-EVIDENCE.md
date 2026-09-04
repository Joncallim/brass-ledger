---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/semantic authority for **#100 — HQ belief / intelligence projection**.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact code/replay integration against committed #99. [[26-LATTICE-COLLECTION-MATRIX]] later extends the same evidence vocabulary. [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns player-observable world manifestations.

# Product purpose

Intelligence should create useful uncertainty, not a probability-management minigame.

The normal Intelligence Chief brief must answer, compactly:

1. **What do you think is happening?**
2. **What facts drive that judgement?**
3. **What does not fit / what remains unknown?**
4. **What observable sign would change the picture?**
5. **Do we actually have tactical warning, or only an assessment?**

No numeric probability, confidence bar, High/Medium/Low confidence, hidden Ravellan posture/preparation, raw policy/action ID or oracle truth appears in normal player presentation.

# Tradecraft model

Kestrel deliberately borrows a small playable subset of real intelligence practice:

- competing hypotheses;
- observable indicators/signposts;
- stronger diagnostic evidence that discriminates between hypotheses;
- contradictory reporting kept visible instead of averaged away;
- named collection against an information gap;
- source/reporting separated from analytic judgement;
- explicit change/consistency of judgement;
- explicit “what would change my mind?” watch-for signpost;
- tactical indications-and-warning separated from broader estimative assessment;
- internal judgement separated from evidence suitable for a public case.

Do **not** implement a full ACH worksheet, Bayesian system, source-reliability simulation, confidence taxonomy or generic intelligence framework. Kestrel has one bounded command question.

# The command question

Stable claim ID:

`ravellan-intent`

Human meaning:

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

Competing directional hypotheses:

- `preparation` — current activity materially supports a real near-term seizure option;
- `coercion` — current pressure is primarily coercive/political rather than cover for an imminent prepared seizure.

`testing` remains hidden world truth, not a third player hypothesis. A testing opponent can legitimately generate coercive, preparatory or conflicted evidence depending on observable behavior.

# Three separate intelligence products

Never collapse these into one state.

## A. Intent assessment

Internal direction:

- `preparation`
- `coercion`
- `unclear`

Internal picture:

- `weak`
- `conflicted`
- `coherent`

Legal states:

- `unclear + weak`
- `unclear + conflicted`
- `preparation + weak`
- `preparation + coherent`
- `coercion + weak`
- `coercion + coherent`

These identifiers are internal semantics, not player confidence labels.

## B. Tactical warning

Derived separately:

- `none`
- `usable`

`usable` means HQ has an active authorised **physical warning signpost** that materially improves its ability to act against a Beacon seizure.

A preparation assessment alone does not create warning.

A physical warning signpost can remain usable even while the wider intent assessment is conflicted.

This is intentional gameplay:

> “I think they are preparing” is not the same as “I can see enough of the force movement to react in time.”

[[27-KESTREL-TERMINAL-MATRIX]] consumes this warning product directly.

## C. Public-case basis

Derived separately for later #101/#102 consumption:

- `none`
- `tentative`
- `credible-source-sensitive`

This is **not** the persisted one-shot attribution-opportunity state.

`tentative` means some eligible directional basis exists but the public case is not yet strong/clean enough.

`credible-source-sensitive` requires:

- at least one active public-case-eligible **diagnostic** directional item;
- no active opposite directional evidence that materially contradicts that case;
- the evidence is source-sensitive: public use would expose/compromise protected sourcing under Kestrel's later attribution rules.

Later #101 owns `none/tentative/credible/used` campaign opportunity state and one-shot consumption. #100 may never regenerate `used` merely because the current evidence basis later becomes credible again.

# Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised source fact** — the exact physical/action-history fact a named observation rule may inspect.
- **HQ evidence** — authored interpretation generated from an authorised source fact.
- **HQ assessment / warning / public-case basis** — deterministic reductions of evidence.
- **Player brief** — bounded safe refs derived from those products.

Changing hidden truth while holding authorised source facts/evidence fixed must leave every HQ product deep-equal.

For directed collection:

> Changing Ravellan hidden posture alone while holding target-authorised physical/action-history facts fixed must leave the collection result deep-equal.

No sensor receives a secret intent label merely because the engine stores one.

# Evidence record

Each derived evidence item contains bounded semantics equivalent to:

- stable `evidenceId`;
- claim ID `ravellan-intent`;
- implication: `preparation | coercion | ambiguous`;
- diagnosticity: `indicator | diagnostic`;
- source group/ref;
- observed cycle;
- active-through cycle;
- explicit superseded evidence IDs;
- player-safe summary ref;
- `warningRole: none | usable`;
- `publicCaseRole: none | source-sensitive`.

Evidence is **derived readout/history**, not persisted V2 campaign state under #100. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns that architecture.

## Indicator

Suggestive but compatible with more than one reasonable explanation.

## Diagnostic

Substantially discriminates between Kestrel's two hypotheses. It still does not reveal hidden truth or guarantee future behavior.

Diagnosticity is not a hidden numeric weight.

# Intent assessment reducer

Use active, non-superseded evidence only.

1. no active non-ambiguous directional evidence → `unclear + weak`;
2. active preparation **and** coercion evidence → `unclear + conflicted`;
3. preparation only:
   - any preparation diagnostic item → `preparation + coherent`;
   - otherwise → `preparation + weak`;
4. coercion only:
   - any coercion diagnostic item → `coercion + coherent`;
   - otherwise → `coercion + weak`.

Ambiguous evidence never chooses direction.

Do not count votes, average contradiction, or let evidence quantity overpower an opposite directional report.

A diagnostic item does not erase an active contradictory directional item; conflict remains until contradiction expires or is explicitly superseded.

# Warning reducer

`usable` iff at least one active non-superseded evidence item has:

- implication `preparation`; and
- `warningRole = usable`.

Contradictory intent evidence does not erase a genuine physical warning signpost.

# Public-case reducer

Ignore evidence with `publicCaseRole = none`.

- no eligible active directional evidence → `none`;
- eligible directional evidence but no uncontradicted diagnostic basis → `tentative`;
- at least one eligible diagnostic directional item + no active opposite directional evidence → `credible-source-sensitive` in that direction.

Conflicting eligible diagnostic directions reduce to tentative/conflicted, never two simultaneous credible cases.

This reducer never consumes an opportunity.

# Ordinary evidence timeline

## C1 — opening pressure

`opening-pressure-ambiguous`

- implication `ambiguous`;
- diagnosticity `indicator`;
- source `opening-maritime-pressure`;
- observed C1, active through C2;
- warning none;
- public case none;
- meaning: increased patrol/auxiliary activity fits coercion, testing or cover for preparation.

Assessment: `unclear + weak`.

## C2 — continuing shipping pressure

`shipping-probe-ambiguous`

- implication `ambiguous`;
- diagnosticity `indicator`;
- source `shipping-pressure`;
- observed C2, active through C3;
- warning none;
- public case none.

Assessment remains `unclear + weak` absent other evidence.

## C2 `reroute-and-monitor` result, observed C3

Reroute accepts larger civilian/political disruption to create a monitoring opportunity while preserving reserve.

Selector inputs only:

- C2 Ravellan preparation immediately after the verified C2 Ravellan decision;
- verified C2 normal action.

Never posture.

### `reroute-auxiliary-integrated`

Condition: preparation `developing|ready` + C2 action `probe_shipping`.

- implication preparation;
- diagnosticity indicator;
- source `reroute-auxiliary-monitoring`;
- observed C3, active through C5;
- warning none;
- public case none;
- meaning: monitored pressure vessels appear integrated with a wider preparation pattern.

### `reroute-auxiliary-coercive`

Condition: preparation `none` + C2 action `probe_shipping|seed_deception`.

- implication coercion;
- diagnosticity indicator;
- same lifecycle/roles;
- meaning: monitoring points to coercive pressure tasking rather than a seizure-force sequence.

### `reroute-auxiliary-unclear`

Otherwise ambiguous indicator, same lifecycle/roles.

The clue does not clear the mandatory C3 conflict. Its payoff is persistence after generic C3 signposts expire.

A later same-question auxiliary-tasking result may explicitly supersede it.

## C3 — mandatory conflicting signposts

Both activate before C3 command under every hidden opening/current action.

### `staging-logistics-anomaly`

- implication preparation;
- diagnosticity indicator;
- source `regional-logistics`;
- observed C3, active through C4;
- warning none;
- public case none;
- meaning: routine reporting sees logistics activity near known staging areas above baseline.

### `combat-elements-dispersed`

- implication coercion;
- diagnosticity indicator;
- source `routine-force-disposition`;
- observed C3, active through C4;
- warning none;
- public case none;
- meaning: **within routine coverage**, the major combat elements expected for a rapid seizure still appear dispersed.

Critical fairness rule:

`combat-elements-dispersed` is a bounded routine-coverage observation, **not omniscient global world truth**. It may be incomplete because collection coverage is limited, movement is occurring outside observed sectors, or Ravellan is obscuring the picture. That is why focused collection can later supersede it legitimately.

Together the fixed signposts force:

`unclear + conflicted`

This is a playable competing-hypotheses problem, not a hidden selector choosing which analyst is correct.

## C4 — ambiguous pressure-pattern change

`cycle4-pressure-pattern-ambiguous`

- implication ambiguous;
- diagnosticity indicator;
- source `visible-pressure-pattern`;
- observed C4, active through C5;
- warning none;
- public case none.

The **analytic evidence summary is generic**: visible pressure has changed but does not establish whether Ravellan is preparing, coercing or consolidating.

[[37-RAVELLAN-WORLD-EFFECT-MATRIX]] may supply action-specific **situation prose** describing what the player can visibly observe. That prose is not parsed back into the evidence reducer and cannot smuggle the hidden action in as extra analytic evidence.

# C3 focused staging collection, result observed C4

Stable question/order target:

`staging-area-focus`

Tasking diverts existing collection from Beacon coverage; the operational cost is owned elsewhere.

Selector input only:

- verified C4 Ravellan-decision post-state preparation (result-time physical state).

Never posture or C4 action ID.

## Preparation `developing|ready`

`focused-staging-buildup`

- implication preparation;
- diagnosticity indicator;
- source `focused-staging-collection`;
- observed C4, active through terminal;
- supersedes `combat-elements-dispersed`;
- warning **usable**;
- public case `source-sensitive`;
- meaning: focused collection sees movement consistent with seizure-force staging.

It is intentionally an intent **indicator** but a **usable tactical warning**. Physical movement improves warning without proving the opponent's complete political strategy.

## Preparation `none`

`focused-staging-empty`

- implication coercion;
- diagnosticity indicator;
- source `focused-staging-collection`;
- observed C4, active through terminal;
- supersedes `staging-logistics-anomaly`;
- warning none;
- public case `source-sensitive`;
- meaning: focused coverage does not find concentration of the force package needed for a rapid seizure.

A testing opponent with no concentration may therefore look coercive through this sensor. That is legitimate imperfect inference.

# C5 without newer directed information

The generic C3 pair expires before C5.

Possible assessment:

- no lasting directional clue → unclear weak;
- reroute clue → preparation/coercion weak;
- focused result → preparation/coercion weak;
- later Lattice/liaison result → same reducer;
- contradictory persistent directed evidence → unclear conflicted.

Warning may differ:

- focused buildup can leave `preparation + weak` **with usable warning**;
- a coherent preparation assessment from non-warning evidence can remain warning `none`.

Information is valuable but not mandatory for all viable routes.

# Lattice / liaison extension

[[26-LATTICE-COLLECTION-MATRIX]] later adds evidence to this exact model.

Shared rules:

- results never directly set assessment, warning, public-case state or recommendation;
- same-question newer evidence may explicitly supersede older evidence;
- different questions remain independently active;
- contradictory active directions remain conflict;
- ambiguous results never select direction;
- only `warningRole = usable` creates warning;
- only `publicCaseRole = source-sensitive` contributes to public-case basis.

# Lifecycle / supersession

Evidence is reconstructed as history and receives status at query time.

Active iff:

- `observedCycle <= queryCycle <= activeThroughCycle`; and
- no already-observed evidence explicitly supersedes it.

Evidence A is superseded at cycle Q iff an evidence item B exists with:

- `B.observedCycle <= Q`; and
- `B.supersedes` contains `A.evidenceId`.

Do not infer supersession merely from source group or similar subject matter.

Expired/superseded evidence remains historical but never enters current reducers.

Ordinary lifecycles:

- opening ambiguous C1–C2;
- shipping ambiguous C2–C3;
- reroute clue C3–C5;
- C3 signpost pair C3–C4;
- C4 pressure ambiguous C4–C5;
- focused staging result C4–terminal.

No expiry mutation is written to session state.

# Stable reason selection

No hidden reason score.

## Conflicted

Show newest active preparation item + newest active coercion item.

Same observed cycle: diagnostic before indicator; stable evidence ID is only the final display-order tie.

## Directional

Show strongest/newest supporting directional item, plus at most one material gap/contrary fact.

## Unclear weak

Show newest ambiguous item or authored coverage gap.

Normal brief is never the whole evidence ledger.

# Assessment-change taxonomy

Derived, never persisted:

- `initial`
- `unchanged`
- `narrowed`
- `strengthened`
- `weakened`
- `conflicted`
- `cleared-conflict`
- `reopened`
- `reversed`

Exact total mapping from previous P to current C:

1. no previous snapshot → `initial`;
2. exact state equality → `unchanged`;
3. directional preparation ↔ coercion flip → `reversed`;
4. same directional state weak → coherent → `strengthened`;
5. same directional state coherent → weak → `weakened`;
6. C is `unclear + conflicted` → `conflicted`;
7. P is `unclear + conflicted` and C is `unclear + weak` → `cleared-conflict`;
8. P is any unclear state and C is directional → `narrowed`;
9. P is directional and C is `unclear + weak` → `reopened`.

Those rules exhaust every pair of the six legal assessment states after equality/reversal/same-direction transitions. There is no “closest category” or array-order fallback.

# Player-facing Intelligence Chief brief

Normal command projection contains safe refs equivalent to:

- one `judgementRef`;
- max two `basisEvidenceRefs`;
- max one `contraryEvidenceRef`;
- exactly one `keyGapRef`;
- zero/one `watchForRef`;
- zero/one `assessmentChangeRef` when not unchanged;
- safe warning statement when operationally material;
- legal collection question supplied separately by agenda/capability authority.

Do not expose internal picture/diagnosticity enums, selector facts, raw action/preparation/posture, likelihood or confidence labels.

Canonical judgement meanings:

- preparation weak: “My read is that they're preparing a real move. I don't trust the wider picture yet.”
- preparation coherent: “This now looks like real preparation. The reporting is starting to line up.”
- coercion weak: “I think the pressure itself is the operation. That's still a thin read.”
- coercion coherent: “This increasingly looks like coercion, not cover for an immediate seizure.”
- unclear conflicted: “The indicators disagree. The reporting points in both directions.”
- unclear weak: “We don't have enough to tell whether the pressure is the operation or cover for one.”

Final prose is content-owned but preserves meaning.

# Exact key-gap / watch-for matrix

This is bounded authored semantics, not generated analysis.

| Assessment | Warning | Key gap | Watch for |
| --- | --- | --- | --- |
| unclear + weak | none | relationship between visible pressure and a real seizure force | physical concentration / military tasking |
| unclear + conflicted | none | reconcile logistics activity with apparently dispersed force elements | independent direct observation of force movement/tasking |
| unclear + conflicted | usable | wider meaning of an already-observed physical warning sign | corroboration that force movement belongs to a broader preparation sequence, or contrary coercive tasking |
| preparation + weak | none | whether suggestive activity forms an executable force package | direct concentration / independent preparation signpost |
| preparation + weak | usable | whether the physical warning reflects wider sustained preparation and timing | auxiliary/tasking or sequence corroboration; movement toward execution |
| preparation + coherent | none | physical timing and executable force movement | direct landing-force concentration / movement toward execution |
| preparation + coherent | usable | timing/threshold for execution | movement from staging into execution |
| coercion + weak | none | how quickly pressure could pivot into real preparation | new force concentration / preparation milestones |
| coercion + coherent | none | whether the coercive campaign is changing character | new preparation signposts / physical concentration |

Other assessment/warning combinations are unreachable under the warning reducer and fail validation rather than inventing copy.

# Timing

HQ belief is queried at the pre-command point **after the current-cycle Ravellan decision exists**.

Player orders cannot retroactively change the brief already shown.

Queued results appear only at authored later cycles:

- C2 reroute → C3;
- C3 focused staging → C4;
- Lattice/liaison → [[26-LATTICE-COLLECTION-MATRIX]] result cycle.

# Persistence / replay architecture

**#100 persists no evidence, assessment, warning or public-case state and adds no ledger entry.**

All products derive from:

- trusted current V2 state;
- replay-verified `ravellan-decision` / `command-set` history;
- canonical Kestrel intelligence-model content.

Therefore #100 uses Pattern B in [[30-ARCHITECTURE-CONTRACT]].

Consequences:

- no `hq-belief-update` ledger kind;
- no #100 state mutation/revision;
- no evidence-expiry writes;
- no client-submitted evidence/assessment;
- no #100 schema/ruleset-version bump; persisted format remains `0.4.0-prototype`;
- imported saves are replay-validated before normal player belief projection.

# Derived-model content identity

Pure derivation still has historical semantics and must not change silently.

#100 defines a canonical serialisable Kestrel intelligence-model definition/version, conceptually:

`kestrel-hq-belief-v1`

It includes or deterministically covers:

- evidence catalogue IDs/roles/lifecycles/supersession;
- reducer version;
- key-gap/watch-for mapping refs;
- safe judgement/change semantic refs that affect gameplay/readout.

Until #103 creates the full Kestrel scenario registry/content identity, #100 tests this definition's deterministic digest directly.

When #103 establishes Kestrel's canonical `contentDigest`, that digest **must include this intelligence-model definition**. A future semantic change to the evidence/reducer model changes Kestrel content identity even when V2 persisted schema remains unchanged.

Do not solve this by registering Kestrel prematurely in the existing V1 scenario registry.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact code seams.

# Required #100 tests

## Reducers

- no directional evidence → unclear weak;
- one directional indicator → directional weak;
- one uncontradicted diagnostic item → directional coherent;
- evidence on both sides → unclear conflicted even if one is diagnostic;
- ambiguous evidence never chooses direction;
- warning only from active preparation evidence marked usable;
- contradictory intent evidence does not erase valid physical warning;
- coherent preparation without warning-role evidence does not create warning;
- credible public case requires eligible diagnostic evidence and no opposite active direction.

## Timeline / fairness

- exact C1–C4 ordinary lifecycles;
- mandatory C3 conflict across all hidden openings/actions;
- `combat-elements-dispersed` is routine-coverage evidence, not a hidden-world oracle;
- reroute uses only historical C2 preparation + action and persists C3–C5;
- reroute never removes C3 conflict;
- focused staging uses only C4 result-time preparation;
- posture/action variation with C4 preparation fixed cannot alter focused result;
- focused buildup can produce preparation weak + usable warning;
- action-specific C4 situation copy cannot alter generic ambiguous evidence semantics;
- supersession/expiry changes active set without state mutation.

## Assessment-change / briefing

- table-driven test over all 36 previous/current legal assessment pairs proves one exact change category;
- every reachable assessment/warning pair has exactly one key-gap/watch-for mapping;
- unreachable assessment/warning pair fails content validation;
- brief bounded to max reasons/contrary/gap/watch-for contract.

## Information boundary / architecture

- same authorised evidence + changed hidden posture/truth → equal products/player brief;
- selector signatures contain no posture;
- raw hidden action/preparation used only by exact authorised historical selectors;
- historical readout does not drift when later state changes;
- normal projection excludes internal confidence/picture/diagnosticity/posture/preparation/action/truth provenance;
- repeated derivation is pure/deep-equal and leaves state hash/revision unchanged;
- V2 state schema/action union unchanged and ruleset remains `0.4.0-prototype`;
- intelligence-model definition digest is deterministic and changes when a canonical evidence semantic is changed in a test fixture;
- V1 unchanged.

# Rejection conditions

Reject #100 if it:

- persists belief/evidence or adds a ledger action without a new explicit decision;
- bumps prototype ruleset version merely for derived readout types;
- changes derived intelligence semantics without changing its canonical content-model identity;
- introduces Bayesian/numeric confidence, hidden evidence weights/vote counts or player-facing confidence bands;
- derives warning from assessment direction instead of warning-role evidence;
- treats routine C3 observation as omniscient global truth;
- parses action-specific world prose back into hidden analytic evidence;
- derives public case from arbitrary private intelligence without explicit eligibility;
- lets directed selectors read posture;
- sets assessment directly from collection output;
- derives normal player intelligence from unverified imported save history;
- lets browser/server duplicate analytic rules;
- builds a generic multi-claim intelligence framework before another scenario proves reuse.
