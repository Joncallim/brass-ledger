---
type: backend-review-note
reviewed_on: 2026-06-07
tags:
  - backend-review
  - verification
---

Backlink: [[POTATO]]


# Test And Verification

## Commands Run

| Command | Result |
| --- | --- |
| `npm test` | Passed |
| `npm run build` | Passed |
| `npm run lint:content` | Passed |
| `npm run lint:potato` | Passed |

## Existing Test Coverage

`packages/sim/src/index.test.ts` currently covers:

- deterministic `resolveTurn` output for identical selections
- turn advancement plus burden/chief-position emission
- chief trust effect on future positions
- multi-stage chief conversation progression and trust deltas
- replay validation reporting history length mismatches without throwing
- schema rejection for out-of-range persisted campaign metrics
- schema rejection for divergent `state.strategic` mirror fields

`apps/server/src/index.test.ts` currently covers:

- CORS allowlist behavior
- disabled whole-session save endpoint
- invalid session id rejection on save
- resolve-turn persistence, replay validation, revision increment, and stale `expectedRevision` rejection
- chief conversation open/respond revision increments and stale response rejection
- import rejection for forged scenario identity and acceptance of replayable exports
- replay endpoint validation
- delete endpoint removal and missing-session readback
- static client shell serving and traversal-style static lookup rejection

## Coverage Gaps

- No replay corruption tests for forged current state, altered initial state, altered replay hash, or extra history.
- No concurrency tests for simultaneous resolve/conversation requests.
- No persistence tests around malformed save files in `GET /api/sessions`.

## Suggested Tests

- Route-level Fastify injection tests for malformed persisted save handling.
- Replay validator tests for missing `history[index]`, extra history, altered replay hash, altered `state`, altered `initialState`, and terminal campaigns.
- File-store tests for invalid save skipping and storage-level compare-and-swap if the persistence layer becomes multi-process.
