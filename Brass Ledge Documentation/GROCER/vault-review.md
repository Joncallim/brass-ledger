---
type: vault-review
project: Brass Ledger
status: active
reviewed_on: 2026-06-07
tags:
  - GROCER
  - review
  - engine-foundation
---

Backlink: [[GROCER]]

# Vault Review

## Consolidation Result

`Brass Ledge Documentation/` is now the folder to open directly in Obsidian. GROCER remains the canonical vault section inside that umbrella. The former root-level note repositories have been moved into the documentation folder:

| Former vault | New GROCER path | Status |
| --- | --- | --- |
| POTATO | [[POTATO/POTATO]] | Active engine/mechanics domain. |
| CELERY | [[CELERY/CELERY]] | Active doctrine/staff domain. |
| CARROT | [[CARROT/CARROT]] | Active world/scenario domain. |
| CAPSICUM | [[CAPSICUM/README]] | Framed design domain; mostly unpopulated. |

The legacy comparison folders remain inside `Brass Ledge Documentation/` during migration. New notes should be created inside `GROCER/`.

## Corrected Inconsistencies

| Issue | Correction |
| --- | --- |
| `GROCER.md` described GROCER as a coordinator of subordinate vaults instead of the single vault. | GROCER is now defined as the single vault root with internal domains. |
| `POTATO/development-stages.md` said all notes should consolidate into POTATO. | Stage 0 now says notes consolidate into GROCER; POTATO remains the engine/mechanics domain. |
| `POTATO/POTATO.md` described POTATO as the source of truth for all Brass Ledger decisions. | POTATO now owns game-engine and mechanics decisions inside GROCER. |
| Validation only checked `POTATO/`. | The validation script now checks `GROCER/` as the canonical vault. |

## Current Engine Truths

These claims match the current TypeScript implementation and should be treated as foundation facts until changed deliberately:

- Current scenario id: `brass-ledger-jhq`.
- Current scenario title: `Brass Ledger`.
- Current theater: `Northern Frontier`.
- Current turn model: 12 max turns with a 6-turn micro-campaign.
- Current player-facing staff model: S1-S5.
- Current internal directorates: `people`, `intelligence`, `operations`, `sustainment`, `plans`, and `training`.
- Current S3 mapping includes both `operations` and `training`.
- Current capability programs: Joint Fires Network, Counter-Deception Grid, Sustainment Ledger, and Reserve Rebuild.
- Current external constraints: Commercial Shipping Market, Trusted Electronics Chain, and Propellant Market.

## Accuracy Risks To Keep Visible

| Area | Risk | Engine implication |
| --- | --- | --- |
| CARROT worldbuilding | Glasshouse Meridian factions are richer than the implemented single Northern Frontier scenario. | Treat CARROT factions as future scenario substrate, not current engine content. |
| CELERY doctrine | Doctrine notes include real-world references and abstraction claims. | Any faction mechanic derived from CELERY needs an `evidenceRefs` trail before implementation. |
| POTATO roadmap | Some roadmap items are started, not complete. | Notes must distinguish implemented contracts from intended mechanics. |
| CAPSICUM design | CAPSICUM is framed but not populated. | Current visual source remains POTATO sprite/UI notes until CAPSICUM is filled. |
| Dual tech tree | Planning docs describe exact algorithms not yet implemented as first-class engine modules. | Do not encode dual-tech assumptions as live balance requirements until the engine has data structures and tests. |

## Required Follow-Up Before Engine Expansion

1. Add a migration decision: either remove the legacy comparison folders under `Brass Ledge Documentation/` after review or mark them as archived.
2. Populate CAPSICUM by moving or summarizing visual rules from [[POTATO/sprite-design-logic]] and [[POTATO/game-engine-review/05-browser-design-system]].
3. Convert CARROT faction balance into scenario data only after the S1-S5 contract and doctrine-profile schema are stable.
4. Add tests when doctrine mechanics move from notes into `packages/sim`.
