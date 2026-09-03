---
type: v2-execution-plan
status: active
---

# V2 Execution Plan

Backlink: [[README]]

This file owns **dependency order and gates**. Exact mechanics live in the numbered contracts/issues. If a mechanic detail differs, the detailed mechanic contract controls; if sequencing differs, this plan controls.

## Core chain

`#94 bootstrap`
→ `#95 V2 version/replay skeleton`
→ `#96 authoritative command contract`
→ `#97 standing intent`
→ `#99 Ravellan adversary`
→ `#100 HQ belief/intelligence`
→ `#98 recommendation`
→ `#101 persistent consequences`
→ `#102 Lattice capability`
→ `#103 complete Kestrel content`
→ `#104 complete headless six-cycle execution`
→ `#107 headless design laboratory`
→ **3-player non-gating formative smoke**
→ `#105 Command Room`
→ `#106 Consequence Reveal`
→ `#108 browser E2E`
→ `#109 formal study harness/readiness`
→ `#110 human fun gate`.

Do not begin a downstream gameplay issue merely because its predecessor has implementation in progress; dependency closes only after predecessor truthfully closes under its own acceptance/review/gate contract.

## Why the lab/smoke precede browser work

After #104 the complete game loop already exists in replay-valid plain text.

#107 should first reject structural failures such as:

- doomed/unfair seeds;
- invalid all-Delegate package;
- fake or player-safe dominated choices;
- mandatory/cosmetic Lattice;
- worthless information;
- unreachable promised adversary policy branches;
- issue-order-dependent state/signals;
- missing recovery;
- identical strategy families;
- universal final course;
- trivial late-game snowball.

A structurally acceptable #107 then authorises the 3-player formative smoke. If ≥2/3 hit the stop criteria in [[35-HUMAN-PLAYTEST-HARNESS]], remediate the loop before the main browser tranche.

This prevents UI polish from becoming the default answer to a mechanical failure.

## Authority map

| Work | Primary authority |
| --- | --- |
| Product loop / six-cycle story | [[00-NORTH-STAR]], [[10-GAMEPLAY-CONTRACT]], [[20-VERTICAL-SLICE]], [[21-KESTREL-SIX-CYCLE-CANON]] |
| #99 adversary | [[22-RAVELLAN-EXECUTABLE-POLICY]] |
| #100 HQ belief | [[23-HQ-BELIEF-AND-EVIDENCE]], [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]], [[30-ARCHITECTURE-CONTRACT]] |
| #98 recommendations | [[24-STAFF-RECOMMENDATION-POLICY]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #101 consequences | [[25-KESTREL-CONSEQUENCE-MATRIX]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #102 Lattice | [[26-LATTICE-COLLECTION-MATRIX]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #103 content | [[21-KESTREL-SIX-CYCLE-CANON]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| Replay/version integration | [[30-ARCHITECTURE-CONTRACT]] |
| #104 headless execution | [[33-HEADLESS-SIX-CYCLE-EXECUTION]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #107 structural lab | [[31-HEADLESS-DESIGN-LAB]], [[40-EVALUATION-CONTRACT]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #105 Command Room | [[28-COMMAND-ROOM-INTERACTION-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #106 Reveal | [[29-CONSEQUENCE-REVEAL-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[25-KESTREL-CONSEQUENCE-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #108 browser E2E | [[34-BROWSER-E2E-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #109 human protocol | [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |
| #110 human gate | [[40-EVALUATION-CONTRACT]], [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |

`32-POST-GATE-GAME-ARCHITECTURE` is never implementation authority before #110 passes and the human product owner explicitly authorises the next phase.

## Per-issue machine closure

A machine-owned issue closes only when:

- exact positive/rejection cases implemented;
- focused tests pass;
- persisted/replay changes have trusted recomputation/tamper proof;
- V1 isolation green;
- required independent reviews have no unresolved blocker;
- repository gates appropriate to touched packages pass;
- commit pushed and hosted CI status reported honestly.

Do not use a future issue's code to conceal an unmet current acceptance criterion.

## Persisted-format rule

Any issue changing persisted V2 state/ledger/replay semantics follows [[30-ARCHITECTURE-CONTRACT]]:

1. inspect actual committed current prototype version;
2. advance to next repository-consistent prototype version;
3. prove previous prototype payload is not silently reinterpreted;
4. invent no migration without explicit authority;
5. preserve V1.

#100 onward must inspect the **final committed #99 replay ordering** before selecting new ledger/system-transition integration. The design contracts freeze semantics but deliberately do not guess an insertion point against an uncommitted #99 implementation.

## Formative smoke

After #104 + #107:

- 3 fresh players;
- complete replay-valid plain-text slice;
- uninterrupted/non-leading;
- no hidden truth/strategy coaching.

If ≥2/3 cannot explain a major consequence, cannot form a next-command plan, or show no voluntary desire to continue while another command remains, stop before main browser work and open focused remediation.

This smoke can fail the hypothesis but cannot pass #110.

## Formal gate

After #108 and the approved human harness:

- 8 fresh players;
- fixed thresholds in [[40-EVALUATION-CONTRACT]];
- human product owner decides pass/fail/inconclusive.

No agent, CI run, lab, E2E or synthetic play may pass #110.

## Stop/escalate

Use `BLOCKED: PRODUCT DECISION REQUIRED` when:

- active canonical contracts genuinely contradict after applying 39;
- a required state transition cannot be replay-verifiable without materially changing the lifecycle;
- implementation needs a new threshold/action family/hidden input not authorised;
- fixing a lab/human failure requires changing the product hypothesis rather than implementing it.

Record concrete conflict, options/trade-offs and a reversible recommendation before changing gameplay truth.