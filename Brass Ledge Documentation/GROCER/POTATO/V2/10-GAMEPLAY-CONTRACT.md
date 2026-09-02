---
type: v2-gameplay-contract
status: active
---

# V2 Gameplay Contract

Backlink: [[README]]

## Authority and cycle

The simulation owns every state transition. Content authors bounded issues,
orders, adversary policies, and consequence rules. A presentation client may
show derived agenda/reasons but may not score, choose, or resolve an order.

For each command cycle, in this order:

1. Advance elapsed world conditions.
2. Advance external state from world truth, then select adversary policy using
   only its persisted observation records, posture, doctrine/objective, and seed.
3. Advance existing consequences according to their own lifecycle.
4. Update HQ belief only from authorised observation/intelligence rules.
5. Build the command agenda from HQ belief, commitments, and actionable effects.
6. Derive staff recommendations from HQ belief, standing intent, chief view,
   commitments, and institutional capability.
7. Player delegates, intervenes, or defers each legal agenda issue.
8. Resolve final orders and their explicit cost/commitment effects.
9. Apply direct order/world-effect consequence transitions, create records, and
   project newly visible signals into adversary observations.
10. Produce causal consequence beats using only legitimately visible facts.
11. Persist state, inputs/actions, derived result, and replay evidence.
12. Advance the cycle.

No recommendation, preview, or visible estimate may read hidden world posture.
Changing hidden truth alone with unchanged HQ belief must leave the
recommendation unchanged.

## Command semantics

Each agenda issue exposes exactly its legal dispositions: **delegate** accepts
the named staff recommendation; **intervene** selects one authored commander
order and consumes one intervention token; **defer** is legal only when the
issue declares it. There is no player-facing global best-option score. Staff
reasons are discrete content/reason references, not hidden numeric utility.

Standing intent has four declared fields: `mainEffort`, `protectedBoundary`,
`acceptableSecondaryRisk`, and `posture`. Intent guides recommendation ties and
explains trade-offs; it never forces a result. The prototype starts with two
intervention tokens per cycle. This is an experiment, not a permanent rule.

A cycle submits one atomic command set with `expectedRevision`; all
dispositions, intervention costs, and task actions validate together or reject
together. The V2 ledger records intent changes, dispositions/orders, and task
actions with canonical pre/post hashes. Missing, reordered, duplicated, or
extra actions invalidate replay. Step 3 ticks only records present at cycle
start; records made in step 9 first tick next cycle.

## Information, consequences, and fairness

World truth may contain adversary posture and external event preparation. HQ
belief is a separate, serialisable state of observations, confidence, and known
commitments. A consequence records provenance (`player-caused`,
`player-conditioned`, `adversary-caused`, or `external`) and visibility. An
external shock may occur without player causation; preparation can change its
severity.

The adversary selects only from authored action families to pursue its stated
objective. It reads only `AdversaryObservation`, not arbitrary world truth:
observations are authored public signals/commitments projected in step 9 and
usable next cycle unless content declares a longer delay. It never reads player
score, win probability, private order, or future input. No rubber-banding is
legal.

Truth provenance is separate from `visibleAttribution`. Until an authored reveal
permits it, player-facing causality is known, suspected, contested, or unknown
from HQ belief. A terminal debrief may show “what HQ knew then” and “what
occurred”; live DTOs must not expose truth provenance.

## Recovery and end state

Before cycle six, every non-terminal deteriorating state must retain at least
one costly legal recovery path. The final crisis evaluates campaign history:
prepared capability, intelligence quality, exposed boundary, commitments, and
adversary posture. No single final choice may win every viable history.

Every non-terminal consequence beat must include an observed change, a
belief-safe known/suspected/contested cause, the persistent record that changed,
one unresolved future pressure or expiry, and one future influence point. It
must not forecast hidden truth.
