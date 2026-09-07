# Codex handoff — #100 state-space regeneration and final closure

This is the authoritative implementation handoff for PR #111. It is not a new gameplay authority. Where generated vectors conflict with shipping executable semantics, the frozen product decision below controls the regeneration work; corrected generated artifacts become authoritative when this PR is merged.

## Frozen product decision

Shipping #99 Ravellan policy timing and 37A observation timing are authoritative.

- A coalition signal produced in cycle N is recorded in N and becomes usable by Ravellan policy beginning in N+1.
- For an observation emitted at N with lifetime L, the shipping usable interval is exactly cycles `N+1 ... N+L` inclusive.
- The independent oracle must reproduce delayed-observation semantics without importing production helpers as its expected implementation.
- Do not change production #99 or 37A merely to recover the old `257` projection count.
- Existing `257 / 4,112 / 156 / 50 / 53 / 18 / 20` values are generated artifacts. Retain any value only if the corrected executable oracle regenerates it.
- #100 production remains base-only. The test-only oracle may use frozen future #102 Lattice/liaison tables solely to exercise the full declared #100 semantic envelope; this does not authorize #102 runtime work.

Historical provenance supports this decision: shipping #99 with delayed observation semantics was committed before the later exhaustive #100 vector authority was authored. There is no earlier shipping generator to resurrect as authority.

## Non-negotiable change boundary

The following may be regenerated automatically from the corrected oracle:

- counts;
- state/history/trajectory sets;
- per-cycle reachability;
- maxima;
- hashes;
- downstream prose that only reports those generated results.

The following are **not** automatically editable merely because regenerated vectors differ:

- #99 policy semantics;
- 37A signal meanings/timing;
- #100 evidence definition IDs, implication, diagnosticity, role currency, supersession or copy;
- #102 target IDs, task/result timing, one-shot target rule, target defaults or task legality;
- player-facing product meaning, recommendation rules or terminal semantics.

If the corrected oracle falsifies a qualitative frozen product rule — for example same-target retask is no longer mechanically fake, a currently invalid evidence branch becomes reachable, a declared evidence definition becomes impossible, or focused/Lattice semantic hierarchy changes materially — stop with `BLOCKED: PRODUCT DECISION REQUIRED` and provide the exact counterexample. Do not rewrite mechanics to make the vectors tidy.

## Worktree / starting discipline

1. Fetch current `origin/main`; preserve all user-owned worktree changes. Do not reset, discard or overwrite them.
2. Work only on PR #111 / branch `fix/100-state-space-regeneration`.
3. Read the full current versions of 21, 22, 23, 23A, 23B, 23C, 23D Markdown, the 23D vector JSON, 26, 30, 37A, 38, 39, issue #100, shipping `packages/sim/src/v2.ts`, and every current #100 state-space/differential test before editing.
4. Treat `4401ac0fcad2422988e2c485c2f07af5d08e2eab` only as the pre-regeneration baseline if it remains an ancestor; never clobber later work.
5. Issue #100 must remain open until this PR satisfies the final closure evidence.

## Phase 0 — collapse to one oracle SSoT

The repo currently has multiple #100 differential/state-space test files that partially duplicate expected semantics. Do not leave competing generators after this repair.

Create or identify **one test-only independent state-space generator** as the single source of expected histories/vectors. Existing test files may consume it, but may not each maintain their own package/timing/reducer tables.

Audit at minimum:

- `v2-hq-belief-differential.test.ts`;
- `v2-hq-belief-differential-phase1.test.ts`;
- `v2-hq-belief-state-space.test.ts`.

Rewrite/remove stale duplicate expected generators where redundant. Keep focused mutation/contract tests as separate consumers if useful.

Shipping code must never import this test-only oracle.

## Phase 1 — independently prove temporal normalization and #99 policy

The current state-space harness historically fed cycle-N emissions into cycle-N Ravellan policy. Remove that error.

For cycle N:

```text
Ravellan policy input N =
  hidden posture/preparation entering N
  + observations emitted in cycles < N that remain usable at N
```

Then:

```text
resolve Ravellan decision N
→ resolve complete coalition/package effects N
→ derive/coalesce cycle-N signal emissions
→ record cycle-N observations
→ those observations are usable from N+1
```

The reference oracle independently owns:

- #99 policy rows;
- observation lifetime table;
- delayed usability;
- newest-per-signal replacement;
- contradictory same-cycle value rejection;
- 37A candidate emission/coalescing rules.

Run **two distinct differentials** before trusting downstream vectors:

1. Independent normalized policy evaluator vs production `chooseV2RavellanAction` over the complete legal policy-input domain — zero mismatches.
2. Independent temporal observation normalizer vs production `activeV2RavellanObservations` over exhaustive/representative multi-cycle observation histories covering every signal, value, age, replacement and contradiction case — zero mismatches.

Explicit hostile timing assertions:

- emission at N cannot affect decision N;
- lifetime 1 emitted at N is usable at N+1 only;
- lifetime 2 emitted at N is usable at N+1 and N+2 only;
- C5 emissions may affect C6 but never C5;
- no C6 coalition emission is created for another Ravellan decision.

## Phase 2 — rebuild the 62,208 broad raw package envelope from canon, not the stale harness

Preserve the broad envelope shape from 23B unless the canonical action/package authorities themselves prove it structurally wrong:

```text
3 opening Ravellan states
× 4 C1 public signal packages
× 9 C2 packages
× 4 C3 packages
× 3 C4 operational courses
× 48 C5 public packages
= 62,208
```

Do **not** copy the current test constants blindly. Reconstruct package semantics from 21 + 37A (and 39 where complete-package composition matters).

### Opening states

Use the three canonical opening pairs only:

- `genuine_preparation / developing`;
- `coercive_feint / none`;
- `testing / none`.

### C1

Build `2 watch × 2 partner` from 37A exact emissions.

### C2

Build `3 shipping × 3 public posture`; derive candidate emissions from the complete package and coalesce same-signal values exactly as 37A requires. Preserve exact C2 shipping course for #100 reroute evidence.

### C3

Build `2 reserve × 2 partner`; the second qualifying reserve-deployment event may emit `reserve_exhaustion_signal` in that command cycle, but the resulting observation obeys the same N→N+1 delay.

### C4

Use the three exact operational courses from 21/37A. A qualifying C4 reserve event may refresh exhaustion where 37A permits.

### C5 — rebuild carefully

The existing harness is not authority for C5 package construction. Build the broad `3 Beacon × 2 reserve × 4 authority × 2 attribution-use` semantic envelope from 21/37A:

- Beacon: visible reinforce / quiet reinforce / hold;
- reserve: keep forward / emergency consolidation;
- authority semantic outcome/course: joint-Honour / Concession / unilateral-Act / Honour-after-withdrawal-none;
- attribution flag: use / hold.

Then derive signals from the **complete package**, not from independent pre-authored observation arrays.

Required 37A package behavior includes:

- visible Beacon reinforce always yields credible coverage; consolidation does not overwrite it;
- otherwise keep-reserve-forward yields credible coverage;
- quiet reinforce + emergency consolidation yields **no new coverage**;
- quiet reinforce without that combination yields credible coverage;
- emergency consolidation otherwise yields weak coverage;
- visible reinforcement alone creates demonstrated denial;
- visible reinforcement and/or attribution use coalesce to exactly one discovery signal with the correct source semantics;
- authority produces exactly one coherent / fractured / none unity outcome;
- C5 never emits reserve exhaustion;
- package signal output is invariant to issue/order-array ordering.

Add table-driven tests for all `3 × 2 × 4 × 2 = 48` C5 packages before using them in state-space enumeration.

Actually instantiate and execute all 62,208 raw histories. Do not prove the count arithmetically.

Use the independent #99 evaluator on the reference side after Phase 1 proves it matches production.

## Phase 3 — regenerate the exact #100-relevant projection classes

Keep the **projection key schema** fixed from 23B; only its resulting count is regenerated.

For each of cycles C1–C6 include the Ravellan decision tuple:

```text
cycle
+ action
+ matched policy row
+ pre-decision posture
+ pre-decision preparation
+ post-decision posture
+ post-decision preparation
```

Then append the exact C2 shipping course.

Do not add coalition package labels, raw observation histories, source strings or unrelated command fields merely to inflate/alter `P`.

Deduplicate the 62,208 executed raw histories using that canonical key. Let the resulting count be `P`.

Do not force `257`, `628`, or any other old result.

### Projection-sufficiency proof

For every equivalence class, independently derive a semantic fingerprint from each member raw history and prove every member is equivalent for all #100-relevant source facts and every frozen full-envelope collection course.

A missing field in the projection key must fail this test rather than silently collapse semantically different histories.

Record:

- `P`;
- canonical projection-set hash;
- min/max/representative class sizes;
- representative collision examples proving why distinct raw packages collapse.

## Phase 4 — regenerate the full test-only semantic envelope with exact result timing

Production #100 remains base-only. The oracle exercises the full declared semantics with frozen #102 tables.

For each of the `P` projections enumerate:

- focused staging absent/present; and
- eight future collection courses:
  - Lattice unavailable / no liaison;
  - Lattice unavailable / C4 liaison;
  - landing → auxiliary;
  - landing → sequence;
  - auxiliary → landing;
  - auxiliary → sequence;
  - sequence → landing;
  - sequence → auxiliary.

Thus the generated schedule count is `P × 2 × 8 = P × 16`.

Implement frozen result timing exactly from 23C/26:

- C3 focused staging → C4 occurrence using verified C4 post-decision preparation;
- C4 liaison → C5 occurrence using C5 normal action/preparation;
- C4 Lattice task → C5 occurrence after the C5 normal Ravellan decision/world cut;
- C5 Lattice task → C6 occurrence using latest-normal C5/pre-manifestation facts;
- landing reads only result-cut preparation;
- auxiliary reads result-cut preparation + latest normal Ravellan action;
- sequence reads exactly the latest two verified **normal** Ravellan actions C4/C5;
- R6 terminal action/row and hidden posture are never collection inputs.

Same-target retask remains illegal and focused staging does not consume the Lattice landing target **unless the corrected oracle produces a counterexample to those qualitative product rules; if so, stop for product decision rather than changing them silently.**

## Phase 5 — regenerate every derived vector from the single oracle

Produce canonical sorted sets and deterministic SHA-256 hashes for every field represented in `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`, including at minimum:

- raw histories;
- relevant projections;
- producer schedules;
- semantic evidence histories;
- headline product trajectories;
- basis-pattern product trajectories;
- headline composite states;
- basis-pattern composite states;
- per-cycle headline states;
- per-cycle basis-pattern states;
- max evidence-history size;
- max assessment-current/public-current/warning-current occurrences;
- algebraic/reachable assessment-warning states;
- algebraic/reachable basis-pattern-warning states;
- focused-positive landing-upgrade results;
- canonical set hashes.

Run the generator twice in separate clean processes and require byte-identical vector JSON and hashes.

No generated count may survive solely because an existing document expects it.

## Phase 6 — reconcile canonical sources without laundering product changes

Update together:

1. `23B-HQ-BELIEF-STATE-SPACE-AUDIT.md`
   - describe the corrected delayed generator explicitly;
   - replace stale generated counts/hashes;
   - record that previous vectors came from same-cycle signal availability inconsistent with shipping #99/37A.
2. `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`
   - regenerate mechanically from the oracle; no hand-editing to preserve old values.
3. `23A-HQ-BELIEF-EXECUTION-ARCHITECTURE.md`
   - retain test-only frozen-#102 permission;
   - remove/update stale generated numeric references;
   - preserve production #100 vs test-only envelope separation.
4. Search the full repo for old counts/hashes and update only genuinely dependent references.

Revalidate — do not merely renumber — downstream claims in at least 26, #102/#107 planning, evaluation contracts, terminal-route audits and browser/headless E2E docs.

Important: 23B's broad envelope intentionally over-approximates later legal package reachability. Do **not** rewrite #107 legal-play conclusions merely because the broad test envelope changed. Only update a downstream semantic/legality claim if its own proof is rerun.

If a qualitative downstream assertion fails under the corrected state space (e.g. same-target retask no-op, target differentiation, previously invalid evidence branch, or a product-reachability invariant), stop for product decision.

After canonical files/tests are committed, update issue #100's stale closure-vector wording to the regenerated authority; do not leave the issue body contradicting the merged canon.

## Phase 7 — production comparison and oracle mutation tests

Expected/reference code must not import production #100 reducers/producers/content as the source of expected semantics. Production imports are comparison-only.

Compare exact canonical sets, not counts alone, for every #100-owned production output that exists today.

Mutation tests must prove the oracle catches at least:

- same-cycle signal use;
- one-cycle-too-late signal use;
- lifetime off-by-one;
- replacement/expiry error;
- C5 package-order dependence;
- incorrect quiet+emergency C5 coverage;
- dead C5 reserve-exhaustion emission;
- future-state leakage;
- wrong C4/C5 result cut;
- R6 terminal leakage;
- majority-vote reducer;
- any-contrary automatic veto;
- wrong focused currency;
- temporary supersession/resurrection;
- missing evidence definition;
- count-equal but set-different outputs;
- equal headline count but different trajectory sequence;
- projection key that collapses semantically distinct raw histories.

## Codex subagent orchestration — mandatory

Codex is the orchestrator. Exactly one writer modifies files at a time; all reviewers are read-only and work in fresh contexts. Use different underlying models where Codex supports model selection; otherwise use independent fresh subagents and explicitly record that limitation.

### Initial blind reconstruction

Before showing one reviewer the old 23B/23D numeric vectors, ask it to derive the expected generator/state-space shape from shipping #99 + 21/22 + 37A + 23C + 26 only. Compare its independently derived assumptions to the writer's oracle. This is an anti-anchoring check, not an authority override.

### Review Round A — generator correctness

At least five independent reviewers:

1. **Temporal/policy** — N→N+1, lifetime/replacement/contradiction, #99 differential.
2. **Package-composition** — especially all 48 C5 complete packages, coalescing and reserve-exhaustion rules.
3. **Combinatorics/equivalence** — 62,208 generation, projection key sufficiency, duplicates, `P × 16` expansion.
4. **Oracle independence/mutation strength** — shared-assumption contamination, hard-coded output, tests that can pass without execution.
5. **Canonical-source** — generated JSON/doc synchronization, stale references and authority leakage.

### Review Round B — intelligence/replay integration

Fresh agents, preferably different model assignments:

1. intelligence/tradecraft semantics;
2. replay/trust/future-state and R6 leakage;
3. package/API/layering/V1+#99 compatibility;
4. frozen #102 overlay timing and downstream #102/#107 boundary;
5. performance/determinism — clean-process repeatability, cache independence, stable sorting/hashes.

Every reviewer finding must include severity, exact file/function, concrete counterexample/history, violated authority, minimal remediation and regression test. Do not accept vague advice.

Only the writer remediates validated findings.

### Saturation rule

After remediation, launch fresh full rounds against the latest diff. Do not stop after one clean pass. Stop only after **two consecutive full multi-agent rounds produce zero new P0/P1/material-P2 findings** across temporal correctness, package composition, combinatorics, projection equivalence, oracle independence, intelligence semantics, replay/trust, canonical consistency, deterministic generation and downstream boundaries.

Record the role/model matrix, findings and dispositions in the PR discussion.

## Gates and final handback

After review saturation run at minimum:

```bash
npm run lint:grocer
npm run lint:content
npm run lint:assets
npm test
npm run build
npm run replay:demo
git diff --check
```

Also run the single state-space generator/oracle directly twice in clean processes and record byte-identical output/hashes.

Then:

1. fetch/rebase current `origin/main` without discarding user changes;
2. rerun affected focused tests and full gates;
3. push PR #111;
4. wait for hosted CI completion;
5. keep #100 open;
6. return for final independent ChatGPT review before merge/closure.

PR #111 must contain:

- actual 62,208 execution proof (or a structural blocker if canon itself disproves it);
- actual projection count `P` and projection-set hash;
- projection-sufficiency proof;
- actual `P × 16` schedule count;
- every regenerated evidence/state/trajectory count and hash;
- zero production/reference mismatches where production comparison applies;
- package/timing/oracle mutation-test results;
- any qualitative-invariant blocker encountered;
- subagent role/model matrix;
- two consecutive clean saturation rounds;
- full local gates;
- completed hosted CI.

Do not start #101 or #102 runtime implementation. Return the fully green, review-saturated PR for final independent review.