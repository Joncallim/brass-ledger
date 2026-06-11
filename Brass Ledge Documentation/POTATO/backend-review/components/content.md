---
type: backend-component
component: content
package: packages/content
role: scenario data and content validation
risk_level: low
source:
  - packages/content/src/scenario.ts
  - packages/content/src/validate-content.ts
tags:
  - backend-review
  - component/content
---

Backlink: [[POTATO]]


# Content

The content package contains the current Brass Ledger scenario and a validation script.

## Strengths

- Scenario is parsed through `scenarioDefinitionSchema` at module load.
- Content validation catches duplicate chiefs, memos, memo options, and events.
- Content validation checks option references to capability programs and external constraints.
- Scenario starts with aligned `maxTurns` and turn 1.

## Main Risks

- Event tag references are not checked against any tag registry because tags are free-form.
- Chief preferred/concern tags are not validated against memo option tags, which can silently reduce chief-position expressiveness.
- Initial state includes both canonical `strategic.*` values and top-level mirrors; validator does not assert they match.

## Source Anchors

- Scenario parse: `packages/content/src/scenario.ts:3`
- Validation script: `packages/content/src/validate-content.ts:1`
