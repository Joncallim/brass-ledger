---
type: v2-human-playtest-harness
status: active
---

# Human Playtest Harness

Backlink: [[README]]

This is the protocol authority for **#109 — collecting non-leading human evidence**. [[80-HUMAN-PLAYTESTS]] stores anonymised results. No AI/CI/synthetic run may pass #110.

## Purpose

Human testing answers what machine proof cannot:

- did players feel causal ownership;
- did they form a forward strategy;
- did uncertainty feel meaningful rather than arbitrary;
- did painful trade-offs create regret/vindication/tension/surprise/payoff;
- did they voluntarily want the next command or another run;
- did command-by-exception feel like command rather than approving staff paperwork.

## Study sequence

### Stage A — 3-player formative smoke

Run only after:

`#104 complete replay-valid headless slice → #107 structural lab complete`

Browser UI is not required.

Purpose: cheaply falsify the **remaining experiential** hypothesis after obvious structural defects have already been screened by #107.

This stage is non-gating.

If #107 still has unresolved blocking findings, do not spend fresh-player time to rediscover them.

Stop/redesign before the main browser tranche when at least 2/3 participants:

- cannot explain major consequences from their decisions/history;
- cannot form a next-cycle plan;
- or show no voluntary desire to continue while another command remains.

Also stop for a repeated severe qualitative defect even if the 2/3 shorthand is not neatly met, e.g. all players independently experience the game as approval paperwork or an important outcome as unknowable punishment.

A green smoke cannot pass #110.

### Stage B — 8-player formal gate study

Run only after:

- #105/#106 completed following the formative continuation decision;
- #108 authoritative browser E2E complete;
- #109 protocol QA complete.

Fixed thresholds from [[40-EVALUATION-CONTRACT]]:

- ≥6/8 voluntarily want another turn/run;
- ≥6/8 identify a significant personal cause;
- ≥6/8 state an unprompted forward strategy;
- ≥5/8 report meaningful regret, vindication, tension, surprise or payoff;
- ≥6/8 use ownership language.

Repeated severe qualitative failure overrides counts.

## Fresh participant rule

Formal participants must not have:

- read V2 canonical design docs;
- implemented/reviewed V2 mechanics;
- been told hidden Ravellan policy/starting state;
- been coached on intended strategic families;
- seen enough prior participant play to know important branches.

Record only coarse relevant strategy/management-game experience. Do not use project contributors in the formal eight.

## Minimal facilitator setup

Equivalent to:

> You are commanding a coalition headquarters responsible for Beacon Channel. Your staff will tell you what it intends to do. You can personally change a limited number of things. Play the situation as you think best.

Do not explain:

- hidden postures/policy rows;
- intended “builds”/optimal strategies;
- which Lattice target is best;
- how final routes map to hidden history;
- what study behaviors count as a pass.

If the product cannot explain a required mechanic, record that failure instead of rescuing it with facilitator teaching.

## Uninterrupted primary run

During play:

- do not suggest orders;
- do not interpret uncertainty for the player;
- do not say they are playing correctly/incorrectly;
- do not reveal hidden truth;
- do not ask reflective/leading questions each cycle;
- observe silently where possible.

Rules/control questions may be answered only to the extent normal product documentation should answer them. Record help requests.

Strategic question (“what should I do?”): state neutrally that the choice is theirs.

## Evidence channels

Keep three categories separate.

### A. Spontaneous during-play evidence

Record verbatim/near-verbatim with cycle/issue context:

- causal language (`I did that because…`, `that happened because…`);
- forward plan (`next I need to…`);
- opponent hypothesis;
- regret/vindication;
- desire to see what happens;
- confusion/disengagement;
- voluntary history/reason inspection;
- hesitation when scarce interventions/package requirements collide.

Spontaneous evidence is stronger than prompted answers for ownership/forward-plan coding.

### B. Observed behavior

Record:

- cycle reached/completed;
- standing direction;
- major interventions/delegations;
- whether staff reasons/dissent are read;
- whether promises/authority requirements are noticed;
- whether known one-shot/source cost is noticed before attribution use;
- whether Lattice/liaison/recovery paths are used;
- whether a player attempts an invalid cross-issue package and understands the explanation;
- whether they abandon/stop early;
- actual continuation/replay uptake.

Do not infer emotion from click telemetry alone.

### C. Post-run interview

Keep prompted responses labelled separately.

Ask, in order:

1. What happened in your campaign?
2. What do you think you personally caused or set in motion?
3. What were you trying to do by the end?
4. Which uncertainty mattered most?
5. Was there a decision you regretted or felt vindicated about? Why?
6. Did the final confrontation feel connected to earlier choices? Why/why not?
7. What would you do differently on replay?
8. What felt like paperwork rather than a real decision?
9. Where did the game confuse you or fail to give enough information?
10. Did any option feel like an obvious trap or a fake choice? Why?

Do not make “Was it fun?” the primary metric; an optional general enjoyment question may come last.

## Voluntary continuation / replay

For unfinished play, observe whether the participant naturally advances when the next control is available. Do not manufacture a timed “continue?” prompt.

After completion, expose a real Play Again/new-run option and state neutrally once that it is available. Record:

- spontaneous desire;
- prompted verbal interest separately;
- actual uncoached replay uptake separately.

A polite “sure” is not equivalent to actual replay desire.

## Coding

### Ownership

Count when the participant treats campaign state as belonging to their decisions/strategy, e.g. “my reserve problem,” “I broke the promise,” “I kept prioritising intelligence.” Exact phrasing not required.

Do not count generic “the game made X low” without causal understanding.

### Causal understanding

Count when they correctly connect at least one material later state/event to earlier intervention/delegated standing direction/commitment without being told.

Record misconceptions especially if they believe:

- Ravellan reads private intent/orders directly;
- staff advice is omniscient/correct-answer UI;
- promises/authority are cosmetic;
- Lattice is a passive stat buff;
- reroute/monitor has no reason to exist or produces magic intel;
- final route availability is arbitrary;
- terminal debrief truth was knowable earlier.

### Forward plan

Must be spontaneous before post-run interview: recover reserve, preserve partner authority, protect/target information, accept an exposure for another objective, prepare quietly, etc.

“Click next” is not strategy.

### Emotion/payoff

Count only when tied to game state/decision: regret, vindication, tension, surprise, relief, capability payoff, understandable frustration at a self-created problem.

Confusion/UX frustration is coded separately, not romanticised as strategic tension.

## Fairness / trap-choice coding

Pay special attention to two distinct failures.

### Unfair hidden-state punishment

If a participant says an outcome was impossible to anticipate, inspect whether they had a legitimate clue/countermeasure or explicitly accepted the risk.

Repeated “there was nothing I could have known/done” is severe even if machine fairness tests passed.

### Obvious trap/fake option

If participants repeatedly identify a legal option as pointless/self-harm, capture why.

Machine #107 should already have removed mechanically inelastic/player-safe dominated choices. If humans still perceive a route as a trap, determine whether:

- the value is poorly communicated;
- the machine fixture missed a reachable dominance case;
- or the risky upside exists mechanically but is not legible enough to make the choice meaningful.

Do not dismiss the finding because the option technically changes state.

## Severe qualitative override

Fail/route remediation despite numeric thresholds when a serious pattern repeats, especially:

- gameplay is mostly approving staff recommendations;
- players cannot connect prior choices to the final crisis;
- hidden-state outcomes feel arbitrary/unfair;
- a strategy/course is experienced as an obvious trap;
- cross-issue constraints feel like unexplained invalid-form errors rather than strategy;
- source/commitment costs are discovered only after selection despite being knowable;
- consequences make sense only after facilitator explanation;
- participants continue mainly from study obligation;
- required information/recommendation prose is too dense to read voluntarily.

Document verbatim evidence before applying the override.

## Anonymised record

Per participant record only what is needed:

- anonymous tester ID;
- stage;
- coarse prior strategy-game experience;
- run/seed ID;
- standing direction;
- major intervention/commitment/capability/authority choices;
- terminal outcome;
- spontaneous causal/plan statements;
- confusion/help/trap-choice observations;
- emotion/payoff evidence;
- prompted answers;
- actual continuation/replay uptake;
- coded dimensions;
- qualitative finding/follow-up.

No unnecessary personal identifiers.

## Formative decision

After three participants:

- `CONTINUE — underlying loop not falsified by smoke`;
- or `STOP — focused redesign/remediation before browser tranche`.

If ≥2/3 hit a stop criterion, stop. Do not default to tutorial/copy polish unless evidence clearly shows mechanics are sound and presentation alone is failing.

The smoke never counts as formal pass evidence for #110.

## Formal decision

After eight fresh formal participants, the human product owner reviews fixed thresholds, severe patterns, actual replay behavior and evidence quality.

Possible result:

- `PASS — authorise post-gate product phase`;
- `FAIL — focused mechanical remediation`;
- `FAIL — interaction/information remediation`;
- `INCONCLUSIVE — contaminated/insufficient study; rerun affected sessions`.

No assistant/agent closes #110 as passed for the product owner.

## Protocol QA

Before formal use:

- independent reviewer checks facilitator language for leading cues;
- spontaneous vs prompted fields are distinct;
- actual replay uptake separate from verbal interest;
- no telemetry-to-emotion inference;
- normal product, not facilitator, teaches necessary controls/rules;
- #107 has completed before Stage A;
- documentation validation passes.

## Rejection conditions

Reject #109 if it runs Stage A before #107, uses synthetic/project contributors as formal participants, coaches strategy, merges prompted/spontaneous evidence, counts politeness as replay desire, stores unnecessary personal data, treats telemetry as emotion, rescues incomprehensible mechanics through facilitation, or changes the fixed gate after seeing results merely to get a pass.
