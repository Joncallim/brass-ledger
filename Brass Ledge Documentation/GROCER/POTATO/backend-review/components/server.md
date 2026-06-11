---
type: backend-component
component: server
package: apps/server
role: HTTP API, static asset serving, session persistence orchestration
risk_level: high
source:
  - apps/server/src/index.ts
tags:
  - backend-review
  - component/server
---

Backlink: [[POTATO]]


# Server

The server is a Fastify app that registers permissive CORS, exposes JSON API routes, serves the built web client, and stores sessions as JSON files.

## Strengths

- Small route surface and readable handler flow.
- Uses shared Zod schemas for request body/session parsing.
- Uses temp-file plus rename for writes.
- Separates static client serving from API paths.

## Main Risks

- Closed: whole-session save route is disabled by default: [[../findings/F-001-client-save-overwrites-authoritative-state]].
- Closed: import route validates canonical scenario state and replay before write: [[../findings/F-002-import-accepts-forged-sessions]].
- Closed: CORS defaults to known development origins only: [[../findings/F-003-open-cors-local-save-mutation]].
- Closed: save ids are rejected unless they match UUID shape: [[../findings/F-004-save-id-path-boundary-is-implicit]].
- Closed for local single-process use: read-modify-write handlers are serialized by per-session locks: [[../findings/F-006-file-store-has-lost-update-races]].
- Still open: static asset path prefix handling needs a stricter boundary check: [[../findings/F-008-static-asset-prefix-check-is-fragile]].

## Source Anchors

- CORS registration: `apps/server/src/index.ts:26`
- Save path construction: `apps/server/src/index.ts:79`
- Whole-session save route: `apps/server/src/index.ts:208`
- Resolve turn route: `apps/server/src/index.ts:381`
- Import route: `apps/server/src/index.ts:409`
- Static asset route: `apps/server/src/index.ts:441`
