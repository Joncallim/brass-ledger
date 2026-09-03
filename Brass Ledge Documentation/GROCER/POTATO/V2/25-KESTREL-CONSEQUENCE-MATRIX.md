---
type: v2-kestrel-consequence-contract
status: active
---

# Kestrel Consequence Matrix

Backlink: [[README]]

This is the implementation authority for **#101 — concrete Kestrel persistent state, provenance, order consequences and recovery**. It is intentionally not a generic consequence engine.

[[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-command-set interactions, C5 partner authority/tempo and terminal route effects. [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns Ravellan-observation emission; do not duplicate that logic here.

## Product rule

Persistent state exists so the player can understand:

> something changed because of my order / headquarters direction / Ravellan / the external situation, and now I have a different problem.

Do not collapse these records into a universal success/trust/readiness score.

## Provenance

Every material transition records one of:

- `player-caused` — final coalition order directly created it;
- `player-conditioned` — external/adversary event occurred, but prior player state changed severity/response;
- `adversary-caused` — Ravellan directly caused it;
- `external` — neither side directly caused it.

Truth provenance is replayable but player-facing causal text remains belief-safe until terminal debrief.

## Concrete records

### `beacon-exposure`

`contained → thin → open`

Opening: `thin`.

- contained: quick opportunistic move materially harder;
- thin: defensible with warning/preparation but exploitable;
- open: serious exploitable gap.

Improve/worsen one step when authored; clamp endpoints.

### `beacon-preparation`

`routine | prepared`

Opening: `routine`.

Separate from exposure: vulnerability now versus whether HQ has done the work for credible denial.

### `reserve-condition`

`usable → strained → brittle`

Opening: `usable`.

Worsen/recover one step; clamp endpoints. Brittle is not automatic defeat.

### `partner-consent`

`cooperative → uneasy → conditional → withdrawn`

Opening: `cooperative`.

Ordinary worsen/improve is one step unless an explicit recovery sets a floor/state. Withdrawal is serious but not irreversible: C5 political concession can restore it to `conditional` at severe cost.

### `consultation-promise`

`none | active | honoured | breached`

Opening: `none`.

Only C1 formal consultation creates `active`. No implicit promise.

`honoured`/`breached` are terminal for the six-cycle promise record.

### `partner-authority`

`pending | none | joint | unilateral | concession`

Opening: `pending`.

Resolved by the C5 partner-authority issue under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

This records permission/coordination, not relationship sentiment.

### `political-concession`

`none | active`

Opening: `none`.

C5 costly recovery. It can restore immediate access/authority but remains severe terminal cost.

### `liaison-obligation`

`none | active | fulfilled | breached`

Opening: `none`.

Created only by the commander-only C4 partner-liaison fallback.

### `lattice-investment`

`0 | 1 | 2 | 3-operational`

Opening `0` plus explicit deterministic missed-schedule evidence/flag sufficient to prove maturity unreachable after a missed required C1/C2/C3 advance.

No catch-up.

### `attribution-opportunity`

`none | tentative | credible | used | expired`

Opening `none`.

Derived only from legitimate HQ evidence under [[23-HQ-BELIEF-AND-EVIDENCE]]. Hidden world truth cannot advance it.

`credible` means **unspent** opportunity. Under 39, once `used` in C5/C6 it cannot become credible again during Kestrel even if later evidence arrives.

## Helper semantics

For ordinal records, “improve one” / “worsen one” move exactly one step and clamp.

C5 is special: simultaneous Beacon/reserve signed steps are composed from the complete final-order set, summed, then clamped once under 39. Never sequentially clamp issue effects.

Repeated causal effects remain separate history even if net/clamped state does not move.

## Cycle 1

### `reinforce-watch`

Player-caused:

- Beacon exposure improve one (`thin → contained` opening);
- reserve worsen one.

Ravellan signals come from 37A.

### `ordinary-watch`

No persistent improvement. Opening exposure remains thin.

### `formal-consultation-agreement`

Player-caused:

- consultation promise `none → active`;
- partner may improve one if below cooperative (normally no movement at opening).

It also creates the pre-arranged channel represented by the active promise and used in C2/C5 composition under 39.

### `informal-liaison`

No promise/authority record.

### `protect-lattice-c1`

Lattice `0 → 1`.

Missing it marks Kestrel maturity unreachable.

## Cycle 2 shipping

### `quiet-escort`

No persistent reserve/partner penalty by default.

Visible beat:

- some shipping delay remains;
- weaker visible deterrence is a course cost, not a persistent meter.

### `visible-patrol-surge`

Player-caused:

- reserve worsen one;
- if the complete C2 package is **not** coordinated under 39, partner worsen one;
- if coordinated through active formal channel + joint warning, do not worsen partner.

### `reroute-and-monitor`

Player-caused:

- partner worsen one if the disruption is not already jointly coordinated/accepted;
- reserve unchanged.

Visible beat: larger civilian shipping disruption.

Information payoff is the queued C3 indicator in [[23-HQ-BELIEF-AND-EVIDENCE]], not a generic intel stat.

## Cycle 2 public posture

### `remain-silent`

No persistent state transition.

### `joint-non-attributive-warning`

Player-caused:

- improve partner one step if uneasy/conditional;
- cannot restore withdrawn by itself.

### `public-accusation`

This Kestrel order is always unilateral.

Player-caused:

- partner worsen one regardless whether formal promise existed;
- if consultation promise active: `active → breached`.

It does **not** create a credible attribution opportunity merely because the player accused publicly.

## Cycle 2 Lattice

Protect on schedule only if C1 protected:

`1 → 2`.

Otherwise maturity unreachable.

## Cycle 3

### `forward-reserve-preparation`

Player-caused:

- Beacon preparation `routine → prepared`;
- reserve worsen one.

### `hold-reserve`

No persistent movement.

### `focus-staging-collection`

Player-caused:

- Beacon exposure worsen one;
- queue C4 focused staging evidence under [[23-HQ-BELIEF-AND-EVIDENCE]].

### `maintain-current-coverage`

No focused evidence; no exposure worsening from collection diversion.

### `reassure-partner`

Player-caused:

- improve partner one if uneasy/conditional;
- cannot restore withdrawn;
- cannot erase a breached promise.

### `protect-lattice-c3`

If advances 1–2 succeeded:

`2 → 3-operational`.

Otherwise maturity remains unreachable.

## Cycle 4

### `recover-reserve`

Player-caused:

- reserve improve one;
- Beacon exposure worsen one.

Canonical costly recovery: endurance is bought with immediate security.

### `prepare-beacon-quietly`

Player-caused:

- Beacon preparation `routine → prepared`;
- Beacon exposure improve one;
- reserve worsen one.

This is not a free upgrade. Its targeted detectability/adversary discovery effect is in 37A.

### `press-visible-advantage`

Player-caused:

- reserve worsen one;
- partner worsen one if the action is uncoordinated under known public/commitment state.

### Lattice Task Collection

No generic persistent bonus. Queue target result under [[26-LATTICE-COLLECTION-MATRIX]].

### `request-partner-liaison`

Commander-only intervention under 39:

- liaison obligation `none → active`;
- queues narrower C5 evidence.

It never executes through Delegate.

## Cycle 5 — atomic composition

C5 final orders are resolved as a complete package under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

### Beacon posture signed effects

#### `quiet-reinforce-beacon`

- Beacon exposure improve +1;
- Beacon preparation → `prepared`;
- reserve worsen -1 when material reserve commitment is required by the authored state.

#### `visible-reinforce-beacon`

- Beacon exposure +1;
- Beacon preparation → `prepared`;
- reserve -1.

Partner effect comes from the authority package, not an independent per-order decrement.

#### `hold-beacon-posture`

No direct state movement.

### Reserve decision signed effects

#### `keep-reserve-forward`

- reserve -1;
- Beacon preparation → `prepared` if not already.

#### `emergency-consolidation`

- reserve +1;
- Beacon exposure -1.

### Order-independent aggregation

For Beacon exposure and reserve:

- sum all signed C5 deltas from the complete final-order set;
- clamp once from pre-command state;
- preserve every individual causal effect record.

Therefore quiet reinforcement + consolidation can net exposure zero regardless agenda ordering while still creating Beacon preparation and using scarce command attention.

## Cycle 5 partner authority

Resolve under 39.

### `honour-consultation`

Always player-legal.

Non-withdrawn partner:

- partner-authority → `joint` for C6;
- active promise → `honoured`;
- active liaison obligation → `fulfilled`;
- improve partner one step.

Withdrawn partner:

- partner-authority → `none`;
- honour/fulfil active commitment where applicable;
- partner remains withdrawn.

Same-cycle sensitive-action compatibility depends on whether the active C1 formal channel still provides rapid consultation under 39.

### `political-concession`

Where legal:

- partner-authority → `concession`;
- concession `none → active`;
- withdrawn partner → `conditional`;
- honour an active unbreached consultation promise;
- fulfil active liaison obligation where applicable.

Severe terminal cost remains.

### `act-then-inform`

Only valid with at least one same-cycle partner-sensitive action.

- partner-authority → `unilateral`;
- active promise → `breached`;
- active liaison obligation → `breached`;
- partner worsen exactly **one step total for the unilateral package**.

Do not worsen once per sensitive action.

Partner-sensitive actions are exactly visible Beacon reinforcement and C5 attribution use.

## Cycle 5 attribution

### `hold-attribution`

No immediate persistent transition. Preserve `attribution-opportunity = credible` for possible C6 Hold And Expose.

### `use-attribution`

Legal only at `credible` and with a compatible authority package.

- attribution `credible → used`;
- improve partner one step if partner not withdrawn and use is coordinated/politically usable;
- if unilateral, the package-level authority rule owns the one political deterioration rather than adding another per-order decrement.

`used` is terminal for Kestrel; later evidence does not regenerate the opportunity.

The discovery/unity observations are owned by 37A.

## Attribution derivation

From active HQ evidence:

- no directional evidence → `none`;
- relevant directional indicator → `tentative`;
- relevant corroborating evidence + no active material directional contradiction → `credible`;
- C5/C6 use → `used`;
- pre-use evidence expiry can weaken/expire according to HQ-belief state.

Do not infer from hidden truth.

## Liaison obligation

C4 liaison creates `active`.

It becomes:

- `fulfilled` through authored consultation/concession satisfying the obligation;
- `breached` through an explicitly incompatible unilateral package;
- if still active at terminal, outstanding commitment cost, not automatic breach.

## Severe-cost historical flags

Before final route effects, severe-cost history includes at minimum:

- consultation promise breached;
- political concession active;
- liaison obligation breached;
- other explicit authored commitment failure.

Reserve brittleness is evaluated on **post-terminal-route** reserve state under [[27-KESTREL-TERMINAL-MATRIX]].

Terminal-specific severe flags (`late-reaction`, `emergency-surge`, overreaction) are also owned by 27/39.

No numeric cost score.

## Recovery invariant

Before C6, the promised costly counterplay includes:

- reserve deterioration → C4 recovery / C5 emergency consolidation;
- Beacon weakness → C3/C4/C5 preparation/reinforcement paths;
- partner deterioration → reassurance while recoverable, C5 consultation/authority choices, concession for hard recovery;
- partner withdrawal → C5 concession can restore access at severe cost, while honouring consultation remains a legal choice to preserve integrity without recovery;
- missed Lattice → C4 commander-only liaison fallback;
- information weakness → remaining focused/Lattice/liaison options when temporally useful.

A recovery option must actually change the threatened downstream state and must not be free.

## Ravellan observations

Do not infer/employ them in this file. Exact coalition→Ravellan signals, same-cycle coalescing and reserve-deployment counting are exclusively [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

## Replay / authority

Every persisted state mutation must be replay-verifiable or purely derived under [[30-ARCHITECTURE-CONTRACT]].

New persisted partner-authority / consequence state requires the next prototype format version from the actual committed predecessor. No silent reinterpretation/migration. V1 remains isolated.

## Required #101 tests

At minimum:

- exact opening record states;
- every order transition above;
- provenance correctness;
- C2 coordinated surge avoids partner penalty; uncoordinated surge does not;
- C2 accusation worsens partner without promise and additionally breaches active promise;
- reroute creates civilian/political cost but no reserve penalty; its intelligence result lives in HQ evidence;
- C4 quiet preparation costs reserve;
- liaison cannot delegate and creates obligation;
- C5 partner authority/tempo state and package-level political effect;
- C5 signed reserve/exposure effects invariant to issue order;
- withdrawn + honour legal without forced concession; concession restores access at severe cost;
- C5 use attribution consumes opportunity permanently; hold preserves it;
- attribution derives only from HQ evidence;
- every promised recovery path changes the threatened state at real cost;
- trusted replay/tamper rejection covers every persisted record;
- V1 unchanged.

## Rejection conditions

Reject #101 if it introduces universal meters/trust score, implicit promises, generic lifecycle plugin framework, sequential C5 clamping, per-order double political penalties, free recovery, hidden-truth attribution, liaison through Delegate, regenerating one-shot attribution after use or V1 state changes.