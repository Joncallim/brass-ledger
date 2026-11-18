# Story 003: Staff recommendation and dissent (#98)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Ready
> **Layer**: Core
> **Type**: Logic
> **Estimate**: M
> **Build step**: core
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 7 — belief- and state-aware staff recommendation and dissent (#98)
**Contract**: `GROCER/POTATO/V2/24-STAFF-RECOMMENDATION-POLICY.md` (Recommendation algorithm,
Recommendation result, Dissent, Required #98 tests); `36-KESTREL-AGENDA-COURSE-MATRIX.md`;
`39-KESTREL-CROSS-SYSTEM-COMPOSITION.md` for complete-package legality.

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web 8.1.5 | **Risk**: HIGH (`docs/engine-reference/web/VERSION.md`: Vite 8)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

**Risk trigger (CLAUDE.md)**: the replay agenda provider changes. Needs an independent
determinism/replay reviewer.

---

## Acceptance Criteria

*From the brief's Features item 7, made concrete by contract 24:*

- [ ] **AC-1**: Each issue yields one deterministic recommendation by the precedence player-legal set → protected boundary → main priority → default style → tolerated cost → commitment → responsible-officer tie, returned as structured reason refs (2–4 decisive) with no numeric score; when every candidate crosses a constraint it emits no-clean-option.
- [ ] **AC-2**: The three commander-only courses (C2 `public-accusation`, C4 `request-partner-liaison`, C5 `use-attribution`) are never recommended under any standing intent, and every all-Delegate package is legal.
- [ ] **AC-3**: With the same legitimate assessment, warning, public-case and source state, changing only hidden truth leaves recommendation and dissent equal; warning is used only in the C5 Beacon warning-sensitive tie; the C3 Intelligence/Operations dissent from `unclear / conflicted` appears as authored in 36 §6.
- [ ] **AC-4**: In replay the provider sees only the verified ledger prefix; live and verified-prefix recommendations agree; changing a command or future entry cannot change an earlier agenda; no persisted schema or version changes.

---

## Implementation Notes

*From contract 24 (Verified-prefix input, Rejection conditions) and 50 (#98 replay-provider gate):*

- Evolve the in-memory agenda provider to take a sim-created verified ledger-prefix context; never the untrusted full import or future command entries. This changes no persisted version.
- No weighted utility, no array/random tie-breaking, no runtime LLM advice, no reading a persisted credible mirror, no inferring warning from assessment, no trusting a client claim or evidence basis.
- Chief worldview creates preference, concern and dissent but never pre-filters the commander's direction.

**Open (escalate, do not invent):**
- **C5 Operations/Political dissent is not authored** in 36 or 39 (24 says "where authored"). It is excluded from this story: a product decision for the owner.
- 36 §6 says Intelligence "may" dissent at C3; 24 requires the C3 disagreement. Assert its existence, not its exact copy. If the reserve red line removes forward-reserve, the dissent condition is undefined: escalate.

---

## Out of Scope

- The C5 Operations/Political dissent (unauthored; see above).
- Story 005/007: rendering recommendations in the Command Room.

---

## Files

- `packages/sim/src/` (a `v2-recommendation*.ts` module; agenda provider in `v2.ts`)
- `packages/shared/src/` (recommendation result types)
- `packages/sim/src/v2-recommendation.test.ts`

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: deterministic recommendation by precedence
  - Given: fixed standing intent and state
  - When: the recommendation is derived
  - Then: it follows legal set → boundary → priority → style → tolerated cost → commitment → officer tie; returns 2–4 decisive reason refs and no numeric score; if every candidate crosses the boundary it emits `no-clean-option` and fabricates nothing
  - Edge cases: each step eliminating or retaining all candidates; neutral is not a style match; a missing reachable tie is a validation failure; no array, lexical or random ordering
- **AC-2**: commander-only never recommended; all-Delegate legal
  - Given: every standing-intent combination
  - When: recommendations are derived for C2, C4 and C5
  - Then: `public-accusation`, `request-partner-liaison`, `use-attribution` never recommended; they remain player-legal at one intervention each; the all-Delegate package is legal; C5 attribution baseline is Hold
  - Edge cases: partner or visible-style priority cannot re-admit them
- **AC-3**: hidden-truth independence; warning only in the C5 Beacon tie; C3 dissent
  - Given: identical assessment, warning, public-case and source state, only hidden truth varied
  - When: recommendation and dissent are derived
  - Then: deep-equal; warning changes the outcome only in the C5 Beacon tie (usable: quiet > visible > hold; else preparation: quiet > visible > hold; else hold > quiet > visible); at `unclear / conflicted` in C3, Operations prefers forward > hold and Intelligence dissents
  - Edge cases: the reserve red line removes reinforcement before the tie and the reason ref exposes the tension; warning ignored in non-warning ties
- **AC-4**: verified-prefix replay safety
  - Given: a ledger of command sets and Ravellan decisions
  - When: the provider derives the agenda live and in replay
  - Then: it sees only the prefix through the cycle-Q Ravellan decision and command sets through Q−1; live = replay; changing command Q or later leaves the Q agenda unchanged; no persisted schema or version change
  - Edge cases: unverified import cannot generate advice; #99 replay/order tests stay green

---

## Test Evidence

**Story Type**: Logic
**Required evidence**: `packages/sim/src/v2-recommendation.test.ts` (Vitest), passing; plus the repository gate.

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-001-persistent-consequences.md`, `production/epics/brass-ledger-v2-kestrel-strait-slice/story-002-lattice-collection.md`
- Unlocks: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-004-headless-six-cycle-run.md`
