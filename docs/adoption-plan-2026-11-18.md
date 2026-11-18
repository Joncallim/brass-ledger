# Adoption Plan

> **Generated**: 2026-11-18 (second pass, after rigor changed; replaces the minimal-tier plan
> from earlier the same day, whose completed items are under "Done" below)
> **Project phase**: Production (inferred from 41 source files under `packages/`; no
> `project.stage` set, and the V2 human gate has not passed, so treat this as unreliable)
> **Engine**: Web / TypeScript, Vite 8.1.5 (installed versions in CLAUDE.md)
> **Template version**: v1.3.0 (Claude Code Game Studios, commit abc0de7)
> **Settings**: `modes.rigor: standard` → workflow `standard`; `modes.review_mode: full` (pinned)

Work through these steps in order. Check off each item as you complete it.
Re-run `/adopt` anytime to check remaining gaps.

**Scope of this audit.** Standard tier: GDDs (5 required sections, plus Formulas where a
system has numeric rules), critical ADRs, systems index, stories and infrastructure.
Found in the studio's format: 0 GDDs, 0 ADRs, 0 stories, no systems index. The GROCER vault
(`Brass Ledge Documentation/`) is canonical under CLAUDE.md's Brass Ledger Rules and was
**not audited against studio formats**; nothing in this plan rewrites it. The V2 design is in
`GROCER/POTATO/V2/` (numbered contracts), decisions are in `60-DECISION-LOG.md` (50 entries,
a table), and the work items are GitHub issues #94–#110.

---

## Done (first pass, 2026-11-18)

- [x] `design/game-brief.md` written as a pointer to the V2 contracts; product owner
      answered its open questions.
- [x] `engine.version` 8.1.5 set; installed versions recorded in CLAUDE.md.
- [x] Review depth chosen: `modes.rigor: standard`, `modes.review_mode: full`.

---

## Step 1: Fix Blocking Gaps

None. No studio skill reads a malformed artifact today: there are no studio-format
artifacts for one to misread.

### 1.0 Decision first (product owner): how to meet the standard tier

The standard tier expects GDDs and ADRs. Brass Ledger's design already lives in GROCER, so
pick one before Step 2:

- **A. Pointer documents.** One short GDD per system and one ADR per critical decision, each
  carrying the studio's required headings, summarising and linking its numbered contract
  ("where this and the contract disagree, the contract wins"). The whole pipeline works
  (`/create-stories`, `/architecture-review`, `/story-readiness`, sprint tracking).
  Cost: about 10 GDDs and 5 ADRs to keep in step with GROCER; `/consistency-check` and
  `/propagate-design-change` help.
- **B. Keep the documents light.** `/project-settings modes.workflow=minimal` (an explicit
  value wins over rigor). The brief stays the studio's design record, GROCER the only design
  source, and `review_mode: full` keeps every review. Cost: GDD/ADR/story skills mostly do not
  apply; Steps 2–4 below shrink to the config items. Re-run `/adopt` after.

**Time**: 5 min
- [x] **B chosen** (product owner, 2026-11-18): `modes.workflow: minimal` pinned in
      `project.yaml`, `review_mode: full` kept. Steps 2 and 3 do not apply; at the minimal
      tier the remaining gaps are Steps 4 and 5.

---

## Step 2: Fix High-Priority Gaps (option A — not chosen; kept for reference)

### 2.1 Systems index and GDDs

**Problem**: no `design/gdd/systems-index.md` and no GDDs, so `/create-stories`,
`/design-review`, `/gate-check` and `/consistency-check` have nothing to read.

**Fix**: `/map-systems` to write the index from the V2 authority map, then
`/reverse-document` (or `/design-system`) one pointer GDD per system. Each GDD has Overview,
Detailed Rules, Edge Cases, Dependencies and Acceptance Criteria (plus Formulas for numeric
rules), each section linking the contract section it summarises. Gaps in a contract are
marked as questions, never filled ("Escalate unspecified gameplay decisions").

Candidate systems, from `V2/README.md` and `50-EXECUTION-PLAN.md`:

| System (GDD stem) | Issue | Contracts |
|---|---|---|
| `command-package` | #96 | 10 (command semantics), 39 |
| `standing-direction` | #97 | 10, 20 §1 |
| `ravellan-adversary` | #99 | 22, 37, 37A |
| `hq-intelligence` | #100 | 23, 23A–23F |
| `persistent-consequences` | #101 | 25 |
| `lattice-collection` | #102 | 26 |
| `staff-recommendation` | #98 | 24, 36 |
| `terminal-crisis` | #104 | 27 |
| `command-room` | #105 | 28, 38 |
| `consequence-reveal` | #106 | 29, 38 |

**Time**: 2 sessions
- [ ] `design/gdd/systems-index.md` written
- [ ] One pointer GDD per system, each run through `/design-review`

### 2.2 ADRs for critical decisions

**Problem**: no ADRs, so `/story-readiness` cannot check a story's decisions and
`/architecture-review` has nothing to trace.

**Fix**: `/architecture-decision` for each critical decision, each citing its source in
`30-ARCHITECTURE-CONTRACT.md`, `10-GAMEPLAY-CONTRACT.md` or `60-DECISION-LOG.md` (by D-number).
Candidates:
- replay: canonical initial state plus ordered authoritative transitions, hash verification;
- persisted-format rule: version bump, no silent reinterpretation, no migration without
  authority;
- #100 intelligence is pure derived state, never persisted (D47, D50);
- information boundary and player-safe projection (38);
- V1 protections: server-authoritative mutation, `expectedRevision` stale-write rejection,
  accepted-risk semantics.

Each ADR must reach `Accepted` (stories referencing a `Proposed` ADR are blocked).
**Time**: 1 session
- [ ] ADRs written and accepted

---

## Step 3: Bootstrap Infrastructure (option A — not chosen; kept for reference)

### 3a. Register existing requirements (fills tr-registry.yaml)
`docs/architecture/tr-registry.yaml` exists but holds no requirements. Run
`/architecture-review` after Step 2.
**Time**: 1 session
- [ ] tr-registry.yaml has requirement IDs

### 3b. Create control manifest
Run `/create-control-manifest`. Seed it with the CLAUDE.md invariants (rules only in
`packages/sim`, schemas only in `packages/shared`, no headless coupling to browser/server).
**Time**: 30 min
- [ ] docs/architecture/control-manifest.md created

### 3c. Create sprint tracking file
Run `/sprint-plan update` (the GitHub issues #94–#110 are the backlog).
**Time**: 15 min
- [ ] production/sprint-status.yaml created

### 3d. Set authoritative project stage
Run `/gate-check` for the stage you are actually in. The inferred "Production" comes from
file counts; the V2 human gate (#110) has not passed, so confirm the stage with the
product owner first.
**Time**: 5 min
- [ ] `project.stage` written

### 3e. Traceability matrix
`/architecture-review` writes `docs/architecture/requirements-traceability.md`.
- [ ] Traceability matrix created

---

## Step 4: Medium-Priority Gaps

### 4.1 Naming conventions not configured
Record the repo's existing conventions (read from `packages/` and `apps/`, not invented)
with `/project-settings naming.<key>=<value>`.
**Time**: 30 min
- [ ] Naming conventions recorded

### 4.2 Performance budgets not configured
Frame-rate budgets mostly do not apply to a turn-based, headless-first game; turn-resolution
time and bundle size might. Set only the ones that apply, or record that none do.
**Time**: 15 min
- [ ] Budgets set, or "not applicable" recorded

(Sprint status, stage and traceability, also medium, are Step 3c–3e.)

---

## Step 5: Optional Improvements

### 5.1 Rendering and physics blank
Not applicable. Record them as none.
- [ ] Recorded

### 5.2 Forbidden patterns empty
Candidates from CLAUDE.md: simulation rules outside `packages/sim`; schemas outside
`packages/shared`; whole-session client saves; headless runner importing browser or server
state; real user save directories in tests; signing credentials anywhere in the repo.
- [ ] Recorded

---

## What to Expect from Existing Stories

There are no story files. The GitHub issues stay the source of work; `/create-stories`
would write story files from GDDs (option A), not replace the issues.

---

## Re-run

Run `/adopt` again after Step 1.0 (option B changes the tier) or after Step 3 (option A).
