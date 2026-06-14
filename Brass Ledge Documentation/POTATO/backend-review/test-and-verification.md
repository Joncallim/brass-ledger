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
- chief agenda memory persistence through turn resolution, replay validation, and future-position bias
- chief coalition output for selected memo options, staff constraints, preview parity, and negotiation levers
- multi-stage chief conversation progression and trust deltas
- replay validation reporting history length mismatches without throwing
- replay validation reporting altered replay hashes, altered initial state, altered final state, and extra history
- schema rejection for out-of-range persisted campaign metrics
- schema rejection for divergent `state.strategic` mirror fields
- S5 program commitments requiring fielded level-2 tech before fulfillment
- industry causal refs for event-driven constraint shifts

`apps/server/src/index.test.ts` currently covers:

- CORS allowlist behavior
- headless API default runs with explicit accepted-risk records
- headless API and CLI JSON output include compact chief coalition summaries
- headless API rejection for supplied turns that omit accepted-risk overrides
- chief conversation completion persisting agenda memory while preserving revision checks
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

`apps/cli/test/index.test.ts` currently covers:

- JSON headless runs recording accepted risks and validating replay
- supplied input rejection when accepted-risk overrides are omitted
- `--auto-accept-risks` filling supplied input risks and writing a replayable export

`apps/web/test/acceptedRiskUi.test.ts` currently covers:

- accepted-risk preview candidates starting unresolved
- accepted-risk overrides being created only from checked player choices
- default workbench turn input not silently copying preview risk candidates

## Coverage Gaps

- No storage-level compare-and-swap test because the current store is single-process and lock-backed.

## Suggested Tests

- File-store tests for invalid save skipping and storage-level compare-and-swap if the persistence layer becomes multi-process.
- CLI subprocess tests for session continuation from an exported campaign when that workflow becomes user-facing.
