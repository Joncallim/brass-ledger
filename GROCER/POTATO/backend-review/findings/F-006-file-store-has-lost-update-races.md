---
type: backend-finding
id: F-006
severity: P2
status: closed
area: persistence/concurrency
risk: concurrent requests can overwrite each other's state changes
file: apps/server/src/index.ts
line: 87
tags:
  - backend-review
  - finding/P2
---

Backlink: [[POTATO]]


# F-006 File Store Has Lost Update Races

## Finding

Mutating handlers perform read-modify-write cycles with no revision check, lock, or compare-and-swap. `writeSession` writes atomically at the file operation level, but it does not prevent two handlers from reading the same old state and then writing conflicting next states.

Status update: closed on 2026-06-07. Mutating handlers now run through per-session in-process locks, sessions carry a durable numeric `revision`, authoritative mutations increment it, and clients may send `expectedRevision` to reject stale writes.

## Impact

Concurrent requests can lose conversation progress, trust changes, turn resolution, or deletes. This is easy to hit in a browser UI if multiple actions are clicked quickly or if autosave overlaps with resolve/conversation calls.

## Evidence

- `apps/server/src/index.ts:87` writes the whole session with temp/rename.
- `apps/server/src/index.ts:250` conversation open reads and writes.
- `apps/server/src/index.ts:312` conversation respond reads and writes.
- `apps/server/src/index.ts:381` resolve turn reads and writes.
- `apps/server/src/index.ts:208` whole-session save can overwrite all of the above.

## Recommendation

Add optimistic concurrency:

- include a numeric `revision` in `GameSession`
- require mutation requests to send the revision they read
- reject stale writes with `409`
- increment revision on successful write

For the file store, a per-session in-process mutex is also useful, but revision checks are still valuable for browser retries and future multi-process deployments.

Implemented for the local server. A future multi-process or networked store should still add storage-level compare-and-swap semantics.
