---
type: backend-finding
id: F-003
severity: P1
status: closed
area: http-boundary
risk: arbitrary browser origins can call local mutation endpoints
file: apps/server/src/index.ts
line: 27
tags:
  - backend-review
  - finding/P1
---

Backlink: [[POTATO]]


# F-003 Open CORS Local Save Mutation

## Finding

The Fastify server registers CORS with `origin: true`, reflecting arbitrary origins. The server also exposes mutation endpoints for create, save, delete, import, resolve, and conversations.

## Impact

Because the server listens on `127.0.0.1`, this looks like a local-only app. However, a web page loaded from another origin in the user's browser can attempt cross-origin requests to the local backend. With permissive CORS, browser protections do not prevent that page from reading responses or driving local save mutations.

The most damaging combinations are open CORS plus whole-session save/import/delete.

## Evidence

- `apps/server/src/index.ts:26` creates the Fastify app.
- `apps/server/src/index.ts:27` registers CORS with `origin: true`.
- Mutating routes exist at `apps/server/src/index.ts:182`, `198`, `208`, `250`, `312`, `381`, and `409`.

## Recommendation

For development, restrict CORS to known dev origins such as the Vite host. For packaged local use, either disable CORS or require a per-process token that the web client receives from the server shell.

At minimum, do not expose whole-session save/import/delete to arbitrary origins.
