# PR #111 — one-pass execution override

This file controls execution cadence for `.github/CODEX-100-STATE-SPACE-REGENERATION-HANDOFF.md`. It does not change any product or technical authority in that handoff.

The projection-equivalence blocker is now resolved by `.github/CODEX-111-PROJECTION-EQUIVALENCE-DECISION.md`. Apply that decision in this same pass: the state-space quotient alpha-normalizes replay-bound occurrence IDs/origins while production replay identity remains exact and is proved separately. Resolving this blocker is not a new stopping point.

## Goal-driven execution mode

Execute PR #111 as **one continuous goal-driven pass**. Intermediate commits, partial milestones, structural consolidations, focused green tests, locally green subsets, regenerated-but-not-reconciled vectors, resolved product blockers, or review rounds that have not reached the saturation rule are checkpoints only. They are **not** valid stopping or return points.

Continue autonomously from the current head through every remaining phase of the main handoff until one of exactly three terminal conditions occurs:

1. **Closure-ready success** — vector generation is complete; canonical sources and genuinely dependent downstream references are reconciled; independent/reference comparisons, semantic projection-equivalence proofs, separate replay-origin/instance-ID proofs and mutation tests pass; two consecutive full fresh subagent review rounds produce zero new P0/P1/material-P2 findings; full local gates pass; the oracle is deterministic across two clean processes; the branch is rebased/pushed; hosted CI is complete and green; PR #111 contains the required closure evidence. Then return once for final independent ChatGPT review. Do not start #101/#102 runtime work.
2. **Genuine product blocker** — corrected executable evidence falsifies a frozen qualitative product rule or exposes a real contradiction that cannot be resolved from existing authority. Return only as `BLOCKED: PRODUCT DECISION REQUIRED`, with the minimal counterexample, affected authorities, options and recommendation.
3. **Unrecoverable execution blocker** — a required external/tool capability genuinely cannot be completed after reasonable in-session recovery attempts. Return the exact blocker and completed evidence. Ordinary test failures, review findings, merge conflicts that can be rebased, stale generated vectors, or implementation defects are work to remediate, not reasons to stop.

## Orchestration discipline

Codex remains the orchestrator throughout the same pass. Use subagents for independent investigation/review while one writer owns mutations. When a subagent finds a valid defect, remediate it, add/strengthen the regression proof, then continue to the next handoff phase without asking the user to resume the task.

Do not send a progress-style final response such as “structural consolidation is pushed but vectors/reviews remain.” Progress may be recorded as PR comments/commits, but the user-facing return should occur only at one of the three terminal conditions above.

The definition of done is the merge/closure evidence in the main handoff plus the semantic/replay identity split in the projection-equivalence decision, not the completion of any single phase, blocker resolution or commit.