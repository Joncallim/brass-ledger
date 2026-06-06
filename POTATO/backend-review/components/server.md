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

- Whole-session save route accepts client-provided state as authoritative: [[../findings/F-001-client-save-overwrites-authoritative-state]].
- Import route accepts structurally valid but unreplayed sessions: [[../findings/F-002-import-accepts-forged-sessions]].
- CORS is open while mutation routes are available: [[../findings/F-003-open-cors-local-save-mutation]].
- Save ids are raw strings with implicit path boundaries: [[../findings/F-004-save-id-path-boundary-is-implicit]].
- No optimistic concurrency on read-modify-write handlers: [[../findings/F-006-file-store-has-lost-update-races]].

## Source Anchors

- CORS registration: `apps/server/src/index.ts:26`
- Save path construction: `apps/server/src/index.ts:79`
- Whole-session save route: `apps/server/src/index.ts:208`
- Resolve turn route: `apps/server/src/index.ts:381`
- Import route: `apps/server/src/index.ts:409`
- Static asset route: `apps/server/src/index.ts:441`
