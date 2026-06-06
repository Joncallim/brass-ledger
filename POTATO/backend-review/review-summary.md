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

The weakest part is authority. The server exposes whole-session save/import endpoints that accept client-provided `GameSession` objects after structural Zod parsing, but without proving that the state follows from the scenario and turn inputs. For a local single-player prototype this is survivable; for a real game backend, it means the client can overwrite campaign state, history, trust, replay records, and outcome.

## Highest Priority Findings

| ID | Severity | Finding | Area |
| --- | --- | --- | --- |
| [[findings/F-001-client-save-overwrites-authoritative-state\|F-001]] | P1 | `/api/sessions/:id/save` accepts whole client sessions as authoritative | Persistence/API |
| [[findings/F-002-import-accepts-forged-sessions\|F-002]] | P1 | Import accepts forged but structurally valid sessions | Import/replay |
| [[findings/F-003-open-cors-local-save-mutation\|F-003]] | P1 | Open CORS allows arbitrary browser origins to mutate local saves | HTTP boundary |
| [[findings/F-005-replay-validation-assumes-history-alignment\|F-005]] | P2 | Replay validation can throw on malformed aligned-looking sessions | Replay |
| [[findings/F-006-file-store-has-lost-update-races\|F-006]] | P2 | File persistence has no optimistic concurrency control | Persistence |

## Verification

The following checks passed during review:

| Command | Result |
| --- | --- |
| `npm test` | Passed: 4/4 sim tests |
| `npm run build` | Passed: server, web, content, shared, sim |
| `npm run lint:content` | Passed: scenario validation |

## Recommended Remediation Order

1. Make the server authoritative for saves: remove or narrow `/api/sessions/:id/save`, and only persist state produced by server-side `resolveTurn` and conversation handlers.
2. Validate imports with replay reconstruction before writing imported sessions.
3. Restrict CORS to the packaged client/dev origins, or disable browser cross-origin mutation endpoints for the local server.
4. Add a session id schema and safe path resolver that rejects anything except UUID-like ids.
5. Harden replay validation against missing history entries and mismatched lengths.
6. Add revision numbers or compare-and-swap writes to prevent concurrent lost updates.
