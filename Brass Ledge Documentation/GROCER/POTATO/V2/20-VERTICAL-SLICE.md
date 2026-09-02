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

[[22-RAVELLAN-EXECUTABLE-POLICY]] supplies the complete executable posture,
observation, precedence, preparation, and terminal-behaviour matrix for #99.

## Setting and fixed authority

The slice is **Kestrel Strait**, a fictional coalition headquarters facing the
Ravellan Maritime Command. Ravellan seeks a limited seizure of the Beacon
Channel relay before coalition reinforcement becomes politically feasible.
Its doctrine is probe, conceal preparation, exploit a visible weak boundary,
and stop short of open war when denied. Its hidden posture is one of
`testing`, `genuine_preparation`, or `coercive_feint`; it can probe shipping, seed a
deception narrative, prepare the seizure, or pause to consolidate. Those are
the only prototype action families.

The player selects one standing intent at cycle 1:

| Opening question | Answers |
| --- | --- |
| What matters most right now? | Keep the Beacon secure / Keep our partner with us / Work out what Ravellan is actually doing |
| What do you not want the staff spending without asking you? | Do not disrupt civilian shipping unless we have to / Do not act publicly without our partner / Do not burn through the reserve force |
| If something has to get worse for a while, what can you live with? | We can afford to look less aggressive / We can take some political heat / We can lean harder on the reserves for a while |
| If you do not hear from me, how should headquarters normally behave? | Prepare quietly / Show strength early / Consult our partner first |

The player has two interventions each cycle. Every agenda item has a staff
recommendation and at most two authored intervention orders; defer appears only
where listed below.

## Canonical authored cycle matrix

| Cycle | Situation and required command issue | Required consequence / branch |
| --- | --- | --- |
| 1 Ownership | Set the four standing directions without an intervention. Operations owns Beacon watch: ordinary watch or reinforce watch (lower exposure/better warning; readiness cost/detectable signal). Political owns informal liaison or formal consultation agreement (cooperation plus an explicit promise). Intelligence owns defer/protect Lattice advance one. | Three credible protections and two interventions. The unprotected priority becomes a visible exposure, missing promise, or missing investment; reveal both achievement and exposure. |
| 2 Consequence | All hidden situations can shadow shipping. Operations: quiet escort (less disruption, weak deterrence), visible patrol surge (denial, reserve strain/signal/partner concern), or reroute-monitor (reserve/observation, civilian disruption/passivity). Political: silence, joint non-attributive warning, or public accusation (unilateral accusation breaches a promise). Intelligence requests Lattice advance two. | Delegated shipping is never neutral: it creates shipping delay, partner unease, reserve use, or a visible signal. |
| 3 Doubt | Conflicting evidence: Intelligence seeks verification while Operations warns waiting loses warning. Operations chooses forward reserve preparation or hold; Intelligence may focus collection at another coverage cost; Political reassures partner; Intelligence requests final Lattice protection. | At least three credible intervention candidates, only two tokens. The Intelligence/Operations disagreement comes from the same HQ belief; hidden posture never leaks. Missing advance three prevents Lattice maturity. |
| 4 Payoff | Ravellan's patrol lull is ambiguous. Exploit it by recovering reserve, quietly preparing Beacon, or pressing visible advantage. | Mature Lattice tasks one named unresolved question; authored evidence arrives at cycle 5. Without it, partner liaison is narrower, costs an intervention, and creates an obligation. |
| 5 Pain | Belief-qualified Beacon warning, partner deadline, and reserve strain collide. Beacon: quiet reinforce/visible reinforce/hold. Partner: honour consultation/act then inform/political concession. Reserve: keep forward/emergency consolidation. Attribution exists only with legitimate evidence. | More than two attractive interventions. A promise, exposure, readiness, or political risk remains unresolved. Concession and consolidation remain costly recovery routes. |
| 6 Reckoning | Ravellan selects limited seizure, threshold challenge/major feint, or abort from its hidden situation/history and observable coalition behaviour. Final courses: Quiet Denial, Joint Visible Denial, Emergency Mobilisation, Hold and Expose. | Availability and sensible use depend on preparation, intelligence, partner health, promise, exposure, and reserve. No route is universal. |

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

## Frozen recovery and final-route predicates

Emergency consolidation is legal through cycle 5: it improves reserve endurance
but immediately worsens Beacon security. Political concession is legal through
cycle 5: it buys immediate partner support but limits later coalition freedom.
Liaison creates a consultation obligation. These are costly recovery routes, so
no authored seed may force hard loss before the final crisis.

Quiet Denial is strong with prepared Beacon forces, warning, and a sound threat
read, but weak without warning/preparation. Joint Visible Denial is strong with
healthy consent, honoured consultation, and usable reserve; damaged partnership
may make it weak or unavailable. Emergency Mobilisation is the brute-force
route: it can save Beacon after mistakes, but a brittle reserve makes it costly
or only partially effective. Hold and Expose is strong against feint/coercion or
testing when credible evidence and partner diplomacy exist; it is dangerous
against genuine movement with poor physical preparation. In a coercive feint, an
obvious coalition military collapse may create an opportunistic seizure.

At cycle 5, attribution can strengthen partner unity or deter Ravellan, but can
sacrifice sources and embarrass the coalition if assessment is wrong; Lattice
makes legitimate attribution easier, never guaranteed. At cycle 6, even an
abort leaves a command problem—exploit, expose, or quietly accept de-escalation.
The terminal debrief states HQ's major assessment at each decision, Ravellan's
initial posture and transitions, which signals were genuine/deceptive, and why
its final action followed; it never exposes weights or probabilities.

## Deliberately open, not implementable without decision

The final numerical intervention budget, campaign length beyond six cycles, and
final prose are experimental. Intelligence uses authored evidence internally and
natural-language judgement externally; numeric or player-facing confidence bands
are not an open design option.
The slice freezes only their bounded prototype behaviour. Any issue needing a
specific threshold or alternate mechanic must raise `BLOCKED: PRODUCT DECISION
REQUIRED` and update [[60-DECISION-LOG]].
