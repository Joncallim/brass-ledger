---
type: backend-review-summary
reviewed_on: 2026-06-06
status: complete
tags:
  - backend-review
  - summary
---

Backlink: [[POTATO]]


# Review Summary

## Executive Read

The backend is compact and understandable. The strongest part is the deterministic simulation core: `resolveTurn` validates memo selections, advances state through a consistent pipeline, emits replay hashes, and has basic determinism tests. The content package also validates scenario identity, memo/program references, and event uniqueness.

The previous weakest part was authority: whole-session save/import endpoints accepted client-provided `GameSession` objects after structural Zod parsing. The hardened server now disables whole-session client saves, validates imports against canonical scenario state plus replay reconstruction, restricts CORS to known development origins, rejects non-UUID save ids, and serializes per-session mutating handlers.

## Highest Priority Findings

| ID | Severity | Status | Finding | Area |
| --- | --- | --- | --- | --- |
| [[findings/F-001-client-save-overwrites-authoritative-state\|F-001]] | P1 | Closed | `/api/sessions/:id/save` is disabled by default | Persistence/API |
| [[findings/F-002-import-accepts-forged-sessions\|F-002]] | P1 | Closed | Import requires canonical scenario state and clean replay validation | Import/replay |
| [[findings/F-003-open-cors-local-save-mutation\|F-003]] | P1 | Closed | CORS defaults to known dev origins only | HTTP boundary |
| [[findings/F-005-replay-validation-assumes-history-alignment\|F-005]] | P2 | Closed | Replay validation reports history length mismatches without throwing | Replay |
| [[findings/F-006-file-store-has-lost-update-races\|F-006]] | P2 | Closed | Per-session mutation locks serialize local read-modify-write handlers | Persistence |

## Verification

The following checks passed during review:

| Command | Result |
| --- | --- |
| `npm test` | Passed: 4/4 sim tests |
| `npm run build` | Passed: server, web, content, shared, sim |
| `npm run lint:content` | Passed: scenario validation |

## Remaining Remediation Order

1. Add schema-level range invariants for persisted/imported game metrics.
2. Harden static asset path handling with a boundary check that accounts for sibling path prefixes.
3. Add HTTP route tests for CORS, disabled whole-session save, import rejection, replay validation, and session id validation.
4. Add durable revision metadata if the file save store ever becomes multi-process or networked.
