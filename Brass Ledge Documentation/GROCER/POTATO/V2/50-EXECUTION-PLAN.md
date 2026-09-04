---
type: v2-execution-plan
status: active
---

# V2 Execution Plan

Backlink: [[README]]

This file owns dependency order and gates. Exact mechanics live in numbered contracts/issues. If sequencing differs, this plan controls; for mechanic authority use [[README]].

# Core chain

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

Do not begin downstream gameplay merely because predecessor code exists. Dependency clears only when predecessor truthfully closes under its own review/test contract.

# #100 special architecture gate

#99 is now committed at `0.4.0-prototype`.

#100 has inspected that committed replay lifecycle and deliberately uses **pure derived readout**:

```text
ravellan-decision CN
→ derive HQ intelligence
→ agenda/recommendation/projection
→ command-set CN
```

For #100 specifically:

- no persisted HQ belief/evidence state;
- no new ledger discriminator;
- no revision increment for intelligence;
- no ruleset-version bump;
- no migration;
- no derivation from unverified imported history.

[[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] is the exact implementation seam.

Do **not** generalise this into “downstream V2 never needs system transitions.” #101/#102 genuinely persist campaign/capability truth and must independently choose replay-safe integration under [[30-ARCHITECTURE-CONTRACT]].

# Why lab/smoke precede browser

After #104, complete loop exists in replay-valid plain text.

#107 first rejects structural failures such as:

- doomed/unfair seed;
- invalid all-Delegate package;
- fake/player-safe dominated choice;
- false dominance ignoring intervention cost;
- assessment/warning/public-case conflation;
- historical intelligence using current state;
- omniscient routine coverage / narrative prose leaking analysis;
- mandatory/cosmetic or globally dominated Lattice target;
- worthless information;
- unreachable recovery/policy path;
- issue-order-dependent state/signals;
- contradictory/dead observations;
- identical strategy families;
- empty/dominated/universal terminal route;
- trivial snowball.

Then 3-player smoke tests the experiential loop. Stop/redesign before browser if it falsifies causality/comprehension/desire to continue.

# Authority map

| Work | Primary authority |
| --- | --- |
| Product loop / six-cycle story | [[00-NORTH-STAR]], [[10-GAMEPLAY-CONTRACT]], [[20-VERTICAL-SLICE]], [[21-KESTREL-SIX-CYCLE-CANON]] |
| #99 adversary | [[22-RAVELLAN-EXECUTABLE-POLICY]] + closed issue #99 evidence |
| #100 HQ intelligence | [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], [[30-ARCHITECTURE-CONTRACT]], [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] |
| #98 recommendations | [[24-STAFF-RECOMMENDATION-POLICY]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #101 consequences/attribution state | [[25-KESTREL-CONSEQUENCE-MATRIX]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]], [[30-ARCHITECTURE-CONTRACT]] |
| #102 Lattice | [[26-LATTICE-COLLECTION-MATRIX]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], [[30-ARCHITECTURE-CONTRACT]] |
| #103 content | [[21-KESTREL-SIX-CYCLE-CANON]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[26-LATTICE-COLLECTION-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[36-KESTREL-AGENDA-COURSE-MATRIX]], [[37-RAVELLAN-WORLD-EFFECT-MATRIX]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| Replay/version integration | [[10-GAMEPLAY-CONTRACT]], [[30-ARCHITECTURE-CONTRACT]] |
| #104 headless | [[33-HEADLESS-SIX-CYCLE-EXECUTION]] plus mechanic authorities above |
| #107 lab | [[31-HEADLESS-DESIGN-LAB]], [[40-EVALUATION-CONTRACT]], [[23-HQ-BELIEF-AND-EVIDENCE]], [[26-LATTICE-COLLECTION-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #105 Command Room | [[28-COMMAND-ROOM-INTERACTION-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[27-KESTREL-TERMINAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #106 Reveal | [[29-CONSEQUENCE-REVEAL-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[25-KESTREL-CONSEQUENCE-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #108 E2E | [[34-BROWSER-E2E-CONTRACT]], [[38-PLAYER-SAFE-PROJECTION-CONTRACT]], [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]], [[27-KESTREL-TERMINAL-MATRIX]], [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] |
| #109 protocol | [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |
| #110 human gate | [[40-EVALUATION-CONTRACT]], [[35-HUMAN-PLAYTEST-HARNESS]], [[80-HUMAN-PLAYTESTS]] |

[[32-POST-GATE-GAME-ARCHITECTURE]] is never implementation authority before human #110 pass + explicit next-phase authorisation.

# Per-issue machine closure

A machine-owned issue closes only when:

- exact positive/rejection cases implemented;
- focused tests pass;
- persisted/replay changes, if any, have trusted recomputation/tamper proof;
- V1 isolation green;
- required independent reviews have no unresolved blocker;
- appropriate repository gates pass;
- commit pushed and CI/hosted status reported honestly.

For a **pure-derived** issue such as #100, closure instead requires explicit proof that no persisted/replay format changed and that derivation is deterministic/trust-boundary safe.

Do not use future issue code to conceal unmet current acceptance.

# Persisted-format rule

Any issue changing persisted V2 state/ledger/replay semantics follows [[30-ARCHITECTURE-CONTRACT]]:

1. inspect actual committed current prototype version;
2. advance next repository-consistent prototype version;
3. prove previous payload not silently reinterpreted;
4. invent no migration without authority;
5. preserve V1.

A pure-derived semantic change can still require **content identity** change even without a ruleset-format bump. #100 therefore versions/digests `kestrel-hq-belief-v1`, and #103 must incorporate that model in Kestrel's final content digest.

# Formative smoke

After #104 + #107:

- 3 fresh players;
- replay-valid plain-text slice;
- uninterrupted/non-leading;
- no hidden truth/strategy coaching.

Stop before browser if >=2/3 cannot explain major consequence, form next-command plan, or voluntarily want to continue while another command remains.

Also stop for repeated severe pattern including intelligence-as-arbitrary-guessing, omniscient-advisor perception, inability to distinguish judgement from warning when it matters, cosmetic collection targets, paperwork/trap/fairness failure.

Smoke can falsify, never pass #110.

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
- implementation needs new threshold/action family/hidden input not authorised;
- fixing lab/human failure changes product hypothesis rather than implementing it.

Record concrete conflict, options/trade-offs and reversible recommendation before changing gameplay truth.
