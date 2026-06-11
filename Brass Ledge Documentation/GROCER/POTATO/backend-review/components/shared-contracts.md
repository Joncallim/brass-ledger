---
type: backend-component
component: shared-contracts
package: packages/shared
role: Zod schemas, state summaries, advisor and conversation helpers
risk_level: medium
source:
  - packages/shared/src/index.ts
tags:
  - backend-review
  - component/shared
---

Backlink: [[POTATO]]


# Shared Contracts

The shared package defines the backend's structural contracts and several game helper functions. It is both the API contract layer and part of the simulation model.

## Strengths

- Zod schemas cover the major session, state, scenario, turn, replay, and conversation structures.
- Directorates, phases, chief positions, and campaign statuses use enums.
- Conversation records are stored as structured transcript/choice data.

## Main Risks

- Numeric schemas are mostly `z.number()` without range constraints, so persisted/imported data can be structurally valid while violating game invariants.
- `GameSession` does not encode replay invariants such as equal `turnInputs` and `history` length.
- State contains duplicate mirrors that can diverge in accepted saves unless canonicalization is enforced.

## Source Anchors

- Campaign state schema: `packages/shared/src/index.ts:420`
- Turn input schema: `packages/shared/src/index.ts:460`
- Turn result schema: `packages/shared/src/index.ts:467`
- Game session schema: `packages/shared/src/index.ts:512`
- Directorate burden: `packages/shared/src/index.ts:767`
- Chief position derivation: `packages/shared/src/index.ts:841`
