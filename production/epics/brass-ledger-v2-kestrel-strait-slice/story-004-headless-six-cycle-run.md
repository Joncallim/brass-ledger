# Story 004: Complete six-cycle headless run with content identity (#103, #104)

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
**Requirement**: Brief MVP feature 8 — complete six-cycle headless run with content identity (#103, #104)
**Contract**: `GROCER/POTATO/V2/33-HEADLESS-SIX-CYCLE-EXECUTION.md` §2–§17;
`38-PLAYER-SAFE-PROJECTION-CONTRACT.md`; `60-DECISION-LOG.md` D47; `26` §8 (collection digest).

**ADR Governing Implementation**: N/A (minimal — no ADRs)
**ADR Decision Summary**: N/A (minimal — no ADRs)
**ADR Version**: N/A (minimal — no ADRs)

**Engine**: Web 8.1.5 | **Risk**: HIGH (`docs/engine-reference/web/VERSION.md`: Vite 8)
**Engine Notes**: none (no ADR engine-compatibility analysis at minimal)

**Control Manifest Rules (this layer)**: N/A (minimal — no control manifest)

**Risk trigger (CLAUDE.md)**: content identity and replay hashes. Needs an independent
determinism/replay reviewer. Keep the portable headless runner uncoupled from browser and
server state.

---

## Acceptance Criteria

*From the brief's Goal & fail state and Features item 8, made concrete by contract 33:*

- [ ] **AC-1**: A run resolves Kestrel content identity binding both the `kestrel-hq-belief-v1` and `kestrel-collection-v1` semantic digests, and refuses an unresolved or mismatched bundle.
- [ ] **AC-2**: A complete C1→C6 run for each opening posture passes trusted replay, and identical content identity, bundles, seed, standing intent and provider outputs give identical ledger, persisted state, derived HQ history, Ravellan history and final classification (one of Strategic Success, Costly Success, Political Defeat, Operational Defeat).
- [ ] **AC-3**: The command provider receives only the player-safe projection (no hidden Ravellan state, source facts, evidence origins, internal enums or oracle); an invalid package or target fails without repair.
- [ ] **AC-4**: The transcript shows each cycle's safe brief, and the terminal debrief separates "What HQ believed" (equal to the reconstructed historical briefs) from "What was actually happening".

---

## Implementation Notes

*From contract 33 (§1, §14, §17):*

- Headless calls the same authoritative transitions and readouts later used by server and browser; it is never a simplified second game. Orchestration only: rules stay in shared/content/sim.
- Provide a bounded, isolated, deterministic batch API for #107; counterfactual cloning never mutates the source run.
- Reject: persisting or duplicating HQ belief; deriving #100 before adding due #102 evidence; an implicit content singleton; exposing source/internal state to the provider; a provider-authored delegated target; no-task or repeat; deriving the next brief before the Ravellan phase; repairing invalid output; trusting saved state without replay; rewriting history with terminal truth; running the smoke before #107; generic orchestration.

**Open:** which classification each posture produces is #107's question; assert only that the result is one of the four and identical across runs. The exact `contentDigest` composition is not specified in the sections read; assert dependence on both digests.

---

## Out of Scope

- #107 headless design lab and the three-player formative smoke (not stories in this epic).
- Stories 005–008: browser Command Room and Consequence Reveal.

---

## Files

- `packages/content/src/` (Kestrel content identity)
- `packages/headless/src/` (six-cycle runner, transcript)
- `packages/sim/src/v2.ts`
- `packages/headless/src/v2-six-cycle.test.ts`

---

## QA Test Cases

*Written by qa-lead (QL-STORY-READY: ADEQUATE, 2026-11-18). Implement against these.*

- **AC-1**: content identity binds both digests; refuses unresolved or mismatched bundles
  - Given: a resolved Kestrel content identity with both bundles
  - When: a run starts
  - Then: `contentDigest` incorporates both digests (D47, 26 §8); altering either changes the identity
  - Edge cases: missing belief bundle refused; missing collection bundle refused; digest mismatch on either refused; no implicit content singleton
- **AC-2**: complete run per opening posture passes replay; identical inputs give identical outputs
  - Given: each opening hidden posture (`genuine_preparation`, `coercive_feint`, `testing`, per 21) with fixed identity, bundles, seed, standing intent and deterministic provider
  - When: a full C1→C6 run is executed twice, then replayed
  - Then: replay passes; both runs deep-equal in ledger, persisted campaign/task/source state, derived HQ history, Ravellan history and signals, final state/digest/classification; classification is one of the four; no HQ-belief history persisted
  - Edge cases: derivation leaves state, revision and hash unchanged; a due #102 occurrence enters before same-window #100 reducers; not-ready error on the post-command, pre-Ravellan state; no C6 task; all-Delegate default-target package legal
- **AC-3**: provider receives only the player-safe projection; invalid output fails without repair
  - Given: a recording provider
  - When: a run proceeds, then invalid outputs are injected
  - Then: every provider input matches the 33 §3 allow-list; invalid package, no-task, repeated target, or a provider-authored delegated target or claim basis fails with a structured cycle/issue/task/package error; last verified state preserved
  - Edge cases: stale or incomplete package; C6 target; no silent Delegate, retarget or repair
- **AC-4**: transcript and terminal debrief
  - Given: a completed run
  - When: the transcript renders
  - Then: each cycle has a safe brief with the 33 §13 fields and no internal enums or evidence dump; terminal order is classification/state → "What HQ believed" → "What was actually happening"; "What HQ believed" deep-equals briefs reconstructed from the ledger and bundles, including warning gain, refresh and loss; hidden truth only in the third section
  - Edge cases: no hindsight rewrite; attribution claim and one-shot cost shown only when available; warning status at C5 and C6 (check "safe brief" against 38 when implementing)

---

## Test Evidence

**Story Type**: Integration
**Required evidence**: `packages/headless/src/v2-six-cycle.test.ts` (Vitest), passing; plus the repository gate and `npm run build --workspace @brass-ledger/cli`.

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: `production/epics/brass-ledger-v2-kestrel-strait-slice/story-001-persistent-consequences.md`, `production/epics/brass-ledger-v2-kestrel-strait-slice/story-002-lattice-collection.md`, `production/epics/brass-ledger-v2-kestrel-strait-slice/story-003-staff-recommendation.md`
- Unlocks: #107 headless design lab, then the formative smoke; then stories 005 and 006
