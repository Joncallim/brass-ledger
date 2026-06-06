---
type: backend-component
component: file-save-store
package: data/saves
role: JSON session persistence
risk_level: high
source:
  - data/saves
  - apps/server/src/index.ts
tags:
  - backend-review
  - component/persistence
---

Backlink: [[POTATO]]


# File Save Store

The save store persists each session as one JSON file under `data/saves`.

## Strengths

- Human-readable saves are useful for development and replay debugging.
- `writeSession` uses a temporary file and rename, which reduces partial-write risk.
- `listSessions` skips invalid save files rather than failing the entire listing.

## Main Risks

- No revision/etag/compare-and-swap; concurrent handlers can overwrite each other.
- Raw session id strings are used to build paths.
- The store accepts all structurally valid sessions from save/import paths, even if replay-invalid.
- Large or numerous save files can make `GET /api/sessions` expensive because it parses all JSON files.

## Source Anchors

- Path construction: `apps/server/src/index.ts:79`
- Write flow: `apps/server/src/index.ts:87`
- Read flow: `apps/server/src/index.ts:95`
- Listing/parsing all saves: `apps/server/src/index.ts:100`
