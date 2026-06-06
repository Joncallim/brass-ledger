---
type: backend-review-summary
reviewed_on: 2026-06-07
status: complete
tags:
  - backend-review
  - summary
---

Backlink: [[POTATO]]


# Review Summary

## Executive Read

The backend is compact and understandable. The strongest part is the deterministic simulation core: `resolveTurn` validates memo selections, advances state through a consistent pipeline, emits replay hashes, and has basic determinism tests. The content package also validates scenario identity, memo/program references, and event uniqueness.

The previous weakest part was authority: whole-session save/import endpoints accepted client-provided `GameSession` objects after structural Zod parsing. The hardened server now disables whole-session client saves, validates imports against canonical scenario state plus replay reconstruction, restricts CORS to known development origins, rejects non-UUID save ids, serializes per-session mutating handlers, and persists revision metadata for authoritative mutations.

## Highest Priority Findings

| ID | Severity | Status | Finding | Area |
| --- | --- | --- | --- | --- |
| [[findings/F-001-client-save-overwrites-authoritative-state\|F-001]] | P1 | Closed | `/api/sessions/:id/save` is disabled by default | Persistence/API |
| [[findings/F-002-import-accepts-forged-sessions\|F-002]] | P1 | Closed | Import requires canonical scenario state and clean replay validation | Import/replay |
| [[findings/F-003-open-cors-local-save-mutation\|F-003]] | P1 | Closed | CORS defaults to known dev origins only | HTTP boundary |
| [[findings/F-005-replay-validation-assumes-history-alignment\|F-005]] | P2 | Closed | Replay validation reports history length mismatches without throwing | Replay |
| [[findings/F-006-file-store-has-lost-update-races\|F-006]] | P2 | Closed | Per-session mutation locks serialize local read-modify-write handlers | Persistence |
| [[findings/F-007-save-schema-lacks-game-invariant-ranges\|F-007]] | P2 | Closed | Persisted campaign metrics are range-bounded and state mirrors are checked | Schema/invariants |
| [[findings/F-008-static-asset-prefix-check-is-fragile\|F-008]] | P3 | Closed | Static assets use relative path containment instead of string prefix checks | Static assets |

## Verification

The following checks passed during review:

| Command | Result |
| --- | --- |
| `npm test` | Passed: 8/8 server route tests and 7/7 sim tests |
| `npm run build` | Passed: server, web, content, shared, sim |
| `npm run lint:content` | Passed: scenario validation |
| `npm run lint:potato` | Passed: 33 notes |

## Remaining Remediation Order

1. Expand HTTP route tests around malformed persisted files and deeper replay corruption variants.
2. Add storage-level compare-and-swap if the file save store ever becomes multi-process or networked.
