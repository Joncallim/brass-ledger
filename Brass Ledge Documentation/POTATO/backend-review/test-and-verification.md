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
- S1-S5 staff readout and causal explainability emission
- S1-S5 core mechanics advancement for recovery debt, fog-of-war, executable posture, stockpile/lift, and coherence
- chief trust effect on future positions
- multi-stage chief conversation progression and trust deltas
- replay validation reporting history length mismatches without throwing
- replay validation reporting altered replay hashes, altered initial state, altered final state, and extra history
- schema rejection for out-of-range persisted campaign metrics
- schema rejection for divergent `state.strategic` mirror fields

`apps/server/src/index.test.ts` currently covers:

- CORS allowlist behavior
- disabled whole-session save endpoint
- invalid session id rejection on save
- resolve-turn persistence, replay validation, revision increment, and stale `expectedRevision` rejection
- chief conversation open/respond revision increments and stale response rejection
- import rejection for forged scenario identity and acceptance of replayable exports
- import rejection for replay-corrupted exports
- replay endpoint validation
- delete endpoint removal and missing-session readback
- malformed persisted save skipping in session lists
- simultaneous authoritative mutation conflict behavior
- static client shell serving and traversal-style static lookup rejection

## Coverage Gaps

- No terminal-campaign replay test for attempts to resolve after campaign completion.
- No storage-level compare-and-swap test because the current store is single-process and lock-backed.

## Suggested Tests

- Replay validator tests for terminal campaigns.
- File-store tests for invalid save skipping and storage-level compare-and-swap if the persistence layer becomes multi-process.
