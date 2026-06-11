---
type: celery-pattern-library
area: doctrine-patterns
status: active
tags:
  - CELERY
  - doctrine
  - tactics
  - operational-art
  - patterns
---

# Doctrine Pattern Library

Backlink: [[CELERY]]

## Purpose

This library turns doctrine into reusable playbook cards. Each card must be argued through [[adversarial-refinement-loop]] before becoming a POTATO mechanic. Each card cites evidence in [[doctrine-proof-register]].

## Pattern Card Format

| Field | Meaning |
| --- | --- |
| Doctrine claim | What the military idea says. |
| Staff debate | How S1-S5 argue over it. |
| Player decision | What the player actually chooses. |
| Abuse case | What breaks if the player overuses it. |
| POTATO hook | Where the mechanic should land. |
| Evidence | Proof anchor. |

## Card: Objective

Doctrine claim: Operations should serve clear, attainable objectives and connect means to ends.

Staff debate: S5 demands the objective; S3 wants tasks; S2 tests assumptions; S4 prices feasibility; S1 asks whether the force can endure the path.

Player decision: Name a main campaign aim for the month: deter, recover, reassure, discover, modernize, or conserve.

Abuse case: The player stacks attractive actions that do not share a purpose. The month looks productive but produces contradiction debt.

POTATO hook: `campaignAimClarity`, `contradictionPenalty`, memo objective tags.

Evidence: [[doctrine-proof-register#US Joint JP 5-0 Joint Planning]], [[doctrine-proof-register#UK Defence Doctrine Principles]]

## Card: Initiative And Tempo

Doctrine claim: Initiative and tempo can create advantage by forcing the opponent to respond under pressure.

Staff debate: S3 argues for pace; S2 asks whether speed is outrunning understanding; S4 warns about burn; S1 prices recovery; S5 asks whether tempo serves the campaign.

Player decision: Push faster than the institution comfortably supports, or slow down to preserve future options.

Abuse case: High tempo becomes a dominant strategy unless culmination, support burn, and personnel debt catch up.

POTATO hook: `relativeTempo`, `initiativeWindow`, `culminationRisk`, `recoveryDebt`.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]], [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]]

## Card: Main Effort And Mass

Doctrine claim: Concentrating effort at the decisive point creates effect that dispersed effort cannot.

Staff debate: S5 names the decisive point; S3 shapes the main effort; S4 prioritizes support; S2 validates whether the point is real; S1 warns which formations carry the burden.

Player decision: Declare one main effort and accept that secondary lanes receive less attention.

Abuse case: The player concentrates every month and quietly hollows neglected portfolios.

POTATO hook: `mainEffortFocus`, priority burden routing, secondary-lane delayed events.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#NATO AJP-3.2 Land Operations]]

## Card: Economy Of Force

Doctrine claim: Not every effort can receive full resources. Secondary efforts must receive enough, not everything.

Staff debate: S5 forces a priority decision; every other chief describes the risk of being placed in economy-of-force status.

Player decision: Explicitly mark one staff lane as "minimum essential support" for the month.

Abuse case: The player treats economy of force as free capacity rather than accepted risk.

POTATO hook: `secondaryRiskAccepted`, accepted-risk ledger, delayed underinvestment events.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#US Joint JP 5-0 Joint Planning]]

## Card: Maneuver And Dislocation

Doctrine claim: Advantage can come from changing the opponent's problem rather than only increasing direct pressure.

Staff debate: S3 proposes dislocation; S2 identifies where the adversary is weak or misreading; S4 asks whether movement and support reveal or constrain the plan; S5 asks whether dislocation supports the campaign story.

Player decision: Choose between visible posture, quiet repositioning, deception, partner movement, or capability surprise.

Abuse case: Maneuver becomes magical movement if not constrained by lift, intelligence, and political signaling.

POTATO hook: `optionDislocation`, `signatureControl`, lift and intelligence gates.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]], [[doctrine-proof-register#NATO AJP-3.2 Land Operations]]

## Card: Security And Risk Control

Doctrine claim: Forces must deny opponents unexpected advantage while still acting.

Staff debate: S2 argues for exposure control; S3 resists paralysis; S4 points at support signatures; S5 worries about alliance and public interpretation.

Player decision: Harden, conceal, disperse, or accept exposure to preserve tempo.

Abuse case: Security becomes over-control. The player avoids surprise but loses initiative and reassurance.

POTATO hook: `exposureControl`, `tempoDrag`, deception-event probability.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#US Joint JP 3-0 Joint Campaigns And Operations]]

## Card: Surprise And Deception

Doctrine claim: Surprise and deception can create advantage, but they rely on signature control, timing, and adversary perception.

Staff debate: S2 owns enemy perception; S3 owns synchronization; S4 owns support signature; S5 owns political story if exposed; S1 owns trust and personnel burden.

Player decision: Use overt assurance, ambiguous signaling, deception, or full transparency.

Abuse case: Deception becomes a universal discount if exposure costs and self-deception are missing.

POTATO hook: `signatureControl`, `deceptionPlanFriction`, `exposurePenalty`, `selfDeceptionRisk`.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]], [[doctrine-proof-register#Australia Planning Update]]

## Card: Simplicity And Order Clarity

Doctrine claim: Plans must be clear enough to execute under stress.

Staff debate: S3 attacks cleverness; S2 asks which assumptions can be explained; S4 asks whether priorities are unambiguous; S1 asks whether units understand expectations; S5 asks whether cabinet and allies can repeat the logic.

Player decision: Choose a simple plan with lower upside or a complex plan with more possible payoff.

Abuse case: Complexity becomes free optimization unless staff synchronization and handoff failures exist.

POTATO hook: `orderClarity`, `handoffFriction`, `complexityLoad`.

Evidence: [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]]

## Card: Culmination

Doctrine claim: Forces can reach a point where continuing action becomes ineffective or dangerous.

Staff debate: S4 identifies support ceiling; S1 identifies personnel ceiling; S3 identifies execution ceiling; S2 identifies uncertainty ceiling; S5 identifies political/campaign ceiling.

Player decision: Continue pressure, pause, shift main effort, or spend reserve.

Abuse case: Without culmination, optimal play becomes permanent surge.

POTATO hook: `culminationRisk`, `supportableTempo`, `recoveryDebt`, `politicalExposure`.

Evidence: [[doctrine-proof-register#US Army ADP 4-0 Sustainment]], [[doctrine-proof-register#US Army ADP 3-90 Tactical Fundamentals]]

## Card: Reserve And Slack

Doctrine claim: Uncommitted capacity preserves the ability to exploit success or respond to shock.

Staff debate: S3 wants reserve for opportunity; S1 wants reserve for recovery; S4 wants support reserve; S2 wants decision reserve for unknowns; S5 wants political and alliance options.

Player decision: Spend capacity now or hold back capacity against uncertain future events.

Abuse case: Reserve feels like "doing nothing" unless events and future options reward it.

POTATO hook: `uncommittedCapacity`, crisis response modifier, event mitigation.

Evidence: [[doctrine-proof-register#US Joint JP 3-0 Joint Campaigns And Operations]], [[doctrine-proof-register#US Joint JP 5-0 Joint Planning]]

## Card: Sustainment As Operational Reach

Doctrine claim: Sustainment enables freedom of action, endurance, and operational reach.

Staff debate: S4 defines the ceiling; S3 asks for tempo; S1 links endurance to people; S5 links reach to campaign design; S2 links supply-chain uncertainty to risk.

Player decision: Invest in supply, movement, repair, financial management, health support, or accept shorter reach.

Abuse case: Logistics becomes a background stat instead of the reason operations stop.

POTATO hook: `supportableTempo`, `operationalReach`, `stockpileDepth`, `liftBurn`.

Evidence: [[doctrine-proof-register#US Army ADP 4-0 Sustainment]], [[doctrine-proof-register#Sustainment Warfighting Function Elements]]

## Card: Mission Command And Commander Centrality

Doctrine claim: Command approaches differ in how much they emphasize commander intent, decentralized execution, and staff-led planning.

Staff debate: S5 wants intent; S3 wants executable orders; S2/S4 need enough detail to support action; S1 asks whether subordinate initiative creates uneven burden.

Player decision: Issue detailed control, broad intent, or rapid provisional guidance.

Abuse case: Mission command becomes a magic speed buff unless trust, clarity, and subordinate competence matter.

POTATO hook: `commanderIntentClarity`, `subordinateLatitude`, `trustRisk`, `planningCompression`.

Evidence: [[doctrine-proof-register#Australia Planning Update]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]], [[doctrine-proof-register#UK Defence Doctrine Principles]]

## Card: Multidomain And System Competition

Doctrine claim: Modern operations can be shaped by linked land, air, maritime, space, cyber, information, logistics, and political systems.

Staff debate: S2 maps systems; S3 synchronizes effects; S4 protects dependencies; S5 links system effects to campaign objectives; S1 warns about specialist scarcity and training burden.

Player decision: Target a single visible problem or invest in linked system disruption and resilience.

Abuse case: "System" language becomes a vague superpower unless each domain has a staff owner and a counterweight.

POTATO hook: `systemPressure`, optional J6/C2 module, external constraints, specialist shortfalls.

Evidence: [[doctrine-proof-register#China System Operations And Theater Command]], [[doctrine-proof-register#US Army ADP 3-0 Operations]], [[doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline]]
