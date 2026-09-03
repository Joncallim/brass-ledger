---
type: v2-human-evaluation
status: active
---

# V2 Human Playtests

Backlink: [[README]]

[[35-HUMAN-PLAYTEST-HARNESS]] is the protocol authority for participant
freshness, facilitation, spontaneous-versus-prompted evidence, coding, replay
uptake, formative-stop logic, and severe qualitative overrides. This file is the
anonymised evidence registry only. [[40-EVALUATION-CONTRACT]] owns the numeric
human-gate thresholds.

Do not populate this registry with synthetic/agent play or infer a passing human
finding from telemetry.

## Study register

| Tester | Stage | Prior experience | Run/seed | Standing direction / major strategy | Terminal outcome | Actual continuation / replay uptake | Finding / follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

## Per-participant evidence template

Create one anonymised section per participant using this structure. Do not store
unnecessary personal identifiers.

### Tester `<anonymous-id>`

- **Study stage:** formative smoke / formal gate
- **Prior strategy-game experience:** none / occasional / experienced / other coarse category
- **Run/seed ID:**
- **Standing direction:**
- **Major interventions / delegated strategy:**
- **Promises / obligations created or breached:**
- **Lattice / liaison / recovery use:**
- **Terminal outcome:**
- **Facilitator help required:** controls / rules / none; describe without teaching strategy

#### Spontaneous causal / ownership evidence

Record verbatim or near-verbatim statements made without prompting and the cycle/context.

- 

#### Spontaneous forward-plan evidence

Record statements/behavior showing what the participant intended to do next before the post-run interview.

- 

#### Observed confusion / disengagement

Record what happened and where. Do not infer emotion solely from telemetry.

- 

#### Regret / vindication / tension / surprise / payoff

Record evidence tied to an actual decision/state. Separate usability frustration from strategic frustration.

- 

#### Prompted post-run responses

Keep these explicitly separate from spontaneous evidence. Follow the question order in [[35-HUMAN-PLAYTEST-HARNESS]].

- **What happened in your campaign?**
- **What did you personally cause or set in motion?**
- **What were you trying to do by the end?**
- **Which uncertainty mattered most?**
- **What did you regret / feel vindicated about?**
- **Did the final confrontation feel connected to earlier play?**
- **What would you do differently on replay?**
- **What felt like paperwork / click-through?**
- **Where was the game confusing or under-informative?**

#### Continuation / replay evidence

- **Verbal prompted interest:**
- **Spontaneous desire to continue:**
- **Actual optional replay started:** yes / no
- **If replay started, what did the participant explicitly intend to change?**

#### Coding against gate dimensions

- **Significant personal cause identified:** yes / no / unclear
- **Unprompted forward strategy:** yes / no / unclear
- **Meaningful affect/payoff:** yes / no / unclear
- **Ownership language:** yes / no / unclear
- **Voluntary another turn/run desire:** yes / no / unclear
- **Material misconception:** none / describe

#### Qualitative finding / remediation hypothesis

Record the observed failure/success pattern before proposing a fix. Do not default to more tutorial/copy if the underlying mechanic is what failed.

- 

## Formative smoke decision record

After exactly the authorised three fresh formative participants, record:

- number unable to explain major causal consequences;
- number unable to form a next-cycle plan;
- number showing no voluntary desire to continue while another command remained;
- repeated qualitative pattern, if any;
- human decision: `continue` or `stop-and-redesign`.

This is not a pass of #110.

## Formal gate decision record

After the eight fresh formal participants, record the raw counts required by
[[40-EVALUATION-CONTRACT]] before writing a conclusion:

- want another turn/run: `/8`;
- identify significant personal cause: `/8`;
- unprompted forward strategy: `/8`;
- meaningful regret/vindication/tension/surprise/payoff: `/8`;
- ownership language: `/8`;
- actual optional replay uptake: `/8` (contextual evidence; not a separate fixed threshold).

Then record any repeated severe qualitative failure and whether facilitation/data
quality contaminated any sessions.

Only the human product owner may record the final #110 decision:

- `PASS — authorise post-gate product phase`;
- `FAIL — focused mechanical remediation`;
- `FAIL — interaction/information remediation`;
- `INCONCLUSIVE — rerun contaminated/insufficient study`.
