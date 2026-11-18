# Story 006: Consequence Reveal, thin stand-in (#106)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Blocked — BLOCKED: start gate (29 §1): #104/#107 and the formative smoke must permit it under 50-EXECUTION-PLAN
> **Layer**: Presentation
> **Type**: UI
> **Estimate**: M
> **Build step**: thin — consequence reveal and debrief UI
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief Your systems: consequence reveal and debrief UI
**Contract**: `GROCER/POTATO/V2/29-CONSEQUENCE-REVEAL-CONTRACT.md` §1–§3, §13, §15;
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

*From the brief's Goal & fail state and Your systems entry, made concrete by contract 29:*

- [ ] **AC-1**: After each command the reveal shows 1–5 material beats from the sim's safe consequence beats, each answering what happened, what we know about why, which earlier decision or state matters, what remains unresolved, and what the player can influence next.
- [ ] **AC-2**: The terminal reveal shows the post-route classification, then "What HQ believed" (deep-equal to the original historical safe semantics), then "What actually happened"; no hidden Ravellan truth appears before the debrief.

---

## Implementation Notes

*From contract 29 (§2, §16):*

- A causal bridge, not a mini victory screen or an accounting dashboard. No numeric importance score; beat order is the sim's.
- Never rewrite historical analysis or a claim using terminal truth; never declare decisions right or wrong; no cinematic scope before the fun hypothesis passes.

**Open:** 29 gives no rule for zero beats; treat 0 as invalid. Whether each beat answers its question *well* is a human judgement recorded from the screenshot review.

---

## Out of Scope

- Story 008: causality language, package narration, commitment/intelligence callbacks, warning gained/refreshed/lost narratives, attribution reveal, density/accessibility, and the rest of 29 §15.
- Story 005: the Command Room.

---

## Files

- `apps/web/src/` (reveal and debrief components)
- `apps/web/src/consequence-reveal.test.tsx`
- `production/qa/evidence/` (screenshots)

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: 1–5 material beats
  - Setup: sim safe consequence beats after a command
  - Verify: 1–5 beats, each with the five fields present and non-empty; if the sim gives more than 5, only 5 in the sim's priority order (intervention/retarget, matured capability, adversary change, delegated, accounting)
  - Pass condition: the minimum 1 and maximum 5 both render; no numeric importance score; no raw Ravellan truth
- **AC-2**: terminal reveal order, no truth leak
  - Setup: a completed run
  - Verify: post-route classification first, then "What HQ believed" (deep-equals the original historical safe semantics), then "What actually happened"
  - Pass condition: no hidden Ravellan state before the debrief; stale or superseded occurrences stay reconstructible; truth does not alter the historical record; warning gained, refreshed and lost stay distinct

---

## Test Evidence

**Story Type**: UI
**Required evidence**: a retained screenshot of each screen touched in `production/qa/evidence/` (BLOCKING), plus component tests in `apps/web/src/consequence-reveal.test.tsx`.

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-004-headless-six-cycle-run.md`, #107 headless design lab, and a formative smoke that does not trigger stop/redesign
- Unlocks: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-008-consequence-reveal-deepen.md`
