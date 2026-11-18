# Story 005: Command Room, thin stand-in (#105)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Blocked — BLOCKED: start gate (28 §1): #104 complete → #107 complete → formative smoke does not trigger stop/redesign
> **Layer**: Presentation
> **Type**: UI
> **Estimate**: M
> **Build step**: thin — Command Room browser UI
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief Your systems: Command Room browser UI
**Contract**: `GROCER/POTATO/V2/28-COMMAND-ROOM-INTERACTION-CONTRACT.md` §1–§7, §19;
`38-PLAYER-SAFE-PROJECTION-CONTRACT.md`.

This builds what the V2 plan puts after the smoke test. The product owner chose to write
the story now (2026-11-18); it is not built before its start gate clears.

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web 8.1.5 | **Risk**: HIGH (`docs/engine-reference/web/VERSION.md`: Vite 8)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal). React 19.2.4 in `apps/web`.

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

*From the brief's Your systems entry, made concrete by contract 28:*

- [ ] **AC-1**: One command surface renders the sim's player-safe projection for the current cycle: situation/change, bounded Intelligence-Chief brief, standing direction, the agenda with each intended staff course and 2–4 reasons, and one `Issue Orders` action.
- [ ] **AC-2**: Every issue starts at Delegate; issuing orders untouched submits the all-Delegate package, and the browser never supplies a delegated final order.
- [ ] **AC-3**: Intervene and undo enforce the two-token personal-attention limit, and the three commander-only courses are offered only as interventions, never as Delegate.

---

## Implementation Notes

*From contract 28 (§3, §20) and CLAUDE.md:*

- The browser renders sim projections and submits only player authority. No intelligence, recommendation, package or terminal rule is computed in React.
- No Briefing → Memos → Chiefs → Final Review chain. Full evidence/history stays secondary.
- Server-authoritative mutation with `expectedRevision` stale-write rejection stays as it is.

---

## Out of Scope

- Story 007: the Lattice default/retarget control, the explicit C5/C6 warning line, `taskTargetOverride` submission, package conflicts, attribution disclosure, C6 routes, accessibility, and the rest of 28 §19.
- Story 006: the consequence reveal.

---

## Files

- `apps/web/src/` (Command Room component and route)
- `apps/web/src/command-room.test.tsx`
- `production/qa/evidence/` (screenshots)

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: one command surface renders the player-safe projection
  - Setup: a safe projection fixture for a cycle
  - Verify: situation/change; brief (judgement, ≤2 basis facts, ≤1 contrary, exactly one gap, ≤1 watch, ≤1 update); standing direction; each agenda issue with its staff course and 2–4 reasons; one `Issue Orders` action; no internal enums, source facts or hidden state
  - Pass condition: all present for every agenda-size fixture, a missing optional line renders cleanly, no Briefing/Memos/Chiefs chain
- **AC-2**: all-Delegate default
  - Setup: any cycle; load the page and click `Issue Orders` untouched
  - Verify: every issue shows Delegate; the submitted payload is all-Delegate dispositions with no recommendation or claim fields
  - Pass condition: the sim derives the final orders; the browser sends no delegated final order
- **AC-3**: two-token limit, undo, commander-only exclusion
  - Setup: a cycle with several alternatives
  - Verify: Intervene uses one token and Delegate returns it; a third normal intervention cannot submit and the player must release an earlier one (nothing silently replaced); the three commander-only courses appear only as interventions (from `requiresIntervention`, not copy)
  - Pass condition: exactly 2/2 works, undo at 2/2 works, a retarget is not counted

---

## Test Evidence

**Story Type**: UI
**Required evidence**: a retained screenshot of each screen touched in `production/qa/evidence/` (BLOCKING), plus component tests in `apps/web/src/command-room.test.tsx`.

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-004-headless-six-cycle-run.md`, #107 headless design lab, and a formative smoke that does not trigger stop/redesign
- Unlocks: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-007-command-room-deepen.md`
