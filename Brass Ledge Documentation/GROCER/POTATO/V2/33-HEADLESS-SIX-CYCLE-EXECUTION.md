---
type: v2-headless-execution-contract
status: active
---

# Headless Six-Cycle Execution Contract

Backlink: [[README]]

This is the implementation authority for **#104 — complete replay-valid Kestrel execution without browser dependency**. It owns orchestration only. Game rules remain in shared/sim/content under [[30-ARCHITECTURE-CONTRACT]].

# Purpose

Headless exists so the complete six-cycle game can be executed deterministically, replay-verified, exercised by [[31-HEADLESS-DESIGN-LAB]], inspected through a belief-safe transcript, and later used for the 3-player non-gating smoke.

It calls the same authoritative transitions/derived readouts later used by server/browser. It is never a simplified second game implementation.

# Inputs

A run receives:

- resolved canonical V2/Kestrel content identity;
- canonical parsed `V2HqBeliefModelDefinition` for `kestrel-hq-belief-v1`;
- campaign seed;
- one valid immutable standing direction;
- command provider receiving only normal player-safe current projection;
- optional non-authoritative test/run-control metadata.

The normal provider never receives hidden world/Ravellan state, raw adversary observations, private ledger, #100 source facts, internal assessment enums, oracle-frontier state or future branches.

The supplied HQ-belief model is trusted resolved content. Headless does not invent/patch it.

# Player-safe headless projection

Use [[38-PLAYER-SAFE-PROJECTION-CONTRACT]]. Before browser DTO exists, expose only equivalent safe semantics:

- cycle/revision;
- situation/change;
- standing direction;
- bounded Intelligence-Chief brief from #100:
  - one judgement;
  - bounded basis/contrary facts;
  - key gap/watch-for;
  - separate safe tactical-warning wording where material;
- public Kestrel state/known commitments;
- agenda, responsible officer, recommendation/reasons/dissent;
- legal alternatives/personal-attention cost;
- safe cross-issue requirements;
- eligible Task Collection / commander-only liaison where legal;
- safe C6 crisis + only [[27-KESTREL-TERMINAL-MATRIX]] routes.

Never expose hidden posture/preparation/action/signal records, #100 source facts, internal weak/conflicted/coherent or diagnosticity/public-case enums, oracle state, future outcomes or best-option score.

# Canonical execution

## Opening

1. resolve trusted ruleset/content identity + parsed Kestrel HQ-belief model;
2. create canonical V2 initial state including #99 Ravellan state;
3. persist/verify initial digest;
4. apply standing intent;
5. enter C1.

## C1–C5

For each cycle:

1. execute authoritative Ravellan/system transition in canonical ledger order;
2. execute any due persisted consequence/capability transitions required by later implemented issues;
3. **derive #100 HQ intelligence purely** from the trusted session + supplied belief model at the current pre-command point;
4. append any later #102 authorised derived evidence through the narrow sim-owned extension seam before #100 reducers, never by mutating a saved belief snapshot;
5. build agenda;
6. derive staff recommendation/reason/dissent using only authorised #100 products/public state;
7. produce safe player projection;
8. call command provider exactly once for that command window;
9. sim derives delegated final orders + validates complete package;
10. invalid/stale/incomplete/incompatible package fails — no repair;
11. execute authoritative order/consequence/capability/reverse-signal transitions;
12. every persisted mutation is replay-verifiable under [[30-ARCHITECTURE-CONTRACT]];
13. derive belief-safe consequence transcript;
14. advance to next cycle.

Preserve explicit system/player ledger entries required by simulator. Do not invent a synthetic “HQ-belief update” transition.

## #100 phase safety

After a command advances `state.cycle` to N+1 but before `ravellan-decision N+1`, #100 current belief is not ready.

Headless must not render the next Command Room/brief in that intermediate state. It waits for the canonical next Ravellan/system phase.

A direct current-belief query there should surface the dedicated not-ready error rather than relabeling the previous brief.

## C6

1. execute authoritative Ravellan terminal decision;
2. derive #100 C6 historical/current intelligence with supplied belief model;
3. project safe overt crisis family;
4. derive only routes legal under [[27-KESTREL-TERMINAL-MATRIX]] — including the separate #100 warning product;
5. obtain one legal final player course;
6. apply terminal state effects/resolution;
7. produce classification + two-layer debrief;
8. persist final canonical state/digest;
9. complete trusted replay verification.

No C6 Task Collection.

# #100 purity / determinism

HQ evidence/assessment/warning/public-case basis are **not authoritative persisted run state**.

Headless determinism includes:

- repeated derived HQ snapshots/briefs from the same trusted session + same belief model are deep-equal;
- deriving them does not change revision/state hash/final digest;
- final-session digest does not contain a duplicate #100 belief history;
- historical transcript/debrief can reconstruct past #100 briefs exactly from canonical ledger + model.

When reporting a run's “HQ intelligence history,” mean derived historical readout, not a saved mutation log.

# Command-provider authority

Provider returns player authority only:

- one disposition per agenda issue;
- intervention order ID where applicable;
- legal Defer;
- legal Task Collection / commander-only liaison choice;
- final C6 route.

It does not return delegated final order IDs, recommendations, HQ evidence/assessment/warning, consequences, Ravellan actions/signals, partner-authority result or outcome.

Untouched all-Delegate package must be legal. If not, recommendation/content is defective.

# Invalid provider

Fail with structured cycle/issue/package error. Preserve last verified canonical state.

Never silently Delegate, alter another issue, sample another action, or mutate provider output into legality.

# Determinism / replay

Identical content identity, **identical belief-model definition**, seed, standing intent and deterministic provider outputs must produce identical:

- authoritative ordered ledger;
- derived HQ historical snapshots/briefs;
- Ravellan history/signals;
- persistent consequences;
- final post-route state/digest/classification.

Every successful run passes normal trusted replay for persisted truth. #100 derived readout is then recomputed from that replay-valid history + identical semantic model.

# Transcript

Per cycle show:

- situation/change;
- bounded HQ judgement/basis/gap/watch-for;
- tactical warning distinctly where material;
- staff intended action/reasons/dissent;
- legal alternatives/known costs/requirements;
- personal exceptions vs delegated work;
- consequence beats;
- unresolved next pressure.

Do not show internal #100 enums or evidence ledger dump.

When C5 attribution available, disclose one-shot/source cost before selection.

Terminal transcript shows post-route classification/state, then:

1. **What HQ believed** — historical #100 player-safe briefs including warning;
2. **What was actually happening** — terminal-only debrief truth.

No hindsight rewriting of HQ analysis.

# Batch / lab

Provide bounded programmatic API suitable for #107. Runs isolated/deterministic; counterfactual cloning belongs to lab, never mutates source history.

The lab must be able to branch/inspect derived assessment, warning and public-case basis as separate diagnostics while keeping them out of player policy inputs unless player-safe projection legitimately exposes corresponding semantics.

# Human-smoke sequencing

`#104 complete → #107 complete → 3-player smoke → continuation/redesign → #105/#106`

Headless adds no coaching, preferred-strategy hints or hidden truth.

# Required #104 tests

At minimum prove:

- complete C1→C6 run + trusted replay;
- at least one replayable run per Ravellan opening posture;
- same canonical inputs/model/provider → same authoritative ledger/final digest and same derived Intel history;
- provider sees no hidden state/#100 source facts/internal model enums/oracle data;
- #100 current brief is queried only after current-cycle Ravellan decision;
- deriving #100 readout does not mutate session/hash/revision;
- preparation assessment + warning none and conflicted assessment + warning usable are transcript-representable safely;
- all-Delegate representative packages legal;
- invalid package fails rather than repaired;
- C2/C5 package/signals exact;
- C6 route uses separate warning and terminal matrix;
- terminal `What HQ believed` equals reconstructed historical safe briefs, not hindsight;
- no C6 Task Collection;
- hidden truth only terminal debrief/isolated diagnostics;
- batch deterministic;
- V1 CLI/headless green.

# Rejection conditions

Reject #104 if headless persists/duplicates HQ belief, invents `hq-belief-update`, uses an implicit content singleton inside sim/headless rules, exposes source facts/internal assessment states to normal provider, derives next-cycle brief before Ravellan phase, duplicates game rules, auto-repairs invalid packages, trusts saved state without replay, rewrites historical Intel with terminal truth, runs smoke before #107, or expands into generic orchestration.
