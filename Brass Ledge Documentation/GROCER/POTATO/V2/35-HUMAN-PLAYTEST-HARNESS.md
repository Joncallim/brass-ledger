---
type: v2-human-playtest-harness
status: active
---

# Human Playtest Harness

Backlink: [[README]]

This document is the implementation/protocol authority for **#109 — V2 human playtest harness** and complements [[80-HUMAN-PLAYTESTS]], which stores evidence/results. It does not permit an AI agent to certify the human fun gate.

## Purpose

The harness should reveal whether players actually experience:

- causal ownership;
- a forward strategy;
- meaningful uncertainty;
- regret, vindication, tension, surprise or payoff;
- voluntary desire to continue/replay.

It must avoid coaching players into the behaviors being measured.

## Two study stages

### Stage A — formative smoke

Participants: **3 fresh players**.

Timing: after #104 produces a complete trusted-replay-valid plain-text/headless Kestrel slice. Browser UI is not required.

Purpose: cheaply falsify major loop/causality problems before UI effort.

This stage is explicitly non-gating.

Stop/redesign before formal testing if at least 2 of 3:

- cannot explain major consequences in terms of decisions/history;
- cannot form a next-cycle plan;
- or show no voluntary desire to continue the run when another command remains.

The smoke may reveal implementation/design problems; it cannot pass #110.

### Stage B — formal V2 gate study

Participants: **8 fresh players**.

Timing: after #108 authoritative browser E2E and #109 harness readiness.

Pass thresholds remain those in [[40-EVALUATION-CONTRACT]]:

- ≥6/8 voluntarily want another turn/run;
- ≥6/8 identify something significant they personally caused;
- ≥6/8 state a forward strategy without prompting;
- ≥5/8 report meaningful regret, vindication, tension, surprise or payoff;
- ≥6/8 use ownership language about the campaign.

A repeated severe qualitative failure overrides numerical passage.

No AI, CI job, telemetry score or synthetic play may mark this gate passed.

## Participant freshness

A “fresh player” for the gate must not have:

- read the V2 design/canonical docs;
- implemented/reviewed Brass Ledger V2 mechanics;
- been coached on Ravellan's hidden policy;
- been told the intended optimal strategies;
- seen a previous participant run in enough detail to know key branches.

Record prior experience with strategy/management games for interpretation, but do not exclude experienced players automatically.

Do not use project contributors for the formal 8-player threshold sample.

## Session setup

Before play, facilitator may state only the minimal fiction/control context needed to begin, equivalent to:

> You are the commander of a coalition headquarters responsible for Beacon Channel. Your staff will recommend what it intends to do. You can personally change a limited number of things. Play the situation as you think best.

Do not explain:

- hidden Ravellan postures;
- the three intended strategy families;
- which capability is “good”;
- how terminal routes counter Ravellan;
- what behaviors count toward the study pass criteria.

Use normal in-product/headless explanations only. If the game itself cannot communicate a required concept, record that failure rather than rescuing it with facilitator teaching.

## Facilitation rule: uninterrupted primary run

During the primary run:

- do not suggest a choice;
- do not explain why one order is better;
- do not reveal hidden truth;
- do not reassure the player that they are playing “correctly”;
- do not ask leading reflective questions after each cycle;
- do not interrupt merely to collect data that can be observed silently.

If the participant asks a rules/control question, answer only what the normal product/field manual would legitimately state. Record that they needed facilitator help.

If they ask a strategic question (“What should I do?”), reply neutrally that the choice is theirs; do not interpret the situation for them.

## Evidence channels

Separate evidence into three categories.

### A. Spontaneous during-play evidence

Record verbatim or near-verbatim statements/behavior such as:

- “I did that because…”
- “That happened because I…”
- “Next I need to…”
- “I knew I shouldn't have…”
- “I think Ravellan is…”
- “I want to see what happens if…”
- visible disengagement/confusion;
- voluntary attempts to inspect history/reasons;
- hesitation when interventions collide.

Timestamp by cycle/issue, not wall-clock identity data unless needed operationally.

Spontaneous evidence is stronger than prompted interview answers for ownership/forward-plan criteria.

### B. Observed behavior

Record:

- cycle reached/completed;
- major interventions/delegations;
- whether participant reads staff reasons/dissent;
- whether they notice/remember explicit promises;
- whether they use Lattice/liaison when available;
- whether they use a recovery action;
- whether they abandon/stop early and when;
- whether they attempt another run when actually available.

Do not infer emotion solely from click telemetry.

### C. Post-run prompted interview

Prompted responses are useful context but remain labeled as prompted.

Do not merge them into spontaneous evidence.

## Post-run interview order

Ask these open questions in this order, without supplying examples unless the participant genuinely cannot understand the question.

1. **What happened in your campaign?**
2. **What do you think you personally caused or set in motion?**
3. **What were you trying to do by the end?**
4. **Which uncertainty mattered most to your decisions?**
5. **Was there a decision you regretted or felt vindicated about? Why?**
6. **Did the final confrontation feel connected to what you had done earlier? Why or why not?**
7. **What would you do differently if you played again?**
8. **What felt like paperwork or something you were clicking through rather than deciding?**
9. **Where did the game confuse you or fail to give you enough information?**

Do not ask “Was it fun?” as the primary metric. A yes/no answer is too easy to please the facilitator with and does not replace behavior/evidence.

A general enjoyment question may be asked last for qualitative context.

## Voluntary continuation/replay evidence

Do not count a participant saying “sure, I guess” after being strongly asked whether they would replay as equivalent to spontaneous replay desire.

For an unfinished run with another command available:

- observe whether they voluntarily continue when the normal progression control is available;
- do not artificially end the session at a fixed minute solely to manufacture a “continue?” response.

After a completed run:

- make a genuine `Play Again`/new-run option available;
- neutrally state once that another run is available if they want it, without selling alternative branches;
- record actual replay uptake separately from verbal/promoted interest.

Actual uncoached replay uptake is strong evidence but is not required from every passing participant.

## Ownership-language coding

A participant counts toward the ownership criterion when their spontaneous or post-run language clearly treats the campaign as the result of their strategy/history, e.g.:

- “my reserve problem”;
- “I kept prioritising intelligence”;
- “I broke the promise”;
- “I left Beacon too exposed”;
- “my plan was to keep the partner on side.”

Do not require these exact words.

Do not count generic statements like “the game made the reserve low” if the participant cannot connect it to their decisions.

## Causal-understanding coding

A participant demonstrates causal understanding when they can correctly connect at least one material later state/event to an earlier order/delegated policy/commitment without being told the answer.

Minor factual mistakes do not automatically fail the player if the important causal model is intact.

Record material misconceptions, especially:

- believing Ravellan reads private choices directly;
- believing staff recommendations are omniscient/correct answers;
- thinking promises/partner state are cosmetic;
- thinking Lattice is a passive stat buff;
- being unable to distinguish what HQ believed from actual hidden truth in the terminal debrief.

Repeated misconceptions across participants are design findings even if numerical thresholds pass.

## Forward-plan coding

A participant counts when, before being asked in the post-run interview, they articulate or behaviorally demonstrate a future strategic intention such as:

- recover reserve next;
- preserve partner consent for joint action;
- protect Lattice to answer the staging question;
- accept Beacon exposure temporarily for another priority;
- prepare quietly because they suspect a real move.

A simple “I'll click the next thing” is not a forward strategy.

Post-run answer to “what would you do differently?” is useful replay evidence but does not retroactively satisfy the unprompted forward-plan criterion.

## Emotion/payoff coding

Count meaningful affect only when tied to game state/decision, including:

- regret;
- vindication;
- surprise;
- tension;
- relief;
- satisfaction at a capability/payoff;
- frustration at a self-created problem that the player understands.

Generic positive politeness (“nice game”) does not count.

Negative emotion can still be productive if it is about a meaningful trade-off; frustration caused by confusing UI/rules is a usability failure and should be coded separately.

## Severe qualitative override

Even if numerical thresholds are met, the product owner should fail/route remediation when a serious pattern repeats, especially:

- game is primarily experienced as approving staff recommendations/paperwork;
- players cannot see how prior choices affect the final crisis;
- hidden-state outcomes feel arbitrary/unfair;
- one strategy is perceived as obviously correct and others as traps;
- consequences are understood only after facilitator explanation;
- participants continue only because they feel obligated to finish a study;
- information/recommendation text is too dense to read voluntarily.

Document the repeated evidence verbatim before applying an override.

## Anonymised evidence record

For each participant record:

- anonymous tester ID;
- study stage;
- relevant prior strategy-game experience (coarse category only);
- run/seed ID;
- standing direction;
- major intervention/commitment/capability choices;
- terminal outcome;
- spontaneous causal statements;
- spontaneous forward-plan statements;
- observed disengagement/confusion/help requests;
- regret/vindication/tension/surprise/payoff evidence;
- prompted interview answers;
- actual continuation/replay uptake;
- coded pass dimensions;
- notable qualitative finding/follow-up.

Do not store unnecessary personal identifiers.

## Formative-smoke decision

After 3 participants, classify only:

- **continue to implementation/formal preparation**;
- **stop and redesign the loop/causality**.

Do not call the formative smoke a pass of the V2 fun gate.

If ≥2/3 hit a stop criterion, open focused remediation issues tied to actual observed failure. Do not default to tutorial/copy/polish unless evidence shows the mechanics are understood and only presentation is failing.

## Formal-gate decision

After 8 fresh participants, the human product owner reviews:

- numeric thresholds from [[40-EVALUATION-CONTRACT]];
- severe qualitative patterns;
- actual replay/continuation behavior;
- evidence quality and any facilitation contamination.

Possible decisions:

- `PASS — authorise post-gate product phase`;
- `FAIL — focused mechanical remediation`;
- `FAIL — interaction/information remediation`;
- `INCONCLUSIVE — study contamination/data-quality problem; rerun affected sessions`.

No AI agent closes #110 on the user's behalf.

## Protocol QA for #109

Before using the harness formally:

- another reviewer checks every facilitator instruction for leading language;
- verify spontaneous and prompted fields are separate;
- verify the template captures actual replay uptake separately from prompted interest;
- verify no field asks facilitator to infer hidden internal emotion from telemetry;
- verify the product itself, not facilitator script, teaches controls/concepts required for play;
- run documentation validation.

## Rejection conditions

Reject #109 if it uses synthetic participants, lets facilitators coach strategy, counts prompted politeness as spontaneous replay desire, merges prompted/spontaneous evidence, stores unnecessary personal data, treats telemetry as emotion, or changes the numerical gate after seeing results merely to obtain a pass.
