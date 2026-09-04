---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/semantic authority for **#100 — HQ belief / intelligence projection**.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the exact code/replay integration against the committed #99 ledger. [[26-LATTICE-COLLECTION-MATRIX]] later extends the same evidence vocabulary with Lattice/liaison results. [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns player-observable world manifestations.

# Product purpose

Intelligence exists to help the commander make a decision under uncertainty. It is not a probability minigame and not a hidden-answer oracle.

The player should repeatedly be able to answer:

1. **What does Intelligence currently think?**
2. **What facts are driving that judgement?**
3. **What does not fit / what are we still missing?**
4. **What observable sign would change the picture?**
5. **Do we actually have warning, or only an assessment?**

The player never sees numeric probability, confidence percentage/bar, High/Medium/Low confidence, hidden Ravellan posture/preparation, raw policy/action IDs or oracle truth.

# Tradecraft model

Kestrel intentionally borrows a small, playable subset of real intelligence practice:

- **competing hypotheses** rather than one story that accumulates points;
- **indicators/signposts** tied to observable activity;
- stronger **diagnostic evidence** that discriminates between hypotheses;
- explicit contradictory reporting rather than silently averaging it away;
- collection against a named information gap;
- separation of source/reporting from analytic judgement;
- explanation of why a judgement changed or remained uncertain;
- separate **indications-and-warning** from broader intent assessment;
- separate internal assessment from evidence usable for a public case.

Do not implement a full ACH matrix, source-reliability scoring system, Bayesian model, confidence taxonomy or generic intelligence framework. Kestrel has one bounded decision question.

# The decision question

Stable claim ID remains:

`ravellan-intent`

Its human meaning is deliberately narrower than philosophical “intent”:

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

The two competing directional hypotheses are:

- `preparation` — current activity is materially supporting a real near-term seizure option;
- `coercion` — current pressure is primarily coercive/political rather than cover for an imminent prepared seizure.

`testing` remains hidden world truth, not a third player hypothesis. A testing opponent can legitimately generate evidence that looks coercive, preparatory or conflicted depending on what it is physically doing.

# Three different intelligence products

Do **not** collapse these into one state.

## A. Intent assessment

Internal direction:

- `preparation`
- `coercion`
- `unclear`

Internal picture state:

- `weak`
- `conflicted`
- `coherent`

Legal combinations:

- `unclear + weak`
- `unclear + conflicted`
- `preparation + weak`
- `preparation + coherent`
- `coercion + weak`
- `coercion + coherent`

These are implementation semantics. Player copy never labels a percentage/confidence band.

## B. Tactical warning

Derived separately:

- `none`
- `usable`

`usable` means HQ has an active authorised **physical warning signpost** that materially improves the commander's ability to act against a Beacon seizure.

A preparation assessment alone is **not** usable warning.

Conversely, HQ can have a usable physical warning signpost while the broader intent picture is still conflicted.

This distinction is intentional gameplay:

> “I think they are preparing” is not the same as “I know enough about the force movement to act in time.”

[[27-KESTREL-TERMINAL-MATRIX]] consumes this derived warning state rather than inferring warning from assessment direction.

## C. Public-case basis

Derived separately for later #101/#102 use:

- `none`
- `tentative`
- `credible-source-sensitive`

This is **not** the persisted one-shot attribution-opportunity state. #100 only answers whether the current evidence base can support a public case.

`credible-source-sensitive` means:

- at least one active public-case-eligible **diagnostic** directional item exists;
- no active material directional contradiction remains;
- exposing the case would reveal/compromise protected sourcing under Kestrel's later attribution rules.

`tentative` means some eligible directional basis exists but the above standard is not met.

Later #101 owns `none/tentative/credible/used` campaign opportunity state and the one-shot consumption rule. A later implementation must never regenerate `used` merely because #100's current basis becomes credible again.

# Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised source fact** — the exact physical/action-history fact a named observation rule is permitted to inspect.
- **HQ evidence** — an authored interpretation record generated from that fact.
- **HQ assessment / warning / public-case basis** — pure deterministic reductions of evidence.
- **Player brief** — bounded natural-language refs derived from those products.

Changing hidden truth while holding authorised source facts/evidence fixed must leave all HQ products deep-equal.

For directed collection, the stronger invariant applies:

> Changing Ravellan hidden posture alone while holding the target-authorised physical/action-history facts fixed must leave the collection result deep-equal.

No sensor receives a secret intent label merely because the engine stores one.

# Evidence record

Each derived Kestrel evidence item contains bounded serialisable semantics equivalent to:

- stable `evidenceId`;
- claim ID (`ravellan-intent`);
- implication: `preparation | coercion | ambiguous`;
- diagnosticity: `indicator | diagnostic`;
- source group/ref;
- observed cycle;
- active-through cycle;
- explicit superseded evidence IDs where applicable;
- player-safe summary ref;
- `warningRole: none | usable`;
- `publicCaseRole: none | source-sensitive`.

These records are **derived readout/history**, not persisted V2 campaign state under #100. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] freezes that architecture.

## Indicator

Legitimately suggestive but compatible with more than one reasonable explanation.

## Diagnostic

Substantially discriminates between Kestrel's two competing hypotheses. It still does not reveal hidden truth or guarantee future behavior.

The word `diagnostic` is intentional: evidence is strong because it separates explanations, not because it secretly carries a numeric weight.

# Intent assessment reducer

Use active, non-superseded evidence only.

1. No active non-ambiguous directional evidence → `unclear + weak`.
2. Active preparation **and** coercion evidence → `unclear + conflicted`.
3. Preparation only:
   - any active preparation `diagnostic` item → `preparation + coherent`;
   - otherwise → `preparation + weak`.
4. Coercion only:
   - any active coercion `diagnostic` item → `coercion + coherent`;
   - otherwise → `coercion + weak`.

Ambiguous evidence never selects a direction.

Do not count votes, average contradictions or let three weak indicators overpower one contradictory indicator by quantity.

A diagnostic item does **not** override an active contradictory directional item. Contradiction remains visible until the contradictory evidence expires or is explicitly superseded.

# Warning reducer

`usable` iff at least one active non-superseded evidence item has:

- implication `preparation`; and
- `warningRole = usable`.

Contradictory intent evidence does not erase a genuine physical warning signpost.

This is deliberate: warning is about whether a commander has actionable physical notice, not whether analysts have solved Ravellan's entire strategy.

# Public-case reducer

Ignore evidence with `publicCaseRole = none`.

- no eligible active directional evidence → `none`;
- eligible directional evidence exists but no uncontradicted diagnostic basis → `tentative`;
- at least one eligible diagnostic directional item + no active material directional contradiction → `credible-source-sensitive`.

The credible direction is the diagnostic item's direction; conflicting diagnostic directions can never be credible simultaneously and therefore reduce to tentative/conflicted.

This reducer never consumes the opportunity. Consumption belongs to later campaign state.

# Ordinary evidence timeline

## Cycle 1 — opening pressure

`opening-pressure-ambiguous`

- implication: `ambiguous`;
- diagnosticity: `indicator`;
- source: `opening-maritime-pressure`;
- observed C1;
- active through C2; expires before C3;
- warning: none;
- public case: none;
- meaning: increased patrol/auxiliary activity is compatible with coercion, testing or cover for preparation.

Assessment: `unclear + weak`.

## Cycle 2 — continuing shipping pressure

`shipping-probe-ambiguous`

- implication: `ambiguous`;
- diagnosticity: `indicator`;
- source: `shipping-pressure`;
- observed C2;
- active through C3; expires before C4;
- warning: none;
- public case: none.

Assessment remains `unclear + weak` absent other authorised evidence.

## Cycle 2 `reroute-and-monitor` result, observed C3

Reroute deliberately accepts larger civilian/political disruption to create a monitoring opportunity while preserving reserve.

The selector may inspect only:

- C2 Ravellan preparation **immediately after the verified C2 Ravellan decision**;
- verified C2 normal Ravellan action.

It never reads posture.

### `reroute-auxiliary-integrated`

Condition:

- C2 preparation `developing|ready`;
- C2 action `probe_shipping`.

Evidence:

- implication `preparation`;
- diagnosticity `indicator`;
- source `reroute-auxiliary-monitoring`;
- observed C3, active through C5;
- warning none;
- public case none;
- meaning: monitored shipping-pressure vessels appear integrated with a wider preparation pattern.

### `reroute-auxiliary-coercive`

Condition:

- C2 preparation `none`;
- C2 action `probe_shipping|seed_deception`.

Evidence:

- implication `coercion`;
- diagnosticity `indicator`;
- same lifecycle/roles;
- meaning: monitoring points to a coercive/pressure tasking chain rather than a seizure-force sequence.

### `reroute-auxiliary-unclear`

Otherwise:

- implication `ambiguous`;
- diagnosticity `indicator`;
- same lifecycle/roles.

The reroute clue never removes the mandatory C3 conflict. Its value is persistence after that generic conflict expires.

A later same-question auxiliary-tasking result from Lattice/liaison supersedes the reroute clue.

## Cycle 3 — mandatory conflicting signposts

Before C3 command, activate both under every hidden opening/current action:

### `staging-logistics-anomaly`

- implication `preparation`;
- diagnosticity `indicator`;
- source `regional-logistics`;
- observed C3, active through C4;
- warning none;
- public case none;
- meaning: logistics activity near staging areas is above baseline.

### `combat-elements-dispersed`

- implication `coercion`;
- diagnosticity `indicator`;
- source `force-disposition`;
- observed C3, active through C4;
- warning none;
- public case none;
- meaning: major elements needed for a rapid seizure remain visibly dispersed.

Together they force:

`unclear + conflicted`

This is a deliberate indications/signposts problem: the headquarters sees facts that support competing explanations.

A C2 reroute clue may add context but cannot remove the conflict while both signposts remain active.

## Cycle 4 — ambiguous pressure-pattern change

`cycle4-pressure-pattern-ambiguous`

- implication `ambiguous`;
- diagnosticity `indicator`;
- source `visible-pressure-pattern`;
- observed C4, active through C5;
- warning none;
- public case none;
- action-specific safe summary comes from [[37-RAVELLAN-WORLD-EFFECT-MATRIX]].

It never chooses direction.

# C3 focused staging collection, result observed C4

Stable target/order question:

`staging-area-focus`

The order diverts current collection from Beacon coverage; that operational cost is owned elsewhere.

The selector reads **only seizure preparation at C4 result time**, specifically the verified C4 Ravellan decision's post-state preparation.

No posture/action branch exists.

## Preparation `developing|ready`

`focused-staging-buildup`

- implication `preparation`;
- diagnosticity `indicator`;
- source `focused-staging-collection`;
- observed C4, active through terminal;
- supersedes `combat-elements-dispersed`;
- **warning `usable`**;
- public case `source-sensitive`;
- meaning: focused collection now shows movement consistent with seizure-force staging.

This is intentionally only an intent **indicator** while still providing **usable warning**. Seeing physical movement can improve tactical warning without proving the opponent's whole political intent.

## Preparation `none`

`focused-staging-empty`

- implication `coercion`;
- diagnosticity `indicator`;
- source `focused-staging-collection`;
- observed C4, active through terminal;
- supersedes `staging-logistics-anomaly`;
- warning none;
- public case `source-sensitive`;
- meaning: the earlier anomaly is not accompanied by concentration of the force package needed for a rapid seizure.

A testing opponent with no concentration may therefore look coercive through this sensor. That is legitimate imperfect inference, not a bug.

# Cycle 5 without newer directed information

The fixed C3 pair expires before C5.

Possible intent assessments:

- no lasting directional clue → `unclear + weak`;
- active reroute clue → preparation/coercion + weak;
- active focused result → preparation/coercion + weak;
- later Lattice/liaison evidence → same reducer;
- contradictory persistent directed evidence → `unclear + conflicted`.

Possible warning differs:

- focused staging buildup can leave `warning = usable` even while intent is only `preparation + weak`;
- a coherent preparation assessment from some non-physical later source need not imply usable warning.

Information is valuable but not mandatory for all viable military/coalition routes.

# Lattice / liaison extension contract

[[26-LATTICE-COLLECTION-MATRIX]] later adds evidence to this same schema.

Shared rules:

- result never directly sets assessment, warning, public-case state or recommendation;
- same-question newer evidence may explicitly supersede older evidence;
- different questions remain independently active;
- contradictory active directions remain conflict;
- ambiguous results never choose direction;
- Lattice evidence may be diagnostic;
- only evidence explicitly marked `warningRole = usable` creates warning;
- only evidence explicitly marked `publicCaseRole = source-sensitive` contributes to public-case basis.

# Evidence lifecycle / supersession

Evidence is derived for historical replay/readout and receives status at query time.

Active iff:

- observed cycle <= queried cycle <= active-through cycle; and
- no already-observed evidence explicitly supersedes it.

Expired/superseded items remain reconstructable history but never participate in current reducers.

Current ordinary lifecycles:

- opening ambiguous: C1–C2;
- shipping ambiguous: C2–C3;
- reroute clue: C3–C5;
- C3 conflict pair: C3–C4;
- C4 pressure ambiguous: C4–C5;
- focused staging result: C4–terminal.

No mutation is performed merely to mark an item expired.

# Stable evidence/reason selection

No hidden reason score.

## Conflicted

Show:

- newest active preparation item;
- newest active coercion item.

If same observed cycle, `diagnostic` precedes `indicator`; stable evidence ID is final presentation-order tie only.

## Directional

Show strongest/newest supporting directional item; then at most one useful unresolved gap.

## Unclear weak

Show newest ambiguous item or authored coverage gap.

Player brief should never become an evidence ledger dump.

# Assessment-change readout

Derive, never persist, one of:

- `initial`
- `unchanged`
- `narrowed` — unclear → directional;
- `strengthened` — same direction weak → coherent;
- `more-uncertain` — directional → unclear/conflicted or coherent → weak;
- `reversed` — preparation ↔ coercion.

This exists so the Intelligence Chief can explain **what changed in the analysis**, not to award progress points.

# Player-facing Intelligence Chief brief

Normal command projection contains a compact derived brief with safe refs equivalent to:

- `judgementRef`;
- `basisEvidenceRefs` — max 2;
- optional `contraryEvidenceRef` — max 1;
- `keyGapRef` — exactly one;
- `watchForRef` — exactly one when material;
- `assessmentChangeRef` only when not unchanged;
- safe indication of whether tactical warning exists where relevant;
- legal named collection question supplied separately by agenda/capability authority.

It does **not** expose internal diagnosticity/picture enums, hidden source facts, hidden action/preparation/posture, likelihood or confidence labels.

Canonical judgement meanings:

- preparation + weak: “My read is that they're preparing a real move. I don't have enough on the force package to trust that yet.”
- preparation + coherent: “This now looks like real preparation. The reporting is starting to line up.”
- coercion + weak: “I think the pressure itself is the operation. That's still a thin read.”
- coercion + coherent: “This increasingly looks like coercion, not cover for an immediate seizure.”
- unclear + conflicted: “The indicators disagree. Logistics say preparation; force disposition says not yet.”
- unclear + weak: “We don't have enough to tell whether the pressure is the operation or cover for one.”

Final prose is content-owned but must preserve those meanings.

## Key-gap / watch-for semantics

Use bounded content refs, not generated prose or free-text analysis.

At minimum preserve these meanings:

- unclear/weak → gap: relation between pressure and a real seizure force; watch for physical concentration;
- conflicted → gap: staging/logistics versus dispersed combat elements; watch for direct force movement/tasking;
- preparation/weak → gap: whether suggestive signs form a genuine executable force package; watch for independent physical confirmation;
- preparation/coherent → gap: timing/threshold; watch for movement from preparation into execution;
- coercion/weak → gap: ability to pivot rapidly from pressure to preparation; watch for new force concentration;
- coercion/coherent → gap: whether the coercive campaign is changing character; watch for preparation signposts.

# Timing

Belief is queried at the canonical pre-command point **after the current-cycle Ravellan decision exists**.

A player order cannot retroactively change the brief already shown before that order.

Queued observation results appear only at their authored later cycle:

- C2 reroute → C3;
- C3 focused staging → C4;
- later Lattice/liaison → their [[26-LATTICE-COLLECTION-MATRIX]] result cycle.

# Persistence / replay architecture

**#100 persists no HQ evidence, assessment, warning or public-case state and adds no ledger entry.**

All #100 products are pure deterministic derived readouts reconstructed from:

- trusted current V2 state;
- already-authoritative/replayable `ravellan-decision` and `command-set` ledger evidence;
- the frozen Kestrel evidence catalogue/content identity.

Therefore #100 uses Pattern B (“pure derived readout”) from [[30-ARCHITECTURE-CONTRACT]].

Consequences:

- no `hq-belief-update` ledger kind;
- no #100 V2 ruleset-version bump;
- no evidence-expiry mutations;
- no client-submitted evidence/assessment;
- imported saves must pass normal trusted replay before any normal player belief projection is produced.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] defines the exact history extraction and code seams.

# Required #100 tests

At minimum prove:

## Reducers

- no directional evidence → unclear weak;
- one directional indicator → directional weak;
- one uncontradicted diagnostic item → directional coherent;
- evidence on both sides → unclear conflicted even if one is diagnostic;
- ambiguous evidence alone never chooses direction;
- warning derives only from active `warningRole = usable` preparation evidence;
- contradictory intent evidence does not erase a valid physical warning signpost;
- coherent preparation assessment without a warning-role item does not create warning;
- public-case `credible-source-sensitive` requires eligible diagnostic evidence + no active material contradiction.

## Timeline

- exact C1/C2/C3/C4 ordinary lifecycle;
- mandatory C3 conflict under all hidden openings/current actions;
- reroute branch uses only C2 preparation + C2 action and persists C3–C5;
- reroute never removes mandatory C3 conflict;
- focused staging uses only C4 result-time preparation;
- posture/action variation with preparation fixed cannot alter focused result;
- focused buildup can yield preparation-weak + usable-warning simultaneously;
- supersession/expiry remove items from active reduction without mutating session state.

## History / information boundary

- same authorised evidence + changed hidden posture/truth → equal assessment/warning/public-case/player brief;
- collection selectors' function signatures contain no posture;
- raw hidden action/preparation used only by the exact authorised historical selectors;
- normal projection contains no percentage/band/internal picture/posture/preparation/action/truth provenance;
- derived history at prior cycles is stable even after later Ravellan state changes.

## Gameplay / readout

- assessment-change classification deterministic;
- brief returns bounded reasons/gap/watch-for rather than whole evidence history;
- public-case basis is distinct from tactical warning;
- later `used` attribution state cannot be regenerated by #100 (integration fixture/stub until #101).

## Architecture

- V2 persisted state/schema and action-ledger discriminators are unchanged by #100;
- `v2CurrentRulesetVersion` remains `0.4.0-prototype` for #100;
- trusted replay of #99 sessions remains byte/semantic compatible;
- V1 unchanged.

# Rejection conditions

Reject #100 if it:

- adds a persisted belief/evidence field or new ledger action without a new explicit product decision;
- bumps V2 prototype version merely for derived readout types;
- introduces Bayesian/numeric confidence, evidence weights/vote counts or confidence bands;
- derives warning from assessment direction instead of warning-role evidence;
- derives a public case from arbitrary private intelligence without explicit eligibility;
- lets a directed selector read hidden posture;
- sets assessment directly from collection output;
- trusts imported client/save evidence rather than verified authoritative history;
- lets React/server presentation recompute analytic rules;
- creates a generic multi-claim intelligence framework before a second scenario proves reuse.
