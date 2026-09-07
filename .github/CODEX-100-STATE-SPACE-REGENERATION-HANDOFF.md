# Codex handoff — #100 state-space regeneration and final closure

This is an implementation handoff for the active repair branch. It is not a new gameplay authority. Where generated vectors conflict with shipping executable semantics, the product decision below controls the regeneration work and the corrected canonical documents produced by this PR become authoritative when merged.

## Frozen product decision

Shipping #99 Ravellan policy timing and 37A observation timing are authoritative.

- A coalition signal produced in cycle N is recorded in N and becomes usable by Ravellan policy beginning in N+1.
- The independent oracle must reproduce the same delayed-observation semantics as shipping `activeV2RavellanObservations()` without importing that helper as its expected implementation.
- Do not change production #99 or 37A merely to recover the old `257` projection count.
- Existing `257 / 4,112 / 156 / 50 / 53 / 18 / 20` numbers are generated artifacts. Retain any value only if the corrected executable oracle regenerates it.
- #100 production remains base-only. The test-only oracle may continue using frozen future #102 Lattice/liaison tables solely to exercise the full declared #100 semantic envelope; this does not authorize #102 runtime work.

Historical provenance supports this decision: shipping #99 with delayed observation semantics was committed before the later exhaustive #100 vector authority was authored. There is no earlier shipping generator to resurrect as authority.

## Worktree / starting discipline

1. Fetch current `origin/main` and preserve all user-owned worktree changes. Do not discard, reset, or overwrite them.
2. Work only on this PR branch.
3. Read the full current versions of 23, 23A, 23B, 23C, 23D Markdown, the 23D vector JSON, 26, 37A, 30, 38, issue #100, shipping `packages/sim/src/v2.ts`, and all #100 state-space/differential tests before editing.
4. Treat `4401ac0fcad2422988e2c485c2f07af5d08e2eab` as the pre-regeneration implementation baseline only if it remains an ancestor of current main; do not clobber later work.

## Phase 1 — repair the independent history generator

The current failing harness has historically fed each cycle's coalition package into that same cycle's Ravellan decision. Remove that error.

For cycle N:

```text
Ravellan policy input N =
  hidden posture/preparation entering N
  + observations generated in cycles < N that remain usable at N
```

Then:

```text
resolve Ravellan decision N
→ resolve coalition/package effects N
→ record cycle-N signals
→ those signals become policy-usable from N+1
```

The reference oracle must independently encode #99 policy, 37A signal generation, observation lifetime, delay, replacement and contradiction semantics. First differentially prove the independent #99 evaluator against production `chooseV2RavellanAction` over the complete legal policy-input domain. Require zero mismatches before trusting any downstream vector.

## Phase 2 — enumerate the actual 62,208 broad histories

Preserve the authored raw command/package envelope unless executable enumeration proves a structural error:

```text
3 opening Ravellan postures
× 4 C1 packages
× 9 C2 packages
× 4 C3 packages
× 3 C4 courses
× 48 C5 packages
= 62,208
```

Actually instantiate and execute all 62,208 histories. Do not prove this with arithmetic alone.

Each history must execute exact #99 policy with the delayed signal rule. Preserve the exact C2 shipping course because `reroute-and-monitor` is #100-evidence-relevant.

## Phase 3 — regenerate #100-relevant projection equivalence classes

Derive the canonical #100-relevant history projection from each executed raw history. It must contain only fields that can affect #100 intelligence production, including the complete six-cycle Ravellan decision sequence and the exact C2 shipping course, using the narrowest current 23B/23C semantics.

Deduplicate canonical projections and let the resulting number be `P`.

Do not hard-code or force `257`, `628`, or any other prior result. Print representative equivalence collisions and deterministic hashes so the projection key itself is auditable.

## Phase 4 — regenerate the full test-only semantic envelope

Keep the previously selected full-envelope test strategy while leaving production #100 base-only.

For each of the `P` relevant projections enumerate:

- focused staging absent/present; and
- eight frozen future collection courses:
  - Lattice unavailable / no liaison;
  - Lattice unavailable / C4 liaison;
  - landing → auxiliary;
  - landing → sequence;
  - auxiliary → landing;
  - auxiliary → sequence;
  - sequence → landing;
  - sequence → auxiliary.

Thus schedule count is generated as `P × 2 × 8 = P × 16`. Same-target retask remains illegal. Focused staging does not consume the Lattice landing target. Frozen #102 tables remain test-only.

## Phase 5 — regenerate every derived vector

From the corrected independent generator, produce canonical sorted sets and deterministic SHA-256 hashes for:

- semantic evidence histories;
- headline product trajectories;
- basis-pattern product trajectories;
- headline composite states;
- basis-pattern composite states;
- per-cycle headline states;
- per-cycle basis-pattern states;
- maximum evidence-history size;
- maximum assessment-current/public-current/warning-current occurrence counts;
- warning gain/refresh/loss transitions;
- focused-positive landing upgrade results;
- all other fields currently stored in `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`.

Run the generator twice in clean processes and require byte-identical generated vectors and hashes.

Do not preserve any old generated number merely because downstream docs currently cite it.

## Phase 6 — reconcile canonical sources in this PR

Update the canonical sources together so there is no remaining split-brain authority:

1. `23B-HQ-BELIEF-STATE-SPACE-AUDIT.md`
   - describe the corrected delayed generator explicitly;
   - replace all stale generated counts/hashes;
   - document why the old vectors were regenerated: the former oracle used same-cycle signal availability contrary to shipping #99/37A.
2. `23D-HQ-BELIEF-STATE-SPACE-VECTORS.json`
   - regenerate from executable output; no hand-massaging.
3. `23A-HQ-BELIEF-EXECUTION-ARCHITECTURE.md`
   - preserve the test-only frozen-#102 permission;
   - remove stale exact values if changed;
   - keep production #100 vs test-only envelope separation explicit.
4. Search the entire repository for every old #100 vector/count/hash and update only semantically dependent references. Check at minimum #102, #107, evaluation contracts, execution plan, headless/browser E2E contracts, terminal-route audits and issue #100.

Do not replace unrelated numeric occurrences mechanically.

## Phase 7 — compare independent reference against production where production exists

The expected/reference path must not import production #100 reducers/producers/content as its source of expected semantics. Production may be imported only for comparison.

Compare exact canonical sets, not counts alone, for all #100-owned production outputs that can be exercised today. Add mutation tests proving the oracle fails for:

- same-cycle signal use;
- one-cycle-too-late signal use;
- future-state leakage;
- wrong observation lifetime;
- majority-vote reducer;
- any-contrary automatic veto;
- wrong focused evidence currency;
- temporary supersession/resurrection;
- missing evidence definition;
- count-equal but set-different output;
- trajectory-equal-count but different sequence.

## Codex subagent orchestration — mandatory

Use Codex as orchestrator. One writer at a time; all reviewers are read-only. Use genuinely separate subagents/fresh contexts, and different available models where Codex can select them.

### Round A — generator correctness

Run at least four independent subagents:

1. **Temporal/policy reviewer** — attack N→N+1 timing, observation lifetimes, ordering and #99 reproduction.
2. **Combinatorics/equivalence reviewer** — attack 62,208 generation, projection key completeness/minimality, duplicates and schedule expansion.
3. **Oracle-independence reviewer** — attack shared assumptions/import contamination, hard-coded counts and mutation-test weakness.
4. **Canonical-source reviewer** — attack stale vector references, authority divergence and mismatched generated hashes.

Validate every finding against executable evidence/canonical semantics. Only the writer remediates.

### Round B — intelligence/replay integration

Fresh subagents, preferably with different model assignments:

1. intelligence/tradecraft semantics;
2. replay/trust/future-state leakage;
3. package/API/layering/V1+#99 compatibility;
4. downstream #102/#107 test-only/runtime boundary.

### Saturation rule

After remediation, rerun fresh full rounds on the latest diff. Do not stop after one clean round. Stop only after **two consecutive full multi-agent rounds produce zero new P0/P1/material-P2 findings** across temporal correctness, combinatorics, oracle independence, intelligence semantics, replay/trust, canonical-source consistency and downstream boundaries.

Record the subagent role/model matrix and findings in the PR discussion. If Codex cannot choose distinct underlying models, still use fresh independent agents and explicitly record that limitation; do not pretend they were different models.

## Gates and closure

After review saturation, run at minimum:

```bash
npm run lint:grocer
npm run lint:content
npm run lint:assets
npm test
npm run build
npm run replay:demo
git diff --check
```

Run the regenerated state-space oracle directly twice in clean processes and record the exact final counts and hashes.

Then rebase current `origin/main`, rerun affected focused/full gates, push this PR branch and wait for hosted CI. Do not merge/close #100 until CI is completed successfully and the PR contains:

- actual raw-history count;
- actual relevant projection count `P`;
- actual full schedule count `P × 16`;
- every regenerated evidence/state/trajectory count and hash;
- zero production/reference mismatches where comparison applies;
- mutation-test results;
- subagent review rounds/model matrix;
- two consecutive clean saturation rounds;
- full local and hosted gates.

Do not start #101 or #102 runtime work. Return for final independent ChatGPT review after the PR is fully green and review-saturated.