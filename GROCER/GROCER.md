---
type: vault-index
project: Brass Ledger
status: active
created_on: 2026-06-07
tags:
  - GROCER
  - source-of-truth
---

# GROCER

GROCER is the single Obsidian-style vault for Brass Ledger. It consolidates the former vegetable-codename vaults into one vault root while preserving their responsibilities as internal knowledge domains.

## Vault Domains

| Domain | Role |
| --- | --- |
| [[POTATO/POTATO]] | Game mechanics, engine contracts, balancing rules, and implementation-facing decisions. |
| [[CELERY/CELERY]] | Military staff doctrine, commander support, tactical patterns, and faction doctrine substrate. |
| [[CARROT/CARROT]] | Scenario worldbuilding, faction and theater generation, campaign templates, and narrative continuity. |
| [[CAPSICUM/README]] | Visual language, UI/UX framework, sprite rules, layout patterns, and product tone. |
| [[REPOSITORIES]] | Repository boundary rules and migration frame. |
| [[vault-review]] | Consolidation review, inconsistencies, and engine-foundation corrections. |

## Operating Rule

Use GROCER as the vault root. Put content in the domain that owns the decision.

- Doctrine and staff behavior belong in CELERY.
- Game rules and engine-facing balance belong in POTATO.
- Setting, factions, scenarios, theaters, and campaign generators belong in CARROT.
- Visual and interface style belongs in CAPSICUM.

When an idea crosses boundaries, record it first in the domain that owns the reason, then link the dependent domains.

## Engine Foundation Rule

The current game-engine foundation is:

- S1-S5 is the player-facing staff contract.
- The engine may keep six internal directorates, with `training` represented under S3 Operations for player-facing readouts.
- Scenario data in `packages/content/src/scenario.ts` is the implementation source for current content values.
- GROCER notes should describe intended design and explicitly mark items that are not yet implemented.
