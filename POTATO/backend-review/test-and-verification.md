---
type: backend-review-note
reviewed_on: 2026-06-06
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

## Existing Test Coverage

`packages/sim/src/index.test.ts` currently covers:

- deterministic `resolveTurn` output for identical selections
- turn advancement plus burden/chief-position emission
- chief trust effect on future positions
- multi-stage chief conversation progression and trust deltas

## Coverage Gaps

- No HTTP route tests for save, import, resolve, export, delete, CORS, or static asset serving.
- No replay corruption tests for missing history, mismatched history/input lengths, forged current state, or altered initial state.
- No concurrency tests for simultaneous resolve/conversation/save requests.
- No persistence tests around path handling and id validation.
- No schema tests for out-of-range persisted metrics.

## Suggested Tests

- Route-level Fastify injection tests for all mutation endpoints.
- Import tests that reject forged state and accept valid exported replayable sessions.
- Save endpoint tests that prove either removal or replay enforcement.
- Replay validator tests for missing `history[index]`, extra history, altered replay hash, altered `state`, altered `initialState`, and terminal campaigns.
- File-store tests for revision mismatch behavior once optimistic concurrency is added.
