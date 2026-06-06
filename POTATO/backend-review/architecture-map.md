---
type: backend-review-note
reviewed_on: 2026-06-06
tags:
  - backend-review
  - architecture
---

Backlink: [[POTATO]]


# Architecture Map

## Runtime Shape

```mermaid
flowchart LR
  Web["apps/web client"] -->|HTTP JSON| Server["apps/server Fastify API"]
  Server --> Content["@brass-ledger/content scenario"]
  Server --> Shared["@brass-ledger/shared schemas + helpers"]
  Server --> Sim["@brass-ledger/sim turn engine"]
  Server --> Store["data/saves/*.json"]
  Sim --> Shared
  Content --> Shared
```

## Component Responsibilities

| Component | Role | Review record |
| --- | --- | --- |
| `apps/server` | Fastify API, static asset serving, save file IO, session lifecycle | [[components/server]] |
| `packages/sim` | Deterministic game turn resolution, preview, replay validation | [[components/simulation]] |
| `packages/shared` | Zod contracts, state summaries, advisor/chief conversation helpers | [[components/shared-contracts]] |
| `packages/content` | Scenario data and content validation script | [[components/content]] |
| `data/saves` | JSON save persistence | [[components/file-save-store]] |

## Key Data Flow

1. New sessions are created in `apps/server/src/index.ts` using `createInitialGameSession(soloScenario, sessionId)`.
2. The server writes the whole session to `data/saves/{id}.json`.
3. Turn previews call `previewTurn`, which internally calls `resolveTurn` but does not persist.
4. Turn resolution reads the saved session, optionally checks `expectedRevision`, parses `TurnInput`, calls `resolveTurn`, appends input/result history, increments `revision`, validates replay, writes the next session, and returns the payload.
5. Conversations optionally check `expectedRevision`, mutate `state.conversationHistory` and `state.chiefTrust`, increment `revision`, then write the whole session back.
6. Export returns the whole saved session; import parses a whole exported session and writes it with a new id.

## Design Strengths

- Simulation is separated from HTTP concerns.
- Shared Zod schemas give a clear contract boundary.
- Replays are deterministic enough to hash and validate.
- Save writes use temp-file plus rename, avoiding torn writes for a single write operation.
- Per-session in-process mutation locks serialize local read-modify-write handlers.
- Session payloads include durable `revision` metadata, and authoritative mutating routes can reject stale `expectedRevision` values.
- Content validation catches duplicate ids and broken program/constraint references.

## Design Gaps

- Route coverage should continue expanding around delete, conversation, and malformed persistence cases.
- The local file store still lacks cross-process compare-and-swap, so a networked or multi-process deployment would need stronger storage semantics.
