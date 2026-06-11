---
type: backend-finding
id: F-001
severity: P1
status: closed
area: persistence/api
risk: client can replace authoritative game state
file: apps/server/src/index.ts
line: 208
tags:
  - backend-review
  - finding/P1
---

Backlink: [[POTATO]]


# F-001 Client Save Overwrites Authoritative State

## Finding

`POST /api/sessions/:id/save` parses `body.session` with `gameSessionSchema`, checks only that `session.id` matches the route id, updates `updatedAt`, and writes the whole object to disk.

## Impact

Any caller that can reach the endpoint can rewrite campaign state, turn history, trust, campaign outcome, replay hashes, scenario ids, and duplicated state mirrors as long as the object is structurally valid. The route bypasses the backend's strongest invariant: state should be produced by `resolveTurn` from the scenario, initial state, and turn inputs.

This also weakens replay integrity. The replay endpoint may later report a problem, but the invalid state has already been accepted and may be returned by list/get/session payloads.

## Evidence

- `apps/server/src/index.ts:208` defines the save route.
- `apps/server/src/index.ts:211` parses a whole `GameSession`.
- `apps/server/src/index.ts:216` updates only `updatedAt`.
- `apps/server/src/index.ts:217` writes it immediately.

## Recommendation

Remove this route unless it is strictly needed. If the client needs autosave, persist only narrow client-owned fields. Server-owned game state should be mutated only by `resolve-turn`, conversation handlers, and explicit migration/import flows.

If whole-session save must remain for development, require:

- scenario/content/save-format checks
- canonical initial state check
- `turnInputs.length === history.length`
- successful `validateReplaySession`
- state mirror canonicalization before write
- dev-only gating or a separate unsafe endpoint name
