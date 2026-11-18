# Adoption Plan

> **Generated**: 2026-11-18
> **Project phase**: Production (inferred from 41 source files under `packages/`; no
> `project.stage` set — and the V2 human gate has not passed, so treat this as unreliable)
> **Engine**: Web / TypeScript — `engine.version` not configured
> **Template version**: v1.3.0 (Claude Code Game Studios, commit abc0de7)
> **Workflow tier**: `minimal` (default — `modes.rigor` unset)

Work through these steps in order. Check off each item as you complete it.
Re-run `/adopt` anytime to check remaining gaps.

**Scope of this audit.** At `workflow: minimal` the design record is
`design/game-brief.md`; GDDs, ADRs, the systems index, stories, the TR registry, the
control manifest and sprint status are not expected and were **not audited**. The
GROCER vault (`Brass Ledge Documentation/`, 184 notes including `GROCER/POTATO/V2/`)
is the project's canonical design record under CLAUDE.md's Brass Ledger Rules; it was
**not audited against studio formats** and must not be rewritten into them. No v1.0
config migration is needed (`project.yaml` exists).

---

## Step 1: Fix Blocking Gaps

### 1.1 No game brief

**Problem**: `design/game-brief.md` does not exist. At the minimal tier it is the whole
design record that `/next-step`, `/cut` and `/prototype` read; without it they see no
game and may steer toward starting one.

**Fix**: `/reverse-document` the brief from `GROCER/POTATO/V2/00-NORTH-STAR.md` and
`10-GAMEPLAY-CONTRACT.md` (plus `20-VERTICAL-SLICE.md` for Build order). Constraints:
- The brief is a one-page pointer to the V2 contracts, not a new design. Every field
  links the contract it comes from.
- Anything the contracts leave open is marked *(provisional)* or left as a question for
  the product owner — CLAUDE.md: "Escalate unspecified gameplay decisions; do not
  invent them."
- **Out of scope** carries the V2 freeze (no scenario expansion, graphics, doctrine,
  tutorials, meta-progression, plugin frameworks until the human gate).

**Time**: 1 session
- [x] `design/game-brief.md` written, six required fields filled (Pitch, Core loop,
      Goal & fail state, Features, Out of scope, Build order), each sourced
- [x] Product owner answered its open questions (map room: a #105 candidate only;
      audience; references none yet; genre) — 2026-11-18

---

## Step 2: Fix High-Priority Gaps

### 2.1 Engine reference describes versions the project does not use

**Problem**: `docs/engine-reference/web/VERSION.md` (imported into every session by
CLAUDE.md) pins the template's versions — TypeScript 7.0.2, Vite 8.3.4, Playwright
1.64.1, Phaser 4.2.1. The lockfile installs TypeScript 5.9.3, Vite 8.1.5, Playwright
1.62.1 and React 19.2.4; `prototypes/map-room` pins Phaser 3.90.0. Agents may write
TypeScript 7 or Phaser 4 code. `engine.version` is unset.

**Fix**: set `engine.version` to the installed Vite version (8.1.5) — via
`/setup-engine web` **choosing to pin, not upgrade** (a version bump is an always-ask
decision), or `/project-settings engine.version=8.1.5`. Then add a "Brass Ledger
installs" note to the top of `VERSION.md` (or to CLAUDE.md's Engine Version Reference)
listing the installed versions above, so the lockfile wins over the template pin.

**Time**: 30 min
- [x] `engine.version` set in `project.yaml` (8.1.5)
- [x] Installed versions recorded in CLAUDE.md's Engine Version Reference (2026-11-18)

### 2.2 Review mode skips the independent reviews the project requires

**Problem**: review mode resolves to `solo` (from the default `modes.rigor: minimal`):
no director or reviewer agents are spawned. CLAUDE.md's risk triggers require
independent adversarial review for replay/hash changes, save migrations, session
deletion, revision/concurrency, accepted-risk handling, file paths, import/export,
release replacement and signing.

**Fix (your decision)**: `/project-settings modes.rigor=standard` (phase-gate reviews,
standard GDD/ADR tier) or `modes.rigor=full`. Note that raising rigor also raises the
workflow tier, which brings GDDs/ADRs back into scope — re-run `/adopt` afterwards.
Alternative: keep `minimal` and request the independent review explicitly whenever a
risk trigger applies (the CLAUDE.md rule still binds; only the automation is missing).

**Time**: 5 min (plus a re-run of `/adopt`)
- [x] Rigor chosen and set: `modes.rigor: standard` with `modes.review_mode: full`
      pinned on purpose (product owner, 2026-11-18). Workflow tier is now `standard`:
      re-run `/adopt`.

---

## Step 3: Bootstrap Infrastructure

Not on the minimal path — the brief's build order is the plan. Next: `/create-stories`
(or `/dev-story` once stories exist).

---

## Step 4: Medium-Priority Gaps

### 4.1 Naming conventions not configured

**Problem**: `naming.*` is unset in `project.yaml` and `[TO BE CONFIGURED]` in
`.claude/docs/technical-preferences.md`, so skills fall back to generic conventions.

**Fix**: record the repo's existing conventions (read from `packages/` and `apps/`, not
invented) with `/project-settings naming.<key>=<value>`.
**Time**: 30 min
- [ ] Naming conventions recorded

### 4.2 Performance budgets not configured

**Problem**: `performance.*` is unset. Frame-rate and draw-call budgets mostly do not
apply to a turn-based, headless-first game; turn-resolution time and bundle size might.

**Fix**: set only the budgets that apply, or record that none do.
**Time**: 15 min
- [ ] Budgets set, or "not applicable" recorded

---

## Step 5: Optional Improvements

### 5.1 Rendering and physics blank

Not applicable to Brass Ledger. Set them to `none` so engine-aware skills stop asking.
**Time**: 5 min
- [ ] `rendering` and `physics` recorded as none

### 5.2 Forbidden patterns empty

`technical-preferences.md` has no forbidden patterns. Candidates already stated in
CLAUDE.md: simulation rules outside `packages/sim`; schemas outside `packages/shared`;
whole-session client saves; headless runner importing browser or server state; real
user save directories in tests; signing credentials anywhere in the repo.
**Time**: 15 min
- [ ] Forbidden patterns recorded

---

## What to Expect from Existing Stories

There are no stories in the studio's format. The roadmap and issue lists in
`GROCER/POTATO/` stay where they are; nothing here regenerates them.

---

## Re-run

Run `/adopt` again after Step 2 (especially if rigor changes, which widens the audit) to
verify the blocking and high gaps are resolved.
