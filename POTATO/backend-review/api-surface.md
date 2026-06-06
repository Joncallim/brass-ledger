---
type: backend-review-note
reviewed_on: 2026-06-06
tags:
  - backend-review
  - api
---

Backlink: [[POTATO]]


# API Surface

## Routes

| Method | Path | Behavior | Authority risk |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Returns `{ ok: true }` | Low |
| `GET` | `/api/scenario` | Returns current scenario summary and memo templates | Low |
| `GET` | `/api/sessions` | Lists parsed save files | Medium, depends on save store integrity |
| `POST` | `/api/sessions` | Creates a new session | Low |
| `GET` | `/api/sessions/:id` | Reads a save file by id | Medium, id boundary is implicit |
| `DELETE` | `/api/sessions/:id` | Deletes a save file by id | Medium, id boundary is implicit |
| `POST` | `/api/sessions/:id/save` | Persists a client-provided whole session | High, see [[findings/F-001-client-save-overwrites-authoritative-state]] |
| `POST` | `/api/sessions/:id/preview-turn` | Runs deterministic preview from saved state and input | Low/medium |
| `POST` | `/api/sessions/:id/resolve-turn` | Resolves a turn server-side and persists | Low/medium |
| `POST` | `/api/sessions/:id/chiefs/:chiefId/conversation/open` | Creates/replaces current-turn chief conversation | Medium, no concurrency guard |
| `POST` | `/api/sessions/:id/chiefs/:chiefId/respond` | Advances current-turn chief conversation and trust | Medium, no concurrency guard |
| `GET` | `/api/sessions/:id/export` | Exports whole session | Low |
| `POST` | `/api/sessions/import` | Imports whole session with new id | High, see [[findings/F-002-import-accepts-forged-sessions]] |
| `GET` | `/api/sessions/:id/replay` | Validates replay for a saved session | Medium, see [[findings/F-005-replay-validation-assumes-history-alignment]] |

## HTTP Boundary Notes

The server registers CORS with `origin: true`, which mirrors arbitrary request origins. Because the app listens on `127.0.0.1`, this is mostly a local-app issue, but any web page running in the user's browser can still attempt cross-origin requests to the local backend. That matters because the backend exposes create, save, import, resolve, conversation, and delete endpoints.

## Recommended API Shape

- Keep `POST /api/sessions`, `POST /api/sessions/:id/resolve-turn`, and conversation endpoints as authoritative mutation paths.
- Replace `POST /api/sessions/:id/save` with a narrow endpoint for client preferences or remove it entirely.
- For import, validate scenario/version, validate replay, enforce canonical `initialState`, and write only after validation passes.
- Add a `revision` or `updatedAt` precondition to every mutating route.
