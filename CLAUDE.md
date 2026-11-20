# Brass Ledger -- Game Studio Agent Architecture

Brass Ledger is a headless-first strategic leadership simulator, developed with
Claude Code Game Studios: 49 coordinated Claude Code subagents, each owning a
domain, orchestrated through the skills in `.claude/skills/`. The deterministic
TypeScript engine and shared schemas are authoritative; the CLI, Fastify server,
browser workbench and desktop shell are clients of those rules.

## Technology Stack

- **Engine**: Web (TypeScript monorepo, npm workspaces; no game engine)
- **Language**: TypeScript (strict), Node.js
- **Version Control**: Git; work on branches, through pull requests
- **Build System**: `npm run build` (workspaces); Vite for `apps/web` and `prototypes/map-room`
- **Asset Pipeline**: `packages/asset-pipeline`; check generated assets with `npm run lint:assets`
- **Code root**: `packages/` (`project.yaml` `engine.code_root`); clients in `apps/` and `desktop/`

## Project Structure

@.claude/docs/directory-structure.md

Brass Ledger's own layout, which the code-root override above maps onto:

- `packages/sim`: turn resolver, preview, replay and engine tests.
- `packages/shared`: schemas, contracts, readouts and advisor helpers.
- `packages/content`: scenarios and content validation.
- `packages/headless`: common CLI/API campaign runner.
- `packages/save-store`: local save persistence.
- `packages/asset-pipeline`: generated asset handling.
- `apps/cli`: compiled headless command. `apps/server`: Fastify API and authoritative
  sessions. `apps/web`: React/Tailwind workbench. `desktop`: Electron packaging shell.
- `prototypes/map-room`: the isolated Phaser presentation prototype (not a workspace).
- `scripts`: release, documentation and generated-asset validators.
- `Brass Ledge Documentation/GROCER`: the canonical design vault. Start at
  `GROCER/GROCER.md`; implementation-facing POTATO documents are linked from `README.md`.

## Engine Version Reference

<!-- ENGINE-REFERENCE-IMPORT: the line under this comment is engine-specific,
     and there is none until an engine is set. /setup-engine, the grow's record
     step and /project-settings (engine.name) write
     @docs/engine-reference/<engine>/VERSION.md here for the chosen engine. Skills
     that need the pinned version read that file on demand either way. -->
@docs/engine-reference/web/VERSION.md

**Brass Ledger installs older versions than that template pin: the lockfile wins.**
Write code for these, and do not upgrade without the product owner:

| Package | Installed | Where |
|---------|-----------|-------|
| `vite` | 8.1.5 (`engine.version`) | root lockfile; `apps/web` |
| `typescript` | 5.9.3 | root lockfile (not 7.x: no native compiler, JS API present) |
| `@playwright/test` | 1.62.1 | root lockfile |
| `react` | 19.2.4 | root lockfile; `apps/web` |
| `phaser` | 3.90.0 | `prototypes/map-room` only (Phaser 3 API, not 4) |

Read a package's version from `package-lock.json` (or the prototype's own lockfile)
before using a version-specific API.

## Technical Preferences

`project.yaml` at the repo root is the primary config store — engine, specialists,
naming, platform, performance, modes. Skills resolve it via `resolve_config`
(see `.claude/docs/config-resolution.md`).

`.claude/docs/technical-preferences.md` is the **legacy fallback**, read on demand
when a key is absent from `project.yaml`.

## Brass Ledger Rules (from the former AGENTS.md)

These are project facts, not modes: no skill, agent or setting overrides them.

### Current product priority: V2 fun-first prototype

Before V2 implementation, read `Brass Ledge Documentation/GROCER/POTATO/V2/README.md`
and its numbered contracts. The current Briefing → Memos → Chiefs → Final Review
interaction is not a protected product invariant. V1 deterministic replay,
save/import/export, server-authoritative mutation, stale-write rejection and headless
boundaries remain protected.

Until the V2 human gate passes, do not expand scenarios, graphics, doctrine,
tutorials, unrelated presentation polish, meta-progression or generic plugin
frameworks. Escalate unspecified gameplay decisions; do not invent them. A green
automated gate cannot close a human fun gate.

### Non-negotiable invariants

- Keep simulation rules in `packages/sim`; do not reimplement them in UI, API, CLI or
  desktop layers.
- Preserve deterministic turn resolution, replay hashes and replay validation.
- Shared serializable contracts and Zod schemas live in `packages/shared`.
- Scenario content belongs in `packages/content` and must pass reference and doctrine
  reachability validation.
- The server owns authoritative session mutation. Preserve `expectedRevision`
  stale-write rejection; do not restore whole-session client saves.
- Preserve accepted-risk semantics. Supplied inputs require explicit accepted-risk
  overrides unless an operator deliberately selects unattended acceptance.
- Keep saves migration-safe and compatible across CLI and server flows.
- Do not couple the portable headless runner to browser or server state.

### Ownership (maps onto the studio's agents)

- Simulation, replay or balance: one domain implementer plus an independent
  determinism/replay reviewer.
- Schema changes: one contract owner coordinates all consumers and compatibility tests
  before client work proceeds.
- Session/save/API work: one backend owner plus a concurrency, migration and filesystem
  review.
- Browser or desktop work: keep the client owner separate from engine ownership; verify
  behaviour through public contracts.
- Content work: one content owner runs content validation and checks downstream
  readouts. Documentation taxonomy changes also need GROCER/POTATO validation.
- Release work: a release owner and an independent artifact smoke check.
- One writer per file; QA and review stay read-only unless handed a fix.

### Validation

Use workspace-specific tests while iterating. The standard repository gate:

```bash
npm run lint:grocer
npm run lint:content
npm test
npm run build
```

Focused evidence: `npm run replay:demo`; `npm run build --workspace @brass-ledger/cli`;
`npm run run --workspace @brass-ledger/cli -- --turns 1 --json --sprites --validate`.
Generated assets: `npm run lint:assets`. Run `npm run release` only when the task
concerns the distributable artifact. The map-room prototype has its own gate in its
README (`npm test`, `npm run build`, `npm run test:browser`).

### Risk triggers

Require independent adversarial review for replay/hash changes, save migrations,
session deletion, revision/concurrency behaviour, accepted-risk handling, file paths,
import/export, release replacement, or signing/notarization. Never use real user save
directories for tests. Signing credentials remain external and must never enter the
repository, logs, fixtures or delegated prompts.

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
  (exempt: `active.md` appends, agent memory, a subagent's new file at the path
  its orchestrating skill named; see `.claude/rules/agent-memory.md`)
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction
- A skipped or dismissed question is not an answer: act on nothing, re-ask in
  plain text and wait
- Started outside this file's folder? Warn first: hooks, deny rules and the
  ask-first mode load only when Claude Code starts here

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** Run `/start` for the guided onboarding flow, or `/adopt` to audit
> Brass Ledger's existing documents against the studio's formats.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

Read `.claude/docs/context-management.md` on demand — it is a reference, not
session context. Two of its conventions are load-bearing and cited by name
elsewhere in the repo, so they are restated here rather than lost:

- **`production/session-state/active.md` is the session checkpoint.** The file is
  the memory, not the conversation. Read it first after any compaction, crash, or
  `/clear`.
- **Helpers in `.claude/scripts/` emit observations, never verdicts.** A script
  that scores or judges will eventually contradict a mode or override it cannot
  see. (Cited by `artifact-check.sh` and `adr-dep-graph.sh`.)

## Attribution

`.claude/`, `design/`, `docs/`, `production/` and `studio-tests/` come from
[Claude Code Game Studios](https://github.com/donchitos/claude-code-game-studios)
(MIT, `.claude/LICENSE-claude-code-game-studios`), installed from commit `abc0de7`.
