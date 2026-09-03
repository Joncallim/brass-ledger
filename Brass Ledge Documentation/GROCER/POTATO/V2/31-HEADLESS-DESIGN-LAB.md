---
type: v2-headless-design-lab-contract
status: active
---

# Headless Design Laboratory

Backlink: [[README]]

This document is the implementation authority for **#107 — V2 headless strategy/balance laboratory**. It defines machine diagnostics that can falsify broken structure before human play. It must never claim that the game is fun.

## Product purpose

The laboratory answers questions such as:

- Is one strategy obviously dominant?
- Do important choices actually change anything?
- Is information worth acquiring?
- Can an early mistake still be recovered from?
- Does every viable run end with the same final answer?
- Does hidden starting state create unavoidable punishment?

It does **not** answer:

- Was this exciting?
- Did the player feel ownership?
- Did the player want another run?

Those remain human-only evidence under [[40-EVALUATION-CONTRACT]].

## Deterministic policy cohort

Retain the canonical test policies:

- `delegate-all`;
- `intervene-all-where-legal`;
- `recovery-first`;
- `deterrence-first`;
- `intelligence-first`;
- `random-valid` using persisted deterministic seed input;
- `oracle` — test-only, may see hidden truth and is never used in staff/player execution.

Policies must operate only through legal public/headless command APIs except the oracle's explicit diagnostic truth access.

No ML agent or LLM policy is required.

## Outcome dimensions

Compare terminal runs only through the existing non-scalar Pareto dimensions:

- Beacon security;
- partner consent/access;
- reserve readiness;
- commitment integrity.

Earned intelligence is diagnostic-only, not a success axis.

Do not collapse these into one weighted score.

## Viability gate

A Kestrel authored seed/history set is structurally viable only if all are true:

1. no seed forces a hard loss before Cycle 6 without a meaningful earlier legal countermeasure/recovery;
2. materially different non-oracle policies can reach Cycle 6;
3. at least two terminal outcome profiles are non-dominated across the viable authored seed set;
4. a costly recovery route remains available through Cycle 5 as promised by the canonical contracts;
5. oracle advantage does not demonstrate that a non-oracle player was required to know hidden truth to avoid unavoidable defeat.

The oracle may reveal unfair information dependence; it does not define the correct strategy.

## Diagnostic 1 — policy dominance

For the same viable seed set, policy A dominates policy B only when A is at least as good as B on every terminal Pareto axis and strictly better on at least one, using the same authored comparison semantics.

Flag especially:

- `delegate-all` dominating every other non-oracle policy;
- `intervene-all-where-legal` dominating every other non-oracle policy;
- one of recovery/deterrence/intelligence-first dominating the others across every viable seed.

A flagged dominance is a design warning requiring review; it is not automatically fixed by randomisation.

## Diagnostic 2 — Decision Elasticity

For every authored major decision point, branch from the **same verified pre-decision state** and execute each legal alternative while holding all earlier history and deterministic inputs constant.

A choice has **mechanical elasticity** if at least one alternative changes one or more of the following within the remaining slice:

- persistent Kestrel record state;
- later HQ evidence/assessment;
- later agenda membership;
- later staff recommendation/dissent;
- legal action/capability/terminal-route availability;
- Ravellan authorised observation/policy path;
- terminal classification or terminal Pareto profile.

If alternatives differ only in prose while all of these remain equal, flag the decision as **inelastic / potentially fake choice**.

Do not require every small delegated choice to affect the terminal outcome. The requirement is that consequential authored differences alter some later strategic state/opportunity.

Report:

- decision ID/cycle;
- compared alternatives;
- first downstream state divergence;
- whether branches reconverge later;
- terminal effect if any.

## Diagnostic 3 — intervention/delegation value

Across viable seeds, record per cycle:

- intervention opportunities available;
- interventions actually used by each test policy;
- whether the intervention changes a later strategic state under Decision Elasticity;
- whether delegating produced a real cost/trade-off.

Flag if:

- spending both interventions is weakly better in every comparable state;
- never intervening is weakly better in every comparable state;
- a large fraction of intervention alternatives are mechanically inelastic.

Do not invent a fixed numeric fun threshold. Report exact counts/branches for human design review.

## Diagnostic 4 — strategy separation

The authored strategic families should produce recognisably different state trajectories:

- intelligence-first;
- coalition/diplomacy-preserving behavior where represented by the policy cohort/content;
- deterrence/reserve-backed behavior;
- recovery-first.

Flag two strategy policies as **insufficiently separated** when, across all viable seeds, they produce the same:

- Lattice/liaison reachability;
- material persistent-record trajectories;
- terminal route availability set;
- terminal Pareto profile/classification.

A strategy need not win differently on every seed, but at least one viable seed should expose a meaningful mechanical distinction.

## Diagnostic 5 — information value

Compare otherwise equivalent branches with and without legitimately acquired evidence where possible.

Information is mechanically relevant when it changes at least one of:

- HQ assessment;
- staff recommendation/dissent;
- availability of attribution/Hold And Expose;
- a later reasonable/legal command path;
- terminal profile through a belief-dependent decision.

Flag if:

- Lattice/collection evidence never changes a later actionable state;
- liaison and Lattice always produce identical action-space/value;
- oracle information is required to avoid defeat while legitimate HQ information cannot affect the necessary decision.

Do not require information always to improve outcomes. Sometimes better information should reveal that an earlier strategy was wrong or make a costly pivot rational.

## Diagnostic 6 — capability relevance

Lattice passes the capability relevance check only if, on at least one viable branch, maturity changes the legal information/action space and creates a later mechanically elastic decision unavailable without it.

It must not pass merely because terminal metrics improve after adding an invisible bonus.

Also confirm at least one viable non-Lattice branch reaches a non-defeat terminal outcome through the liaison/other authored route. Otherwise Lattice is mandatory rather than a build choice.

## Diagnostic 7 — recovery reachability

From every reachable non-terminal state at the end of Cycles 1–5, evaluate whether deteriorating promised dimensions retain the authored recovery/counterplay routes.

At minimum inspect:

- reserve strain/brittleness → emergency consolidation where still pre-terminal;
- partner deterioration → reassurance/concession while reachable;
- Beacon exposure → reinforcement/preparation where reachable;
- missed Lattice → liaison counterplay where authored.

Flag:

- any state that becomes a forced loss before Cycle 6 without an earlier explicit avoidable decision chain;
- recovery actions that exist in UI/legality but cannot change the threatened downstream outcome/state;
- recovery that is costless and therefore trivially dominant.

## Diagnostic 8 — route sameness

For each viable history entering Cycle 6, record:

- legal final courses;
- each legal course's terminal classification/profile;
- whether one course dominates all others in that history.

It is acceptable for one course to be best in a particular history.

Flag if the **same final course** is at least as good as all others across every viable history/seed, or if all viable histories expose the same legal final-route set and same relative ordering.

This directly enforces the no-universal-final-answer contract.

## Diagnostic 9 — intent relevance

For equivalent opening seed/world conditions, vary one standing-intent field at a time while holding the other three constant and run the deterministic staff/content path.

Each selected field must have at least one authored reachable case in the six-cycle slice where it changes:

- a staff recommendation/reason;
- or a downstream delegated action/consequence.

At least one authored case must place two intent fields in a real trade-off so changing one does not simply add a free benefit.

Flag an intent option that never affects any reachable recommendation/consequence.

## Diagnostic 10 — adversary responsiveness/fairness

Using #99's canonical policy:

- vary an authorised Ravellan observation while holding private coalition state fixed and confirm the policy can change where the matrix says it should;
- vary private coalition/HQ state while holding adversary observations fixed and confirm Ravellan does not change;
- record whether the three opening postures lead to meaningfully different policy/terminal opportunities under at least some player histories;
- flag any seed whose loss is determined by opening hidden posture despite no legitimate clue/counterplay.

Do not rebalance Ravellan dynamically based on these diagnostics.

## Diagnostic 11 — snowball / trivial-success detection

Flag a branch when an early advantage causes all later command windows to lose meaningful trade-offs, for example:

- every later recommendation agrees;
- all interventions are inelastic;
- recovery is unnecessary;
- all final routes collapse to the same classification/profile.

This is diagnostic only. Do not inject difficulty or rubber-banding to fix it.

## Diagnostic 12 — choice overload / agenda collision

Report per cycle:

- number of agenda issues;
- number of credible personal-intervention alternatives;
- intervention budget;
- number of mechanically elastic alternatives.

Cycle 3 and Cycle 5 must each contain more than two credible intervention candidates under at least the canonical authored histories promised by [[21-KESTREL-SIX-CYCLE-CANON]].

Flag if the collision exists only because many choices are mechanically inelastic.

## Counterfactual execution integrity

Counterfactual branches are laboratory simulations, not player history.

They must:

- clone from a verified canonical state/revision;
- use normal authoritative sim transitions;
- never write back into the source run;
- remain deterministic;
- distinguish counterfactual diagnostic output from canonical replay evidence.

The normal player debrief must not expose oracle/counterfactual-perfect outcomes from this lab.

## Laboratory report

Produce a deterministic machine-readable report plus concise human-readable summary containing:

- seed/policy matrix;
- terminal Pareto outcomes/classification;
- dominated-policy findings;
- Decision Elasticity findings;
- intent relevance;
- information/capability relevance;
- recovery failures;
- route sameness;
- adversary fairness/responsiveness;
- snowball/triviality warnings;
- agenda collision statistics.

Do not output a “fun score”.

## Required #107 tests

At minimum prove the lab itself detects fixture cases deliberately constructed with:

- always-delegate dominance;
- always-intervene dominance;
- an inelastic fake choice;
- missing recovery path;
- mandatory Lattice;
- information that never changes action space;
- a universal final route;
- irrelevant intent field;
- adversary reading private state;
- doomed hidden-truth seed;
- snowball/trivial late game.

Then run the diagnostics against canonical Kestrel without treating a green diagnostic report as human-fun proof.

## Rejection conditions

Reject #107 if it produces a scalar balance/fun score, trains an agent policy, feeds oracle data into staff/player code, modifies gameplay dynamically to make metrics pass, treats counterfactual branches as canonical history, or claims automated evidence satisfies the human gate.
