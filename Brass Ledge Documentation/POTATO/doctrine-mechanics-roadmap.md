---
type: mechanics-roadmap
area: doctrine-mechanics
status: active
priority: P1
tags:
  - POTATO
  - CELERY
  - doctrine
  - factions
  - mechanics
---

# Doctrine Mechanics Roadmap

Backlink: [[POTATO]]

Doctrine sources:

- [[../CELERY/doctrine-pattern-library]]
- [[../CELERY/adversarial-debate-library]]
- [[../CELERY/faction-doctrine-gene-bank]]
- [[../CELERY/doctrine-proof-register]]

## Purpose

This roadmap turns the expanded CELERY doctrine repository into implementation work for POTATO. The aim is a playable staff-command system where doctrine changes decision texture, not just numbers.

## Core Data Additions

```ts
type AcceptedRisk = {
  id: string;
  staffFunction: "S1" | "S2" | "S3" | "S4" | "S5";
  sourceMemoId: string;
  riskType: string;
  warning: string;
  expectedWindow: "immediate" | "next_turn" | "campaign";
  evidenceRefs: string[];
};

// The implemented schema (packages/shared doctrineMechanicsStateSchema) is
// authoritative. handoffFriction, supportableTempo, and planningCompression were
// dropped from the doctrine variable set during Doctrine 1 (issue #55):
// supportableTempo lives in staffMechanics.s4 as the S4 staff metric.
type DoctrineMechanicsState = {
  campaignAimClarity: number;
  relativeTempo: number;
  mainEffortFocus: number;
  secondaryRiskAccepted: number;
  optionDislocation: number;
  signatureControl: number;
  exposureControl: number;
  orderClarity: number;
  culminationRisk: number;
  uncommittedCapacity: number;
  operationalReach: number;
  staffSynchronization: number;
  commanderIntentClarity: number;
  systemPressure: number;
};

type DoctrineGene = {
  id: string;
  label: string;
  evidenceRefs: string[];
  strengths: string[];
  vulnerabilities: string[];
  variableModifiers: Partial<Record<keyof DoctrineMechanicsState, number>>;
  staffAdviceStyle: Partial<Record<"S1" | "S2" | "S3" | "S4" | "S5", string>>;
};
```

## Resolution Hooks

| Phase | Doctrine work |
| --- | --- |
| Memo generation | Attach objective, tempo, main-effort, deception, reserve, and sustainment tags. |
| Preview | Show staff burden plus accepted-risk candidates. |
| Chief debate | Chiefs challenge doctrine overuse through adversarial objections. |
| Commit | Player explicitly accepts or mitigates the top staff risks. |
| Resolve | Doctrine variables modify deltas only through gates and counterweights. |
| After action | Report which doctrine bet paid off, which staff warning matured, and which risk moved forward. |

## Pattern-To-Mechanic Map

| CELERY pattern | Engine variable | Gate | Failure event |
| --- | --- | --- | --- |
| Objective | `campaignAimClarity` | S5 coherence and memo tag consistency. | Contradiction debt. |
| Tempo | `relativeTempo` | S1 debt, S2 confidence, S4 supportable tempo. | Early culmination. |
| Main effort | `mainEffortFocus` | Declared priority and support allocation. | Neglected-lane failure. |
| Economy of force | `secondaryRiskAccepted` | Explicit accepted risk. | Surprise from under-resourced lane. |
| Maneuver | `optionDislocation` | S2 confidence and S4 lift/support. | Hollow movement or revealed posture. |
| Deception | `signatureControl` | S2 counter-deception and S3 synchronization. | Exposure penalty or self-deception. |
| Security | `exposureControl` | S2/S4 risk control. | Tempo drag. |
| Simplicity | `orderClarity` | Low complexity load. | Lower upside on multi-lane actions. |
| Culmination | `culminationRisk` | S1/S4/S3 condition. | Hard readiness/support loss. |
| Reserve | `uncommittedCapacity` | Unspent staff/action capacity. | Lower immediate progress. |
| Sustainment reach | `operationalReach` | S4 stock, lift, repair, financial/health support. | Support ceiling. |
| Mission command | `commanderIntentClarity` | Trust and chief competence. | Handoff friction. |
| System competition | `systemPressure` | S2 estimate and optional J6/C2. | Mis-targeting or dependency blowback. |

## Faction-Gene Implementation

- ✅ Phase 1: Add doctrine variables to state, initialized neutrally. *(Landed — issue #55.)*
- ✅ Phase 2: Add scenario-level doctrine genes from [[../CELERY/faction-doctrine-gene-bank]]. *(Landed — issue #56: DoctrineGene/DoctrineProfile in shared, content gene registry, profile applied to the opening baseline at scenario-definition time; the sim derives its pull targets and recompute offsets from the biased baseline so the bias is durable.)*
- Phase 3: Let genes alter chief advice style and burden routing. *(Issue #57.)*
- Phase 4: Add faction-specific events that mature from overused doctrine. *(Issue #58.)*
- Phase 5: Add optional staff modules: J6/C2, J8 finance, J9 policy/civil affairs, STRATCOM, medical, engineering. *(Issue #59.)*

## Player-Facing Rules

- Never show doctrine as a wall of theory.
- Show doctrine as staff argument, preview modifier, and after-action consequence.
- Every benefit needs a counterweight.
- Accepted risks should remain visible until paid, mitigated, or disproven.
- Faction identity should be felt through what the staff naturally recommends and what it underprices.

## First Implementation Slice

The smallest useful slice:

1. Add `acceptedRisks` to turn preview and result.
2. Add `relativeTempo`, `supportableTempo`, `culminationRisk`, and `campaignAimClarity`.
3. Update memo options with doctrine tags.
4. Add after-action entries for "doctrine bet" and "risk maturity."
5. Add tests proving high tempo is good only when support and confidence are sufficient.

## Test Ideas

| Test | Expected behavior |
| --- | --- |
| High tempo with high support | Deterrence improves and culmination risk rises mildly. |
| High tempo with low support | Visible posture rises but executable posture and S4 fall. |
| Main effort without accepted risk | Engine records warning and unresolved risk. |
| Reserve held during crisis | Event penalty is reduced. |
| Deception with poor S2 | Exposure/self-deception risk increases. |
| Mission command with low trust | Planning compression creates handoff friction. |
| Coalition-native high visibility action | Alliance reliability improves but policy/media friction rises. |
