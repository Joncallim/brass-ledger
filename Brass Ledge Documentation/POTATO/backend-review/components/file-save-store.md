---
type: backend-component
component: file-save-store
package: per-user application data
role: JSON session persistence
risk_level: high
source:
  - configured per-user save directory
  - apps/server/src/index.ts
tags:
  - backend-review
  - component/persistence
---

Backlink: [[POTATO]]


# File Save Store

The save store persists each session as one JSON file under the platform per-user save directory (or `BRASS_LEDGER_SAVE_DIR` when explicitly configured).

## Strengths

- Human-readable saves are useful for development and replay debugging.
- `writeSession` uses a temporary file and rename, which reduces partial-write risk.
- Sessions carry a numeric `revision` that is incremented on authoritative server mutations.
- Mutating routes can reject stale `expectedRevision` values before applying changes.
- Per-session in-process locks serialize local read-modify-write handlers.
- `listSessions` skips invalid save files rather than failing the entire listing.

## Main Risks

- There is no cross-process compare-and-swap; multi-process or networked deployments need stronger storage semantics.
- Large or numerous save files can make `GET /api/sessions` expensive because it parses all JSON files.

## Source Anchors

- Path construction: `apps/server/src/index.ts`
- Write flow: `apps/server/src/index.ts`
- Read flow: `apps/server/src/index.ts`
- Listing/parsing all saves: `apps/server/src/index.ts`
