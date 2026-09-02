---
type: v2-vertical-slice-contract
status: active
---

# V2 Six-Cycle Vertical Slice

Backlink: [[README]]

## Canonical B2 authority

[[21-KESTREL-SIX-CYCLE-CANON]] is the complete canonical six-cycle design. It
supersedes earlier provisional Kestrel wording in this note where they differ.
It freezes the known/hidden information boundary, named issue owners, legal
courses, Lattice timing, visible Ravellan signals, consequence records, recovery,
terminal predicates, and terminal truth reveal. Agents must not fill gaps with
new mechanics.

## Historical scaffold

The slice is **Kestrel Strait**, a fictional coalition headquarters facing the
Ravellan Maritime Command. Ravellan seeks a limited seizure of the Beacon
Channel relay before coalition reinforcement becomes politically feasible.
Its doctrine is probe, conceal preparation, exploit a visible weak boundary,
and stop short of open war when denied. Its hidden posture is one of
`testing`, `preparing-seizure`, or `feinting`; it can probe shipping, seed a
deception narrative, prepare the seizure, or pause to consolidate. Those are
the only prototype action families.

The player selects one standing intent at cycle 1:

| Field | Options |
| --- | --- |
| Main effort | Beacon security / coalition cohesion / intelligence advantage |
| Protected boundary | civilian shipping / partner consent / reserve readiness |
| Secondary risk | accept slower deterrence / accept political friction / accept thinner reserve |
| Posture | quiet preparation / visible deterrence / diplomatic restraint |

The player has two interventions each cycle. Every agenda item has a staff
recommendation and at most two authored intervention orders; defer appears only
where listed below.

## Frozen cycle scaffold

| Cycle | Situation and required command issue | Required consequence / branch |
| --- | --- | --- |
| 1 Intent | Choose intent; decide whether to protect Beacon watch coverage, secure partner consent, or fund **Lattice Cell**. | Unchosen priority becomes an exposure or promise; Lattice starts only if funded. |
| 2 Reaction | Ravellan probes shipping. Delegate escort posture, intervene with visible patrol, or defer public attribution. | Delegation must cause a meaningful cost: either shipping delay, partner unease, or revealed readiness signal. |
| 3 Doubt | Evidence conflicts on whether the probe masks seizure preparation. Intelligence chief favours verification; operations chief favours deterrent movement. | Same HQ belief must permit different chief recommendations; no hidden posture leak. |
| 4 Payoff | If protected at cycles 1–3, Lattice matures. | Maturity unlocks the distinct **task collection** action: inspect one authored uncertainty and replace its confidence band with a narrower legitimate belief update. It is not a stat bonus. If unfunded, an alternate costly partner liaison path remains. |
| 5 Collision | A partner consent deadline, reserve strain, and Beacon warning collide. | At least one promise/exposure must be accepted or broken; a non-terminal recovery order remains legal. |
| 6 Reckoning | Ravellan attempts, feints, or abandons a Beacon seizure according to posture and observed signals. | Resolution must depend on prior information, preparation/capability, boundary exposure, and commitments. Viable routes include quiet intelligence-led denial, visible coalition deterrence, and costly reserve mobilisation. |

## Persistent families and chief conflicts

- **Exposure:** neglected Beacon coverage, shipping vulnerability, or thin reserve;
  worsens an adversary opportunity but can be reduced by costly mobilisation.
- **Promise:** partner consultation/visibility commitment; honour improves consent,
  breach buys tempo but reduces cooperation.
- **Preparation:** patrol readiness or quiet collection preparation; created by
  actions and decays/changes only under authored rules.
- **Investment:** Lattice Cell; three protected advances unlock task collection.
- **Opportunity:** a time-limited credible attribution or coalition window.

The intelligence chief values credible attribution and Lattice; the operations
chief values visible denial and reserve readiness; the political chief values
partner consent. Cycle 3 must produce an intelligence/operations disagreement;
cycle 5 must produce a political/operations commitment collision.

## Deliberately open, not implementable without decision

The exact semantic scale of “confidence”, the final numerical intervention
budget, campaign length beyond six cycles, and final prose are experimental.
The slice freezes only their bounded prototype behaviour. Any issue needing a
specific threshold or alternate mechanic must raise `BLOCKED: PRODUCT DECISION
REQUIRED` and update [[60-DECISION-LOG]].
