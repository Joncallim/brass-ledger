# Story 008: Consequence Reveal, deepened (#106)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Blocked — BLOCKED: start gate (29 §1), and no design doc yet (`design/gdd/consequence-reveal.md`; run `/design-system consequence-reveal` first)
> **Layer**: Presentation
> **Type**: UI
> **Estimate**: L
> **Build step**: deepen — consequence reveal and debrief UI
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`; system doc `design/gdd/consequence-reveal.md` (not yet written)
**Requirement**: Brief Your systems: consequence reveal and debrief UI
**Contract**: `GROCER/POTATO/V2/29-CONSEQUENCE-REVEAL-CONTRACT.md` (canonical). The design doc
`/design-system` writes should point to 29, not restate it.

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

- [ ] **AC-1**: The consequence reveal and debrief are built out as `design/gdd/consequence-reveal.md` describes.

---

## Implementation Notes

Write `design/gdd/consequence-reveal.md` with `/design-system consequence-reveal` first, as a
pointer to contract 29. Its criteria then replace AC-1 here, and the QA lead reviews them
before this story is built. Expect them to cover the rest of 29 §15: provenance
distinctions, delegated callbacks, exact order-independent C2/C5 narration, promise/liaison/
authority transitions, warning gained/refreshed/lost-stale, attribution reveal without raw
support IDs, terminal post-route state, V1 After Action unchanged.

---

## Out of Scope

- Story 006: what the thin stand-in already built.

---

## Files

- `apps/web/src/` (reveal and debrief)
- `production/qa/evidence/` (screenshots)

---

## QA Test Cases

*Test cases not yet defined — QL-STORY-READY: NOT ASSESSED (design/gdd/consequence-reveal.md missing). Run /qa-plan, or re-run the QA lead, once the design doc exists.*

---

## Test Evidence

**Story Type**: UI
**Required evidence**: a retained screenshot of each screen touched in `production/qa/evidence/` (BLOCKING).

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-006-consequence-reveal-thin.md`; `design/gdd/consequence-reveal.md`
- Unlocks: #108 browser E2E
