---
type: source-of-truth
project: Brass Ledger
status: active
created_on: 2026-06-06
tags:
  - POTATO
  - source-of-truth
---

# POTATO

POTATO is the game-engine and mechanics domain inside [[../GROCER/GROCER]]. Design, engine, backend, sprite, S1-S5, and development-stage decisions should be recorded here before they are treated as settled.

## Operating Rule

Always consult this domain before changing game rules, interface direction, sprite logic, save format, or engine architecture. If implementation and POTATO disagree, POTATO should be updated deliberately or the implementation should be brought back into alignment.

## Core Index

- [[../REPOSITORIES|Repository frame]]
- [[game-engine-review/01-core-game-and-usp]]
- [[game-engine-review/02-engine-and-mechanics-model]]
- [[game-engine-review/03-s1-s5-function-audit]]
- [[s1-s5-mechanics-translation]]
- [[game-engine-review/04-current-element-audit]]
- [[game-engine-review/05-browser-design-system]]
- [[game-engine-review/06-recommendations-and-roadmap]]
- [[compiled-engine-roadmap]]
- [[s1-s5-user-interface-model]]
- [[doctrine-mechanics-roadmap]]
- [[detailed-dialogue-and-advisor-styles]]
- [[development-stages]]
- [[sprite-design-logic]]
- [[backend-review/review-summary]]

## Current Direction

Brass Ledger is now a compile-able, headless-first game engine with browser, CLI, and API entrypoints. The browser is no longer the source of truth. The deterministic engine and shared headless runner are.

Current implementation state:

- Stage 3 tech/industry model is complete.
- `@brass-ledger/headless` is shared by the compiled CLI and `POST /api/headless/run`.
- Accepted-risk turns are explicit: supplied inputs must acknowledge projected S1-S5 warnings or opt into unattended auto-acceptance.
- Stage 4 agent chiefs and negotiation is active. Chief agenda memory is now persisted by turn resolution and completed chief conversations; coalition behavior, commitment creation, and staff-constraint negotiation remain next.

## Knowledge Repository Split

- [[../CELERY/CELERY]] owns military staff doctrine, staff behavior, and the human-readable strategy playbook.
- [[POTATO]] owns mechanics, engine contracts, balancing rules, and implementation-facing decisions.
- [[../CAPSICUM/README]] is framed for design language and visual systems.
- [[../CARROT/README]] is framed for scenario generation algorithms.

International doctrine now lives in [[../CELERY/international-doctrine-comparison]] with source proof in [[../CELERY/doctrine-proof-register]]. POTATO should use that material only as a mechanics substrate for fictional factions, not as direct real-world faction import.

## Dataview: Action Records

```dataview
TABLE priority, area, status
FROM "POTATO"
WHERE type = "game-engine-action" OR type = "backend-finding"
SORT priority ASC, severity ASC
```
