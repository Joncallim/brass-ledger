---
type: v2-lattice-contract
status: active
---

# Lattice Collection Matrix

Backlink: [[README]]

This is the implementation authority for **#102 — Lattice Cell and the Kestrel directed-collection action it unlocks**. It is one concrete capability, not a generic technology tree.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns the shared evidence/assessment/warning/public-case reducers. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns pure historical derivation. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-system command/attribution interactions.

# Product purpose

Lattice should feel valuable because sustained investment gives the commander a **new verb**:

> protect this institution now, then later ask one specific question without spending normal personal attention.

It does not add `+intel`, probability, rerolls or hidden score.

The three target choices must answer mechanically different command questions. They are not three labels for “reveal Ravellan's posture”.

# Investment schedule

Exactly three scheduled protected advances:

- C1: 0 → 1;
- C2: 1 → 2;
- C3: 2 → `3-operational`.

All must occur on schedule.

If any scheduled advance is missed, Lattice cannot become operational during Kestrel. No catch-up, partial bonus, accelerated investment or refund.

It becomes operational for C4.

# Task Collection

Operational Lattice unlocks exactly one action family:

`task-collection`

Rules:

- available C4 and C5 only;
- one named eligible target per cycle;
- does **not** consume either normal intervention token;
- task is persisted/replayable player authority under #102's later architecture;
- no immediate HQ assessment change;
- result arrives at the next canonical HQ-belief query point;
- result becomes ordinary derived HQ evidence under [[23-HQ-BELIEF-AND-EVIDENCE]];
- no C6 task because there is no later Kestrel command window in which new evidence can guide a decision;
- result never directly mutates hidden Ravellan state or sets assessment/recommendation.

# Posture-blind observation invariant

Each target may inspect only the physical/action-history facts explicitly listed below.

**Hidden Ravellan posture is not an input to any Lattice result selector.**

Holding target-authorised facts constant while changing posture alone must produce identical evidence.

# Named targets

Exactly:

- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

No free-text target exists.

## Eligibility

A target is eligible when:

- Lattice is operational;
- current cycle is C4 or C5;
- no unresolved Lattice task already exists for that cycle;
- the named question is still materially unresolved;
- that exact target has not already produced a result authored as conclusive for the remainder of the slice.

A coherent overall `ravellan-intent` assessment does not automatically make every named question irrelevant. Another target may still provide tactical warning, create contradiction, strengthen a public case or change later route/recommendation space.

Eligibility derives from authoritative evidence/state, never UI prose.

# Timing / authorised world slice

Tasked in Cn:

1. persist target/task in Cn;
2. Ravellan/world advances through the normal lifecycle before result time;
3. at Cn+1 belief query, inspect only the target-authorised verified facts below;
4. create the exact evidence result;
5. feed it through [[23-HQ-BELIEF-AND-EVIDENCE]].

A saved task/result record is evidence to verify, not truth to trust blindly. Replay must recompute the result from the same authorised verified history.

Directional Lattice results remain active through terminal unless a newer result of the **same named question** explicitly supersedes them.

# Target 1 — `landing-force-staging`

Question:

> Are units required for a Beacon seizure actually concentrating?

This is the strongest Kestrel **indications-and-warning** question.

Authorised input:

- seizure-preparation state at result time only.

It does not read posture or recent action ID.

## Preparation `developing|ready`

Evidence:

`lattice-landing-concentration`

- implication `preparation`;
- diagnosticity `diagnostic`;
- source `lattice-landing-force-staging`;
- warning role **`usable`**;
- public-case role `source-sensitive`;
- summary: landing elements associated with previous seizure exercises are concentrating near embarkation areas.

This can produce:

- a coherent preparation assessment if no contradiction remains;
- usable tactical warning even if the wider assessment is still conflicted;
- a source-sensitive public-case basis if contradiction is cleared.

## Preparation `none`

Evidence:

`lattice-landing-dispersed`

- implication `coercion`;
- diagnosticity `indicator`;
- same source;
- warning role none;
- public-case role `source-sensitive`;
- summary: the force package required for a rapid Beacon seizure remains dispersed.

The negative result is only an indicator: absence of concentration now does not prove Ravellan cannot pivot later.

# Target 2 — `auxiliary-tasking`

Question:

> Are the vessels pressuring shipping integrated into wider military preparation or primarily part of coercive pressure?

This is the strongest Kestrel question for **understanding the pressure mechanism**.

Authorised inputs:

- seizure-preparation state;
- most recent verified normal Ravellan action within the collection interval.

No posture.

## Physical preparation + active shipping probe

Condition:

- preparation `developing|ready`;
- most recent action `probe_shipping`.

Evidence:

`lattice-auxiliary-integrated`

- implication `preparation`;
- diagnosticity `indicator`;
- warning none;
- public-case role `source-sensitive`;
- summary: auxiliary vessels appear to be receiving tasking consistent with a wider military preparation effort.

It remains an indicator because auxiliary integration alone does not establish that the physical seizure force is ready or timed.

## No physical preparation + coercive/deceptive pressure action

Condition:

- preparation `none`;
- most recent action `probe_shipping|seed_deception`.

Evidence:

`lattice-auxiliary-coercive`

- implication `coercion`;
- diagnosticity **`diagnostic`**;
- warning none;
- public-case role `source-sensitive`;
- summary: shipping pressure is being directed through a coherent coercive/political tasking chain rather than a seizure-force command sequence.

## Otherwise

`lattice-auxiliary-mixed`

- implication `ambiguous`;
- diagnosticity `indicator`;
- warning none;
- public-case role none;
- summary: tasking crosses auxiliary and military channels, but the pattern does not establish one common operational plan.

A well-chosen target can legitimately return uncertainty.

A Lattice auxiliary result supersedes older active evidence answering the same auxiliary-tasking question, including `reroute-auxiliary-*` or liaison auxiliary evidence. It does not delete evidence from another named question.

# Target 3 — `political-operational-sync`

Question:

> Are Ravellan's recent operational milestones forming one sequence with the pressure campaign?

This is the strongest Kestrel question for **pattern/sequence and a public analytic case**, not tactical warning.

Authorised input:

- two most recent verified normal Ravellan actions available at result time.

No posture/preparation input.

If fewer than two actions exist, use the available history and fall through to the weaker case.

## Two recent prepare actions

`lattice-sync-preparation-sequence`

- implication `preparation`;
- diagnosticity **`diagnostic`**;
- warning none;
- public-case role `source-sensitive`;
- summary: recent operational milestones form a sustained preparation sequence rather than isolated activity.

This can make the intent picture coherent/publicly supportable while still leaving the commander without direct physical warning of when forces will move.

## Exactly one recent prepare action

`lattice-sync-preparation-signal`

- implication `preparation`;
- diagnosticity `indicator`;
- warning none;
- public-case role `source-sensitive`;
- summary: one recent operational milestone aligns with the pressure campaign, but the wider sequence remains mixed.

## No prepare action + at least one probe/deception action

`lattice-sync-coercive-sequence`

- implication `coercion`;
- diagnosticity **`diagnostic`**;
- warning none;
- public-case role `source-sensitive`;
- summary: recent activity sustains political/coercive pressure without corresponding seizure-preparation milestones.

## Otherwise

`lattice-sync-partial`

- implication `ambiguous`;
- diagnosticity `indicator`;
- warning none;
- public-case role none;
- summary: recent activity does not establish whether the political and operational tracks share one timetable.

# Target-choice differentiation

The target choice must matter mechanically from identical pre-task states.

Examples:

- physical preparation developing + only one recent prepare action:
  - landing can produce **diagnostic preparation + usable warning**;
  - sync may produce only a preparation indicator;
- no physical preparation + coercive/deception action:
  - auxiliary/sync can produce **diagnostic coercion**;
  - landing produces only a weaker coercion indicator;
- mixed histories:
  - one target can be ambiguous while another is directional;
- a sync/auxiliary diagnostic preparation result can make intent coherent **without** usable tactical warning, preserving a reason to value landing-force collection in another history/run.

#107 branches target choice from identical pre-task state and rejects a target that never changes later evidence/assessment/warning/public-case/recommendation/route effects relative to the others.

Do not hide equivalent targets behind randomness.

# Result contradictions / supersession

Different named questions are independent. Better collection can reveal a genuinely mixed/changing world.

Therefore:

- different-target evidence does not automatically delete contradiction;
- same-target newer evidence may supersede older same-question evidence when explicitly authored;
- active evidence on both directions → HQ `unclear + conflicted` under the shared reducer;
- a usable physical warning signpost can coexist with a conflicted intent assessment.

Example: landing concentration can provide usable warning while later coercive auxiliary tasking still leaves the wider intent picture disputed.

# Emergency partner-liaison fallback

If Lattice is not operational in C4, expose exactly one narrower fallback:

`request-partner-liaison`

Under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] it is `requiresIntervention = true`:

- consumes exactly one normal personal intervention;
- can never be staff-recommended/delegated;
- creates `liaison-obligation = active`;
- queues one result for C5;
- does not create reusable capability;
- answers only `auxiliary-tasking`;
- can never produce diagnostic evidence;
- can never create usable tactical warning.

It observes the **same authorised auxiliary-tasking facts** as Lattice and maps:

- integrated-preparation condition → `liaison-auxiliary-military-links`, `preparation`, `indicator`, warning none, public-case `source-sensitive`;
- no-preparation coercive condition → `liaison-auxiliary-coercive-links`, `coercion`, `indicator`, warning none, public-case `source-sensitive`;
- otherwise → `liaison-auxiliary-unclear`, `ambiguous`, `indicator`, warning none, public-case none.

A newer liaison result supersedes an older C2 reroute clue for the same auxiliary question.

The fallback is useful but narrower/costlier and cannot by itself create the same coherent picture or tactical warning as a good Lattice result.

# Public-case / attribution interaction

Lattice never directly creates the persisted attribution opportunity.

After evidence enters the #100 derived model:

- eligible indicator evidence may make the **public-case basis** tentative;
- an eligible uncontradicted diagnostic result may make it `credible-source-sensitive`.

Later #101 consumes that basis to manage campaign `attribution-opportunity` state, including the one-shot `used` terminal state.

A later Lattice result may still change HQ assessment after public use, but must not regenerate a spent Kestrel attribution opportunity.

# Replay / ledger requirements

#102 must persist/replay or deterministically reconstruct, under [[30-ARCHITECTURE-CONTRACT]]:

- scheduled advances/missed reachability;
- operational state;
- target ID / task cycle / queue state;
- authorised verified facts or stable references sufficient to recompute result;
- result evidence ID;
- liaison action/obligation/result.

The **#100 belief state itself remains derived** under [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

Trusted replay rejects:

- task before maturity;
- catch-up advancement;
- >1 Lattice task/cycle;
- C6 task;
- wrong target/result combination;
- posture read by target selector;
- liaison diagnostic result;
- liaison usable-warning result;
- liaison via Delegate;
- target result directly setting hidden state/assessment/warning/recommendation;
- same-target supersession that does not match authored chronology.

# Required #102 tests

At minimum:

- exact scheduled maturity and missed-advance failure;
- operational Lattice changes legal action space C4;
- Task Collection costs zero normal interventions;
- one target/cycle;
- all target branches deterministic;
- posture-only variation with authorised target facts fixed → identical result;
- result projection contains no hidden posture/preparation/action IDs;
- result enters shared #100 evidence reducers rather than setting analysis directly;
- landing concentration can create usable warning;
- sync/auxiliary diagnostic preparation can create coherent preparation **without** warning;
- auxiliary/sync coercive diagnostic branches create coherent coercion when uncontradicted;
- public-case roles follow the exact source-sensitive matrix;
- contradictions retained across different named questions;
- same-question supersession works across reroute/liaison/Lattice;
- at least two identical-prestate targets create different downstream mechanics;
- liaison costs one intervention, creates obligation, cannot delegate, cannot diagnose/coherently settle intent by itself, cannot create warning;
- at least one viable non-Lattice non-defeat history exists;
- one-shot attribution timing works: later evidence cannot recreate a used opportunity;
- V1 capability/programme state unchanged.

# Rejection conditions

Reject #102 if it becomes a tech tree, adds generic intelligence points/bonus, reads hidden posture, reveals hidden truth directly, makes every target equivalent, treats every preparation assessment as tactical warning, hides fake choice with randomness, makes liaison free/delegated, removes non-Lattice counterplay or generalises to arbitrary collection targets before another scenario proves reuse.
