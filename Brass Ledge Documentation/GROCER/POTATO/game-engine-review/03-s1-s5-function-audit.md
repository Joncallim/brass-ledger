---
type: game-engine-review-note
reviewed_on: 2026-06-06
area: s1-s5
tags:
  - game-engine-review
  - s1-s5
---

Backlink: [[POTATO]]


# S1-S5 Function Audit

## Recommended Staff Model

The planning docs define S1-S5. The current code uses six directorates: people, intelligence, operations, sustainment, plans, and training.

The refined personnel model keeps **five core staff readouts: S1-S5**, and adds **one selectable J7 Force Development and Training adviser**. J7 is not a sixth independent scorecard. J7 is a cross-cutting appointment whose work appears through S1 people/absorption, S3 readiness/exercises, and S5 long-term capability development.

This preserves the readable S1-S5 command model while giving training, lessons, exercises and force development a believable senior officer in the rotating roster.

| Staff function | Current equivalent | Primary game question |
| --- | --- | --- |
| S1 Personnel | `people` plus parts of `training` | Can the force absorb the human cost? |
| S2 Intelligence | `intelligence` | Is the picture reliable enough to act? |
| S3 Operations | `operations` plus exercise tempo | Can the posture be executed visibly and credibly? |
| S4 Logistics | `sustainment` | Can lift, repair, fuel, and munitions support the promise? |
| S5 Plans | `plans` plus modernization/alliance strategy | Does this month fit the longer political and capability strategy? |

## S1 Personnel

### Engine Role

S1 owns retention, reserve strain, personnel shortfalls, morale, rotation stress, and force quality. S1 is the main brake against fake readiness.

### Current Implementation

Current metrics:

- `reserveStrain`
- `personnelShortfalls`
- `trainingThroughput`
- `publicPatience` effects
- chief Warden as People voice

### Best Player Presentation

Show S1 as a **force endurance** readout:

- reserve strain
- personnel shortfalls
- training absorption
- likely attrition next month
- whether proposed guidance is borrowing from future readiness

### Recommended Mechanics

- Recovery debt: high tempo creates personnel debt that decays slowly.
- Rotation credibility: repeated surge choices reduce deployable quality.
- Retention backlash events: triggered by reserve/tempo tags.
- Training absorption should be shown under S1/S3 rather than as separate S7 UI.

## S2 Intelligence

### Engine Role

S2 owns confidence, collection coverage, warning reliability, deception pressure, and external tech visibility.

### Current Implementation

Current metrics:

- `collectionCoverage`
- `confidence`
- `warningReliability`
- `deceptionPressure`
- chief Halden as Intelligence voice
- counter-deception program and deception-slip event

### Best Player Presentation

Show S2 as an **uncertainty panel**, not a normal scorecard:

- known facts
- estimated facts
- rumored facts
- confidence change
- deception risk
- what decision would be unsafe if the estimate is wrong

### Recommended Mechanics

- S2 should not simply improve numbers; it should reduce variance and reveal gates.
- Add external industry estimate errors from the dual tech tree doc.
- Add intelligence tasking choices: warning, industrial watch, counter-deception, partner collection.

## S3 Operations

### Engine Role

S3 owns operational posture, deployable units, exercises, visible deterrence, and execution risk.

### Current Implementation

Current metrics:

- `deployableUnits`
- `probeTempo`
- `incidentLadder`
- operations burden penalties
- chief Briggs as Operations voice

### Best Player Presentation

Show S3 as a **posture and execution** board:

- visible readiness
- deployment/exercise tempo
- operational credibility
- rehearsal quality
- escalation side effects

### Recommended Mechanics

- Readiness should split into visible readiness and actual executable readiness.
- Exercises should improve deterrence but consume S1/S4 capacity.
- Posture choices should affect adversary probe tempo and allied reassurance.

## S4 Logistics

### Engine Role

S4 owns repair, depot flow, munitions, fuel, lift, stockpile resilience, and supply-chain fragility.

### Current Implementation

Current metrics:

- `depotBacklog`
- `munitionsSufficiency`
- `fuelSufficiency`
- `liftAvailability`
- external constraints: shipping, electronics, propellant
- chief Okafor as Sustainment voice

### Best Player Presentation

Show S4 as a **support reality ledger**:

- what is promised
- what is physically supportable
- bottleneck by category
- next-month backlog
- constraint trend

### Recommended Mechanics

- Add stockpile burn and replenishment curves.
- Add lift commitments as scarce assets.
- Link S4 explicitly to industrial base nodes.
- Make S4 the main limiter on S3 surge strategies.

## S5 Plans

### Engine Role

S5 owns long-horizon strategy, alliance framing, modernization sequencing, political coherence, and doctrine.

### Current Implementation

Current metrics:

- `politicalAlignment`
- `cabinetCover`
- capability program progress
- modernization option tags
- chief Sato as Plans voice

### Best Player Presentation

Show S5 as a **strategy coherence** view:

- current theory of victory
- alliance/political alignment
- modernization queue
- dependencies and gates
- strategic contradictions created this month

### Recommended Mechanics

- Make S5 the owner of the dual tech tree planning layer.
- Add doctrine cards that modify how S1-S4 convert work into outcomes.
- Add alliance commitments that create both capability help and political obligations.

## J7 Force Development And Training

J7 is a selectable senior adviser but **not** a sixth core staff readout.

J7 owns the human conversation around:

- exercises and training standards;
- lessons and adaptation;
- instructor depth;
- whether a new capability has become something the force can actually use;
- how quickly the organisation can absorb change.

Mechanically, those effects still land in the existing system:

- readiness and exercises under S3;
- people, instructor and absorption pressure under S1;
- programme integration and long-term capability development under S5.

The browser may show J7 as a person and appointment without adding a sixth global scorecard.

This section supersedes the earlier recommendation to keep Training entirely hidden as a sub-system.
