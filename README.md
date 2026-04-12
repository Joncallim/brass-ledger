# Brass Ledger

Single-player browser-based strategic leadership simulator built as a solo-developer-friendly monorepo with strong AI-assisted workflows.

## Workspace Layout
- `apps/server`: Fastify server that serves the app and the API
- `apps/web`: React + Tailwind client source and build output
- `packages/shared`: canonical schemas and shared types
- `packages/content`: scenario definitions and content validation
- `packages/sim`: deterministic turn resolver and tests
- `docs/planning`: original planning documents

## Getting Started
```bash
npm install
npm run lint:content
npm test
npm run build
npm run dev
```

`npm run dev` now starts the packaged server on a single URL after building the web client. Open the server URL it prints, usually `http://127.0.0.1:4000/`.

For a production-style single-process launch:

```bash
npm run start
```

If you want the older split setup with the Vite dev server, use:

```bash
npm run dev:split
```

If you want a one-click launcher from Finder on macOS, use:

`[Launch Brass Ledger.command](/Users/jonathanlim/Documents/GitHub/verbose-potato/Launch Brass Ledger.command)`

Double-clicking it will start the packaged server, reuse an already running Brass Ledger instance if one exists, and open the game in your browser.

## Solo Dev Workflow Helpers
- `npm run replay:demo`: runs a deterministic three-turn sample campaign
- Content is validated from `packages/content/src/validate-content.ts`
- The API owns canonical sessions with filesystem-backed saves under `data/saves/`
- The browser UI supports new campaign, save/load, delete, export/import JSON, and replay validation
- Turn results emit explainability entries, advisor reactions, and replay hashes for debugging
