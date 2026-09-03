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

It does **not** answer whether the experience is exciting, emotionally satisfying or voluntarily replayable. Those remain human-only evidence under [[40-EVALUATION-CONTRACT]].

## Pareto dimensions and exact ordering

The laboratory never creates one scalar victory score. Terminal outcomes are compared as a four-dimensional ordinal vector.

### Beacon security

`held > lost`

### Partner consent/access

`cooperative > uneasy > conditional > withdrawn`

Use the final authoritative partner state after terminal-route effects/recovery.

### Reserve readiness

`usable > strained > brittle`

### Commitment integrity

Derive a diagnostic-only ordinal from explicit history:

- `intact` — no breached consultation promise or liaison obligation, no active unresolved obligation at terminal, and no political concession used to repair access;
- `compromised` — no explicit breach, but an obligation remains active/outstanding or political concession is active;
- `broken` — consultation promise or liaison obligation is `breached`.

`intact > compromised > broken`

This diagnostic does not replace the concrete records or terminal classification.

A terminal classification such as Strategic/Costly Success is reported alongside the vector but is not converted into a scalar score.

## Cross-seed dominance relation

For the same seed/standing-intent fixture set, policy A dominates policy B only if:

- for **every** compared run/seed, A is at least as good as B on all four dimensions;
- and at least one dimension on at least one run is strictly better;
- and there is no compared run where B is better on any dimension.

Do not average dimensions across seeds or assign weights.

## Deterministic lab actors

Named lab policies are deliberately simple probes. They operate only through the legal player/headless API and are **not** models of optimal human play.

### Standing-intent exhaustive fixtures

For pure behavior diagnostics (`delegate-all`, `intervene-all-where-legal`, `random-valid`), run against all **81** legal opening standing-intent combinations (`3 × 3 × 3 × 3`) unless a focused test deliberately scopes a smaller equivalent fixture set.

Dominance comparisons between these policies use the same seed and same opening intent.

This prevents a hidden choice of “neutral” intent from biasing the result.

### `delegate-all`

- submit `delegate` for every ordinary agenda issue;
- never choose Defer unless Delegate is not legal under a future explicit contract (not expected in Kestrel);
- take no optional liaison action;
- if Lattice Task Collection is available as a separate zero-intervention action, do **not** task it;
- at Cycle 6, Delegate the terminal recommendation rather than selecting an alternate final course.

Purpose: test whether standing direction + staff autopilot can dominate personal command.

### `intervene-all-where-legal`

For each cycle:

1. iterate agenda issues in canonical authored issue order;
2. for each issue whose recommendation has at least one legal alternate order, intervene until the two-token budget is exhausted;
3. choose the alternate with the lexicographically smallest stable `orderId` among legal alternatives after excluding the recommendation; this lexical rule is **lab-only**, never staff/game content logic;
4. if a separate Lattice Task Collection action is available, choose the lexicographically smallest eligible target ID because it costs no normal intervention;
5. do not use Defer unless no authored order alternative exists and Defer is the only non-Delegate stress action.

Purpose: detect whether “always spend personal attention” is structurally superior. The particular alternate choice is intentionally mechanical, not strategic.

### `random-valid`

For each decision, select uniformly from the complete legal player dispositions/orders using a deterministic lab PRNG seeded from:

`{campaignSeed, standingIntent, cycle, issueId, "random-valid"}`

For Task Collection, select uniformly from legal eligible target IDs using the same deterministic derivation.

The PRNG state is lab-only and not written into canonical campaign state beyond normal chosen player actions.

Purpose: broaden reachability/sanity coverage, not estimate human behavior.

## Named strategic probe policies

These use fixed opening intents matching the strategy being probed. When a preferred course is already the staff recommendation, submit Delegate rather than wasting an intervention to select the same order. When it is not recommended, intervene if budget remains.

If more than two preferred interventions exist, apply the policy's listed issue priority for that cycle; lower-priority preferences remain delegated.

### `intelligence-first`

Opening intent:

- main priority: `ravellan-understanding`;
- protected boundary: `civilian-shipping`;
- tolerated cost: `political-friction`;
- default style: `quiet-preparation`.

Preferred choices:

- C1: `protect-lattice-c1`;
- C2: `protect-lattice-c2`; prefer `quiet-escort` over disruptive reroute where a shipping override is needed;
- C3 priority: `protect-lattice-c3`, then `focus-staging-collection`;
- C4: if Lattice operational, Task Collection target preference `landing-force-staging > auxiliary-tasking > political-operational-sync`; if Lattice unavailable, prefer `request-partner-liaison`;
- C5: if another Task Collection is legal, prefer a different still-eligible target in order `auxiliary-tasking > political-operational-sync > landing-force-staging`; prefer `use-attribution` when credible and partner-safe;
- C6 final alternate preference: `hold-and-expose > quiet-denial > joint-visible-denial > emergency-mobilisation` among legal courses.

This policy deliberately spends early command attention on information/institutional capability and may accept physical/political costs.

### `coalition-first`

Opening intent:

- main priority: `partner-cooperation`;
- protected boundary: `partner-consultation`;
- tolerated cost: `weaker-deterrence`;
- default style: `partner-consultation`.

Preferred choices:

- C1: `formal-consultation-agreement`;
- C2 priority: `joint-non-attributive-warning`, then `quiet-escort` where changing the shipping recommendation protects partner alignment;
- C3: `reassure-partner` when the issue exists;
- C4: do not request partner liaison merely because it is coalition-themed; use it only if Lattice is absent **and** HQ remains `unclear` under the ordinary staff recommendation path, after higher-priority partner-preservation choices;
- C5 priority: `honour-consultation`, then `use-attribution` when jointly/partner-safe, then a Beacon course that does not cross partner consultation if one is legal;
- C6 final alternate preference: `hold-and-expose > joint-visible-denial > quiet-denial > emergency-mobilisation` among legal courses.

Purpose: prove that preserving political authority changes later mechanics rather than functioning as decorative role-play.

### `deterrence-first`

Opening intent:

- main priority: `beacon-security`;
- protected boundary: `civilian-shipping`;
- tolerated cost: `reserve-strain`;
- default style: `visible-deterrence`.

Preferred choices:

- C1: `reinforce-watch`;
- C2: `visible-patrol-surge`;
- C3: `forward-reserve-preparation`;
- C4: `press-visible-advantage`;
- C5 priority: `visible-reinforce-beacon`, then `keep-reserve-forward`;
- C6 final alternate preference: `joint-visible-denial > emergency-mobilisation > quiet-denial > hold-and-expose` among legal courses.

Purpose: probe the high-readiness/high-signal route and ensure it can succeed without becoming universally optimal.

### `recovery-first`

Opening intent:

- main priority: `partner-cooperation`;
- protected boundary: `reserve-readiness`;
- tolerated cost: `weaker-deterrence`;
- default style: `quiet-preparation`.

Preferred choices:

- C1: prefer `ordinary-watch` if staff would otherwise spend reserve; prefer formal consultation when an intervention is not required or remains affordable;
- C2: `quiet-escort` and `joint-non-attributive-warning` where they require overrides;
- C3 priority: `hold-reserve`, then `reassure-partner` when material;
- C4: `recover-reserve`;
- C5 priority: `emergency-consolidation` if reserve is strained/brittle, then `honour-consultation` or `political-concession` only where needed to preserve access;
- C6 final alternate preference: `hold-and-expose > quiet-denial > joint-visible-denial > emergency-mobilisation` among legal courses.

Purpose: test costly recovery and whether preserving endurance can remain viable without simply refusing every risk.

## Oracle frontier — not a gameplay policy

Do **not** implement an “oracle agent” that chooses one supposedly correct move through a hidden scalar objective.

The oracle is a separate test-only **frontier/feasibility diagnostic**.

For a verified state/seed, it may read hidden world truth and exhaustively explore legal player continuations through the normal authoritative simulator. It returns:

- whether any non-defeat terminal continuation exists;
- the set of non-dominated terminal Pareto vectors reachable with hidden truth;
- representative canonical action sequences for each distinct frontier vector using stable lexical action-sequence ordering solely to make diagnostics reproducible;
- the earliest decision at which hidden-truth knowledge changes the reachable frontier, where applicable.

It must never:

- write an action into a real player/staff path;
- define the recommended strategy;
- feed staff advice;
- become a balance target requiring normal policies to match it;
- collapse its frontier to one weighted “best” outcome.

Purpose: diagnose doomed seeds and the value/fairness of hidden information.

## Viability gate

A Kestrel authored seed/history set is structurally viable only if all are true:

1. no seed forces a hard loss before Cycle 6 without a meaningful earlier legal countermeasure/recovery;
2. materially different non-oracle strategies can reach Cycle 6;
3. at least two terminal outcome profiles are non-dominated across the viable authored seed set;
4. a costly recovery route remains available through Cycle 5 as promised by the canonical contracts;
5. oracle-frontier analysis does not show that avoiding unavoidable defeat required hidden truth unavailable through any legitimate evidence/action path.

## Diagnostic 1 — policy dominance

Run the exact Pareto relation above.

Flag especially:

- `delegate-all` dominating every other behavior under all equivalent intent fixtures;
- `intervene-all-where-legal` dominating delegate behavior across equivalent intent fixtures;
- one of recovery/deterrence/intelligence/coalition-first dominating the others across every viable seed.

A flagged dominance is a design warning requiring review; never fix it by randomisation or rubber-banding.

## Diagnostic 2 — Decision Elasticity

For every authored major decision point, branch from the **same verified pre-decision state** and execute each legal alternative while holding all earlier history and deterministic inputs constant.

A choice has mechanical elasticity if at least one alternative changes one or more of:

- persistent Kestrel record state;
- later HQ evidence/assessment;
- later agenda membership;
- later staff recommendation/dissent;
- legal action/capability/terminal-route availability;
- Ravellan authorised observation/policy path;
- terminal classification/Pareto vector.

If alternatives differ only in prose while all of these remain equal, flag **inelastic / potentially fake choice**.

Report decision ID/cycle, alternatives, first downstream divergence, later reconvergence and terminal effect if any.

## Diagnostic 3 — intervention/delegation value

Across equivalent seed/intent fixtures record:

- intervention opportunities;
- interventions used;
- whether each override changes later strategic state under Decision Elasticity;
- whether delegating has a real authored trade-off.

Flag if spending both interventions is weakly better in every comparable state, never intervening is weakly better everywhere, or a large fraction of authored overrides are mechanically inelastic.

## Diagnostic 4 — strategy separation

Compare intelligence-first, coalition-first, deterrence-first and recovery-first trajectories.

Flag two as insufficiently separated when across all viable seeds they produce the same:

- Lattice/liaison reachability;
- consultation/promise/partner trajectory;
- material persistent-state history;
- terminal route set;
- terminal Pareto vector/classification.

At least one viable seed must expose a meaningful mechanical distinction between each intended strategic family and another family.

Coalition-first specifically fails if preserving consultation/partner authority never changes later legal options, Ravellan observations, terminal routes or partner/commitment outcomes.

## Diagnostic 5 — information value

Compare otherwise equivalent branches with/without legitimately acquired evidence.

Information is mechanically relevant when it changes at least one of:

- HQ assessment;
- recommendation/dissent;
- attribution/Hold-and-Expose availability;
- another later legal/credible command path;
- terminal vector/classification through a belief-dependent decision.

Flag if Lattice evidence never changes an actionable state, liaison and Lattice are always equivalent, or oracle-frontier analysis shows hidden truth is essential while legitimate information cannot affect the necessary decision.

Information need not always improve outcome.

## Diagnostic 6 — capability relevance / target elasticity

Lattice passes only if maturity changes legal action/information space and creates at least one later mechanically elastic decision unavailable without it.

Also prove at least one viable non-Lattice history reaches a non-defeat terminal outcome.

For each reachable identical pre-task state with ≥2 eligible Lattice targets, branch every target. Flag a target as potentially cosmetic if it never changes later evidence, assessment, attribution, recommendation, route availability or terminal result relative to another target across the complete reachable target-choice fixture set.

Do not add random target outcomes to hide an inelastic target.

## Diagnostic 7 — recovery reachability

From every reachable non-terminal state at the end of Cycles 1–5, check promised counterplay:

- reserve strain/brittleness → emergency consolidation where still pre-terminal;
- partner deterioration → reassurance/consultation or political concession where authored;
- Beacon exposure → reinforcement/preparation where reachable;
- missed Lattice → liaison counterplay.

Flag forced pre-terminal loss without earlier avoidable decision chain, legal-but-mechanically-useless recovery, or costless dominant recovery.

## Diagnostic 8 — route sameness

For every viable Cycle-6 history record legal final courses and each terminal vector/classification.

It is acceptable for one course to be best in one history.

Flag if the same course is at least as good as every alternative across **all** viable histories/seeds, or if all histories expose the same legal route set/relative ordering.

## Diagnostic 9 — intent relevance

For equivalent seed/world conditions vary one standing-intent field at a time while holding the other three fixed.

Each of the 12 answer choices must participate in at least one reachable case where the field changes:

- recommendation/reason;
- or a downstream delegated action/consequence.

At least one case must place two intent fields in a real trade-off.

Flag a choice that never affects reachable game state/advice.

## Diagnostic 10 — adversary responsiveness/fairness

Using #99:

- vary an authorised Ravellan observation with private coalition state fixed and confirm policy changes where matrix says it should;
- vary private coalition/HQ state with observations fixed and confirm Ravellan does not change;
- confirm all three opening postures create meaningfully different policy/terminal opportunities under at least some player histories;
- use oracle frontier to flag a hidden opening that produces avoidable-looking defeat with no legitimate clue/counterplay.

Do not dynamically rebalance Ravellan.

## Diagnostic 11 — snowball / trivial success

Flag a branch when early advantage makes all later windows strategically empty, e.g.:

- recommendations uniformly agree;
- all interventions become inelastic;
- no recovery is ever relevant;
- all final routes collapse to the same vector/classification.

Do not inject difficulty as the fix.

## Diagnostic 12 — agenda collision

Report per cycle:

- number of consequential agenda issues;
- legal personal-intervention alternatives;
- intervention budget;
- count of mechanically elastic alternatives.

Cycle 3 and Cycle 5 must each expose >2 credible/elastic intervention candidates in the canonical authored histories promised by [[21-KESTREL-SIX-CYCLE-CANON]].

Flag collision created only by fake/inelastic options.

## Counterfactual execution integrity

Counterfactual branches are lab simulations, never canonical player history.

They must clone a verified state/revision, use normal authoritative transitions, remain deterministic, never mutate the source run, and be clearly separated from canonical replay evidence/player debrief.

## Laboratory report

Produce deterministic machine-readable output plus concise human summary containing:

- seed/intent/policy matrix;
- terminal Pareto vectors/classifications;
- dominated-policy findings;
- Decision Elasticity;
- intent relevance;
- information/Lattice/target relevance;
- recovery failures;
- route sameness;
- adversary fairness/responsiveness;
- oracle-frontier feasibility/information findings;
- strategy separation including coalition-first;
- snowball/triviality warnings;
- agenda-collision statistics.

No “fun score”.

## Required #107 self-tests

The lab itself must detect deliberately broken fixtures for:

- always-delegate dominance;
- always-intervene dominance;
- an inelastic fake choice;
- missing recovery;
- mandatory Lattice;
- two cosmetic-equivalent Lattice targets;
- information that never changes action space;
- a universal final route;
- irrelevant intent choice;
- coalition strategy mechanically indistinguishable from another policy;
- adversary reading private state;
- doomed hidden-truth seed revealed by oracle frontier;
- snowball/trivial late game.

Then run the diagnostics against canonical Kestrel without treating a green report as human-fun proof.

## Rejection conditions

Reject #107 if it creates a scalar balance/fun score, implements a hidden-truth gameplay agent, trains an ML/LLM policy, feeds oracle/frontier data into staff/player paths, modifies gameplay dynamically to make diagnostics pass, treats counterfactual branches as canonical history, or claims automated evidence satisfies the human gate.
