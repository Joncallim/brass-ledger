---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the implementation authority for **#100 — HQ belief / intelligence projection**. It defines the bounded Kestrel evidence model, exact ordinary evidence timeline, Cycle-2 reroute monitoring clue, Cycle-3 focused collection, assessment reduction, lifecycle and player-safe Intelligence-Chief judgement.

[[26-LATTICE-COLLECTION-MATRIX]] owns Lattice/liaison directed results. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system composition and repeats the strict posture-blind collection invariant.

## Product purpose

Intelligence should create strategic uncertainty, not a probability-management minigame.

The player should understand:

1. what Intelligence currently thinks;
2. why;
3. what remains weak/contradictory;
4. what can still be investigated.

The player never sees numeric probability, confidence percentage/bar, High/Medium/Low confidence, hidden Ravellan posture/preparation or oracle truth.

## Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised observation** — a fact a specific Kestrel observation/collection rule is allowed to inspect.
- **HQ evidence** — persisted interpreted evidence produced from an authorised observation.
- **HQ assessment** — deterministic reduction of active HQ evidence.
- **Player judgement** — natural-language projection of the assessment/evidence.

Changing hidden truth while holding all authorised observations/evidence fixed must leave HQ assessment and player projection deep-equal.

For directed collection, the stronger rule applies:

> changing Ravellan hidden posture alone while holding the specific target-authorised physical/action-history facts fixed must leave the result deep-equal.

A sensor does not receive a secret intent label merely because the engine has one.

## One primary Kestrel claim

Stable claim ID:

`ravellan-intent`

### Internal direction

- `preparation`
- `coercion`
- `unclear`

### Internal picture state

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

When active directional evidence exists on both sides, direction is always `unclear` and picture is `conflicted`; do not create a “preparation but conflicted” score-like state.

These identifiers are implementation-only.

## Evidence shape

Each evidence item contains only bounded serialisable fields equivalent to:

- stable `evidenceId`;
- claim ID;
- implication: `preparation | coercion | ambiguous`;
- diagnostic class: `indicator | corroborating`;
- source group/ref;
- observed cycle;
- lifecycle: active/superseded/expired or equivalent deterministic evidence;
- player-safe summary ref.

`indicator` = legitimately suggestive but insufficient by itself for a coherent directional picture.

`corroborating` = independently/specially diagnostic enough to make one direction coherent if there is no active contradictory directional evidence.

No numeric weight/count/likelihood exists.

## Assessment reduction

Use active evidence only:

1. no active non-ambiguous directional evidence → `unclear + weak`;
2. active preparation **and** coercion evidence → `unclear + conflicted`;
3. preparation only:
   - any preparation corroborating item → `preparation + coherent`;
   - otherwise → `preparation + weak`;
4. coercion only:
   - any coercion corroborating item → `coercion + coherent`;
   - otherwise → `coercion + weak`.

Ambiguous evidence never chooses direction.

Do not sum votes or let evidence quantity overpower contradiction.

## Ordinary evidence timeline

### Cycle 1 — opening pressure

`opening-pressure-ambiguous`

- implication: `ambiguous`;
- class: `indicator`;
- source: `opening-maritime-pressure`;
- observed/active C1–C2;
- expires before C3;
- meaning: increased patrol/auxiliary activity is compatible with coercion, testing or cover for preparation.

Assessment: `unclear + weak`.

### Cycle 2 — continuing shipping pressure

`shipping-probe-ambiguous`

- implication: `ambiguous`;
- class: `indicator`;
- source: `shipping-pressure`;
- active C2–C3;
- expires before C4;
- meaning: continuing shipping pressure remains compatible with both coercion and cover for something more serious.

Assessment remains `unclear + weak` absent other authorised evidence.

### Cycle 2 `reroute-and-monitor` queued result

This player order deliberately accepts greater civilian/political disruption to preserve reserve and create a monitoring opportunity. Its evidence arrives at the **C3 belief update**.

It reads only:

- seizure-preparation state immediately after the C2 Ravellan decision;
- verified C2 normal Ravellan action.

Result:

#### `reroute-auxiliary-integrated`

Condition:

- preparation `developing|ready`;
- C2 action `probe_shipping`.

Evidence:

- implication `preparation`;
- class `indicator`;
- source `reroute-auxiliary-monitoring`;
- active C3–C5; expires before C6 unless superseded;
- meaning: the monitored shipping-pressure vessels show tasking consistent with a wider preparation pattern.

#### `reroute-auxiliary-coercive`

Condition:

- preparation `none`;
- C2 action `probe_shipping|seed_deception`.

Evidence:

- implication `coercion`;
- class `indicator`;
- same lifecycle;
- meaning: monitoring points to a coercive/pressure tasking chain rather than a physical seizure-force sequence.

#### `reroute-auxiliary-unclear`

Otherwise:

- implication `ambiguous`;
- class `indicator`;
- same lifecycle;
- meaning: monitoring improves the picture but does not establish how shipping pressure relates to wider operations.

The reroute clue does **not** remove the mandatory C3 conflict below. Its value is persistence: after the generic conflict expires, a weak directional clue may remain unless newer same-question collection supersedes it.

A later Lattice/liaison result answering `auxiliary-tasking` supersedes the active reroute clue for that same question.

### Cycle 3 — mandatory conflicting bundle

Two directional indicators become active together **under all hidden opening situations/current actions** before the C3 command:

#### `staging-logistics-anomaly`

- implication `preparation`;
- class `indicator`;
- source `regional-logistics`;
- active C3–C4;
- expires before C5 unless superseded;
- meaning: logistics activity near staging areas is above recent baseline.

#### `combat-elements-dispersed`

- implication `coercion`;
- class `indicator`;
- source `force-disposition`;
- active C3–C4;
- expires before C5 unless superseded;
- meaning: major elements needed for a rapid seizure remain visibly dispersed.

These deliberately force:

`unclear + conflicted`

Even if the C2 reroute clue is directional, active evidence exists on both sides, so C3 remains conflicted.

This is the shared belief that drives the required Intelligence/Operations disagreement. Hidden truth never decides which chief is “really correct” in the recommendation path.

### Cycle 4 — pressure pattern

`cycle4-pressure-pattern-ambiguous`

- implication `ambiguous`;
- class `indicator`;
- source `visible-pressure-pattern`;
- active C4–C5;
- expires before C6;
- action-specific player-safe text comes from [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] but all variants remain ambiguous.

It never chooses direction.

## Cycle-3 focused staging collection

Stable target:

`staging-area-focus`

The order diverts existing collection and carries its Beacon-coverage consequence elsewhere. Result arrives C4.

It reads **seizure preparation only**, because it is observing physical concentration.

### Preparation `developing|ready`

`focused-staging-buildup`

- implication `preparation`;
- class `indicator`;
- source `focused-staging-collection`;
- active C4 through terminal;
- supersedes `combat-elements-dispersed`;
- meaning: focused collection now shows movement consistent with seizure-force staging.

### Preparation `none`

`focused-staging-empty`

- implication `coercion`;
- class `indicator`;
- source `focused-staging-collection`;
- active C4 through terminal;
- supersedes `staging-logistics-anomaly`;
- meaning: the anomaly is not accompanied by concentration of the force package needed for a rapid seizure.

There is **no posture/testing branch**. A testing opponent with no physical concentration can legitimately look coercive through this sensor. That is fair imperfect inference.

## Cycle 5 without newer directed information

The mandatory C3 pair expires before the C5 update.

Possible C5 assessments therefore depend on what the commander actually invested in:

- no lasting directional clue → `unclear + weak`;
- active C2 reroute clue → preparation/coercion + weak;
- active focused C4 result → preparation/coercion + weak;
- newer Lattice/liaison evidence → assessment under the same reducer;
- contradictory persistent directed evidence → `unclear + conflicted`.

Information is useful but not mandatory for all viable military/coalition routes.

## Lattice / liaison evidence

[[26-LATTICE-COLLECTION-MATRIX]] owns the exact target/result catalogue, aligned with posture-blind observation rules.

Rules shared here:

- results enter this ordinary evidence schema;
- result never directly sets assessment/recommendation;
- same-question newer evidence may supersede older reroute/liaison/Lattice evidence when explicitly authored;
- different questions remain independently active;
- contradictory active evidence remains conflict;
- directional Lattice/liaison results remain active through terminal unless explicitly superseded;
- ambiguous results never choose direction.

## Attribution opportunity derivation

Attribution is belief-safe and separate from warning.

- no legitimate directional evidence → `none`;
- at least one relevant directional indicator → `tentative`;
- at least one relevant corroborating item and **no active material directional contradiction** → `credible`;
- player uses credible opportunity in C5/C6 → `used`;
- evidence disappears before use → weaken/expire according to authoritative state.

Under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]], `used` is terminal for Kestrel's one-shot attribution opportunity: later evidence does not regenerate another `credible` opportunity in this slice.

A credible **coercion** assessment can support attribution but does not become `usableWarning`; terminal warning remains preparation-specific.

## Evidence lifecycle summary

- opening ambiguous: through C2, expires pre-C3;
- shipping ambiguous: through C3, expires pre-C4;
- C3 conflict pair: through C4, expires pre-C5 unless superseded;
- C2 reroute clue: C3–C5, expires pre-C6 unless superseded;
- C4 pressure-pattern ambiguous: C4–C5, expires pre-C6;
- focused staging directional result: through terminal;
- directed Lattice/liaison directional result: through terminal unless explicitly superseded;
- ambiguous directed results: according to authored result lifecycle, never directional.

Expired/superseded evidence stays in replay/history but is inactive in reduction.

## Stable reason selection

No hidden reason score.

### Conflicted

Show newest active preparation evidence + newest active coercion evidence. Same-cycle display tie uses stable evidence ID only for presentation order.

### Directional

Show newest supporting directional evidence; if same observed cycle, show corroborating before indicator. Optionally show newest material ambiguous gap.

### Unclear weak

Show newest ambiguous item or authored unresolved-coverage statement.

## Player-facing judgement

Canonical meanings:

- preparation + weak: “I think they’re preparing something real, but our intelligence is weak.”
- preparation + coherent: “This looks like preparation. The reporting is starting to line up.”
- coercion + weak: “My read is that they’re trying to make us react. I don’t trust the picture yet.”
- coercion + coherent: “This increasingly looks like coercion rather than preparation.”
- unclear + conflicted: “There are signs both ways. I can’t call it.”
- unclear + weak: “We don’t have enough yet to say what the pressure is covering.”

Final prose is content-owned but preserves those meanings and exposes no internal confidence label/enum.

Projection should answer:

- current judgement;
- belief-safe evidence reasons;
- important unresolved gap/contradiction;
- legal named collection question when available.

## Timing

HQ belief updates only at the canonical lifecycle position.

A player action cannot retroactively change the assessment already shown before it. Queued order/collection results become usable at their authored later update.

## Replay / authority

HQ evidence is authoritative persisted state or is reconstructed through explicit replay-verifiable transitions according to [[30-ARCHITECTURE-CONTRACT]].

If assessment is persisted as a convenience, replay recomputes it from verified evidence and rejects mismatch.

Never trust client-submitted evidence/assessment.

Any persisted-state change requires the repository's next prototype format boundary; no silent reinterpretation/migration.

## Required #100 tests

At minimum prove:

- identical authorised evidence + different hidden truth → identical assessment/projection;
- no directional evidence → unclear weak;
- one directional indicator → directional weak;
- one corroborating directional result without contradiction → directional coherent;
- evidence on both sides → unclear conflicted even if one is corroborating;
- ambiguous alone never chooses direction;
- exact C1/C2/C3/C4 lifecycle;
- C3 mandatory conflict holds across all hidden openings/current actions;
- reroute result branches use only preparation + C2 action, persist C3–C5 and never remove mandatory C3 conflict;
- focused staging uses only preparation; posture-only variation is irrelevant;
- superseded/expired evidence remains history but not active reduction;
- directed results enter the same reducer;
- C5 use attribution makes opportunity `used` and later evidence does not regenerate it during Kestrel;
- credible coercion attribution does not count as seizure warning;
- normal player projection contains no percentage/band/hidden posture/preparation/action/truth provenance;
- V1 state/replay unchanged.

## Rejection conditions

Reject #100 if it introduces Bayesian probability, generic intelligence score, player confidence labels, posture-dependent sensor results, hidden-truth-derived prose, direct assessment setting from collection, UI-owned intelligence logic or a generic multi-claim framework not required by Kestrel.