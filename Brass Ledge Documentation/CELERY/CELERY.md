---
type: strategy-playbook
project: Brass Ledger
status: archived
created_on: 2026-06-07
tags:
  - CELERY
  - source-of-truth
  - s1-s5
---

# CELERY — Legacy Archive

> The canonical active CELERY documentation is
> [[../GROCER/CELERY/CELERY|GROCER/CELERY]]. Do not update this copy or use it
> to make implementation decisions.

CELERY is the Brass Ledger military staff repository. It describes the S1-S5 staff system as a supreme commander playbook: what each function contributes, what failure looks like, and how a commander should use staff advice before issuing guidance.

## Operating Rule

CELERY explains doctrine and staff behavior. POTATO translates that doctrine into mechanics, engine contracts, UI states, and balancing rules. If CELERY and POTATO disagree, decide whether the doctrine has changed or whether the implementation has drifted.

## Core Index

- [[s1-personnel]]
- [[s2-intelligence]]
- [[s3-operations]]
- [[s4-logistics]]
- [[s5-plans]]
- [[commander-staff-playbook]]
- [[adversarial-refinement-loop]]
- [[adversarial-debate-library]]
- [[tactical-doctrine-patterns]]
- [[doctrine-pattern-library]]
- [[faction-doctrine-gene-bank]]
- [[international-doctrine-comparison]]
- [[doctrine-proof-register]]
- [[doctrine-sources]]
- [[../POTATO/s1-s5-mechanics-translation|POTATO mechanics translation]]
- [[../POTATO/doctrine-mechanics-roadmap|POTATO doctrine mechanics roadmap]]

## Staff Model

| Function | Staff role | Commander augmentation | Primary failure if ignored |
| --- | --- | --- | --- |
| [[s1-personnel]] | Personnel and administration | Preserves the force as a renewable instrument instead of a consumable pool. | Hollow force, retention shock, reserve backlash. |
| [[s2-intelligence]] | Intelligence | Turns uncertainty into bounded risk and warns where assumptions are fragile. | False confidence, surprise, deception capture. |
| [[s3-operations]] | Operations and training integration | Converts intent into executable action, tempo, posture, and synchronization. | Performative readiness, poor sequencing, escalation by accident. |
| [[s4-logistics]] | Logistics and sustainment | Tests every promise against movement, repair, stockpile, fuel, and service reality. | Unsupported tempo, depot collapse, immobile posture. |
| [[s5-plans]] | Plans and strategy | Connects current action to future options, doctrine, alliances, and political narrative. | Ad hoc campaign, incoherent modernization, alliance drift. |

## Supreme Commander Pattern

The supreme commander does not replace the staff. The commander uses the staff to see the institution from five angles before making a decision:

1. S1 asks whether the people can endure the decision.
2. S2 asks whether the decision rests on a reliable picture.
3. S3 asks whether the decision can be executed.
4. S4 asks whether the decision can be supported.
5. S5 asks whether the decision still fits the campaign.

The commander then accepts, rejects, or deliberately owns the risk.

## International Doctrine Layer

CELERY uses S1-S5 as the player-facing vocabulary, but the underlying doctrine should support later fictional factions with different staff cultures. International references show several useful variants:

- NATO and UK doctrine preserve a recognizable J1-J5/J6 structure for interoperability.
- Dutch doctrine emphasizes that staffs are never purely function-based or process-based; effective headquarters need horizontal teams as well as vertical expertise.
- Australian planning doctrine places the commander more explicitly inside the planning process through rapid individual decision-making and deliberate staff planning.
- French and Japanese public structures show national adoption/adaptation of J-coded joint staff arrangements.
- Chinese official strategy does not map cleanly to J1-J5, but it is useful for a faction model where party control, active defense, system-vs-system operations, theater command, mobilization, and civil-military integration are central.

Use [[international-doctrine-comparison]] and [[doctrine-proof-register]] before turning doctrine differences into fictional faction mechanics.

## Adversarial Refinement Rule

Major CELERY changes should pass through the GAN-like loop in [[adversarial-refinement-loop]]:

1. Generator proposes a doctrine or tactics interpretation.
2. Discriminator challenges it for evidence, abstraction quality, faction utility, and game balance.
3. Refiner rewrites the claim into a source-backed playbook rule.
4. POTATO translates only the refined rule into mechanics.

The current debate set lives in [[adversarial-debate-library]]. The reusable concept cards live in [[doctrine-pattern-library]]. Fictional faction ingredients live in [[faction-doctrine-gene-bank]].
