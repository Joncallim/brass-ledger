---
type: celery-doctrine-comparison
area: international-doctrine
status: active
tags:
  - CELERY
  - doctrine
  - international
  - factions
---

# International Doctrine Comparison

Backlink: [[CELERY]]

## Purpose

This note expands CELERY beyond a single U.S.-style S1-S5 interpretation. The goal is to build a doctrine repository that can later be split into fictional factions without copying real states directly.

Each pattern below is evidence-backed in [[doctrine-proof-register]]. Treat these as design inputs, not exhaustive descriptions of any real armed force.

## Common J-Structure Baseline

NATO doctrine provides the cleanest international baseline: a joint task force headquarters is often organized by directorates such as J1 personnel and administration, J2 intelligence, J3 operations, J4 logistics, J5 plans, and J6 communications systems. AJP-3 also notes that additional directorates such as J7 training, J8 finance, J9 civil-military cooperation, strategic communications, medical, and engineering may be added.

Game implication: POTATO should keep S1-S5 as the readable player layer, but leave room for optional faction modules such as C2/Cyber, finance, civil affairs, medical, engineering, training, and strategic communications.

Evidence: [[doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline]]

## UK: NATO-Compatible Joint Headquarters With Policy Awareness

The UK Permanent Joint Headquarters is built around J1 personnel, J2 operational intelligence, J3 current operations, J4 logistics/medical, J5 crisis and deliberate planning, J6 communications and information systems, J8 finance and human resources, and J9 policy/legal/media operations. UK Joint Operations Doctrine explicitly frames itself as NATO operational-level doctrine adapted for a UK joint force commander and staff.

Game implication: a UK-like fictional faction should be strong at coalition interoperability and policy-aware command, but more exposed to legal, media, and political synchronization costs.

Evidence: [[doctrine-proof-register#UK PJHQ Staff Responsibilities]], [[doctrine-proof-register#UK JDP 01 NATO Context]]

## Netherlands: Hybrid Function-Process Staff

Dutch Joint Doctrine Publication 5 is especially useful for game design because it states that there is no one-size-fits-all staff structure and no staff is purely function-based or process-based. It describes traditional functional sections such as personnel, intelligence, operations, logistics, plans, CIS, training, finance, and CIMIC, but also warns that vertical staff sections can create stovepipes. The chief of staff must therefore create horizontal teams and staff-wide coordination.

Game implication: a Netherlands-like fictional faction should have strong cross-functional cells and flexible staff design, with lower stovepipe penalties but higher coordination overhead if the player changes priorities too often.

Evidence: [[doctrine-proof-register#Netherlands No Pure Staff Structure]], [[doctrine-proof-register#Netherlands Staff Functions]], [[doctrine-proof-register#Netherlands Chief Of Staff Role]]

## Australia: Commander-Centric Planning

Australian doctrine material emphasizes joint doctrine as guidance for operational effectiveness and interoperability. The 2024 ADF planning update, summarized by the Australian Army's Cove, describes two linked processes: an Immediate Decision-Making Process for commanders and a Deliberate Military Appreciation Process for planning staffs. The summary emphasizes commander guidance, risk/opportunity assessment, staff estimates, continuous revision, deception, adaptation, and the ability to abbreviate planning when time is short.

Game implication: an Australia-like fictional faction should gain faster decision cycles and better adaptation under time pressure, but may require higher commander attention to keep staff estimates current.

Evidence: [[doctrine-proof-register#Australia Doctrine Purpose]], [[doctrine-proof-register#Australia Planning Update]]

## France: NATO-Structured Operational Joint Command

France's CPOIA public description presents a national operational-level joint command capability and states that its planning-engagement division is organized in NATO-style J branches: J1 personnel, J2 intelligence, J3 operations, J4 logistics, J5 planning, J6 command information systems, and J8 budget/finance.

Game implication: a France-like fictional faction should model operational-level deployable headquarters, expeditionary planning, and finance-aware command, with J8/budget as an explicit constraint rather than a background resource.

Evidence: [[doctrine-proof-register#France CPOIA J-Branches]]

## Japan: Selective Joint Staff Emphasis

Japan's Joint Staff public organization shows J-coded departments including General Affairs J1, Operations J3, Logistics and Medical Planning J4, Defense Plans and Policy J5, and C4 J6. Publicly visible structure emphasizes joint staff, policy/plans, operations, logistics/medical planning, and C4, while not presenting a simple full NATO-style J1-J9 list on the English organization page.

Game implication: a Japan-like fictional faction should emphasize homeland defense, joint coordination, plans/policy, logistics/medical planning, and C4 resilience. Intelligence may be represented through a different institutional path rather than assumed to sit visibly as J2 in every UI layer.

Evidence: [[doctrine-proof-register#Japan Joint Staff Organization]]

## China: Active Defense And System Operations, Not J-Code Translation

China's official military strategy white paper is not a J1-J5 staff manual. It is still useful because it frames the armed forces around party control, active defense, informationized local wars, system-vs-system operations, joint operations, civil-military integration, mobilization, logistics modernization, and theater-level joint command systems.

Game implication: a China-like fictional faction should not simply be "S1-S5 with different labels." It should model centralized political control, integrated national mobilization, system-of-systems competition, civil-military integration, and theater command as primary mechanics.

Evidence: [[doctrine-proof-register#China Active Defense]], [[doctrine-proof-register#China System Operations And Theater Command]], [[doctrine-proof-register#China Mobilization And Civil-Military Integration]]

## Doctrine Axes For Fictional Factions

| Axis | Low end | High end | Gameplay use |
| --- | --- | --- | --- |
| Interoperability | Nationally idiosyncratic staff | NATO-like common staff language | Alliance burden, liaison cost, partner confidence. |
| Commander centrality | Staff-led planning cycle | Commander-led rapid guidance | Decision speed, risk ownership, staff rework. |
| Process flexibility | Fixed vertical sections | Horizontal cells and adaptive teams | Stovepipe penalty versus coordination overhead. |
| Political integration | Military advice insulated from politics | Political/legal/media/party systems embedded | Legitimacy, narrative control, constraint visibility. |
| Mobilization model | Professional force bounded by peacetime systems | Whole-of-state mobilization and civil-military integration | Reserve depth, industry conversion, public burden. |
| Operational focus | Current operations dominance | Future plans and force design dominance | Short-term tempo versus modernization coherence. |
| Support model | Logistics as a directorate | Logistics as national/coalition system | Stockpile, host-nation, commercial, and industrial dependencies. |
| Information model | Intelligence as estimate support | Information systems as decisive warfighting system | S2 uncertainty versus system attack/defense mechanics. |

## Design Guardrails

- Do not copy a real country directly into a faction.
- Use doctrine patterns as mechanical genes that can be recombined.
- Keep S1-S5 readable for the player unless a faction-specific interface has a strong design reason to differ.
- Every faction mechanic derived from real doctrine needs a source entry in [[doctrine-proof-register]].
