---
type: backend-finding
id: F-004
severity: P2
status: closed
area: persistence/pathing
risk: save path safety depends on router decoding behavior
file: apps/server/src/index.ts
line: 79
tags:
  - backend-review
  - finding/P2
---

Backlink: [[POTATO]]


# F-004 Save Id Path Boundary Is Implicit

## Finding

`sessionPath(sessionId)` joins `dataDir` with `${sessionId}.json` without validating that the id is a UUID or that the resolved path remains inside `dataDir`.

## Impact

Current ids are generated with `randomUUID`, and Fastify route params usually constrain obvious slash traversal. Still, the path boundary is implicit and depends on request decoding behavior. The same helper is used by read and delete routes, so a future route change or encoded separator behavior could turn this into an unintended file read/delete surface.

## Evidence

- `apps/server/src/index.ts:79` builds paths from raw `sessionId`.
- `apps/server/src/index.ts:95` reads by raw route id.
- `apps/server/src/index.ts:198` deletes by raw route id.

## Recommendation

Add a `sessionIdSchema` such as `z.string().uuid()` and parse route ids before calling `sessionPath`. Also make `sessionPath` defensive:

- resolve the candidate path
- ensure its dirname equals `dataDir`
- ensure basename is exactly `{uuid}.json`

This keeps the file boundary local even if route shapes change later.
