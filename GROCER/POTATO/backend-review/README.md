---
type: backend-review-index
reviewed_on: 2026-06-06
project: Brass Ledger
scope:
  - apps/server
  - packages/sim
  - packages/shared
  - packages/content
status: complete
tags:
  - backend-review
  - obsidian/database
---

Backlink: [[POTATO]]


# Backend Review Database

This folder is an Obsidian-friendly review database for the Brass Ledger game backend. It uses Markdown notes, YAML frontmatter, and wikilinks so it can be browsed as a vault section or queried with Dataview.

## Query: Open Findings

```dataview
TABLE severity, status, area, risk
FROM "POTATO/backend-review/findings"
WHERE type = "backend-finding" AND status != "closed"
SORT severity ASC, file ASC
```

## Query: Backend Components

```dataview
TABLE role, package, risk_level
FROM "POTATO/backend-review/components"
WHERE type = "backend-component"
SORT package ASC
```

## Review Notes

- [[review-summary]]
- [[architecture-map]]
- [[api-surface]]
- [[state-and-replay-model]]
- [[test-and-verification]]

## Finding Records

- [[findings/F-001-client-save-overwrites-authoritative-state]]
- [[findings/F-002-import-accepts-forged-sessions]]
- [[findings/F-003-open-cors-local-save-mutation]]
- [[findings/F-004-save-id-path-boundary-is-implicit]]
- [[findings/F-005-replay-validation-assumes-history-alignment]]
- [[findings/F-006-file-store-has-lost-update-races]]
- [[findings/F-007-save-schema-lacks-game-invariant-ranges]]
- [[findings/F-008-static-asset-prefix-check-is-fragile]]

## Component Records

- [[components/server]]
- [[components/simulation]]
- [[components/shared-contracts]]
- [[components/content]]
- [[components/file-save-store]]
