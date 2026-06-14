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
| `POST` | `/api/headless/run` | Runs the shared headless campaign runner without persisting to the save store | Low/medium, strict supplied inputs return accepted-risk candidates when warnings are not acknowledged |
| `GET` | `/api/sessions` | Lists parsed save files | Medium, depends on save store integrity |
| `POST` | `/api/sessions` | Creates a new session | Low |
| `GET` | `/api/sessions/:id` | Reads a save file by id | Medium, id boundary is implicit |
| `DELETE` | `/api/sessions/:id` | Deletes a save file by id | Medium, id boundary is implicit |
| `POST` | `/api/sessions/:id/save` | Disabled whole-session client save endpoint | Closed, see [[findings/F-001-client-save-overwrites-authoritative-state]] |
| `POST` | `/api/sessions/:id/preview-turn` | Runs deterministic preview from saved state and input | Low/medium |
| `POST` | `/api/sessions/:id/resolve-turn` | Resolves a turn server-side, optionally checks `expectedRevision`, increments revision, and persists | Low/medium |
| `POST` | `/api/sessions/:id/chiefs/:chiefId/conversation/open` | Creates/replaces current-turn chief conversation with optional `expectedRevision` guard | Low/medium |
| `POST` | `/api/sessions/:id/chiefs/:chiefId/respond` | Advances current-turn chief conversation and trust with optional `expectedRevision` guard | Low/medium |
| `GET` | `/api/sessions/:id/export` | Exports whole session | Low |
| `POST` | `/api/sessions/import` | Imports replay-validated whole session with new id | Medium, rejects forged/corrupt saves |
| `GET` | `/api/sessions/:id/replay` | Validates replay for a saved session | Low/medium, reports malformed history as validation failure |

## HTTP Boundary Notes

The server restricts CORS to known development origins by default. Packaged same-origin use does not require cross-origin access; split development can extend the allowlist with `CORS_ORIGINS`.

## Recommended API Shape

- Use `POST /api/headless/run` for custom front-ends, batch tools, and external clients that want engine output without server-side save persistence.
- Headless API calls with supplied `input` or `inputs` should include explicit `acceptedRiskOverrides`; otherwise the route returns `428` with `acceptedRiskCandidates`. Set `autoAcceptRisks` only for unattended simulation runs where accepting all projected warnings is intended.
- Keep `POST /api/sessions`, `POST /api/sessions/:id/resolve-turn`, and conversation endpoints as authoritative mutation paths.
- If client preferences are needed, add a narrow preferences endpoint rather than reviving whole-session save.
- For import, continue validating scenario/version, replay, and canonical `initialState` before writing.
- Keep `revision` in every session payload and continue accepting optional `expectedRevision` on authoritative mutating routes; stale revisions should return `409 Conflict`.
