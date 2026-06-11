---
type: repository-frame
project: Brass Ledger
status: active
tags:
  - repository-frame
---

# GROCER Knowledge Repositories

This workspace is the GROCER vault. It uses four subordinate Obsidian-style documentation repositories. Each repository has a different job and should not become a dumping ground for the others.

| Repository | Role | Population status |
| --- | --- | --- |
| [[POTATO/POTATO]] | Game mechanics, engine contracts, implementation-facing rules, developer decisions. | Active and populated. |
| [[CELERY/CELERY]] | Military staff doctrine, commander support model, human-readable strategy playbook. | Active and populated. |
| [[CAPSICUM/README]] | Design language, UI/UX framework, sprite and visual rules. | Framed only. |
| [[CARROT/CARROT]] | Scenario worldbuilding, faction/theater generation, campaign templates, procedural content logic. | Active and populated. |

## Boundary Rules

- POTATO owns what the game does.
- CELERY owns why the staff system behaves that way.
- CAPSICUM will own how the product looks, reads, and feels.
- CARROT will own how scenarios are generated, varied, and validated.

When a doctrine idea changes play, record the doctrine in CELERY first, then translate it into POTATO mechanics. When an implementation changes the player experience, update POTATO first, then only update CELERY if the underlying staff model changed.
