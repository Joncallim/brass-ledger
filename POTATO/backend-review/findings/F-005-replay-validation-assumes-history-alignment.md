---
type: backend-finding
id: F-005
severity: P2
status: open
area: replay
risk: malformed sessions can crash validation instead of producing diagnostics
file: packages/sim/src/index.ts
line: 633
tags:
  - backend-review
  - finding/P2
---

Backlink: [[POTATO]]


# F-005 Replay Validation Assumes History Alignment

## Finding

`validateReplaySession` iterates over `session.turnInputs` and immediately reads `session.history[index]`. If a structurally valid session has more inputs than history entries, `actual` is undefined and `actual.input.turn` will throw.

## Impact

Replay validation should be the backend's corruption/tampering detector, but this edge case turns malformed data into an exception. In the HTTP replay route, the broad catch reports `"Session not found"`, which hides the real data-integrity problem.

## Evidence

- `packages/sim/src/index.ts:639` loops over `turnInputs`.
- `packages/sim/src/index.ts:641` reads `session.history[index]`.
- `packages/sim/src/index.ts:643` dereferences `actual.input.turn`.
- `apps/server/src/index.ts:432` catches all replay errors as 404.

## Recommendation

Make replay validation total over malformed sessions:

- detect `turnInputs.length !== history.length`
- return a validation failure kind such as `history_length_mismatch`
- guard missing `actual`
- use input turn when actual history is missing
- have the replay route return `422` for invalid/corrupt sessions, reserving `404` for missing files
