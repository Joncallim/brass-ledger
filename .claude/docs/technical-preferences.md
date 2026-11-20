# Technical Preferences

<!-- project.yaml at the repo root is the machine-readable source of truth for
     engine, specialists, naming, performance, platform, and testing.framework.
     This file is the human-readable LEGACY FALLBACK: agents and skills resolve
     each key from project.yaml first and fall back here only when the
     project.yaml key is absent. /setup-engine dual-writes both.
     Forbidden patterns and allowed libraries are NOT migrated — they live only
     in this file. Populated by /setup-engine; updated as decisions are made. -->

## Engine & Language

- **Engine**: Web (Vite 8.1.5; TypeScript monorepo, no game engine)
- **Language**: TypeScript 5.9.3 (strict), Node.js
- **Rendering**: none (headless engine; React DOM workbench; Phaser 3 only in prototypes/map-room)
- **Physics**: none (turn-based)

## Input & Platform

<!-- Written by /setup-engine. Read by /ux-design, /ux-review, /test-setup, /team-ui, and /dev-story -->
<!-- to scope interaction specs, test helpers, and implementation to the correct input methods. -->

- **Target Platforms**: [TO BE CONFIGURED — e.g., PC, Console, Mobile, Web]
- **Input Methods**: [TO BE CONFIGURED — e.g., Keyboard/Mouse, Gamepad, Touch, Mixed]
- **Primary Input**: [TO BE CONFIGURED — the dominant input for this game]
- **Gamepad Support**: [TO BE CONFIGURED — Full / Partial / None]
- **Touch Support**: [TO BE CONFIGURED — Full / Partial / None]
- **Platform Notes**: [TO BE CONFIGURED — any platform-specific UX constraints]

## Naming Conventions

- **Classes**: PascalCase; error classes end in Error (RevisionMismatchError)
- **Variables**: camelCase; Zod schemas end in Schema (chiefPositionSchema)
- **Signals/Events**: kebab-case string discriminants on kind/type (ravellan-decision, command-set)
- **Files**: kebab-case .ts modules; PascalCase .tsx for React components; *.test.ts(x) beside the code, *.spec.ts for Playwright
- **Scenes/Prefabs**: PascalCase ending in Scene (prototypes/map-room only)
- **Constants**: UPPER_SNAKE_CASE (KESTREL_HQ_BELIEF_MODEL_ID)

## Performance Budgets

Not applicable, deliberately: Brass Ledger is turn-based and headless-first, with no
frame loop. The `performance.*` keys stay unset in project.yaml so /perf-profile reports
NOT ASSESSED instead of measuring against an invented budget. Set one only when the
product owner commits to a real target (for example turn-resolution time).

- **Target Framerate**: not applicable (turn-based)
- **Frame Budget**: not applicable
- **Draw Calls**: not applicable
- **Memory Ceiling**: not set (no committed target)

## Testing

- **Framework**: [TO BE CONFIGURED]
- **Minimum Coverage**: [TO BE CONFIGURED]
- **Required Tests**: Balance formulas, gameplay systems, networking (if applicable)

## Forbidden Patterns

<!-- Add patterns that should never appear in this project's codebase -->
From CLAUDE.md's Brass Ledger Rules (non-negotiable invariants):

- Simulation rules anywhere but `packages/sim` (no reimplementing them in UI, API, CLI or desktop)
- Shared serializable contracts or Zod schemas outside `packages/shared`
- Scenario content outside `packages/content`, or content that skips reference and doctrine reachability validation
- Whole-session client saves, or session mutation that bypasses the server's `expectedRevision` stale-write check
- Supplied inputs accepted without an explicit accepted-risk override (unless an operator deliberately selects unattended acceptance)
- The portable headless runner importing browser or server state
- Non-deterministic turn resolution (`Math.random`, wall-clock time) or changes that break replay hashes or validation
- A persisted V2 format change without a prototype version bump, or a silent reinterpretation or migration of an older payload
- Real user save directories in tests
- Signing credentials in the repository, logs, fixtures or delegated prompts
- Production code importing from `prototypes/`

## Allowed Libraries / Addons

<!-- Add approved third-party dependencies here -->
- [None configured yet — add as dependencies are approved]

## Architecture Decisions Log

<!-- Quick reference linking to full ADRs in docs/architecture/ -->
- [No ADRs yet — use /architecture-decision to create one]

## Engine Specialists

<!-- Written by /setup-engine when engine is configured. -->
<!-- Read by /code-review, /architecture-decision, /architecture-review, and team skills -->
<!-- to know which specialist to spawn for engine-specific validation. -->

- **Primary**: [TO BE CONFIGURED — run /setup-engine]
- **Language/Code Specialist**: [TO BE CONFIGURED]
- **Shader Specialist**: [TO BE CONFIGURED]
- **UI Specialist**: [TO BE CONFIGURED]
- **Additional Specialists**: [TO BE CONFIGURED]
- **Routing Notes**: [TO BE CONFIGURED]

### File Extension Routing

<!-- Skills use this table to select the right specialist per file type. -->
<!-- If a row says [TO BE CONFIGURED], fall back to Primary for that file type. -->

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (primary language) | [TO BE CONFIGURED] |
| Shader / material files | [TO BE CONFIGURED] |
| UI / screen files | [TO BE CONFIGURED] |
| Scene / prefab / level files | [TO BE CONFIGURED] |
| Native extension / plugin files | [TO BE CONFIGURED] |
| General architecture review | Primary |
