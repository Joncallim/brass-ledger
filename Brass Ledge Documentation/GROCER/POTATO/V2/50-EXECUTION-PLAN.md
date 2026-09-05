---
type: v2-execution-plan
status: active
---

# V2 Execution Plan

Backlink: [[README]]

This file owns dependency order and gates. Exact mechanics live in numbered contracts/issues.

# Core chain

`#94 bootstrap`
→ `#95 V2 version/replay skeleton`
→ `#96 authoritative command contract`
→ `#97 standing intent`
→ `#99 Ravellan adversary`
→ `#100 HQ belief/intelligence`
→ `#101 persistent consequences and irreversible source use`
→ `#102 Lattice capability/task persistence`
→ `#98 final belief/state/capability-aware recommendation`
→ `#103 complete Kestrel content identity`
→ `#104 complete headless six-cycle execution`
→ `#107 headless design laboratory`
→ **3-player non-gating formative smoke**
→ `#105 Command Room`
→ `#106 Consequence Reveal`
→ `#108 browser E2E`
→ `#109 formal study harness/readiness`
→ `#110 human fun gate`.

Do not begin downstream gameplay merely because predecessor code exists. Dependency clears only when predecessor truthfully closes under its own review/test contract.

# Why #101/#102 precede #98

The final recommendation system must evaluate actual:

- reserve/Beacon/partner/commitment/source-use state from #101;
- Lattice maturity, used targets, due results and target defaults from #102;
- #100 assessment/warning/public-case products;
- complete C5 package feasibility.

Implementing final #98 before #101/#102 would force stubs or a second recommendation pass and would prevent trusted replay from reconstructing the real agenda.

# #100 architecture gate

#99 is committed at `0.4.0-prototype`.

#100 is a pure read model:

```text
ravellan-decision CN
→ derive HQ intelligence
→ agenda/recommendation/projection
→ command-set CN
```

For #100:

- no persisted evidence/product state;
- no new ledger discriminator/revision;
- no ruleset-version bump/migration;
- no unverified-import derivation;
- no production #102 task implementation.

Canonical authority:

- [[23-HQ-BELIEF-AND-EVIDENCE]];
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]];
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]];
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]];
- [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]];
- `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json` as the machine-readable generated/reference artifact.

# #101 architecture gate

#101 persists concrete campaign state and irreversible source-use history, but not a mutable mirror of #100 credibility.

Current attribution availability remains:

```text
current #100 public-case basis + persisted source use
```

Any new #101 persisted state/ledger/replay semantics follow the next actual prototype version, trusted recomputation/tamper rejection and V1 isolation.

# #102 architecture gate

#102 owns real replay-valid:

- Lattice progress/maturity;
- used target IDs;
- mandatory C4/C5 target selections;
- due-result queue/origins;
- liaison obligation/task truth;
- `kestrel-collection-v1` producer digest.

It produces occurrences of definitions already frozen by #100; it never persists duplicate HQ belief.

# #98 replay-provider gate

Once recommendation depends on #100 history and #101/#102 state, the trusted agenda provider may no longer receive only replay state.

#98 must evolve the in-memory provider to receive a sim-created **verified ledger-prefix context** containing only entries already re-executed successfully. It must not inspect the untrusted full imported save or future command entries.

This API evolution changes no persisted version by itself and does not weaken #99 transition ordering.

# Why #107 and smoke precede browser

After #104, the complete loop exists in replay-valid plain text.

#107 first rejects:

- doomed/unfair hidden seed;
- invalid all-Delegate package;
- fake or player-safe dominated choice;
- assessment/warning/public-case conflation;
- state-space drift from [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] / `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`;
- briefing/delta drift from [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]];
- historical intelligence using current/future state;
- universal evidence lifetime or stale-warning errors;
- omniscient routine coverage / narrative prose leakage;
- no-task or same-target fake Lattice choice;
- mandatory/cosmetic/globally dominated target order;
- worthless information;
- unreachable recovery/policy path;
- issue-order-dependent state/signals;
- contradictory/dead observations;
- identical strategies;
- empty/dominated/universal terminal route;
- trivial snowball.

Then three fresh players test experiential causality/comprehension/desire to continue. Stop/redesign before browser if smoke falsifies the loop.

# Authority map

| Work | Primary authority |
| --- | --- |
| Product loop / six-cycle story | [[00-NORTH-STAR]], [[10-GAMEPLAY-CONTRACT]], [[20-VERTICAL-SLICE]], [[21-KESTREL-SIX-CYCLE-CANON]] |
| #99 adversary | [[22-RAVELLAN-EXECUTABLE-POLICY]] + closed #99 evidence |
| #100 HQ intelligence | [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], [[23C-HQ-BELIEF-EVIDENCE-CATALOG]], [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]], `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json` |
| #101 consequences/source use | [[25-KESTREL-CONSEQUENCE-MATRIX]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]], [[30-ARCHITECTURE-CONTRACT]] |
| #102 Lattice/tasks | [[26-LATTICE-COLLECTION-MATRIX]], [[23C-HQ-BELIEF-EVIDENCE-CATALOG]], [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]], [[30-ARCHITECTURE-CONTRACT]] |
| #98 recommendation | [[24-STAFF-RECOMMENDATION-POLICY]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]], #100/#101/#102 outputs |
| #103 content identity | all mechanic authorities above, especially both #100/#102 semantic digests |
| Replay/version | [[10-GAMEPLAY-CONTRACT]], [[30-ARCHITECTURE-CONTRACT]] |
| #104 headless | [[33-HEADLESS-SIX-CYCLE-EXECUTION]] + mechanic authorities |
| #107 lab | [[31-HEADLESS-DESIGN-LAB]], [[40-EVALUATION-CONTRACT]], [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], [[23D-HQ-BELIEF-BRIEF-AND-DELTA-MATRIX]], `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`, and complete mechanic authorities |
| #105 Command Room | [[28-COMMAND-ROOM-INTERACTION-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] |
| #106 Reveal | [[29-CONSEQUENCE-REVEAL-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] |
| #108 E2E | [[34-BROWSER-E2E-CONTRACT]] + safe/terminal/package authorities |
| #109 protocol | [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |
| #110 human gate | [[40-EVALUATION-CONTRACT]], [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |

[[32-POST-GATE-GAME-ARCHITECTURE]] is never implementation authority before #110 pass + explicit next-phase authorisation.

# Per-issue machine closure

A machine-owned issue closes only when:

- exact positive/rejection cases implemented;
- focused tests pass;
- required persisted transitions replay/recompute and reject tampering;
- pure-derived issues prove no persisted drift;
- V1 isolation green;
- required independent reviews clear after remediation;
- repository gates pass;
- commit is pushed and hosted status reported honestly.

Do not use future issue code to conceal unmet current acceptance.

# Persisted-format rule

Whenever an issue changes persisted V2 state, ledger shape or replay semantics:

1. inspect actual current version;
2. advance to next repository-consistent prototype version;
3. prove previous payload is not silently reinterpreted;
4. add no migration without separate authority;
5. preserve V1.

A pure-derived semantic change still changes content identity where decision-significant. #103 binds the #100 belief-model and #102 collection-model digests.

# Formative smoke

After #104 + #107:

- 3 fresh players;
- replay-valid plain-text slice;
- uninterrupted/non-leading;
- no hidden truth/strategy coaching.

Stop before browser if >=2/3 cannot explain a major consequence, form a next-command plan or voluntarily want to continue while another command remains.

Also stop for repeated severe intelligence-as-arbitrary/omniscient, warning misunderstanding, cosmetic collection, paperwork/trap/fairness or package-comprehension failure.

Smoke can falsify; it never passes #110.

# Formal gate

After #108 + approved harness:

- 8 fresh players;
- fixed thresholds in [[40-EVALUATION-CONTRACT]];
- human product owner decides pass/fail/inconclusive.

No agent/CI/lab/E2E/synthetic play passes #110.

# Stop / escalate

Use `BLOCKED: PRODUCT DECISION REQUIRED` when:

- authority map yields genuine contradiction;
- required persisted transition cannot be replay-verifiable without lifecycle redesign;
- implementation needs a new threshold/action family/hidden input not authorised;
- fixing lab/human failure changes product hypothesis rather than implementing it.

Record concrete conflict, options/trade-offs and recommended reversible default before changing gameplay truth.
