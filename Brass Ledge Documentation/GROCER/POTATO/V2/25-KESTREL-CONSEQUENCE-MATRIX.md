---
type: v2-kestrel-consequence-contract
status: active
---

# Kestrel Consequence Matrix

Backlink: [[README]]

This is the implementation authority for **#101 — concrete Kestrel persistent state, provenance, order consequences and recovery**. It is intentionally not a generic consequence engine.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns the pure-derived current intelligence/public-case basis. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-command-set interactions, C5 partner authority/tempo and terminal route effects. [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] owns Ravellan-observation emission.

# Product rule

Persistent state exists so the player can understand:

> something changed because of my order / headquarters direction / Ravellan / the external situation, and now I have a different problem.

Do not collapse these records into a universal success/trust/readiness score.

# Provenance

Every material transition records one of:

- `player-caused`;
- `player-conditioned`;
- `adversary-caused`;
- `external`.

Truth provenance is replayable. Player-facing causal text remains belief-safe until terminal debrief.

# Concrete records

## `beacon-exposure`

`contained → thin → open`

Opening `thin`.

- contained — quick opportunistic move materially harder;
- thin — defensible with warning/preparation but exploitable;
- open — serious exploitable gap.

Improve/worsen one step when authored; clamp endpoints.

## `beacon-preparation`

`routine | prepared`

Opening `routine`.

Separate from exposure: vulnerability now versus whether HQ has done the work required for credible denial.

## `reserve-condition`

`usable → strained → brittle`

Opening `usable`.

Worsen/recover one step; clamp endpoints. Brittle is not automatic defeat.

## `partner-consent`

`cooperative → uneasy → conditional → withdrawn`

Opening `cooperative`.

Ordinary worsen/improve is one step unless explicit recovery sets a state/floor. Withdrawal is serious but not irreversible: C5 political concession can restore access to `conditional` at severe cost.

## `consultation-promise`

`none | active | honoured | breached`

Opening `none`.

Only C1 formal consultation creates `active`. No implicit promise. `honoured`/`breached` are terminal for Kestrel.

## `partner-authority`

`pending | none | joint | unilateral | concession`

Opening `pending`.

Resolved by the C5 partner-authority issue under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]. This records permission/coordination, not relationship sentiment.

## `political-concession`

`none | active`

Opening `none`.

C5 costly recovery. It may restore immediate access/authority but remains a severe terminal cost.

## `liaison-obligation`

`none | active | fulfilled | breached`

Opening `none`. Created only by commander-only C4 partner-liaison fallback.

## `lattice-investment`

`0 | 1 | 2 | 3-operational`

Opening `0` plus deterministic missed-schedule evidence/flag sufficient to prove maturity unreachable after a missed required C1/C2/C3 advance. No catch-up.

## `attribution-opportunity`

Use a direction-preserving discriminated record equivalent to:

```ts
{ state: "none" }
| { state: "tentative"; direction: "preparation" | "coercion" | null }
| { state: "credible"; direction: "preparation" | "coercion" }
| { state: "used"; direction: "preparation" | "coercion" }
| { state: "expired"; direction: "preparation" | "coercion" | null }
```

Opening `{ state: "none" }`.

The direction is the player-legitimate public claim:

- preparation — HQ can substantiate a real seizure-preparation sequence / physical preparation case;
- coercion — HQ can substantiate a coercive/deceptive pressure operation case.

A scalar generic `credible` with no direction is invalid.

Hidden world truth cannot advance or choose the claim. `used.direction` freezes what the commander actually exposed publicly. Later evidence never changes it or regenerates a spent opportunity.

# #100 → #101 pre-command synchronization

At each authorised command point:

```text
current-cycle Ravellan/system history exists
→ all evidence due now is available
→ #100 derives current public-case basis + direction
→ synchronize the unspent #101 opportunity
→ build agenda/recommendation/attribution or terminal-route legality
```

Before `used|expired`:

- #100 none/null → `{ state: "none" }`;
- #100 tentative + direction/null → `{ state: "tentative", direction }`;
- #100 credible-source-sensitive + required direction → `{ state: "credible", direction }`.

An unspent case may downgrade or change direction when legitimate evidence changes. `used|expired` are absorbing.

A C4 Lattice task result arriving C5 may affect C5 attribution. A C5 task result arriving C6 may affect C6 Hold And Expose before route legality.

Exact persisted transition/ledger placement is #101 architecture work under [[30-ARCHITECTURE-CONTRACT]]. Do not widen `ravellan-decision` to store this unrelated state.

# Helper semantics

For ordinal records, improve/worsen one moves exactly one step and clamps.

C5 is special: simultaneous Beacon/reserve signed steps are composed from the complete final-order set, summed, then clamped once under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]. Never sequentially clamp issue effects.

Repeated causal effects remain separate history even if net/clamped state does not move.

# Cycle 1

## `reinforce-watch`

Player-caused:

- Beacon exposure improve one (`thin → contained` opening);
- reserve worsen one.

Ravellan signals come from 37A.

## `ordinary-watch`

No persistent improvement. Opening exposure remains thin.

## `formal-consultation-agreement`

Player-caused:

- consultation promise `none → active`;
- partner may improve one if below cooperative.

Creates the pre-arranged channel represented by the active promise and used in C2/C5 composition.

## `informal-liaison`

No promise/authority record.

## `protect-lattice-c1`

Lattice `0 → 1`. Missing it marks Kestrel maturity unreachable.

# Cycle 2 shipping

## `quiet-escort`

No persistent reserve/partner penalty by default. Some delay remains; weaker visible deterrence is a course cost, not a persistent meter.

## `visible-patrol-surge`

Player-caused:

- reserve worsen one;
- if complete C2 package is not coordinated, partner worsen one;
- if active formal channel + joint warning coordinates it, do not worsen partner.

## `reroute-and-monitor`

Player-caused:

- partner worsen one when disruption is not already jointly coordinated/accepted;
- reserve unchanged.

Visible beat: larger civilian shipping disruption. Information payoff is bounded #100 evidence, not an intel stat.

# Cycle 2 public posture

## `remain-silent`

No persistent transition.

## `joint-non-attributive-warning`

Player-caused: improve partner one step if uneasy/conditional; cannot restore withdrawn by itself.

## `public-accusation`

Always unilateral.

Player-caused:

- partner worsen one regardless of formal promise;
- if consultation promise active: active → breached.

It does **not** manufacture a credible attribution opportunity merely because the commander publicly accused Ravellan.

# Cycle 2 Lattice

Protect on schedule only after C1 protection: `1 → 2`; otherwise maturity unreachable.

# Cycle 3

## `forward-reserve-preparation`

Player-caused:

- Beacon preparation routine → prepared;
- reserve worsen one.

## `hold-reserve`

No persistent movement.

## `focus-staging-collection`

Player-caused:

- Beacon exposure worsen one;
- queues the C4 focused-staging evidence occurrence under #100.

## `maintain-current-coverage`

No focused evidence; no collection-diversion exposure worsening.

## `reassure-partner`

Player-caused:

- improve partner one if uneasy/conditional;
- cannot restore withdrawn;
- cannot erase breached promise.

## `protect-lattice-c3`

If advances 1–2 succeeded: `2 → 3-operational`; otherwise maturity unreachable.

# Cycle 4

## `recover-reserve`

Player-caused:

- reserve improve one;
- Beacon exposure worsen one.

Canonical costly recovery: endurance is bought with immediate security.

## `prepare-beacon-quietly`

Player-caused:

- Beacon preparation → prepared;
- Beacon exposure improve one;
- reserve worsen one.

Targeted detectability/discovery owned by 37A.

## `press-visible-advantage`

Player-caused:

- reserve worsen one;
- partner worsen one if uncoordinated under known public/commitment state.

## Lattice Task Collection

No generic persistent bonus. Queue target result under [[26-LATTICE-COLLECTION-MATRIX]].

## `request-partner-liaison`

Commander-only intervention:

- liaison obligation none → active;
- queues narrower C5 evidence.

Never Delegate.

# Cycle 5 — atomic composition

Resolve complete final-order package under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

## Beacon posture signed effects

### `quiet-reinforce-beacon`

- exposure +1 improvement;
- Beacon preparation → prepared;
- reserve -1 when material reserve commitment required.

### `visible-reinforce-beacon`

- exposure +1;
- Beacon preparation → prepared;
- reserve -1.

Partner effect comes from authority package, not an independent decrement.

### `hold-beacon-posture`

No direct state movement.

## Reserve signed effects

### `keep-reserve-forward`

- reserve -1;
- Beacon preparation → prepared if needed.

### `emergency-consolidation`

- reserve +1;
- Beacon exposure -1.

## Aggregation

For Beacon exposure/reserve:

- sum all signed C5 deltas from complete final-order set;
- clamp once from pre-command state;
- preserve individual causal records.

Issue-array order never changes result.

# Cycle 5 partner authority

## `honour-consultation`

Always player-legal.

Non-withdrawn partner:

- partner authority → joint for C6;
- active promise → honoured;
- active liaison obligation → fulfilled;
- improve partner one.

Withdrawn partner:

- partner authority → none;
- honour/fulfil active commitment where applicable;
- partner remains withdrawn.

Same-cycle sensitive-action compatibility depends on active rapid formal channel under 39.

## `political-concession`

Where legal:

- partner authority → concession;
- political concession none → active;
- withdrawn partner → conditional;
- honour active unbreached consultation promise;
- fulfil active liaison obligation where applicable.

Severe terminal cost remains.

## `act-then-inform`

Only valid with at least one same-cycle partner-sensitive action.

- authority → unilateral;
- active promise → breached;
- active liaison obligation → breached;
- partner worsens exactly one step total for unilateral package.

Partner-sensitive actions are exactly visible Beacon reinforcement and C5 attribution use.

# Cycle 5 attribution

## `hold-attribution`

No immediate persistent transition. Preserve `{ state: "credible", direction }`.

## `use-attribution`

Legal only when opportunity is `{ state: "credible", direction }` and authority package is compatible.

Persist `{ state: "credible", direction } → { state: "used", direction }`.

Direction cannot change during use.

Common effects for both directions:

- protected source exposed/compromised as severe cost;
- improve partner one step if partner not withdrawn and use is coordinated/politically usable;
- if unilateral, package-level authority rule owns the one deterioration;
- authored discovery effect under 37A.

Player-facing copy and causal record must say which claim was exposed. Do not describe a coercion case as proof of seizure preparation or vice versa.

# C6 handoff — preserve direction without substituting it for route adequacy

[[27-KESTREL-TERMINAL-MATRIX]] receives the full directional attribution record.

Both preparation and coercion cases may be considered by Hold And Expose under #27. The claim direction determines:

- the safe claim/cause copy;
- the historical/debrief meaning;
- any direction-specific dominance result established by #107.

The claim direction does **not** itself provide physical preparedness or warning and is not a shortcut for route adequacy. #27 independently requires the known Beacon/partner predicates.

If #107 proves a direction-specific Hold is player-safe dominated in a concrete state, #27/content should prune that state explicitly; do not assume all coercion cases are categorically invalid merely because a later seizure occurred.

# Liaison obligation

C4 liaison creates active.

It becomes:

- fulfilled through authored consultation/concession satisfying obligation;
- breached through explicitly incompatible unilateral package;
- if still active at terminal, outstanding commitment cost rather than automatic breach.

# Severe-cost history

Before terminal-route effects, severe-cost history includes at minimum:

- consultation promise breached;
- political concession active;
- liaison obligation breached;
- other explicit authored commitment failure.

Reserve brittleness is evaluated on post-terminal-route state under 27. Terminal-specific severe flags (`late-reaction`, `emergency-surge`, overreaction, source exposure) are owned by 27/39. No numeric cost score.

# Recovery invariant

Before C6, promised costly counterplay includes:

- reserve deterioration → C4 recovery / C5 emergency consolidation;
- Beacon weakness → C3/C4/C5 preparation/reinforcement;
- partner deterioration → reassurance, C5 consultation/authority, concession;
- withdrawal → concession can restore access at severe cost while Honour remains integrity-only option;
- missed Lattice → C4 commander-only liaison fallback;
- information weakness → remaining focused/Lattice/liaison options when temporally useful.

A recovery option must actually change threatened downstream state and must not be free.

# Ravellan observations

Do not infer them here. Exact coalition→Ravellan signals are exclusively [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

Both preparation-case and coercion-case public use may emit the same authored `ravellan_discovery_signal = suspected` because public use reveals/compromises protected collection; that signal does not mean both public claims said the same thing.

# Replay / authority

Every persisted mutation must be replay-verifiable under [[30-ARCHITECTURE-CONTRACT]].

New persisted consequence/authority/attribution state follows the next prototype-format rule from the actual committed predecessor. No silent migration/reinterpretation. V1 remains isolated.

# Required #101 tests

At minimum:

- exact opening records;
- every order transition above;
- provenance correctness;
- C2 coordinated vs uncoordinated surge;
- C2 accusation partner/promise effects;
- reroute cost + derived information separation;
- C4 quiet prep reserve cost;
- liaison commander-only + obligation;
- C5 authority/tempo/package effects order-independent;
- withdrawn+Honour legal; concession costly recovery;
- #100 basis state/direction synchronizes exactly before agenda legality;
- generic directionless credible opportunity rejected;
- credible preparation and credible coercion cases persist distinctly;
- C5 Hold preserves direction;
- C5 Use freezes `used.direction` and never regenerates;
- player-safe public copy identifies used claim direction;
- #27 receives both directions without treating direction as physical adequacy;
- direction-specific terminal pruning occurs only when #27/#107 proves the complete player-safe route relation;
- every promised recovery changes threatened state at real cost;
- trusted replay/tamper rejection covers every persisted record including direction;
- V1 unchanged.

# Rejection conditions

Reject #101 if it introduces universal meters/trust scores, implicit promises, generic lifecycle plugin framework, sequential C5 clamping, per-order double political penalties, free recovery, hidden-truth attribution, a directionless generic credible case, loses/rewrites claim direction, treats claim direction as physical warning/preparedness, liaison through Delegate, opportunity regeneration after use or V1 state changes.
