---
type: architecture-plan
area: compiled-engine
status: active
priority: P1
tags:
  - POTATO
  - compiled-engine
---

# Compiled Engine Roadmap

Backlink: [[POTATO]]

## Decision

Brass Ledger should be headless-first and compile-able. Browser UI is a client, not the game. The game engine should run from compiled JavaScript now, and the architecture should keep a path open for a packaged desktop/native shell later.

## Current Step Completed

A new workspace package exists at `apps/cli`. It builds with `tsc` and runs the engine without React, Vite, Fastify, or a browser.

Commands:

```bash
npm run build --workspace @brass-ledger/cli
npm run run --workspace @brass-ledger/cli -- --turns 3
npm run run --workspace @brass-ledger/cli -- --turns 1 --json --sprites
```

## Target Architecture

```mermaid
flowchart TD
  Engine["@brass-ledger/engine core rules"] --> CLI["Compiled CLI"]
  Engine --> Server["Local/API server"]
  Engine --> Browser["Browser workbench or future UI"]
  Engine --> Native["Future packaged native shell"]
  Content["@brass-ledger/content scenario data"] --> Engine
  Shared["@brass-ledger/shared contracts"] --> Engine
  Assets["Sprite + text generation specs"] --> Engine
```

## Required Refactor

The current engine is split across `packages/sim`, `packages/shared`, and `packages/content`. That is workable, but the next stage should introduce a clearer `@brass-ledger/engine` package or formally treat `@brass-ledger/sim` as the engine package.

Recommended package boundaries:

| Package | Responsibility |
| --- | --- |
| `@brass-ledger/engine` | turn resolution, S1-S5 systems, replay, save canonicalization |
| `@brass-ledger/content` | scenario data, memo definitions, event definitions, sprite archetype inputs |
| `@brass-ledger/shared` | schemas and serializable data contracts only |
| `@brass-ledger/cli` | compiled headless runner |
| `@brass-ledger/server` | optional local/API wrapper |
| `@brass-ledger/web` | optional presentation client and engine workbench |

## Compile Targets

| Stage | Target | Notes |
| --- | --- | --- |
| Now | Node CLI compiled by `tsc` | Implemented as `apps/cli`. |
| Near | Single-command local executable script | Add bin wiring and release script. |
| Mid | Desktop wrapper | Electron chosen over Tauri (2026-07). |
| Later | Native/WASM evaluation | Consider only if deterministic performance or distribution requires it. |

## Desktop Wrapper Decision (2026-07)

**Chosen: Electron.** Rationale:

- The engine is pure TypeScript/Node.js. Electron runs Node.js natively, so the engine can be spawned as a child process with no serialisation bridge.
- Tauri would require a Rust toolchain + a sidecar protocol (or WASM compilation of the engine), adding a new language build chain for marginal gain at this stage.
- Engine contracts are stable enough for wrapping — schemas, replay hashes, and the headless API are well-defined.
- The Electron wrapper is a **thin presentation host** — it spawns the compiled server bundle and opens a webview pointing at the same localhost URL. The shell contains zero rule logic.
- Keep the `desktop/` directory isolated from workspace builds. Core `npm run build`/`test`/CI pass without Electron installed.

The Tauri path remains open for later if distribution footprint becomes critical (the Electron binary is ~250MB, Tauri + system webview is ~10MB).

## Rules

- Engine state must be serializable.
- Renderer/browser state must never be authoritative.
- Sprites and text prompts are outputs of engine/content contracts.
- Save/replay must work from CLI without browser APIs.
- Any future UI should consume `decisionPackets`, `staffFunctions`, `spriteSpecs`, and `explainability` emitted by the engine.
