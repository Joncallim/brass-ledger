---
type: v2-gameplay-contract
status: active
---

# V2 Gameplay Contract

Backlink: [[README]]

## Authority

The deterministic simulation owns every state transition.

Content authors bounded Kestrel issues/orders/evidence/world manifestations/signals/consequence rules. Presentation shows strict player-safe derivations and submits only player authority; it never scores, chooses or resolves game rules locally.

## Canonical command-cycle semantics

For each cycle, conceptually:

1. advance elapsed/external world conditions;
2. resolve the authorised Ravellan decision from only its own persisted state + typed active adversary observations;
3. advance existing persistent consequences according to authored lifecycle;
4. produce/update HQ evidence from only authorised observations/queued collection results;
5. deterministically reduce HQ assessment;
6. build the agenda from belief/public commitments/capability/current pressure;
7. derive belief-safe responsible-officer recommendations/dissent from standing direction and known state;
8. player leaves issues delegated or intervenes/defers/selects an authored task/terminal course;
9. validate the **complete atomic player command set**, including cross-issue requirements;
10. resolve final orders and direct consequence/capability/commitment effects from the complete set;
11. project the resulting public/detectable coalition behavior into the exact Ravellan observation set for next-cycle use;
12. produce belief-safe consequence beats;
13. persist/replay every authoritative mutation/evidence transition under the V2 ledger/version contract;
14. advance to the next cycle / terminal debrief as appropriate.

The conceptual gameplay order does not require one ledger entry per numbered sentence. [[30-ARCHITECTURE-CONTRACT]] owns the engineering rule: every persisted authoritative mutation must be either an explicit replay-verifiable transition or a pure derivation, never unlogged state drift.

#99 owns the first-class `ravellan-decision` transition and its final committed ordering. #100 onward must integrate against that actual committed replay path rather than guessing an insertion point while #99 is open.

## Information boundary

World truth, Ravellan state/observations, HQ belief and presentation are distinct.

- Ravellan policy reads only cycle + its own posture/preparation + active authored `AdversaryObservation` records.
- HQ collection/assessment reads only the world/action facts each observation rule is specifically authorised to inspect.
- Recommendation reads HQ belief + standing intent + known commitments/capability/public issue state.
- Normal player DTO reads only HQ belief/public known state/current observable crisis.

Changing hidden truth alone with all legitimate observable inputs fixed must not change staff/player output.

Directed collection is stricter: hidden Ravellan posture alone cannot change a sensor result when its authorised physical/action-history inputs are unchanged.

## Standing direction / recommendation

Opening questions remain:

- what matters most;
- what staff must not spend without asking;
- which temporary cost is tolerable;
- how HQ normally behaves.

Recommendation precedence:

1. player-legal / recommendation-applicable set;
2. protected boundary;
3. main priority;
4. default style;
5. tolerated cost;
6. known commitment;
7. authored responsible-chief tie.

Chief worldview creates professional tie/concern/dissent but does not pre-filter the commander's direction.

There is no hidden score.

## Command semantics

For each ordinary agenda issue:

- **Delegate** executes the responsible officer's authoritative recommendation;
- **Intervene** selects a different legal authored course and consumes personal intervention where normal;
- **Defer** exists only where explicitly authored.

The Command Room may default issues locally to Delegate so the player interacts primarily with exceptions, but the submitted command set remains explicit.

The all-Delegate staff package must itself always be a legal complete command set.

Kestrel's partner-liaison fallback is the one explicit commander-only `requiresIntervention` course; it cannot be delegated.

## Atomic cross-issue composition

One cycle command is one atomic player-authority mutation.

Where issues interact, e.g. C2 coordination or C5 partner authority/visible action/recovery:

- validate the complete set;
- derive cross-issue semantics from the complete set;
- do not let issue/array order alter state;
- do not silently repair another player choice.

Exact Kestrel composition is [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

## Intelligence

One Kestrel claim: `ravellan-intent`.

Internal authored evidence reduces deterministically to natural-language judgement; no player percentage/confidence bar/High-Medium-Low label.

Named collection changes specific evidence, not a generic intelligence score.

C2 reroute monitoring, C3 focused collection, Lattice targets and liaison all use posture-blind target rules in [[23-HQ-BELIEF-AND-EVIDENCE]] / [[26-LATTICE-COLLECTION-MATRIX]].

## Adversary fairness

Ravellan pursues its own authored objective from hidden state and the closed public observation vocabulary.

Exact coalition→Ravellan signal emissions are [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

No player score, win probability, private order, HQ belief, oracle data, future input or rubber-banding.

A player-caused weak/strong signal chain can change Ravellan behavior, but missing signals are never inferred as their opposite.

## Persistent consequence / recovery

Kestrel uses concrete records for Beacon exposure/preparation, reserve, partner consent/authority, promises/obligations, Lattice and attribution opportunity.

Before C6, serious deterioration retains the authored costly counterplay promised by the slice. Recovery is never free and may worsen another dimension.

## Attribution

Credible attribution is one source-sensitive opportunity in Kestrel.

- C5 public use spends it (`credible → used`), exposes/compromises the protected source as a known severe cost and removes C6 Hold And Expose;
- preserving it keeps the final political route available.

Generic credible coercion attribution is not seizure warning; `usableWarning` is preparation-direction HQ belief only.

## Terminal crisis

The player sees only the safe overt crisis family:

- seizure underway;
- threshold confrontation;
- pressure receding.

Final route legality/effects are [[27-KESTREL-TERMINAL-MATRIX]]. Routes known to be player-safe dominated in the current terminal state are not shown as fake alternatives.

Final routes mutate authoritative post-route reserve/partner/attribution/source-cost state before Pareto/classification.

Terminal debrief then separates:

- what HQ believed at the time;
- what actually happened in hidden Ravellan history.

No numeric hidden weights exist to reveal.

## Replay / compatibility

V2 replay reconstructs from canonical initial state + the complete ordered authoritative ledger/system transitions and verifies pre/post state, revision, hashes/digests and deterministic recomputation.

The ledger is not limited to player actions: #99's Ravellan decision and any later persisted system transition are first-class authoritative evidence where required.

Missing, duplicated, forged, reordered or unlogged authoritative transitions invalidate replay.

Persisted-format changes increment the prototype version under [[30-ARCHITECTURE-CONTRACT]]; no silent reinterpretation/migration.

V1 save/replay/client semantics remain isolated.

## Human-fun boundary

Machine tests may prove determinism, information fairness, reachability, recovery, elasticity and absence of obvious dominated traps.

They cannot prove ownership, tension, regret/vindication, comprehension or voluntary continuation/replay.

#107 structural lab + 3-player formative smoke precede the main browser tranche. #110 remains an 8-player human-only decision.