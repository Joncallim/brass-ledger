---
type: celery-method
area: adversarial-refinement
status: active
tags:
  - CELERY
  - review
  - doctrine
  - tactics
---

# Adversarial Refinement Loop

Backlink: [[CELERY]]

## Purpose

This is the GAN-like setup for doctrine writing. It is not an ML model. It is an adversarial editorial machine: one side generates a plausible doctrine claim, the other side tries to break it, and the final document keeps only what survives.

Use this loop when refining CELERY or translating doctrine into POTATO mechanics.

## Roles

| Role | Job | Output |
| --- | --- | --- |
| Generator | Propose a staff, tactics, faction, or mechanics claim. | A bold playable thesis. |
| Discriminator | Attack the thesis for weak evidence, bad abstraction, exploit risk, faction sameness, or doctrinal confusion. | A list of objections. |
| Refiner | Keep the useful claim, narrow overreach, and attach proof. | A source-backed rule. |
| Integrator | Move the rule into CELERY/POTATO without bloating the system. | Updated playbook/mechanics docs. |

## Acceptance Tests

A doctrine claim is accepted only if it passes all tests:

- Evidence: a source exists in [[doctrine-proof-register]] or [[doctrine-sources]].
- Abstraction: the claim describes a game-relevant pattern, not a copied real-world force.
- Staff fit: the claim maps to endurance, uncertainty, execution, support, coherence, or a justified optional module.
- Counterplay: the mechanic creates tradeoffs, not a flat advantage.
- Player clarity: the player can understand the result without reading doctrine.
- Fictionalization: the claim can be recombined into fictional factions.

## Debate Template

```md
## Thesis

Generator:

## Attack

Discriminator:

## Surviving Rule

Refiner:

## POTATO Translation

Integrator:

## Evidence

- [[doctrine-proof-register#...]]
```

## Standing Discriminator Prompts

- Is this strategy, operations, tactics, administration, or politics?
- Is it proven by a source, or does it merely sound plausible?
- Does it create a decision for the player?
- Which staff function owns the risk?
- What breaks if the player overuses it?
- Can two fictional factions express this differently?
- Does the mechanic preserve soft failure before hard failure?

## First-Pass Findings

The current CELERY/POTATO split survives the loop, but three refinements are needed:

1. Tactical ideas need a dedicated abstraction layer so S3 does not become a bucket for every military concept.
2. International doctrine should become faction genes, not faction labels.
3. Proof needs to live beside claims, because otherwise the playbook will slowly become vibes in uniform.
