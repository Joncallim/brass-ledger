# Story 007: Command Room, deepened (#105)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Blocked — BLOCKED: start gate (28 §1), and no design doc yet (`design/gdd/command-room.md`; run `/design-system command-room` first)
> **Layer**: Presentation
> **Type**: UI
> **Estimate**: L
> **Build step**: deepen — Command Room browser UI
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`; system doc `design/gdd/command-room.md` (not yet written)
**Requirement**: Brief Your systems: Command Room browser UI
**Contract**: `GROCER/POTATO/V2/28-COMMAND-ROOM-INTERACTION-CONTRACT.md` (canonical). The design
doc `/design-system` writes should point to 28, not restate it.

This builds what the V2 plan puts after the smoke test. The product owner chose to write
the story now (2026-11-18).

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web 8.1.5 | **Risk**: HIGH (`docs/engine-reference/web/VERSION.md`: Vite 8)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal). React 19.2.4 in `apps/web`.

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

---

## Acceptance Criteria

- [ ] **AC-1**: The Command Room is built out as `design/gdd/command-room.md` describes.

---

## Implementation Notes

Write `design/gdd/command-room.md` with `/design-system command-room` first, as a pointer to
contract 28. Its criteria then replace AC-1 here, and the QA lead reviews them before this
story is built. Expect them to cover the rest of 28 §19: Lattice default/retarget control,
explicit C5/C6 warning, package conflicts without repair, attribution disclosure, safe C6
routes, stale drafts, keyboard/accessibility.

---

## Out of Scope

- Story 005: what the thin stand-in already built.

---

## Files

- `apps/web/src/` (Command Room)
- `production/qa/evidence/` (screenshots)

---

## QA Test Cases

*Test cases not yet defined — QL-STORY-READY: NOT ASSESSED (design/gdd/command-room.md missing). Run /qa-plan, or re-run the QA lead, once the design doc exists.*

---

## Test Evidence

**Story Type**: UI
**Required evidence**: a retained screenshot of each screen touched in `production/qa/evidence/` (BLOCKING).

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-005-command-room-thin.md`; `design/gdd/command-room.md`
- Unlocks: #108 browser E2E
