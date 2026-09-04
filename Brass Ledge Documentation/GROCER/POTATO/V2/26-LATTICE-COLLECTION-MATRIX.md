---
type: v2-lattice-contract
status: active
---

# Lattice Collection Matrix

Backlink: [[README]]

This is the implementation authority for **#102 — Lattice Cell and the Kestrel directed-collection action it unlocks**. It is one concrete capability, not a generic technology tree.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns shared evidence/assessment/warning/public-case reducers. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns pure historical derivation. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system command/attribution interactions.

# Product purpose

Lattice should feel valuable because sustained investment gives the commander a **new verb**:

> protect this institution now, then later ask one specific question without spending normal personal attention.

It does not add `+intel`, probability, rerolls or hidden score.

The three target choices answer mechanically different command questions. They are not three labels for “reveal Ravellan's posture”.

# Investment schedule

Exactly three scheduled protected advances:

- C1: 0 → 1;
- C2: 1 → 2;
- C3: 2 → `3-operational`.

All must occur on schedule. Missing any required advance makes Kestrel maturity unreachable. No catch-up, partial bonus, accelerated investment or refund.

Operational from C4.

# Task Collection

Operational Lattice unlocks exactly one action family:

`task-collection`

Rules:

- available C4/C5 only;
- one named eligible target per cycle;
- zero normal intervention cost;
- task/result authority is persisted/replayable under #102's later architecture;
- no immediate HQ assessment change;
- result arrives at the next canonical HQ-belief query point;
- result becomes ordinary derived HQ evidence under [[23-HQ-BELIEF-AND-EVIDENCE]];
- no C6 task;
- result never directly mutates hidden Ravellan state or sets assessment/recommendation.

# Observation boundary

Each target may inspect only the physical/action-history facts explicitly listed below.

Hidden Ravellan posture is never an input.

#102 should follow the same four-layer pattern as #100 where practical:

```text
verified hidden history
→ target-authorised observation extractor
→ bounded source fact
→ evidence mapper
→ #100 reducers
```

Holding authorised source facts fixed while changing posture alone must produce identical evidence.

# Named targets

Exactly:

- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

No free-text target.

## Eligibility

Target eligible when:

- Lattice operational;
- cycle C4/C5;
- no unresolved same-cycle Lattice task;
- named question materially unresolved;
- that target has not already produced a result authored as conclusive for the rest of Kestrel.

A coherent overall assessment does not make every named question irrelevant. Another target can still add tactical warning, expose contradiction, strengthen a public case or alter later action/route space.

# Timing

Tasked in Cn:

1. persist task/target authority;
2. world/Ravellan advances normally;
3. at Cn+1 belief query inspect only target-authorised verified facts;
4. map to exact evidence result;
5. reduce through #100.

Directional Lattice results remain active through terminal unless newer **same-question** evidence explicitly supersedes them.

# Target 1 — `landing-force-staging`

Question:

> Are units required for a Beacon seizure actually concentrating?

Primary value: **indications-and-warning**.

Authorised physical input:

- seizure-preparation state at result time only.

No posture/recent-action input.

## Preparation `developing|ready`

`lattice-landing-concentration`

- implication `preparation`;
- diagnosticity `diagnostic`;
- warning `usable`;
- public-case `source-sensitive`;
- summary meaning: landing elements associated with prior seizure exercises are concentrating near embarkation areas.

Can create coherent preparation if uncontradicted and usable warning even if wider assessment remains conflicted.

## Preparation `none`

`lattice-landing-dispersed`

- implication `coercion`;
- diagnosticity `indicator`;
- warning none;
- public-case `source-sensitive`;
- summary meaning: the force package required for rapid seizure remains dispersed.

Negative result stays an indicator because absence now does not prove Ravellan cannot pivot later.

# Target 2 — `auxiliary-tasking`

Question:

> Are the vessels pressuring shipping integrated into wider military preparation or primarily part of coercive pressure?

Primary value: understand the **pressure mechanism**; strongest Kestrel route to diagnostic coercion.

Authorised inputs:

- result-time seizure preparation;
- most recent verified normal Ravellan action within collection interval.

No posture.

## Preparation + active shipping probe

Condition: preparation `developing|ready` + latest action `probe_shipping`.

`lattice-auxiliary-integrated`

- implication preparation;
- diagnosticity indicator;
- warning none;
- public-case source-sensitive.

Auxiliary integration alone does not prove the seizure force is ready/timed.

## No preparation + coercive/deceptive pressure action

Condition: preparation `none` + latest action `probe_shipping|seed_deception`.

`lattice-auxiliary-coercive`

- implication coercion;
- diagnosticity **diagnostic**;
- warning none;
- public-case source-sensitive.

This is strong because the collection combines an observed coercive tasking chain with the absence of the physical preparation state the same target is authorised to inspect.

## Otherwise

`lattice-auxiliary-mixed`

- implication ambiguous;
- diagnosticity indicator;
- warning none;
- public-case none.

A newer Lattice auxiliary result explicitly supersedes older auxiliary-tasking evidence such as reroute/liaison evidence, not unrelated questions.

# Target 3 — `political-operational-sync`

Question:

> Are Ravellan's recent operational milestones forming one sequence with the pressure campaign?

Primary value: **pattern/sequence and a preparation-oriented public analytic case**, not tactical warning.

Authorised input:

- two most recent verified normal Ravellan actions available at result time.

No posture/preparation input.

## Two recent prepare actions

`lattice-sync-preparation-sequence`

- implication preparation;
- diagnosticity **diagnostic**;
- warning none;
- public-case source-sensitive;
- meaning: recent milestones form a sustained preparation sequence rather than isolated activity.

This can make intent coherent/publicly supportable while still providing no direct physical warning of execution timing.

## Exactly one recent prepare action

`lattice-sync-preparation-signal`

- implication preparation;
- diagnosticity indicator;
- warning none;
- public-case source-sensitive;
- meaning: one milestone aligns with preparation, but the wider recent sequence remains mixed.

## No prepare action + at least one probe/deception action

`lattice-sync-coercive-sequence`

- implication coercion;
- diagnosticity **indicator**;
- warning none;
- public-case source-sensitive;
- meaning: recent activity has sustained pressure without a new preparation milestone in the observed interval.

**Do not mark this branch diagnostic.** Recent pressure/deception actions do not prove that preparation created earlier is absent; this target does not observe preparation state. Strong diagnostic coercion belongs to `auxiliary-tasking`, which is authorised to inspect both tasking and physical preparation.

## Otherwise

`lattice-sync-partial`

- implication ambiguous;
- diagnosticity indicator;
- warning none;
- public-case none.

# Target-choice differentiation

The target choice must matter from identical pre-task states.

Intended triangle:

- **landing** — best physical warning; can diagnose preparation + warning;
- **auxiliary** — best diagnostic test of coercive tasking; never warning;
- **sync** — best test of a sustained preparation sequence/public case; never warning, and negative coercion result is deliberately weaker than auxiliary.

Representative contrasts:

- physical preparation developing + one recent prepare action:
  - landing → diagnostic preparation + usable warning;
  - sync → preparation indicator only;
- no preparation + coercive latest action:
  - auxiliary → diagnostic coercion;
  - landing → coercion indicator;
  - sync → at most coercion indicator depending recent sequence;
- two recent prepare actions:
  - sync → diagnostic preparation but no warning;
  - landing can provide warning if physical preparation is present;
- mixed histories can make one target ambiguous while another is directional.

#107 branches all eligible targets from identical pre-task state and rejects:

- prose/evidence-count-only differentiation;
- a target globally dominated in every state where co-eligible;
- a target whose claimed warning/public-case role never changes downstream choice/route space.

Do not hide equivalence with randomness.

# Contradiction / supersession

Different named questions remain independent. Better collection may legitimately reveal a mixed/changing world.

- different-target evidence does not automatically delete contradiction;
- same-target newer evidence may explicitly supersede older same-question evidence;
- active opposing directions → `unclear + conflicted`;
- usable physical warning may coexist with conflicted intent.

Example: landing concentration gives usable warning while auxiliary tasking can still point toward coercive pressure.

# Emergency partner-liaison fallback

If Lattice unavailable in C4, expose exactly:

`request-partner-liaison`

Under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]:

- commander-only `requiresIntervention = true`;
- consumes one normal intervention;
- creates liaison obligation;
- queues one C5 result;
- no reusable capability;
- answers only auxiliary-tasking;
- never diagnostic;
- never usable warning.

It observes the same authorised auxiliary facts and maps:

- integrated preparation → preparation indicator, warning none, source-sensitive;
- no-preparation coercive condition → coercion indicator, warning none, source-sensitive;
- otherwise ambiguous, no public-case role.

A newer liaison result supersedes older C2 reroute clue for the same auxiliary question.

Fallback is useful but narrower/costlier and cannot by itself produce coherent intent or tactical warning.

# Public-case / attribution interaction

Lattice never directly creates persisted attribution opportunity.

Evidence enters #100:

- eligible indicators may make public-case basis tentative;
- eligible uncontradicted diagnostics may make it `credible-source-sensitive`.

#101 later mirrors that basis into its unspent opportunity state and owns one-shot `used`. Later Lattice evidence can change HQ analysis but cannot regenerate a spent opportunity.

# Replay / architecture

#102 must persist/replay or deterministically reconstruct, under [[30-ARCHITECTURE-CONTRACT]]:

- scheduled advances/missed reachability;
- operational state;
- task target/cycle/queue;
- authorised verified facts or stable references sufficient to recompute result;
- result evidence ID where persistence is actually needed;
- liaison action/obligation/result.

#100 belief stays derived under [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

Before implementation, choose the smallest replay-safe integration against the then-current lifecycle. Do not widen `ravellan-decision` or persist a duplicate belief snapshot.

# Required tests

At minimum:

- exact scheduled maturity/missed-advance failure;
- Task Collection changes legal info space and costs zero normal interventions;
- one target/cycle;
- all branches deterministic;
- posture-only change with authorised facts fixed → identical result;
- no hidden posture/preparation/action IDs in player projection;
- results enter #100 reducers rather than set analysis directly;
- landing concentration can create usable warning;
- sync diagnostic preparation can create coherent preparation **without** warning;
- auxiliary diagnostic coercion can create coherent coercion when uncontradicted;
- sync no-prepare/recent-pressure branch is only an indicator, never diagnostic;
- public-case roles exact;
- contradiction retained across different targets;
- same-question supersession across reroute/liaison/Lattice;
- at least two identical-prestate targets produce different downstream assessment/warning/public-case/action effects;
- no target globally dominated across all co-eligible states;
- liaison one intervention, obligation, never Delegate/diagnostic/warning;
- viable non-Lattice non-defeat history;
- later evidence cannot regenerate used attribution opportunity;
- V1 unchanged.

# Rejection conditions

Reject #102 if it becomes a tech tree, adds intelligence points/bonus, reads hidden posture, lets sync infer strong coercion from recent action history alone, reveals truth directly, makes targets equivalent, treats preparation assessment as warning, hides fake choice with randomness, makes liaison free/delegated, removes non-Lattice counterplay, persists duplicate #100 belief or generalises arbitrary collection targets before another scenario proves reuse.
