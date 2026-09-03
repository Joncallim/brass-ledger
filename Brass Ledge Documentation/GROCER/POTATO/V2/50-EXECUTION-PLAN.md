---
type: v2-execution-plan
status: active
---

# V2 Execution Plan

Backlink: [[README]]

This file owns **dependency order and gates**, not duplicated implementation detail. Exact scope and acceptance live in the numbered canonical contracts and the matching GitHub issue bodies. If this plan and an issue's detailed implementation contract differ on mechanics, the numbered mechanic contract controls; if they differ on sequencing/gating, this plan controls.

## Core implementation chain

The bounded Kestrel prototype proceeds in this order:

`#94 bootstrap`
→ `#95 V2 version/save-replay skeleton`
→ `#96 authoritative command contract`
→ `#97 standing intent`
→ `#99 Ravellan adversary`
→ `#100 HQ belief/intelligence`
→ `#98 staff recommendation`
→ `#101 persistent consequences`
→ `#102 Lattice capability`
→ `#103 complete Kestrel content`
→ `#104 complete headless six-cycle execution`
→ `#107 headless design laboratory`
→ **3-player formative smoke**
→ `#105 Command Room`
→ `#106 Consequence Reveal`
→ `#108 browser E2E`
→ `#109 formal human-test harness/readiness`
→ `#110 human fun gate`.

One gameplay implementation issue is owned at a time unless a later explicit engineering decision authorises parallel work with non-overlapping files/authority.

## Why #107 and the formative smoke precede browser implementation

The project is testing a fun hypothesis, not trying to finish UI as quickly as possible.

After #104, we can already answer two high-value questions cheaply:

1. **Machine structure:** does the completed game contain dominance, fake choices, mandatory Lattice, doomed seeds, missing recovery, irrelevant intent or universal final answers? #107 answers this without claiming fun.
2. **Human loop smoke:** can three fresh players understand causality, form a plan and voluntarily want the next command in the plain-text slice? The authorised formative smoke answers this without passing #110.

Therefore do not spend the main UI tranche merely to discover a structural/game-loop failure that the headless slice could already expose.

If #107 finds a blocking structural defect, remediate the owning mechanics/content issue and rerun #107 before the smoke.

If at least 2/3 formative players hit the stop criteria in [[35-HUMAN-PLAYTEST-HARNESS]], stop and open focused remediation before #105/#106. Do not treat UI polish as the default cure unless the evidence shows the mechanics are understood and only presentation is failing.

## Canonical authority map

| Work | Primary authority |
| --- | --- |
| Product loop / six-cycle structure | [[00-NORTH-STAR]], [[10-GAMEPLAY-CONTRACT]], [[21-KESTREL-SIX-CYCLE-CANON]] |
| #99 adversary | [[22-RAVELLAN-EXECUTABLE-POLICY]] |
| #100 belief/intelligence | [[23-HQ-BELIEF-AND-EVIDENCE]] + cross-system corrections in [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #98 recommendations | [[24-STAFF-RECOMMENDATION-POLICY]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #101 consequences | [[25-KESTREL-CONSEQUENCE-MATRIX]] + [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #102 Lattice / liaison | [[26-LATTICE-COLLECTION-MATRIX]] + [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #103 Kestrel content/world manifestations | [[21-KESTREL-SIX-CYCLE-CANON]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| Cycle-6 route/outcome | [[27-KESTREL-TERMINAL-MATRIX]] + terminal corrections in [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| Replay/version integration | [[30-ARCHITECTURE-CONTRACT]] |
| #104 headless execution | [[33-HEADLESS-SIX-CYCLE-EXECUTION]] |
| #107 design lab | [[31-HEADLESS-DESIGN-LAB]], [[40-EVALUATION-CONTRACT]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #105 Command Room | [[28-COMMAND-ROOM-INTERACTION-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #106 reveal | [[29-CONSEQUENCE-REVEAL-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] |
| #108 browser E2E | [[34-BROWSER-E2E-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #109 human harness | [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |
| #110 human gate | [[40-EVALUATION-CONTRACT]], [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |

`[[32-POST-GATE-GAME-ARCHITECTURE]]` is not implementation authority before #110 passes and the human product owner explicitly authorises a post-gate phase.

## Per-issue closure rule

A machine-owned issue closes only when:

- its exact positive/rejection cases are implemented;
- focused tests pass;
- all touched persisted/replay semantics have trusted replay/tamper proof;
- V1 isolation remains green;
- required independent reviews have no unresolved blocking findings;
- the repository gates appropriate to the touched packages pass;
- the commit is pushed and hosted CI status is reported honestly.

No issue may use a future issue's implementation to conceal a missing acceptance criterion in its own scope.

## Persisted-format rule

Any issue that changes persisted V2 state/ledger/replay semantics follows [[30-ARCHITECTURE-CONTRACT]]:

- inspect the actual committed current prototype version;
- bump to the next repository-consistent prototype version;
- never silently reinterpret an older prototype payload;
- invent no prototype migration without explicit authority;
- preserve V1.

#100 onward must inspect the final committed #99 replay ordering before selecting any new ledger integration. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] adds cross-system semantic requirements but does not authorise guessing around an uncommitted #99 implementation.

## Human gates

### Formative smoke — after #104/#107

Three fresh players, non-gating. Use the complete replay-valid plain-text slice.

If ≥2/3 cannot explain major consequences, cannot form a next-command plan, or show no voluntary desire to continue while another command remains, stop and redesign before browser implementation.

### Formal gate — #110

Eight fresh players using the completed authoritative browser slice and [[35-HUMAN-PLAYTEST-HARNESS]]. Thresholds remain those in [[40-EVALUATION-CONTRACT]].

No AI agent, CI run, lab result, E2E suite or synthetic player can pass this gate.

## Stop conditions

At any point, implementation must stop with `BLOCKED: PRODUCT DECISION REQUIRED` rather than inventing a mechanic when:

- two active canonical contracts genuinely contradict after applying [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]];
- a required state transition cannot be made replay-verifiable without materially changing the established lifecycle;
- content needs a new threshold/action family/hidden input not already authorised;
- fixing a laboratory/human failure would require changing the product hypothesis rather than implementing the existing contract.

Record the concrete conflict, options, trade-offs and a reversible recommendation before changing gameplay truth.