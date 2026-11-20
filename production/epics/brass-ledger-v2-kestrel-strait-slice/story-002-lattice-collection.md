# Story 002: Lattice capability and collection tasks (#102)

> **Epic**: Brass Ledger — V2 Kestrel Strait slice
> **Status**: Ready
> **Layer**: Core
> **Type**: Integration
> **Estimate**: L
> **Build step**: core
> **Manifest Version**: N/A (minimal — no control manifest)
> **Last Updated**: —

## Context

**GDD**: `design/game-brief.md`
**Requirement**: Brief MVP feature 6 — Lattice capability and collection tasks (#102)
**Contract**: `GROCER/POTATO/V2/26-LATTICE-COLLECTION-MATRIX.md` §2–§18 (authority);
`26A-KESTREL-COLLECTION-PRODUCER-CATALOG.md` §3–§11 for raw→source→definition mappings only
where consistent with 26; `23C-HQ-BELIEF-EVIDENCE-CATALOG.md` for definition IDs.

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

*From the brief's Features item 6, made concrete by contract 26:*

- [ ] **AC-1**: Lattice matures only on the exact C1→C3 investment schedule (26 §2); any missed scheduled advance makes maturity unreachable, and an unreachable Lattice produces no C4/C5 task.
- [ ] **AC-2**: When operational, HQ selects exactly one unused target in C4 and a different unused target in C5 by the 26 §4 default order (exact for all three priorities; IDs `landing-force-staging`, `auxiliary-tasking`, `operational-sequence`); leaving it untouched executes HQ's selection; retargeting costs zero normal interventions; no-task, repeated target, more than one target per cycle and a C6 target are rejected.
- [ ] **AC-3**: A C4 task yields its result at C5 and a C5 task yields its result in the C6 pre-manifestation window, produced only as occurrences of predeclared #100 definitions through the `kestrel-collection-v1` mappings; varying only hidden posture with authorised facts fixed gives equal results; focused staging collection never consumes the landing question.
- [ ] **AC-4**: The persisted V2 prototype version advances exactly once from the #101 version and earlier payloads are rejected without migration; trusted replay recomputes task/result state and rejects every 26 §16 case (operational with no target while unused targets exist, repeated target, more than one target per cycle, C6 target, result before due cycle, result inconsistent with authorised facts, tampered task/result origin, duplicate occurrence, result overriding #100 semantics); no HQ belief is persisted; V1 unchanged.

---

## Implementation Notes

*From contract 26 (§8, §16, §18):*

- `kestrel-collection-v1` digests target IDs, task rules, one-shot rule, default order, result timing, authorised raw-fact domains, raw→source→definition mappings, liaison fallback mapping and applicability rules. It may not redefine #100 evidence meaning.
- Introduce the smallest replay-verifiable state/transition for progress, operational status, used targets, selected target and task cycle, due-result queue and origin.
- Reject: intelligence points/probabilities, no-task or same-target retask, focused collection consuming landing, the old `political-operational-sync` ID, reading hidden posture or the R6 action, persisted duplicate HQ belief, randomness masking target equivalence, a generic collection plugin framework.

**Open (escalate, do not invent):**
- `26A` still uses `political-operational-sync` and `kestrel-collection-producer-v1`, and D49 the old ID; follow 26 §4/§8. Before coding, check 26A's landing and auxiliary rows against 23C (only the sequence rows were cross-checked).
- 26A §5 leaves the task-selection persisted transition and its ledger discriminator to #102: choose the smallest replay-verifiable one; tests assert "an authoritative task-selection entry", not a name.
- Liaison fallback when Lattice is unreachable (26 §14) is in the contract; this story asserts only "no task".

---

## Out of Scope

- Story 001: Lattice investment state itself (#101 persists it; this story adds tasks/results).
- Story 003: recommendation that reads Lattice state (#98).
- Story 004: binding the collection digest into Kestrel content identity (#103).

---

## Files

- `packages/shared/src/` (task/result state schemas)
- `packages/sim/src/v2.ts`, a `packages/sim/src/v2-lattice*.ts` module
- `packages/sim/src/v2-lattice.test.ts`

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: matures only on the exact schedule; a miss is unreachable with no task
  - Given: opening `{on-track, 0}`
  - When: C1, C2, C3 protections are applied or skipped
  - Then: 0 → 1 → 2 → `operational`; a skip at C1, C2 or C3 gives `{unreachable, missedAtCycle}` with that cycle; no C4/C5 task offered
  - Edge cases: no catch-up, rewind or partial benefit; protecting after a miss rejected; operational starts at C4
- **AC-2**: default target by priority; one per cycle; zero-cost override; invalid targets rejected
  - Given: operational Lattice at C4, for each main priority
  - When: the default is resolved; the player leaves it, overrides it, or submits an invalid target
  - Then: `beacon-security` landing → sequence → auxiliary; `partner-cooperation` sequence → auxiliary → landing; `ravellan-understanding` auxiliary → sequence → landing; C5 default is the first unused in that order and differs from C4's; untouched executes the default; override leaves the normal-intervention count unchanged
  - Edge cases: 3 priorities × 3 C4 overrides, C5 picks the first unused (all 6 C4/C5 orders reachable); reject no-task, repeat, a second target in a cycle, a C6 target, and `political-operational-sync`
- **AC-3**: result timing, predeclared definitions, posture independence, focus never consumes landing
  - Given: C4 and C5 tasks with authorised facts fixed
  - When: results are instantiated through `kestrel-collection-v1`
  - Then: C4 task → C5 occurrence; C5 task → C6 pre-manifestation occurrence; landing: preparation `none` → `lattice-landing-dispersed`, `developing`/`ready` → `lattice-landing-concentration`; auxiliary: `none` with `probe_shipping` or `seed_deception` → `lattice-auxiliary-coercive`, otherwise `lattice-auxiliary-mixed`; sequence: two `prepare_beacon_seizure` → `lattice-sync-preparation-sequence`, one → `-signal`, none with ≥1 probe or seed → `-coercive-sequence`, else `-partial`; all three deep-equal when only hidden posture changes; C3 focused staging leaves landing eligible
  - Edge cases: no R6 action or row read; no integrated auxiliary branch; the occurrence copies 23C semantics and cannot override them
- **AC-4**: version, replay recomputation, rejection list
  - Given: the #101 version V, a valid ledger, then tampered ledgers
  - When: payloads load and replay runs
  - Then: version V+1; earlier payloads rejected with no migration; replay recomputes task/result state; each 26 §16 case rejected
  - Edge cases: origin refs are the task-selection entry plus the consumed Ravellan decisions (sequence needs both C4 and C5); no HQ belief persisted; V1 unchanged

---

## Test Evidence

**Story Type**: Integration
**Required evidence**: `packages/sim/src/v2-lattice.test.ts` (Vitest), passing; plus the repository gate.

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-001-persistent-consequences.md`
- Unlocks: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-003-staff-recommendation.md`, `production/epics/brass-ledger-v2-kestrel-strait-slice/story-004-headless-six-cycle-run.md`
