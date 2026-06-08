---
type: backend-finding
id: F-007
severity: P2
status: closed
area: schema/invariants
risk: structurally valid saves can violate game ranges and mirrors
file: packages/shared/src/index.ts
line: 420
tags:
  - backend-review
  - finding/P2
---

Backlink: [[POTATO]]


# F-007 Save Schema Lacks Game Invariant Ranges

## Finding

Most game-state metrics are plain `z.number()` fields with no min/max bounds. `GameSession` also does not enforce that top-level mirror fields match `state.strategic`.

Status update: closed on 2026-06-06. Persisted campaign-state schemas now bound 0-100 index metrics, deployable-unit range, scores, turn ranges, tech progress, trust values, constraint severity, and enforce that the legacy top-level state mirrors match `state.strategic`.

## Impact

The simulation clamps many values when applying deltas, but imported or saved state can still contain impossible values before the next turn. UI summaries, session lists, exports, and replay checks may consume those values directly. Divergent mirrors can also create confusing state where `strategic.forceGeneration` and top-level `forceGeneration` disagree.

## Evidence

- `packages/shared/src/index.ts:420` defines campaign state.
- `packages/shared/src/index.ts:428` stores canonical `strategic`.
- `packages/shared/src/index.ts:430` to `435` store top-level mirrors.
- `packages/shared/src/index.ts:512` defines `GameSession` without cross-field refinements.

## Recommendation

Add domain refinements:

- bounded metric schemas for 0-100 indexes
- bounded deployable unit range
- turn range checks
- cross-field checks or canonicalization for state mirrors
- replay-validity checks before persistence for any whole-session path

If cross-field Zod refinements become too heavy, use a separate `validateGameSessionInvariants(session)` helper and call it before every write.

Implemented with schema-level bounds and a `campaignStateSchema.superRefine` mirror check. State deltas remain intentionally unbounded so memo and event effects can still express negative changes before the resolver clamps final state.
