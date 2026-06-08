---
type: celery-faction-gene-bank
area: fictional-factions
status: active
tags:
  - CELERY
  - factions
  - doctrine
  - gene-bank
---

# Faction Doctrine Gene Bank

Backlink: [[CELERY]]

## Purpose

This is the pre-faction repository. It stores doctrine genes that can later be recombined into fictional factions. Do not map a gene directly to a real-world country. Use the evidence only to prove that the pattern exists.

## Gene Format

| Field | Meaning |
| --- | --- |
| Gene | Fictionalized doctrine ingredient. |
| Real doctrine evidence | Proof that the pattern is grounded. |
| Staff expression | How it changes S1-S5 behavior. |
| Strength | Why the faction wants it. |
| Vulnerability | What makes it playable rather than superior. |
| POTATO variables | Candidate mechanic hooks. |

## Gene: Coalition-Native Staff

Real doctrine evidence: NATO and UK staff structures use recognizable J-directorates and explicit coalition/interoperability language.

Staff expression: S5 and optional J9 are stronger in alliance framing; S3 can coordinate multinational activity more easily; S2 benefits from partner collection when trust is high.

Strength: Lower liaison friction, clearer staff language, stronger coalition reassurance.

Vulnerability: More policy, legal, media, and partner caveat constraints.

POTATO variables: `interoperabilityBias`, `liaisonFriction`, `policyConstraintLoad`, `partnerCaveatRisk`.

Evidence: [[doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline]], [[doctrine-proof-register#UK PJHQ Staff Responsibilities]]

## Gene: Adaptive Cell Staff

Real doctrine evidence: Dutch doctrine states that staff structures are not purely function-based or process-based and that horizontal teams may be needed to overcome stovepipes.

Staff expression: The chief of staff can create cross-functional cells that reduce S1-S5 handoff friction.

Strength: Better response to complex multi-lane problems and fewer vertical stovepipe failures.

Vulnerability: Coordination cost rises if too many temporary cells compete for attention.

POTATO variables: `processFlexibility`, `crossFunctionalCells`, `coordinationLoad`, `stovepipePenalty`.

Evidence: [[doctrine-proof-register#Netherlands No Pure Staff Structure]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]]

## Gene: Commander-Compressed Planning

Real doctrine evidence: Australian planning material distinguishes rapid commander decision-making from deliberate staff planning and emphasizes commander guidance, staff estimates, risk, adaptation, and continuous revision.

Staff expression: The commander can shorten the decision loop but must keep intent and risk updated.

Strength: Faster response in crisis and more useful previews under time pressure.

Vulnerability: Bad commander guidance multiplies staff rework and chief distrust.

POTATO variables: `commanderCentrality`, `planningCompression`, `commanderIntentClarity`, `staffRework`.

Evidence: [[doctrine-proof-register#Australia Planning Update]], [[doctrine-proof-register#Australia Doctrine Purpose]]

## Gene: Expeditionary Operational HQ

Real doctrine evidence: French CPOIA presents a national operational-level joint command capability organized in NATO-style J branches including J8 budget/finance.

Staff expression: S3 and S5 are strong at deployable headquarters planning; S4 has expeditionary reach concerns; finance becomes explicit.

Strength: Strong operational deployment and multinational planning posture.

Vulnerability: Budget and reach constraints become visible earlier and more sharply.

POTATO variables: `operationalReach`, `expeditionaryHQ`, `j8FinancePressure`, `deploymentFriction`.

Evidence: [[doctrine-proof-register#France CPOIA J-Branches]]

## Gene: C4-Resilient Territorial Staff

Real doctrine evidence: Japan's Joint Staff public organization highlights operations, plans/policy, logistics/medical planning, general affairs, and C4.

Staff expression: S3, S4, S5, and optional J6/C4 are tightly linked around homeland defense, continuity, and resilience.

Strength: Better defense posture, C4 resilience, logistics/medical planning, and policy alignment.

Vulnerability: Intelligence or expeditionary functions may require different institutional paths and may be less visible in the player interface.

POTATO variables: `c4Resilience`, `territorialDefenseBias`, `medicalLogisticsDepth`, `expeditionaryPenalty`.

Evidence: [[doctrine-proof-register#Japan Joint Staff Organization]]

## Gene: Whole-Of-State Mobilizer

Real doctrine evidence: China's official strategy emphasizes civil-military integration, mobilization, war reserves, logistics modernization, and coordinated military-civilian development.

Staff expression: S1, S4, and S5 reach beyond the military institution into national manpower, industry, public burden, and political control.

Strength: Deep reserves, stronger industrial conversion, and strategic endurance under pressure.

Vulnerability: Political rigidity, legitimacy strain, international concern, and brittle assumptions if mobilization is overused.

POTATO variables: `mobilizationDepth`, `industryConversion`, `publicBurden`, `politicalControlLoad`, `legitimacyDrag`.

Evidence: [[doctrine-proof-register#China Mobilization And Civil-Military Integration]], [[doctrine-proof-register#China Active Defense]]

## Gene: System-Pressure Operator

Real doctrine evidence: China's official strategy refers to system-vs-system operations and integrated combat forces. U.S. operational doctrine also addresses multidomain operations and joint integration.

Staff expression: S2 maps vulnerabilities; S3 synchronizes effects; optional J6/C2 becomes central; S4 protects friendly dependencies.

Strength: Can create disproportionate effects through system disruption and resilience.

Vulnerability: Requires high intelligence confidence, specialist capacity, and C2 resilience.

POTATO variables: `systemPressure`, `informationSystemEmphasis`, `c2Capacity`, `specialistShortfall`, `dependencyExposure`.

Evidence: [[doctrine-proof-register#China System Operations And Theater Command]], [[doctrine-proof-register#US Army ADP 3-0 Operations]]

## Gene: Sustainment-First Operational Reach

Real doctrine evidence: ADP 4-0 frames sustainment as support to freedom of action, operational reach, and endurance, with logistics, financial management, personnel services, and health service support.

Staff expression: S4 gets earlier veto power, but also unlocks wider future options.

Strength: Fewer false readiness states, better crisis endurance, more robust long campaigns.

Vulnerability: Slower visible posture and political frustration if the public wants immediate action.

POTATO variables: `logisticsSystemDepth`, `supportableTempo`, `operationalReach`, `stockpileDepth`, `healthSupportDepth`.

Evidence: [[doctrine-proof-register#US Army ADP 4-0 Sustainment]], [[doctrine-proof-register#Sustainment Warfighting Function Elements]]

## Gene: Maneuverist Tempo Culture

Real doctrine evidence: MCDP 1 frames maneuver warfare around tempo, focus, surprise, and exploiting weakness.

Staff expression: S3 is culturally aggressive; S2 is used to find gaps; S5 prioritizes options and dislocation; S1/S4 worry about burn.

Strength: Strong initiative windows and adversary disruption.

Vulnerability: Culmination, brittle sustainment, and self-deception if tempo is fetishized.

POTATO variables: `relativeTempo`, `optionDislocation`, `signatureControl`, `culminationRisk`.

Evidence: [[doctrine-proof-register#USMC MCDP 1 Maneuver Warfare]]

## Gene: Policy-Legal Integrated Command

Real doctrine evidence: UK PJHQ includes J9 policy, legal, and media operations, and UK doctrine frames national context for joint commanders and staff.

Staff expression: S5/J9 forecasts policy, law, media, and legitimacy impacts more clearly than other factions.

Strength: Better domestic and alliance narrative management.

Vulnerability: More constraints, slower public commitments, and higher penalty for inconsistency.

POTATO variables: `policyConstraintLoad`, `legalExposure`, `mediaNarrativeControl`, `cabinetCover`.

Evidence: [[doctrine-proof-register#UK PJHQ Staff Responsibilities]], [[doctrine-proof-register#UK JDP 01 NATO Context]]

## Gene Mixing Rules

- A faction should combine three to five genes.
- Every gene must add one strength and one vulnerability.
- Genes should change staff advice style and burden routing before changing raw resources.
- A faction is interesting when its own doctrine tempts the player into its own failure mode.
- If two genes erase each other's vulnerability, add a new coordination cost.
