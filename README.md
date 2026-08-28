# Brass Ledger

Brass Ledger is a headless-first strategic leadership simulator about running a joint headquarters under political, military, and industrial pressure. The browser is a client and workbench; the deterministic engine is the source of truth.

The project is built as a solo-developer-friendly TypeScript monorepo with shared schemas, replay validation, a compiled CLI, a Fastify API, and an Obsidian-style design vault.

## Workspace Layout

| Path | Purpose |
| --- | --- |
| `apps/server` | Fastify server for the browser app, authoritative session API, and headless campaign API. |
| `apps/cli` | Compiled `brass-ledger` command for headless runs, replay checks, exports, and sprite payloads. |
| `apps/web` | React + Tailwind browser workbench. |
| `packages/headless` | Shared headless runner used by both the CLI and API. |
| `packages/sim` | Deterministic turn resolver, preview, replay validation, and engine tests. |
| `packages/shared` | Zod schemas, serializable contracts, readout helpers, and advisor helpers. |
| `packages/content` | Scenario data and content validation. |
| per-user application data | Local JSON saves used by the server (`BRASS_LEDGER_SAVE_DIR` can override the location). |
| `Brass Ledge Documentation/` | Obsidian vault. The folder name is historical; the project name is Brass Ledger. |

## Getting Started

```bash
npm install
npm run lint:grocer
npm run lint:content
npm test
npm run build
npm run dev
```

`npm run dev` builds the workspaces and starts the packaged server on one URL. Open the printed URL, usually `http://127.0.0.1:4000/`.

For a production-style single-process launch:

```bash
npm run start
```

For the older split setup with the Vite dev server:

```bash
npm run dev:split
```

On macOS, the Finder launcher is:

The `Launch Brass Ledger.command` script (in the repo root) starts the packaged server, reuses an already running Brass Ledger instance if one exists, and opens the game in your browser. Keep the launcher in the repository root so it can resolve the release files beside it.

## Release Build

To produce a self-contained, runnable artifact (no `tsx` or Vite dev server needed at runtime):

```bash
npm run release
```

This builds all workspaces, assembles the Node server and CLI with their locked production dependencies, and copies the web client and Electron shell into `release/`. A failed final replacement restores the previous release, and an existing `release/saves/` directory is migrated into the new artifact. Run the browser-hosted server with:

```bash
cd release && ./start.sh
```

`start.sh` is the POSIX launcher. On Windows, use the packaged desktop target or run `node server/index.js` from the release directory.

For a headless CLI run from the release:

```bash
node release/cli/brass-ledger --turns 3
```

To launch or package the desktop shell, install the exact dependencies from the committed release lockfile:

```bash
cd release
npm ci
npm start
```

Create an unpacked platform application with:

```bash
cd release && npm run package
```

The unpacked application is written under `release/dist/`. Signing and notarization credentials are intentionally external to the repository and are required before distributing a production installer.

To run the compiled server directly (without `tsx`) during development:

```bash
npm run start:dist
```

This boots `node dist/index.js` in the server workspace.

## Headless CLI

Build the CLI, then run a campaign without the browser or server:

```bash
npm run build --workspace @brass-ledger/cli
npm run run --workspace @brass-ledger/cli -- --turns 3
npm run run --workspace @brass-ledger/cli -- --turns 1 --json --sprites --validate
```

Generated default turns automatically record the projected accepted-risk warnings. If you pass an input file, the CLI requires `acceptedRiskOverrides` to be present unless you explicitly choose unattended acceptance:

```bash
npm run run --workspace @brass-ledger/cli -- --input turn.json --auto-accept-risks
```

Useful flags:

| Flag | Use |
| --- | --- |
| `--turns N` | Run up to `N` turns. |
| `--json` | Print machine-readable output. |
| `--input file.json` | Use one turn input or an array of turn inputs. |
| `--session file.json` | Continue from a saved `GameSession` or exported session JSON. |
| `--export file.json` | Write a replayable session export. |
| `--validate` | Validate replay after the run. |
| `--sprites` | Include advisor SVG payloads in JSON output. |
| `--auto-accept-risks` | Fill missing accepted-risk overrides for supplied inputs. |
| `--resume id` | Resume a session by ID from the save store. |
| `--save` | Save the session to the save store after the run. |
| `--list` | List all saved sessions. |

Saves are stored in a stable per-user directory (e.g. `~/Library/Application Support/Brass Ledger/saves` on macOS, `~/.local/share/brass-ledger/saves` on Linux). Override with `BRASS_LEDGER_SAVE_DIR`. Sessions can be resumed across CLI and server runs; replay hashes and the campaign-bound action ledger are checked before an imported campaign is accepted. Corrupt or incompatible files remain visible in Records for deletion or recovery rather than silently disappearing. Action-free older saves can migrate to the current format; older conversation ledgers that lack independently verifiable campaign provenance remain explicitly incompatible rather than being trusted.

## Headless API

The server exposes the same headless runner at:

```http
POST /api/headless/run
```

Example request:

```json
{
  "turns": 3,
  "validate": true
}
```

Supplying your own turn input keeps the accepted-risk contract strict:

```json
{
  "exportData": {
    "exportedAt": "2026-06-12T00:00:00.000Z",
    "session": {}
  },
  "input": {
    "turn": 1,
    "selectedActionIds": [],
    "selections": [],
    "acceptedRiskOverrides": []
  }
}
```

Use either a full `session` object or a full exported session as `exportData`. If projected S1-S5 warnings are not acknowledged, the API returns `428` with `acceptedRiskCandidates`. Add those candidates to `acceptedRiskOverrides`, or set `"autoAcceptRisks": true` for unattended batch simulation.

The endpoint is intended for custom front-ends, tools, and batch runners. It does not persist sessions; use the session routes when you need authoritative saved campaigns in the configured per-user save directory.

## Browser And Session API

The browser uses the authoritative session API:

- `GET /api/scenario`
- `POST /api/sessions`
- `GET /api/sessions`
- `GET /api/sessions/:id`
- `DELETE /api/sessions/:id`
- `POST /api/sessions/:id/preview-turn`
- `POST /api/sessions/:id/resolve-turn`
- `GET /api/sessions/:id/export`
- `POST /api/sessions/import`
- `GET /api/sessions/:id/replay`

Mutating session routes support `expectedRevision` and reject stale writes. Whole-session client saves are disabled.

## Documentation

Open `Brass Ledge Documentation/` directly in Obsidian. The canonical vault index is:

`Brass Ledge Documentation/GROCER/GROCER.md`

Primary implementation-facing docs:

- `Brass Ledge Documentation/POTATO/POTATO.md`
- `Brass Ledge Documentation/POTATO/development-stages.md`
- `Brass Ledge Documentation/POTATO/compiled-engine-roadmap.md`
- `Brass Ledge Documentation/POTATO/backend-review/api-surface.md`

## Development Notes

- `npm run replay:demo` runs a deterministic three-turn sample campaign.
- `npm run lint:content` validates scenario references from `packages/content/src/validate-content.ts`.
- `npm run lint:potato` validates the POTATO/GROCER documentation structure.
- Turn results emit S1-S5 readouts, explainability entries, accepted-risk records, tech/industry summaries, advisor reactions, and replay hashes.
