# Story 001: Persistent consequences and irreversible source use (#101)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: In Progress
> **Layer**: Core
> **Type**: Integration
> **Estimate**: L
> **Build step**: core
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: 2026-11-18

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 5 — persistent consequences and irreversible source use (#101)
**Contract**: `GROCER/POTATO/V2/25-KESTREL-CONSEQUENCE-MATRIX.md` §2–§19; `10-GAMEPLAY-CONTRACT.md`
"Persistent consequences", "Attribution", "Replay and compatibility". The contract wins over this story.

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web 8.1.5 | **Risk**: HIGH (`docs/engine-reference/web/VERSION.md`: Vite 8)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

**Risk trigger (CLAUDE.md)**: changes persisted V2 state and replay. Needs one domain
implementer plus an independent determinism/replay reviewer.

---

## Acceptance Criteria

*From the brief's Goal & fail state and Features item 5, made concrete by contract 25:*

- [ ] **AC-1**: The persistent campaign records of 25 §2 (Beacon exposure and preparation, reserve, partner consent, consultation promise, partner authority, political concession, liaison obligation, Lattice investment, attribution source use) exist with the exact opening state, and impossible states are rejected.
- [ ] **AC-2**: Every C1–C5 order applies exactly its 25 §6–§10 effects from the final command set inside the existing `command-set` resolver, with C2 and C5 aggregate arithmetic clamped once and independent of issue order.
- [ ] **AC-3**: Attribution availability derives from the current #100 public-case basis plus persisted source use (no persisted case mirror); Use at C5/C6 persists `usedAtCycle`, claim direction, two evidence IDs and two distinct corroboration groups, after which the record is immutable and the source unavailable; a one-source or directionless case cannot be used; the client cannot submit the basis.
- [ ] **AC-4**: The persisted V2 prototype version advances exactly once; trusted replay recomputes every new field and rejects tampered arithmetic, promise, Lattice, source basis and observation; earlier prototype payloads are rejected without migration; V1 tests stay unchanged.

---

## Implementation Notes

*From contract 25 (§17 Replay integration, §19 Rejection conditions):*

- Inspect the actual predecessor prototype version first; advance exactly once.
- Extend the existing `command-set` resolver; do not add a generic "consequence update" ledger entry for changes wholly determined by the command set. Do not widen `ravellan-decision`.
- Derived consequence facts are recomputed on replay, never trusted from a saved payload.
- Reject: a mutable persisted public-case mirror, a pre-command synchronisation transition, generic trust/morality scores, free recovery, a generic consequence/lifecycle framework, and any V1 change.
- #101 does not pre-add #102 task fields (25 §2 Lattice investment).

**Open (escalate, do not invent):**
- 25 §10 C5 `quiet-reinforce-beacon` reserve −1 "when material commitment required" has no defined trigger. Check `39-KESTREL-CROSS-SYSTEM-COMPOSITION.md`; if it is not there, stop with `BLOCKED: PRODUCT DECISION REQUIRED` for that case.
- `60-DECISION-LOG` D50 (`used|expired`) conflicts with 25 §2 (`unspent|used`). Follow 25.
- Cross-field combinations across records (e.g. promise × partner authority) are not defined in 25; reject only what 25 §2 defines.

---

## Out of Scope

- Story 002: Lattice task selection, used targets and results (#102).
- Story 003: staff recommendation (#98).
- C6 route legality (`27-KESTREL-TERMINAL-MATRIX.md`); this story only stores `usedAtCycle 6` when a legal C6 Use is submitted.

---

## Files

- `packages/shared/src/` (V2 campaign-state schemas)
- `packages/sim/src/v2.ts` (command-set resolver, replay)
- `packages/sim/src/v2-consequences.test.ts`

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: persistent records exist with exact opening state; impossible combinations rejected
  - Given: a fresh V2 Kestrel state
  - When: the campaign state is created and parsed
  - Then: opening is exposure `thin`, preparation `routine`, reserve `usable`, partner consent `cooperative`, promise `none`, partner authority `pending`, concession `none`, liaison `none`, Lattice `{on-track, protectedThroughCycle 0}`, source `{unspent}`
  - Edge cases: reject `on-track` with `missedAtCycle`; `unreachable` with `protectedThroughCycle`; `protectedThroughCycle` 3; `missedAtCycle` 0 or 4; `operational` with extra fields; `used` with `usedAtCycle` not 5 or 6, identical group IDs, a direction other than preparation or coercion, or fewer than two evidence IDs; any enum value outside the 25 §2 sets
- **AC-2**: every C1–C5 order applies exactly its effects; C2/C5 clamp once, order-independent
  - Given: a pre-command state and a complete final command set
  - When: the `command-set` resolver runs, including each permutation of issue order
  - Then: post-state matches the per-order tables (C1 §6, C2 §7 summed then clamped once, C3 §8, C4 §9, C5 §10 summed then clamped once); C2 `coordinatedVisibleSurge` only with an `active` pre-command promise AND `joint-non-attributive-warning` AND `visible-patrol-surge`; breach triggers are exactly uncoordinated surge, `public-accusation`, C4 `press-visible-advantage`, C5 `act-then-inform` with a partner-sensitive action; identical net state across issue orders; one derived consequence fact per contribution
  - Edge cases: clamp at both ordinal bounds; reroute+warning nets 0; reroute+accusation nets −2 where room exists; surge+warning without a channel nets 0 and still breaches an active promise; preparation idempotent; withdrawn partner + Honour legal; `act-then-inform` one package-level deterioration; C1 "partner improves only if below cooperative" needs a constructed state; the open C5 `quiet-reinforce-beacon` case above
- **AC-3**: attribution availability derives from #100 plus source use; Use persists the exact record
  - Given: source unspent or used; current basis credible-source-sensitive, one-source or directionless
  - When: availability is derived, and `use-attribution` is submitted at C5
  - Then: used → `{unavailable, source-already-used}`; unspent → current basis; Use stores `{used, usedAtCycle 5, direction, 2 evidence IDs, 2 distinct group IDs}` copied from the re-derived basis; record immutable; source unavailable after; Hold persists nothing
  - Edge cases: one-source/directionless rejected; client-supplied basis or direction rejected or ignored; both claim directions; second Use rejected; no persisted case-mirror field; C6 Hold And Expose stores `usedAtCycle 6`
- **AC-4**: version advances once; replay recomputes and rejects tampering; earlier payloads rejected; V1 unchanged
  - Given: a valid replay ledger and predecessor prototype payloads
  - When: the ledger is verified and payloads are loaded
  - Then: version = predecessor + 1; replay recomputes the new fields; V1 tests pass unmodified
  - Edge cases: tampered aggregate arithmetic, promise, Lattice, source basis or Ravellan observation each fail replay; an earlier-version payload is rejected with no migration; hashes and revisions recomputed

---

## Test Evidence

**Story Type**: Integration
**Required evidence**: `packages/sim/src/v2-consequences.test.ts` (Vitest, beside the code), passing; plus the repository gate (`npm run lint:grocer`, `npm run lint:content`, `npm test`, `npm run build`).

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: None (#100 is on main)
- Unlocks: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-002-lattice-collection.md`, `production/epics/brass-ledger-v2-kestrel-strait-slice/story-003-staff-recommendation.md`
