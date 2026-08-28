# Brass Ledger Agent Guide

## Purpose

Brass Ledger is a headless-first strategic leadership simulator. The
deterministic TypeScript engine and shared schemas are authoritative; the CLI,
Fastify server, browser workbench, and desktop shell are clients of those rules.

## Read First

Start with `README.md`, then the affected workspace manifests and tests. For
design or content contracts, use the canonical Obsidian vault index at
`Brass Ledge Documentation/GROCER/GROCER.md` and the implementation-facing
POTATO documents linked from the README.

## Non-Negotiable Invariants

- Keep simulation rules in `packages/sim`; do not reimplement them in UI, API,
  CLI, or desktop layers.
- Preserve deterministic turn resolution, replay hashes, and replay validation.
- Shared serializable contracts and Zod schemas live in `packages/shared`.
- Scenario content belongs in `packages/content` and must pass reference and
  doctrine reachability validation.
- The server owns authoritative session mutation. Preserve `expectedRevision`
  stale-write rejection; do not restore whole-session client saves.
- Preserve accepted-risk semantics. Supplied inputs require explicit accepted
  risk overrides unless an operator deliberately selects unattended acceptance.
- Keep saves migration-safe and compatible across CLI and server flows.
- Do not couple the portable headless runner to browser or server state.

## Repository Map

- `packages/sim`: turn resolver, preview, replay, and engine tests.
- `packages/shared`: schemas, contracts, readouts, and advisor helpers.
- `packages/content`: scenarios and content validation.
- `packages/headless`: common CLI/API campaign runner.
- `packages/save-store`: local save persistence.
- `packages/asset-pipeline`: generated asset handling.
- `apps/cli`: compiled headless command.
- `apps/server`: Fastify API and authoritative sessions.
- `apps/web`: React/Tailwind workbench.
- `desktop`: Electron packaging shell.
- `scripts`: release, documentation, and generated-asset validators.

## Focused Routing And Ownership

- Simulation, replay, or balance: one domain implementer plus an independent
  determinism/replay reviewer.
- Schema changes: one contract owner coordinates all consumers and compatibility
  tests before client work proceeds.
- Session/save/API work: one backend owner plus a concurrency, migration, and
  filesystem review.
- Browser or desktop work: keep the client owner separate from engine ownership;
  verify behavior through public contracts.
- Content work: one content owner runs content validation and checks downstream
  readouts. Documentation taxonomy changes also need GROCER/POTATO validation.
- Release work: use a release owner and independent artifact smoke check.
- One writer per file; QA and review remain read-only unless handed a fix.

## Validation

Use workspace-specific tests while iterating. The standard repository gate is:

```bash
npm run lint:grocer
npm run lint:content
npm test
npm run build
```

Useful focused evidence:

```bash
npm run replay:demo
npm run build --workspace @brass-ledger/cli
npm run run --workspace @brass-ledger/cli -- --turns 1 --json --sprites --validate
```

For generated assets run `npm run lint:assets`. Run `npm run release` only when
the task concerns the distributable artifact; it is broader than a normal code
check.

## Risk Triggers

Require independent adversarial review for replay/hash changes, save migrations,
session deletion, revision/concurrency behavior, accepted-risk handling, file
paths, import/export, release replacement, or signing/notarization. Never use
real user save directories for tests. Signing credentials remain external and
must never enter the repository, logs, fixtures, or delegated prompts.
