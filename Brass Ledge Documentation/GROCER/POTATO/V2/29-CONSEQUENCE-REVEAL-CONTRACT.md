---
type: v2-consequence-reveal-contract
status: active
---

# Consequence Reveal Contract

Backlink: [[README]]

This document is the implementation authority for **#106 — V2 Consequence Reveal UI**. It defines how authoritative results are explained without leaking hidden truth or turning the screen into an accounting report.

## Product purpose

The reveal must make the player think:

> “That changed because of what I did, what Ravellan did, or what I deliberately left exposed — and now I want to know what happens next.”

It is not a victory screen after every cycle. It is the causal bridge between one command and the next pressure.

## Beat structure

Every material non-terminal consequence beat answers five questions in this order.

### 1. What happened?

One observable change.

Example:

> Ravellan patrols pulled farther from the commercial lane.

### 2. What do we currently know about why?

Belief-safe causal explanation only.

Example:

> Operations believes the visible patrol surge contributed. Intelligence cannot tell whether Ravellan is actually backing down.

### 3. What from the past matters now?

Name the persistent record/commitment/history that changed or matured.

Example:

> The reserve has now been used heavily in two consecutive command windows.

### 4. What remains unresolved?

Expose one important uncertainty, deadline, exposure or commitment that continues into the next cycle.

Example:

> The staging-area activity remains unexplained.

### 5. What can the commander influence next?

Name a belief-safe future influence point where one is already known/legal.

Example:

> Recovering the reserve would protect endurance, but reduce the force immediately available at Beacon.

Do not promise that a specific future event will occur.

## Beat count and prioritisation

Default reveal should contain **1–5 material beats**.

If more than five authoritative changes occurred, prioritise:

1. direct consequence of a personal intervention;
2. matured prior consequence/commitment;
3. adversary/external change that materially alters the next agenda;
4. capability payoff;
5. secondary accounting changes.

Lower-priority detail may be available through disclosure/history, but the required path must not become a ledger dump.

Do not invent a numeric importance score; use an authored semantic priority/category.

## Causality language

Truth provenance from [[25-KESTREL-CONSEQUENCE-MATRIX]] is authoritative, but player wording depends on visible attribution.

### Player-caused and known

Use direct language when the causal chain is legitimately known:

> Your visible patrol surge strained the reserve.

### Player-conditioned

Distinguish event cause from severity:

> Ravellan increased the pressure. Because the reserve was already strained, Operations has fewer credible response options.

Do not say “you caused Ravellan to escalate” unless the HQ can legitimately know that causal relation.

### Adversary/external cause known

> Ravellan's shipping probe disrupted commercial traffic.

or:

> A partner deadline now requires an answer before further visible escalation.

### Cause suspected/contested/unknown

Use explicit uncertainty:

> Intelligence suspects the lull may be deliberate, but cannot establish why Ravellan reduced visible patrols.

Do not replace uncertainty with narrator omniscience.

## Persistence callback

Every beat that changes a persistent Kestrel record must identify it in player language.

Examples:

- **Reserve:** now strained.
- **Consultation promise:** still active; the next public escalation may test it.
- **Lattice Cell:** second protected advance complete.

Do not expose raw enum names by default.

The display may use short plain-language state phrases, but must not convert these records into generic progress bars unless the contract specifically calls for count/progress presentation (Lattice advancement may show 2 of 3 because the investment count itself is authoritative and meaningful).

## No hidden causal forecast

The reveal may say:

- what changed;
- what HQ thinks caused it;
- what known state now constrains the commander;
- what known deadline/uncertainty remains.

It may not say:

- “Ravellan will attack next cycle” unless that is a legitimately observed scheduled fact;
- hidden posture/preparation;
- win probability;
- exact future event branches;
- oracle counterfactual;
- “you made the right/wrong choice.”

## Personal intervention callback

When a personal intervention had a material immediate or matured consequence, the reveal should make the connection easy to see.

Example:

> **You moved the reserve forward.**
>
> Beacon response time improved, but the reserve is now strained.

Delegated actions should also be attributed to the headquarters rather than disappearing:

> **Operations kept the escort quiet under your standing direction.**
>
> Shipping continued with delay, while the reserve remained out of the visible confrontation.

This reinforces ownership of delegation without pretending the player clicked the exact staff order.

## Commitment callback

Promises/obligations must be explicit when tested.

Example:

> **The partner accepted your consultation promise.**
>
> That support remains available, but a unilateral public accusation would now break an explicit commitment.

If later breached:

> **You acted before consultation.**
>
> The promise is now breached. The partner government has moved to a conditional position.

Do not bury commitment status in secondary detail.

## Capability payoff

When Lattice matures, the reveal should emphasise the new action rather than a reward statistic.

Example:

> **Lattice Cell is operational.**
>
> You can now task one unresolved intelligence question without spending normal personal attention.

This is a major Cycle-4 payoff beat and should outrank routine accounting changes.

## Transition to next command

After the reveal, use one primary progression action.

Preferred labels are contextual and anticipation-oriented where authored safely, e.g.:

- `Advance to the partner deadline`
- `Advance while collection runs`
- `See how the lull develops`
- `Advance to the final confrontation`

If no safe authored contextual label exists, use **Advance**.

Avoid `Next Turn` as the default V2 label because the player is advancing the situation, not completing paperwork.

The label must not leak hidden future events.

## Terminal consequence/debrief

Cycle 6 is different.

First show the actual coalition outcome from [[27-KESTREL-TERMINAL-MATRIX]]:

- Strategic Success;
- Costly Success;
- Political Defeat;
- Operational Defeat.

Then show two distinct debrief layers:

### What HQ believed

Reconstruct major assessment/evidence available at decisive windows.

### What was actually happening

Only now reveal hidden Ravellan opening posture, transitions, preparation and policy reasoning.

The debrief should explain causal history, not present a “correct answer”.

Where useful, show a small number of explicit counterfactual questions for replay motivation, such as:

> What if the reserve had been recovered in Cycle 4?

but do **not** compute or reveal oracle-perfect alternative outcomes in the normal debrief. The headless laboratory owns counterfactual diagnostics, not the player UI.

## Presentation ordering

Default layout:

1. outcome/change headline;
2. material beats;
3. current unresolved pressure/uncertainty;
4. progression action.

Do not require opening a full campaign report before advancing.

## Accessibility

- semantic headings for each consequence beat;
- cause/uncertainty distinctions are in text, not colour alone;
- dynamic result announcement does not steal focus unexpectedly;
- progression button follows the last material beat in logical keyboard order;
- disclosure controls preserve focus when closed;
- terminal outcome is announced with text, not iconography alone.

## Required #106 tests

At minimum prove:

- external/adversary cause and player-conditioned severity render as distinct concepts;
- player-caused beat can cite the actual authoritative intervention/order history;
- delegated consequence can cite the HQ action/standing direction without claiming a personal intervention;
- hidden provenance/posture/preparation never appears in non-terminal projection;
- uncertain cause remains explicitly uncertain;
- promise creation/breach and Lattice maturity receive required callbacks;
- material-beat prioritisation caps the default reveal at five without losing authoritative detail from history;
- progression label cannot reference hidden future state;
- terminal debrief separates “what HQ believed” from hidden truth;
- V1 After Action remains semantically unchanged.

## Rejection conditions

Reject #106 if it becomes an accounting dashboard, hides important promise/breach history, attributes external events directly to the player without evidence, reveals hidden truth early, declares a choice correct/incorrect, adds cinematic scope, or skips consequences and jumps straight into the next command screen.
