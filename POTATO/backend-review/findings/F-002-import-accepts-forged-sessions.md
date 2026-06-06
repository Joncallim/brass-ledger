---
type: backend-finding
id: F-002
severity: P1
status: closed
area: import/replay
risk: forged sessions become trusted saves
file: apps/server/src/index.ts
line: 409
tags:
  - backend-review
  - finding/P1
---

Backlink: [[POTATO]]


# F-002 Import Accepts Forged Sessions

## Finding

`POST /api/sessions/import` parses `sessionExportSchema`, checks scenario id and content version, assigns a new id, and writes the imported session. It does not replay the imported turns or verify that `initialState`, `turnInputs`, `history`, and `state` form a valid deterministic chain.

## Impact

A structurally valid export can import impossible progress, altered trust, changed event flags, manipulated outcomes, or inconsistent duplicate state mirrors. Because the server returns `sessionPayload(importedSession)` after write, the imported forged state becomes immediately usable.

## Evidence

- `apps/server/src/index.ts:409` defines import.
- `apps/server/src/index.ts:412` parses `sessionExportSchema`.
- `apps/server/src/index.ts:414` checks only scenario id/content version compatibility.
- `apps/server/src/index.ts:421` writes the imported session.

## Recommendation

Before writing imports:

- require the canonical scenario initial state or a known migration
- require `turnInputs.length === history.length`
- run `validateReplaySession(soloScenario, importedSession)`
- reject if replay validation is not ok
- canonicalize `state` to the replay-derived final state

If the product intentionally supports custom or modded saves, mark that mode explicitly and isolate it from normal save listing.
