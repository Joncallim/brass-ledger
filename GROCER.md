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

GROCER is the single Obsidian-style vault for Brass Ledger. Open [[GROCER/GROCER]] for the canonical vault index.

The folders inside `GROCER/` preserve the vegetable codenames as internal knowledge domains:

- `POTATO/` for game mechanics, engine contracts, balancing rules, and implementation-facing decisions.
- `CELERY/` for military staff doctrine, commander support, tactical patterns, and faction doctrine substrate.
- `CARROT/` for scenario worldbuilding, faction and theater generation, campaign templates, and narrative continuity.
- `CAPSICUM/` for visual language, UI/UX framework, sprite rules, layout patterns, and product tone.

Legacy top-level folders are retained for comparison during migration. New vault work should happen under `GROCER/`.

## Subordinate Vaults

| Vault | Role |
| --- | --- |
| [[POTATO/POTATO]] | Game mechanics, engine contracts, balancing rules, and implementation-facing decisions. |
| [[CELERY/CELERY]] | Military staff doctrine, commander support, tactical patterns, and faction doctrine substrate. |
| [[CARROT/CARROT]] | Scenario worldbuilding, faction and theater generation, campaign templates, and narrative continuity. |
| [[CAPSICUM/README]] | Visual language, UI/UX framework, sprite rules, layout patterns, and product tone. |

## Operating Rule

Use GROCER as the map. Put content in the subordinate vault that owns the decision.

- Doctrine and staff behavior belong in CELERY.
- Game rules and engine-facing balance belong in POTATO.
- Setting, factions, scenarios, theaters, and campaign generators belong in CARROT.
- Visual and interface style belongs in CAPSICUM.

When an idea crosses boundaries, record it first in the vault that owns the reason, then link the dependent vaults.
