---
type: v2-hq-belief-evidence-catalog
status: active
---

# HQ Belief Evidence Catalog

Backlink: [[README]]

This is the exact content authority for the Kestrel intelligence vocabulary.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns product meaning.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns code/replay seams.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns generated coverage.
- [[26-LATTICE-COLLECTION-MATRIX]] owns #102 task persistence and player target flow.

There are two identity domains:

1. `kestrel-hq-belief-v1` — owned/implemented by #100: evidence meanings, role relevance, ordinary/reroute/focused production, reducers and player copy.
2. `kestrel-collection-v1` — owned/implemented by #102: Lattice/liaison target selection, result timing and raw-fact → predeclared definition mapping.

#100 predeclares the Lattice/liaison evidence **definitions** so #102 cannot redefine their meaning. #100 does not implement live task production.

# 1. Closed identifiers

## Claim

- `ravellan-intent`

## Question IDs

- `ravellan-intent-general`
- `landing-force-staging`
- `auxiliary-tasking`
- `operational-sequence`

The former ID `political-operational-sync` is invalid. The authorised source observes operational action sequence, not political messaging.

## Producer kinds

- `ordinary`
- `reroute`
- `focused`
- `lattice`
- `liaison`

## Supersession policies

- `explicit-only`
- `replace-older-same-question`

## Corroboration groups

Public credibility uses explicit independence groups, not arbitrary source labels:

- `physical-staging`
- `auxiliary-tasking`
- `operational-sequence`
- `partner-liaison`

Focused staging and Lattice landing share `physical-staging`; they do not independently corroborate each other, and the newer landing occurrence replaces the older focused occurrence.

# 2. Exact 19 evidence definitions

Role notation:

- `A` — assessment relevance;
- `W` — tactical-warning relevance;
- `P` — public-case relevance;
- `—` — role unavailable;
- `R–C6` — actual result cycle through C6.

| # | Definition ID | Question | Implication | Class | Producer | Source group | Corroboration group | A | W | P | Supersession |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `opening-pressure-ambiguous` | general | ambiguous | indicator | ordinary | `routine-opening-pressure` | — | C1–C2 | — | — | explicit only |
| 2 | `shipping-probe-ambiguous` | general | ambiguous | indicator | ordinary | `routine-maritime-pressure` | — | C2–C3 | — | — | explicit only |
| 3 | `staging-logistics-anomaly` | general | preparation | indicator | ordinary | `routine-regional-logistics` | — | C3–C4 | — | — | explicit only |
| 4 | `combat-elements-dispersed` | general | coercion | indicator | ordinary | `routine-force-disposition` | — | C3–C4 | — | — | explicit only |
| 5 | `cycle4-pressure-pattern-ambiguous` | general | ambiguous | indicator | ordinary | `routine-visible-pattern` | — | C4–C5 | — | — | explicit only |
| 6 | `reroute-auxiliary-coercive` | auxiliary | coercion | indicator | reroute | `reroute-auxiliary-monitoring` | — | C3–C5 | — | — | replace same question |
| 7 | `reroute-auxiliary-unclear` | auxiliary | ambiguous | indicator | reroute | `reroute-auxiliary-monitoring` | — | C3–C5 | — | — | replace same question |
| 8 | `focused-staging-buildup` | landing | preparation | indicator | focused | `focused-staging-collection` | `physical-staging` | C4–C6 | **C4–C5** | C4–C6 | replace same question; explicitly supersedes #4 |
| 9 | `focused-staging-empty` | landing | coercion | indicator | focused | `focused-staging-collection` | `physical-staging` | **C4–C5** | — | C4–C6 | replace same question; explicitly supersedes #3 |
| 10 | `lattice-landing-concentration` | landing | preparation | diagnostic | lattice | `lattice-landing-collection` | `physical-staging` | R–C6 | R–C6 | R–C6 | replace same question |
| 11 | `lattice-landing-dispersed` | landing | coercion | indicator | lattice | `lattice-landing-collection` | `physical-staging` | R–C6 | — | R–C6 | replace same question |
| 12 | `lattice-auxiliary-coercive` | auxiliary | coercion | diagnostic | lattice | `lattice-auxiliary-collection` | `auxiliary-tasking` | R–C6 | — | R–C6 | replace same question |
| 13 | `lattice-auxiliary-mixed` | auxiliary | ambiguous | indicator | lattice | `lattice-auxiliary-collection` | — | R–C6 | — | — | replace same question |
| 14 | `lattice-sync-preparation-sequence` | sequence | preparation | diagnostic | lattice | `lattice-sequence-analysis` | `operational-sequence` | R–C6 | — | R–C6 | explicit only |
| 15 | `lattice-sync-preparation-signal` | sequence | preparation | indicator | lattice | `lattice-sequence-analysis` | `operational-sequence` | R–C6 | — | R–C6 | explicit only |
| 16 | `lattice-sync-coercive-sequence` | sequence | coercion | indicator | lattice | `lattice-sequence-analysis` | `operational-sequence` | R–C6 | — | R–C6 | explicit only |
| 17 | `lattice-sync-partial` | sequence | ambiguous | indicator | lattice | `lattice-sequence-analysis` | — | R–C6 | — | — | explicit only |
| 18 | `liaison-auxiliary-coercive-links` | auxiliary | coercion | indicator | liaison | `partner-liaison-reporting` | `partner-liaison` | C5–C6 | — | C5–C6 | replace same question |
| 19 | `liaison-auxiliary-unclear` | auxiliary | ambiguous | indicator | liaison | `partner-liaison-reporting` | — | C5–C6 | — | — | replace same question |

Canonical aliases in this table:

- general → `ravellan-intent-general`;
- landing → `landing-force-staging`;
- auxiliary → `auxiliary-tasking`;
- sequence → `operational-sequence`.

# 3. Removed/invalid definitions

Reject:

- `reroute-auxiliary-integrated`;
- `lattice-auxiliary-integrated`;
- `liaison-auxiliary-military-links`.

The exact #99 temporal state space cannot produce the required preparation + active shipping-probe combination at those result cuts.

# 4. #100 ordinary schedule

Exactly:

```text
C1 → opening-pressure-ambiguous
C2 → shipping-probe-ambiguous
C3 → combat-elements-dispersed + staging-logistics-anomaly
C4 → cycle4-pressure-pattern-ambiguous
C5 → none
C6 → none
```

Schedule lists use lexical definition-ID order. Directed definitions never instantiate from this schedule.

# 5. #100 producer mappings

## C2 `reroute-and-monitor` → C3

Inputs: verified C2 normal action + C2 post-decision preparation only.

| Post-preparation | C2 action | Source fact | Definition |
| --- | --- | --- | --- |
| none | `probe_shipping` | `coercive-tasking` | `reroute-auxiliary-coercive` |
| none | `seed_deception` | `coercive-tasking` | `reroute-auxiliary-coercive` |
| every other legal C2 combination | — | `unclear` | `reroute-auxiliary-unclear` |

`pause_consolidate` is illegal in C2 and fails validation rather than mapping.

## C3 focused staging → C4

Input: verified C4 post-decision preparation only.

| Preparation | Source fact | Definition |
| --- | --- | --- |
| none | `no-concentration-observed` | `focused-staging-empty` |
| developing | `concentration-observed` | `focused-staging-buildup` |
| ready | `concentration-observed` | `focused-staging-buildup` |

# 6. Future #102 collection-producer overlay

The following mappings are frozen design inputs for `kestrel-collection-v1`, not #100 production code.

## Lattice landing

| Result-cut preparation | Definition |
| --- | --- |
| none | `lattice-landing-dispersed` |
| developing/ready | `lattice-landing-concentration` |

## Lattice auxiliary

| Result-cut preparation | Latest normal action | Definition |
| --- | --- | --- |
| none | `probe_shipping` or `seed_deception` | `lattice-auxiliary-coercive` |
| every other combination | any | `lattice-auxiliary-mixed` |

## Lattice operational sequence

Input: latest two verified **normal** Ravellan actions C4/C5. The R6 terminal action is excluded.

| Action pattern | Definition |
| --- | --- |
| two `prepare_beacon_seizure` | `lattice-sync-preparation-sequence` |
| exactly one `prepare_beacon_seizure` | `lattice-sync-preparation-signal` |
| no prepare + at least one `probe_shipping` or `seed_deception` | `lattice-sync-coercive-sequence` |
| otherwise | `lattice-sync-partial` |

## C4 liaison → C5

| C5 preparation | C5 normal action | Definition |
| --- | --- | --- |
| none | `probe_shipping` or `seed_deception` | `liaison-auxiliary-coercive-links` |
| every other combination | any | `liaison-auxiliary-unclear` |

# 7. #102 target timing and default order

Future #102 owns this in `kestrel-collection-v1`:

- operational Lattice tasks exactly one unused target in C4 and one different unused target in C5;
- C4 task → C5 occurrence;
- C5 task → C6 occurrence using latest-normal/pre-manifestation facts;
- no same-target retask;
- no zero-cost no-task while unused targets remain;
- ordinary focused staging does not consume the stronger Lattice landing target.

Stable target IDs:

- `landing-force-staging`
- `auxiliary-tasking`
- `operational-sequence`

Default target order by main priority:

| Main priority | First → second → third |
| --- | --- |
| `beacon-security` | landing → sequence → auxiliary |
| `partner-cooperation` | sequence → auxiliary → landing |
| `ravellan-understanding` | auxiliary → sequence → landing |

The player may retarget to another unused target at zero normal intervention cost. Leaving the selection untouched executes the HQ default.

# 8. Supersession

Supersession is computed from all occurrences observed by the query cycle, before role-current filtering.

## Same-question replacement

A later occurrence with `replace-older-same-question` replaces every older occurrence of the same question.

This covers:

- Lattice landing replacing focused staging;
- liaison/Lattice auxiliary replacing C2 reroute;
- a future valid later same-question occurrence replacing an earlier one.

## Explicit asymmetric replacement

- `focused-staging-buildup` supersedes `combat-elements-dispersed`.
- `focused-staging-empty` supersedes `staging-logistics-anomaly`.

Replacement is persistent. Older evidence never resurrects after the replacement becomes stale or is itself replaced.

# 9. Source-context copy

| Ref | Exact copy |
| --- | --- |
| `intel.source.routine-opening` | Routine maritime reporting |
| `intel.source.routine-maritime` | Routine maritime surveillance |
| `intel.source.routine-logistics` | Routine regional logistics reporting |
| `intel.source.routine-disposition` | Routine force-disposition coverage |
| `intel.source.visible-pattern` | Visible pressure-pattern reporting |
| `intel.source.reroute-monitoring` | Monitoring created by the shipping reroute |
| `intel.source.focused-staging` | Focused staging-area collection |
| `intel.source.lattice-landing` | Lattice landing-force collection |
| `intel.source.lattice-auxiliary` | Lattice auxiliary-tasking collection |
| `intel.source.lattice-sequence` | Lattice operational-sequence analysis |
| `intel.source.partner-liaison` | Partner liaison reporting |

# 10. Limitation copy

| Ref | Exact copy |
| --- | --- |
| `intel.limit.pressure-ambiguous` | Visible pressure is compatible with coercion, testing, or cover for preparation. |
| `intel.limit.surface-only` | Surface activity does not show what may be happening at staging areas. |
| `intel.limit.logistics-indirect` | Logistics activity alone does not identify an executable seizure force. |
| `intel.limit.routine-coverage` | Routine coverage is incomplete and may miss movement outside observed sectors. |
| `intel.limit.pattern-ambiguous` | A change in visible pressure can mean deterrence, concealment, consolidation, or continued coercion. |
| `intel.limit.reroute-tasking-only` | The reroute monitoring characterises the pressure vessels; it does not observe the seizure force directly. |
| `intel.limit.focused-positive-intent` | The movement is actionable now, but the report does not settle Ravellan’s wider intent. |
| `intel.limit.focused-positive-warning` | Without a refreshed physical look, this warning will be too old to support a clean C6 reaction. |
| `intel.limit.focused-negative-currency` | This negative observation is time-sensitive; preparation may begin after the collection window. |
| `intel.limit.landing-positive-timing` | Concentration strongly supports preparation but does not reveal the exact execution time. |
| `intel.limit.landing-negative-pivot` | No concentration now does not rule out a later pivot. |
| `intel.limit.auxiliary-current-tasking` | This diagnoses the current tasking chain, not every future Ravellan option. |
| `intel.limit.auxiliary-mixed` | Available tasking links do not distinguish coercion from broader preparation. |
| `intel.limit.sequence-window` | A sustained operational sequence supports preparation but gives no direct execution warning. |
| `intel.limit.sequence-single` | One preparation milestone does not establish a sustained sequence. |
| `intel.limit.sequence-negative` | Recent pressure without a new milestone does not prove earlier preparation is absent. |
| `intel.limit.sequence-partial` | The recent operational sequence is incomplete or mixed. |
| `intel.limit.liaison-narrow` | Partner reporting is narrower and is not independently diagnostic. |
| `intel.limit.liaison-unclear` | Partner reporting does not resolve the tasking chain. |

`focused-staging-buildup` carries both focused-positive limitation refs: one about intent and one about warning currency. The definition schema may use a non-empty ordered `limitationRefs` array rather than one scalar field.

# 11. Evidence summary copy

| Definition | Summary ref | Exact copy |
| --- | --- | --- |
| `opening-pressure-ambiguous` | `intel.evidence.opening-pressure` | Ravellan has increased ambiguous maritime pressure around Beacon Channel. |
| `shipping-probe-ambiguous` | `intel.evidence.shipping-pressure` | Pressure vessels continue to shadow and interfere with commercial traffic. |
| `staging-logistics-anomaly` | `intel.evidence.logistics-anomaly` | Logistics activity near known staging areas is above the routine baseline. |
| `combat-elements-dispersed` | `intel.evidence.combat-dispersed` | Within routine coverage, the major combat elements expected for a rapid seizure still appear dispersed. |
| `cycle4-pressure-pattern-ambiguous` | `intel.evidence.pressure-pattern` | Ravellan’s visible pressure pattern has changed, but the change does not establish why. |
| `reroute-auxiliary-coercive` | `intel.evidence.reroute-coercive` | Monitoring created by the reroute points to a coercive tasking pattern among the pressure vessels. |
| `reroute-auxiliary-unclear` | `intel.evidence.reroute-unclear` | Monitoring created by the reroute does not resolve how the pressure vessels are being tasked. |
| `focused-staging-buildup` | `intel.evidence.focused-buildup` | Focused collection shows movement consistent with a seizure force concentrating near staging areas. |
| `focused-staging-empty` | `intel.evidence.focused-empty` | Focused collection does not find the force concentration needed for a rapid seizure. |
| `lattice-landing-concentration` | `intel.evidence.lattice-landing-concentration` | Lattice confirms that landing elements associated with prior seizure exercises are concentrating. |
| `lattice-landing-dispersed` | `intel.evidence.lattice-landing-dispersed` | Lattice finds the required landing-force package still dispersed. |
| `lattice-auxiliary-coercive` | `intel.evidence.lattice-auxiliary-coercive` | Lattice links the pressure vessels to a coercive tasking chain while finding no corresponding seizure preparation. |
| `lattice-auxiliary-mixed` | `intel.evidence.lattice-auxiliary-mixed` | Lattice finds a mixed tasking picture that does not distinguish coercion from preparation. |
| `lattice-sync-preparation-sequence` | `intel.evidence.lattice-sequence-preparation` | Lattice identifies two successive preparation milestones forming a sustained operational sequence. |
| `lattice-sync-preparation-signal` | `intel.evidence.lattice-sequence-signal` | Lattice identifies one preparation milestone inside an otherwise mixed recent sequence. |
| `lattice-sync-coercive-sequence` | `intel.evidence.lattice-sequence-coercive` | Recent activity sustains pressure without adding a new preparation milestone. |
| `lattice-sync-partial` | `intel.evidence.lattice-sequence-partial` | The recent operational sequence is too partial or mixed to support either explanation. |
| `liaison-auxiliary-coercive-links` | `intel.evidence.liaison-coercive` | Partner reporting points to coercive tasking among the pressure vessels. |
| `liaison-auxiliary-unclear` | `intel.evidence.liaison-unclear` | Partner reporting does not resolve how the pressure vessels are being tasked. |

# 12. Definition → source/limitation refs

| Definition(s) | Source ref | Limitation refs |
| --- | --- | --- |
| `opening-pressure-ambiguous` | `intel.source.routine-opening` | `intel.limit.pressure-ambiguous` |
| `shipping-probe-ambiguous` | `intel.source.routine-maritime` | `intel.limit.surface-only` |
| `staging-logistics-anomaly` | `intel.source.routine-logistics` | `intel.limit.logistics-indirect` |
| `combat-elements-dispersed` | `intel.source.routine-disposition` | `intel.limit.routine-coverage` |
| `cycle4-pressure-pattern-ambiguous` | `intel.source.visible-pattern` | `intel.limit.pattern-ambiguous` |
| both reroute definitions | `intel.source.reroute-monitoring` | `intel.limit.reroute-tasking-only` |
| `focused-staging-buildup` | `intel.source.focused-staging` | `intel.limit.focused-positive-intent`, `intel.limit.focused-positive-warning` |
| `focused-staging-empty` | `intel.source.focused-staging` | `intel.limit.focused-negative-currency` |
| `lattice-landing-concentration` | `intel.source.lattice-landing` | `intel.limit.landing-positive-timing` |
| `lattice-landing-dispersed` | `intel.source.lattice-landing` | `intel.limit.landing-negative-pivot` |
| `lattice-auxiliary-coercive` | `intel.source.lattice-auxiliary` | `intel.limit.auxiliary-current-tasking` |
| `lattice-auxiliary-mixed` | `intel.source.lattice-auxiliary` | `intel.limit.auxiliary-mixed` |
| `lattice-sync-preparation-sequence` | `intel.source.lattice-sequence` | `intel.limit.sequence-window` |
| `lattice-sync-preparation-signal` | `intel.source.lattice-sequence` | `intel.limit.sequence-single` |
| `lattice-sync-coercive-sequence` | `intel.source.lattice-sequence` | `intel.limit.sequence-negative` |
| `lattice-sync-partial` | `intel.source.lattice-sequence` | `intel.limit.sequence-partial` |
| `liaison-auxiliary-coercive-links` | `intel.source.partner-liaison` | `intel.limit.liaison-narrow` |
| `liaison-auxiliary-unclear` | `intel.source.partner-liaison` | `intel.limit.liaison-unclear` |

# 13. Judgement copy

| Assessment | Ref | Exact copy |
| --- | --- | --- |
| unclear/weak | `intel.judgement.unclear-weak` | We do not have enough to tell whether the pressure is the operation or cover for one. |
| unclear/conflicted | `intel.judgement.unclear-conflicted` | The reporting points in both directions. I cannot responsibly call Ravellan’s intent. |
| preparation/weak | `intel.judgement.preparation-weak` | My read is that Ravellan is preparing a real move, but the wider picture remains thin or contested. |
| preparation/coherent | `intel.judgement.preparation-coherent` | This now looks like real preparation. The reporting is starting to hold together. |
| coercion/weak | `intel.judgement.coercion-weak` | My read is that the pressure itself is the operation, but that remains a thin or contested judgement. |
| coercion/coherent | `intel.judgement.coercion-coherent` | This increasingly looks like coercion rather than cover for an immediate seizure. |

# 14. Warning/public-claim copy

| Ref | Exact copy |
| --- | --- |
| `intel.warning.usable` | We have current physical movement worth acting on. |
| `intel.warning.none-late` | We do not have current direct warning of execution. |
| `intel.warning.gained` | New reporting gives us direct warning worth acting on. |
| `intel.warning.refreshed` | A newer physical observation refreshes the warning picture. |
| `intel.warning.lost-stale` | The earlier physical warning is now too old to support a clean reaction. |
| `intel.warning.lost-superseded` | A newer observation no longer supports the earlier direct warning. |
| `intel.warning.lost-mixed` | New reporting and the age of the earlier warning leave us without a current direct warning. |
| `intel.public-claim.preparation` | We can substantiate a seizure-preparation case. |
| `intel.public-claim.coercion` | We can substantiate a coercive or deceptive pressure case. |

At C5/C6 exactly one of `intel.warning.usable` or `intel.warning.none-late` is shown.

# 15. Fifteen basis-pattern/warning briefing mappings

Each row has one key-gap ref/copy and one watch-for ref/copy.

| Basis pattern | Warning | Gap ref — exact copy | Watch ref — exact copy |
| --- | --- | --- | --- |
| `no-direction` | none | `intel.gap.no-direction` — We cannot connect the visible pressure to a real force package. | `intel.watch.no-direction` — Watch for physical concentration or military tasking. |
| `indicator-preparation` | none | `intel.gap.indicator-preparation-none` — Suggestive activity has not yet formed an executable preparation picture. | `intel.watch.indicator-preparation-none` — Watch for direct concentration or a sustained preparation sequence. |
| `indicator-preparation` | usable | `intel.gap.indicator-preparation-warning` — We can act on the movement, but one physical indicator does not settle the wider campaign. | `intel.watch.indicator-preparation-warning` — Watch for sequence or tasking corroboration and movement toward execution. |
| `indicator-coercion` | none | `intel.gap.indicator-coercion` — We do not know how quickly the pressure could pivot into real preparation. | `intel.watch.indicator-coercion` — Watch for force concentration or preparation milestones. |
| `indicator-conflict` | none | `intel.gap.indicator-conflict-none` — The suggestive reports point in opposite directions. | `intel.watch.indicator-conflict-none` — Watch for an independent observation that discriminates between them. |
| `indicator-conflict` | usable | `intel.gap.indicator-conflict-warning` — The movement is actionable, but another indicator still supports coercion. | `intel.watch.indicator-conflict-warning` — Watch for preparation sequence corroboration or clearer coercive tasking. |
| `diagnostic-preparation-clear` | none | `intel.gap.diagnostic-preparation-clear-none` — The preparation judgement is strong, but we still lack current execution warning. | `intel.watch.diagnostic-preparation-clear-none` — Watch for current landing-force movement toward execution. |
| `diagnostic-preparation-clear` | usable | `intel.gap.diagnostic-preparation-clear-warning` — The remaining uncertainty is when Ravellan will cross into execution. | `intel.watch.diagnostic-preparation-clear-warning` — Watch for movement from staging into execution. |
| `diagnostic-preparation-qualified` | none | `intel.gap.diagnostic-preparation-qualified-none` — Strong preparation evidence remains qualified by a surviving coercion indicator and no current direct warning. | `intel.watch.diagnostic-preparation-qualified-none` — Watch for a fresh physical sign or evidence that resolves the coercive indicator. |
| `diagnostic-preparation-qualified` | usable | `intel.gap.diagnostic-preparation-qualified-warning` — Direct warning exists, but a surviving coercion indicator still qualifies the wider preparation judgement. | `intel.watch.diagnostic-preparation-qualified-warning` — Watch whether the movement enters execution or the pressure remains separately coercive. |
| `diagnostic-coercion-clear` | none | `intel.gap.diagnostic-coercion-clear` — We need to know whether the coercive campaign is changing character. | `intel.watch.diagnostic-coercion-clear` — Watch for new preparation signposts or physical concentration. |
| `diagnostic-coercion-qualified` | none | `intel.gap.diagnostic-coercion-qualified-none` — Strong coercion evidence remains qualified by a preparation indicator. | `intel.watch.diagnostic-coercion-qualified-none` — Watch whether the physical indicator develops into an executable force package. |
| `diagnostic-coercion-qualified` | usable | `intel.gap.diagnostic-coercion-qualified-warning` — Coercion remains the best wider judgement, but the physical warning is still actionable. | `intel.watch.diagnostic-coercion-qualified-warning` — Watch for movement into execution while testing whether the pressure chain remains coercive. |
| `diagnostic-conflict` | none | `intel.gap.diagnostic-conflict-none` — Strong evidence supports both explanations; we lack the decisive discriminator. | `intel.watch.diagnostic-conflict-none` — Watch for a fresh observation that invalidates one diagnostic line. |
| `diagnostic-conflict` | usable | `intel.gap.diagnostic-conflict-warning` — Strong evidence supports both explanations, but the physical warning still requires action. | `intel.watch.diagnostic-conflict-warning` — Watch for execution while seeking the discriminator between the two strong cases. |

All 15 mappings are required even though canonical producers currently reach 11.

# 16. Assessment/evidence-change copy

Assessment-change refs:

| Kind | Ref | Exact copy |
| --- | --- | --- |
| initial | `intel.change.initial` | This is the opening assessment. |
| unchanged | `intel.change.unchanged` | The main judgement is unchanged. |
| narrowed | `intel.change.narrowed` | The picture has narrowed toward one explanation. |
| strengthened | `intel.change.strengthened` | The current judgement has strengthened. |
| weakened | `intel.change.weakened` | The current judgement is less secure than it was. |
| conflicted | `intel.change.conflicted` | The reporting is now in conflict. |
| cleared-conflict | `intel.change.cleared-conflict` | The previous conflict has cleared, but the picture remains thin. |
| reopened | `intel.change.reopened` | The previous directional judgement is no longer supportable. |
| reversed | `intel.change.reversed` | The best current judgement has reversed. |

Evidence-cause refs:

| Cause | Ref | Exact copy |
| --- | --- | --- |
| none | `intel.change-cause.none` | No material evidence change drove this update. |
| new-evidence | `intel.change-cause.new-evidence` | New reporting changed the picture. |
| staleness | `intel.change-cause.staleness` | Earlier reporting is now too old for the same operational use. |
| supersession | `intel.change-cause.supersession` | A newer observation replaced an older answer to the same question. |
| mixed | `intel.change-cause.mixed` | New reporting and the age or replacement of earlier reporting changed the picture. |

Normal presentation may suppress initial/unchanged/none when they add no decision value. It may not suppress warning acquisition/loss, an actionable public-case change, or a player-tasked result merely because the assessment sentence stayed unchanged.

# 17. Model validation

`kestrel-hq-belief-v1` rejects unless it proves:

- exact 19 definition IDs;
- exact four question IDs/five producer kinds;
- no invalid old sequence ID or integrated-auxiliary ID;
- exact ordinary/reroute/focused mappings;
- diagnostic implies directional;
- warning role/relevance implies preparation;
- public role/relevance implies directional + corroboration group;
- role windows exact, including focused buildup warning C4–C5 and focused empty assessment C4–C5;
- all source/context/limitation/summary refs resolve;
- focused buildup has both required limitation refs;
- supersession IDs valid, unique and acyclic;
- exact 15 basis-pattern/warning mappings;
- exact copy refs resolve once;
- semantic maps canonicalised without changing authored target-order arrays.

`kestrel-collection-v1` later rejects unless it proves:

- exact three target IDs;
- exact target/result mappings and timing;
- no target repeated;
- no no-task while unused targets remain;
- focused collection does not consume landing;
- default orders contain each target exactly once;
- every result definition exists in the #100 model.

# 18. Digest boundary

The #100 semantic digest includes:

- all 19 evidence definitions and three role relevance rules;
- ordinary/reroute/focused mappings;
- reducer semantic ID;
- source/corroboration/supersession metadata;
- all exact decision-significant copy.

The future #102 producer digest includes:

- target IDs;
- target timing/one-shot/no-task rules;
- target and liaison producer mappings;
- default target orders;
- references to exact #100 definition IDs.

#103 binds both into final Kestrel content identity. Reordering unordered maps canonicalises; changing any semantic value changes the relevant digest.
