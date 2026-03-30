<<<<<<< ours
# Brass Ledger

Single-player browser-based strategic leadership simulator built as a solo-developer-friendly monorepo with strong AI-assisted workflows.

## Workspace Layout
- `apps/web`: React + Tailwind command-center UI
- `apps/server`: Fastify single-player simulation API
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
```

Run the server:

```bash
npm run dev --workspace @brass-ledger/server
```

Run the web app in another terminal:

```bash
npm run dev --workspace @brass-ledger/web
```

The web app expects the API at `http://127.0.0.1:4000`.

## Solo Dev Workflow Helpers
- `npm run replay:demo`: runs a deterministic three-turn sample campaign
- Content is validated from `packages/content/src/validate-content.ts`
- The API now owns canonical sessions with filesystem-backed saves under `data/saves/`
- The browser UI supports new campaign, save/load, delete, export/import JSON, and replay validation
- Turn results emit explainability entries, advisor reactions, and replay hashes for debugging
=======
# verbose-potato

Planning repository for **Brass Ledger**, a multiplayer browser-based strategic leadership simulator.
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs

## Planning Documents
- [01-game-design-document.md](docs/planning/01-game-design-document.md)
- [02-technical-approach.md](docs/planning/02-technical-approach.md)
- [03-art-direction-and-generation.md](docs/planning/03-art-direction-and-generation.md)
- [04-dual-tech-tree-exact-algorithm.md](docs/planning/04-dual-tech-tree-exact-algorithm.md)
