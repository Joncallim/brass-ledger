---
type: v2-execution-plan
status: active
---

# V2 Execution Plan

Backlink: [[README]]

## Dependency graph

`Bootstrap → Version skeleton → Turn/order contracts → Intent → Recommendation`
then `→ Adversary` and `→ HQ belief`, then `→ Consequences → Capability → Content
→ Headless execution → Command Room + Consequence Reveal → Laboratory → Browser
E2E → Human harness → Human gate`.

Only one issue is implemented at a time in dependency order. Each issue below
is also created on GitHub with this same authority. “Machine proof” means focused
tests plus the repository gates appropriate to touched packages; “human proof”
is never substituted by an agent judgement.

## Issue cards

### 1. Documentation / authority-boundary bootstrap

**Player hypothesis:** explicit authority prevents an agent from building a
different game by accident. **Scope:** V2 contracts, issue graph, AGENTS route,
and reconciliation. **Out:** gameplay/schema implementation. **Inputs/outputs:**
GROCER and current V1 boundaries → canonical V2 docs. **Owner:** POTATO docs.
**Positive:** six-cycle and information boundary are explicit. **Reject:** a doc
that permits hidden truth in advice or treats CI as fun proof. **Machine proof:**
`npm run lint:grocer`, documentation review. **Human proof:** none. **Compatibility:**
no runtime change. **Trade-off:** authored detail over open-ended design.
**Dependencies:** none. **Unlocks:** all V2 work.

### 2. Ruleset and save/replay version skeleton

**Player hypothesis:** a real experiment cannot risk existing campaigns.
**Scope:** additive V2 identity/version boundaries and replay/session dispatch.
**Out:** V2 mechanics. **Inputs/outputs:** V1 `GameSession`/ledger → versioned
V2 session/replay root. **Owner:** shared + sim, coordinated server consumer.
**Positive:** V1 validates unchanged; V2 identity round-trips. **Reject:** silent
V1 reinterpretation/migration or UI-only version checks. **Machine proof:**
shared/sim/server import/replay adversarial tests. **Human proof:** none.
**Compatibility:** V1 remains readable/replayable. **Trade-off:** parallel
contracts. **Dependencies:** 1. **Unlocks:** 3–10.

### 3. Authoritative turn/order/disposition contracts

**Player hypothesis:** clear command dispositions make the player commander.
**Scope:** agenda issue, delegate/intervene/defer, final order/action ledger.
**Out:** recommendations, adversary, content/UI. **Inputs/outputs:** V2 campaign
state → validated order transition. **Owner:** shared + sim. **Positive:** legal
defer and intervention cost resolve deterministically. **Reject:** UI selects
an order or invalid disposition persists. **Machine proof:** schema/sim/replay
tests. **Human proof:** none. **Compatibility:** V1 input unchanged. **Trade-off:**
small fixed order vocabulary. **Dependencies:** 2. **Unlocks:** 4–10.

### 4. Standing command intent

**Player hypothesis:** persistent priorities make delegation feel owned.
**Scope:** four intent fields, validation, persistence, causal references.
**Out:** scoring/automatic orders. **Inputs/outputs:** player declaration → known
intent state. **Owner:** shared + sim. **Positive:** intent survives replay; each
selected field receives a visible causal/recommendation reference and at least
two fields create a real trade-off. **Reject:** intent silently forces an order. **Machine
proof:** state/replay tests. **Human proof:** later slice. **Compatibility:** V1
Commander Intent stays intact. **Trade-off:** four bounded fields. **Dependencies:**
3. **Unlocks:** 5, 10.

### 5. Staff recommendation reason engine

**Player hypothesis:** explainable staff advice lets delegation retain agency.
**Scope:** pure recommendation derivation with discrete reason refs/chief views.
**Out:** global best score or world-truth access. **Inputs/outputs:** HQ belief,
intent, commitments, capability → disposition + reasons. **Owner:** sim.
**Positive:** two chiefs differ from one belief. **Reject:** changed hidden truth
alters advice with unchanged belief; numeric best score leaks. **Machine proof:**
isolation/reason tests. **Human proof:** slice. **Compatibility:** no V1 advice
regression. **Trade-off:** authored reasons. **Dependencies:** 3,4,7. **Unlocks:** 10–13.

### 6. Minimal adversary hidden-state model

**Player hypothesis:** a purposeful opponent creates anticipation. **Scope:**
three postures, objective/doctrine, four authored families, observable model.
**Out:** planner/minimax/rubber band. **Inputs/outputs:** world/observations →
adversary action. **Owner:** sim/content. **Positive:** posture changes legal
final branch. **Reject:** reads score/private choice or chooses drama. **Machine
proof:** deterministic/fairness tests. **Human proof:** slice. **Compatibility:**
V1 untouched. **Trade-off:** small policy. **Dependencies:** 2,3. **Unlocks:** 10.

### 7. HQ belief / intelligence projection

**Player hypothesis:** uncertainty makes information choices strategic. **Scope:**
world-to-belief updates, confidence bands, visibility rules. **Out:** omniscient
UI/forecast. **Inputs/outputs:** observations → HQ belief. **Owner:** sim/shared.
**Positive:** task collection narrows a legitimate uncertainty. **Reject:** hidden
posture leaks to preview or recommendation. **Machine proof:** paired isolation
tests. **Human proof:** cycle 3. **Compatibility:** V1 info model untouched.
**Trade-off:** authored evidence. **Dependencies:** 2,3. **Unlocks:** 5,9,10.

### 8. Persistent consequence prototype

**Player hypothesis:** concrete history creates ownership and recovery drama.
**Scope:** concrete discriminated Kestrel exposure, promise, preparation,
investment, and opportunity records with authored per-ID progression and
provenance. **Out:** universal meter, generic lifecycle framework, or inevitable
death spiral. **Inputs/outputs:** orders/world → persistent records. **Owner:** sim/shared. **Positive:** external
shock differs from player-conditioned severity. **Reject:** causal text calls an
external event player-caused; no recovery path. **Machine proof:** lifecycle and
recovery tests. **Human proof:** consequence review. **Compatibility:** V1 state
unchanged. **Trade-off:** five concrete records; generalise only after two uses.
**Dependencies:** 3,6,7. **Unlocks:** 9,10.

### 9. Institutional capability prototype

**Player hypothesis:** building Lattice makes a strategy feel owned. **Scope:**
three protected advances and task-collection action. **Out:** numeric bonus or
generic tech tree. **Inputs/outputs:** investment → legal new intelligence action.
**Owner:** sim/content. **Positive:** matured Lattice changes legal action/info.
**Reject:** it only modifies a score. **Machine proof:** reachability/action-space
tests. **Human proof:** cycle 4. **Compatibility:** V1 programmes untouched.
**Trade-off:** one capability. **Dependencies:** 7,8. **Unlocks:** 10,14.

### 10. Six-turn prototype content

**Player hypothesis:** authored pressure can generate different viable plans.
**Scope:** Kestrel/Ravellan opening, agenda, conflicts, branches, final crisis.
**Out:** additional scenarios/doctrine depth/final prose expansion. **Inputs/outputs:**
contracts → validated content. **Owner:** content. **Positive:** three viable
routes and no universal final answer. **Reject:** generic meters or a doomed
seed. **Machine proof:** content/reachability tests. **Human proof:** slice.
**Compatibility:** registry V1 scenarios unchanged. **Trade-off:** one fiction.
**Dependencies:** 4–9. **Unlocks:** 11–15.

### 11. Headless six-turn campaign execution

**Player hypothesis:** rapid deterministic runs protect the playable experiment.
**Scope:** V2 headless runner and complete replay. **Out:** browser dependency.
**Inputs/outputs:** V2 session/order policy → terminal record. **Owner:** headless.
**Positive:** all valid authored routes run/replay. **Reject:** auto-accepting
illegal orders. **Machine proof:** compiled headless test. **Human proof:** none.
**Compatibility:** V1 CLI preserved. **Trade-off:** text-first. **Dependencies:** 10.
**Unlocks:** 14,15.

### 12. Command Room UI

**Player hypothesis:** a small agenda makes command-by-exception legible.
**Scope:** intent, issue, reasons, legal dispositions, revision-safe actions.
**Out:** packet/chiefs-stage recreation or UI rules. **Inputs/outputs:** server
agenda → authoritative orders. **Owner:** web. **Positive:** every legal choice
is keyboard operable. **Reject:** stale preview/order commit or best score.
**Machine proof:** web/accessibility tests. **Human proof:** slice. **Compatibility:**
existing V1 client remains available. **Trade-off:** plain text. **Dependencies:** 5,10,11.
**Unlocks:** 15,16.

### 13. Consequence Reveal UI

**Player hypothesis:** causal reveal creates anticipation. **Scope:** visible
causal beats, provenance, next uncertainty. **Out:** hidden truth reveal or
cinematic polish. **Inputs/outputs:** authoritative result → derived view.
**Owner:** web. **Positive:** external cause and player-conditioned impact differ.
**Reject:** presentation infers hidden posture. **Machine proof:** component tests.
**Human proof:** slice. **Compatibility:** V1 after-action intact. **Trade-off:**
plain-text presentation. **Dependencies:** 8,10,11. **Unlocks:** 15,16.

### 14. Headless strategy/balance laboratory

**Player hypothesis:** avoid shipping a solved or impossible experiment.
**Scope:** stated policy cohort and diagnostic report. **Out:** automated fun
claim/oracle as player behavior. **Inputs/outputs:** seed/policy → balance report.
**Owner:** headless. **Positive:** detects dominance and recovery failure.
**Reject:** oracle path feeds staff recommendation. **Machine proof:** deterministic
cohort tests. **Human proof:** none. **Compatibility:** V1 batch retained.
**Trade-off:** authored policies. **Dependencies:** 9–11. **Unlocks:** 17.

### 15. Browser E2E vertical slice

**Player hypothesis:** authoritative browser play preserves the tested loop.
**Scope:** six-cycle E2E and stale-write/hidden-info hostile paths. **Out:**
fun certification. **Inputs/outputs:** browser actions → server/replay record.
**Owner:** web/server QA. **Positive:** intent-to-reckoning works. **Reject:**
UI bypasses server/replay. **Machine proof:** Playwright plus replay. **Human
proof:** none. **Compatibility:** V1 E2E remains. **Trade-off:** one golden
slice plus hostile variants. **Dependencies:** 12,13. **Unlocks:** 16,17.

### 16. Human playtest harness

**Player hypothesis:** structured observation reveals fun failures honestly.
**Scope:** facilitation protocol and anonymised evidence format. **Out:** tutorial
or AI evaluations. **Inputs/outputs:** real player run → evidence. **Owner:**
POTATO docs. **Positive:** captures causal understanding and replay desire.
**Reject:** leading tester to a strategy. **Machine proof:** documentation lint.
**Human proof:** protocol usability only. **Compatibility:** none. **Trade-off:**
qualitative evidence. **Dependencies:** 12,13,15. **Unlocks:** 17.

Run one explicitly non-gating formative human smoke on the headless six-cycle
text slice after #11. It may falsify the loop and route remediation, but cannot
pass #17 or replace the full protocol.

### 17. Human V2 fun gate

**Player hypothesis:** only real players can validate voluntary re-engagement.
**Scope:** evaluate collected evidence against [[40-EVALUATION-CONTRACT]].
**Out:** implementation expansion/AI sign-off. **Inputs/outputs:** anonymised
studies → pass/fail/remediation decision. **Owner:** human product owner.
**Positive:** evidence demonstrates ownership, causal understanding, planning,
emotion, and replay desire. **Reject:** CI/agent report counted as evidence.
**Machine proof:** none. **Human proof:** mandatory. **Compatibility:** none.
**Trade-off:** slower gate. **Dependencies:** 14–16. **Unlocks:** only a
human-authorised next product phase.
