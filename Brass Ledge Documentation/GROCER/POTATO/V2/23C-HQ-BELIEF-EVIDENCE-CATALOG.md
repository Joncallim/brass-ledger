---
type: v2-hq-belief-evidence-catalog
status: active
---

# HQ Belief Evidence Catalog

Backlink: [[README]]

This is the exact machine/content authority for the `kestrel-hq-belief-v1` evidence vocabulary. [[23-HQ-BELIEF-AND-EVIDENCE]] owns product meaning, [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns code/replay seams, and [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns generated coverage counts.

An implementation agent may choose local TypeScript names but may not change any ID, producer predicate, evidence semantic, lifetime, source-independence group, supersession rule, or decision-significant copy below.

# 1. Closed identifiers

## Claim

- `ravellan-intent`

## Questions

- `ravellan-intent-general`
- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

## Producer kinds

- `ordinary`
- `reroute`
- `focused`
- `lattice`
- `liaison`

## Supersession policies

- `explicit-only`
- `replace-older-same-question`

## Public-case corroboration groups

Only source-sensitive evidence has a corroboration group.

- `physical-staging`
- `auxiliary-tasking`
- `operational-sequence`
- `partner-liaison`

Different `sourceGroupId` values do not automatically prove independence. Public credibility uses different `corroborationGroupId` values. Focused staging and Lattice landing both belong to `physical-staging`; in normal history the newer landing report also supersedes the older focused report.

# 2. Exact 19 definitions

`warning` means `warningRole = usable`; otherwise `none`.

`public` means `publicCaseRole = source-sensitive`; otherwise `none`.

| # | Definition ID | Question | Implication | Class | Producer | Source group | Corroboration group | Lifetime | Supersession | Warning | Public |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `opening-pressure-ambiguous` | general | ambiguous | indicator | ordinary | `routine-opening-pressure` | — | fixed C1–C2 | explicit only | no | no |
| 2 | `shipping-probe-ambiguous` | general | ambiguous | indicator | ordinary | `routine-maritime-pressure` | — | fixed C2–C3 | explicit only | no | no |
| 3 | `staging-logistics-anomaly` | general | preparation | indicator | ordinary | `routine-regional-logistics` | — | fixed C3–C4 | explicit only | no | no |
| 4 | `combat-elements-dispersed` | general | coercion | indicator | ordinary | `routine-force-disposition` | — | fixed C3–C4 | explicit only | no | no |
| 5 | `cycle4-pressure-pattern-ambiguous` | general | ambiguous | indicator | ordinary | `routine-visible-pattern` | — | fixed C4–C5 | explicit only | no | no |
| 6 | `reroute-auxiliary-coercive` | auxiliary | coercion | indicator | reroute | `reroute-auxiliary-monitoring` | — | fixed C3–C5 | replace same question | no | no |
| 7 | `reroute-auxiliary-unclear` | auxiliary | ambiguous | indicator | reroute | `reroute-auxiliary-monitoring` | — | fixed C3–C5 | replace same question | no | no |
| 8 | `focused-staging-buildup` | landing | preparation | indicator | focused | `focused-staging-collection` | `physical-staging` | fixed C4–C6 | replace same question; explicitly supersedes #4 | yes | yes |
| 9 | `focused-staging-empty` | landing | coercion | indicator | focused | `focused-staging-collection` | `physical-staging` | fixed C4–C5 | replace same question; explicitly supersedes #3 | no | yes |
| 10 | `lattice-landing-concentration` | landing | preparation | diagnostic | lattice | `lattice-landing-collection` | `physical-staging` | result cycle–C6 | replace same question | yes | yes |
| 11 | `lattice-landing-dispersed` | landing | coercion | indicator | lattice | `lattice-landing-collection` | `physical-staging` | result cycle–C6 | replace same question | no | yes |
| 12 | `lattice-auxiliary-coercive` | auxiliary | coercion | diagnostic | lattice | `lattice-auxiliary-collection` | `auxiliary-tasking` | result cycle–C6 | replace same question | no | yes |
| 13 | `lattice-auxiliary-mixed` | auxiliary | ambiguous | indicator | lattice | `lattice-auxiliary-collection` | — | result cycle–C6 | replace same question | no | no |
| 14 | `lattice-sync-preparation-sequence` | sequence | preparation | diagnostic | lattice | `lattice-sequence-analysis` | `operational-sequence` | result cycle–C6 | explicit only | no | yes |
| 15 | `lattice-sync-preparation-signal` | sequence | preparation | indicator | lattice | `lattice-sequence-analysis` | `operational-sequence` | result cycle–C6 | explicit only | no | yes |
| 16 | `lattice-sync-coercive-sequence` | sequence | coercion | indicator | lattice | `lattice-sequence-analysis` | `operational-sequence` | result cycle–C6 | explicit only | no | yes |
| 17 | `lattice-sync-partial` | sequence | ambiguous | indicator | lattice | `lattice-sequence-analysis` | — | result cycle–C6 | explicit only | no | no |
| 18 | `liaison-auxiliary-coercive-links` | auxiliary | coercion | indicator | liaison | `partner-liaison-reporting` | `partner-liaison` | fixed C5–C6 | replace same question | no | yes |
| 19 | `liaison-auxiliary-unclear` | auxiliary | ambiguous | indicator | liaison | `partner-liaison-reporting` | — | fixed C5–C6 | replace same question | no | no |

Canonical internal question aliases used by the model are:

- `general` → `ravellan-intent-general`;
- `landing` → `landing-force-staging`;
- `auxiliary` → `auxiliary-tasking`;
- `sequence` → `political-operational-sync`.

# 3. Removed definitions

The following IDs are invalid and content validation must reject them:

- `reroute-auxiliary-integrated`;
- `lattice-auxiliary-integrated`;
- `liaison-auxiliary-military-links`.

They are impossible under committed #99 result-time combinations. Do not keep them as speculative future branches.

# 4. Ordinary schedule

The model contains exactly:

```text
C1 → opening-pressure-ambiguous
C2 → shipping-probe-ambiguous
C3 → combat-elements-dispersed + staging-logistics-anomaly
C4 → cycle4-pressure-pattern-ambiguous
C5 → none
C6 → none
```

Schedule lists are canonical lexical order. Directed definitions never instantiate from this schedule.

# 5. Producer mappings

## C2 `reroute-and-monitor` → C3 report

Inputs are verified C2 normal action and C2 post-decision preparation only.

| C2 post-preparation | C2 action | Source fact | Definition |
| --- | --- | --- | --- |
| none | `probe_shipping` | `coercive-tasking` | `reroute-auxiliary-coercive` |
| none | `seed_deception` | `coercive-tasking` | `reroute-auxiliary-coercive` |
| none | `prepare_beacon_seizure` | `unclear` | `reroute-auxiliary-unclear` |
| developing | any legal C2 normal action | `unclear` | `reroute-auxiliary-unclear` |
| ready | any legal C2 normal action | `unclear` | `reroute-auxiliary-unclear` |

`pause_consolidate` is illegal in C2 and fails producer validation rather than mapping.

## C3 focused staging → C4 report

Input is verified C4 post-decision preparation only.

| C4 post-preparation | Source fact | Definition |
| --- | --- | --- |
| none | `no-concentration-observed` | `focused-staging-empty` |
| developing | `concentration-observed` | `focused-staging-buildup` |
| ready | `concentration-observed` | `focused-staging-buildup` |

## Lattice landing result

Input is result-cycle post-decision preparation only.

| Preparation | Source fact | Definition |
| --- | --- | --- |
| none | `no-concentration-observed` | `lattice-landing-dispersed` |
| developing | `concentration-observed` | `lattice-landing-concentration` |
| ready | `concentration-observed` | `lattice-landing-concentration` |

## Lattice auxiliary result

Inputs are result-time preparation and the latest normal Ravellan action available to the authorised collection interval.

| Preparation | Latest normal action | Source fact | Definition |
| --- | --- | --- | --- |
| none | `probe_shipping` | `coercive-tasking` | `lattice-auxiliary-coercive` |
| none | `seed_deception` | `coercive-tasking` | `lattice-auxiliary-coercive` |
| any | every other legal normal action | `mixed` | `lattice-auxiliary-mixed` |
| developing/ready | any legal normal action | `mixed` | `lattice-auxiliary-mixed` |

The order of the last two rows is semantic rather than executable precedence: the only coercive branch is exactly `none + probe/deception`; all other combinations are mixed.

## Lattice operational-sequence result

Inputs are the two latest verified **normal** Ravellan actions at result time. The terminal C6 action is never included.

| Recent normal actions | Definition |
| --- | --- |
| two `prepare_beacon_seizure` | `lattice-sync-preparation-sequence` |
| exactly one `prepare_beacon_seizure` | `lattice-sync-preparation-signal` |
| no prepare and at least one `probe_shipping` or `seed_deception` | `lattice-sync-coercive-sequence` |
| otherwise | `lattice-sync-partial` |

## C4 partner liaison → C5 report

Uses the same authorised result-time facts as auxiliary tasking but produces indicator-strength liaison definitions.

| Preparation | Latest normal action | Definition |
| --- | --- | --- |
| none | `probe_shipping` or `seed_deception` | `liaison-auxiliary-coercive-links` |
| every other combination | `liaison-auxiliary-unclear` |

# 6. Result timing

Exactly:

- C2 reroute order → C3 occurrence;
- C3 focused order → C4 occurrence;
- C4 Lattice target → C5 occurrence;
- C5 different unused Lattice target → C6 occurrence;
- C4 liaison → C5 occurrence.

C6 adds no new normal action/preparation transition for a repeated target. Same-target C5 retasking is invalid.

# 7. Supersession

Supersession is determined from the full occurrence history observed by the query cycle and is persistent.

## Same-question replacement

A newer occurrence with `replace-older-same-question` replaces every older occurrence of the same question, including a different definition ID.

This covers:

- Lattice landing replacing focused staging;
- liaison or Lattice auxiliary replacing C2 reroute;
- Lattice auxiliary replacing liaison if a future authorised path ever permits both.

## Explicit asymmetric replacement

- `focused-staging-buildup` explicitly supersedes `combat-elements-dispersed`.
- `focused-staging-empty` explicitly supersedes `staging-logistics-anomaly`.

A superseded occurrence never resurrects merely because the superseding occurrence later becomes stale or is itself superseded.

# 8. Source and limitation copy

All decision-significant English strings below are part of the prototype model digest.

## Source-context refs

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

## Limitation refs

| Ref | Exact copy |
| --- | --- |
| `intel.limit.pressure-ambiguous` | Visible pressure is compatible with coercion, testing, or cover for preparation. |
| `intel.limit.surface-only` | Surface activity does not show what may be happening at staging areas. |
| `intel.limit.logistics-indirect` | Logistics activity alone does not identify an executable seizure force. |
| `intel.limit.routine-coverage` | Routine coverage is incomplete and may miss movement outside observed sectors. |
| `intel.limit.pattern-ambiguous` | A change in visible pressure can mean deterrence, concealment, consolidation, or continued coercion. |
| `intel.limit.reroute-tasking-only` | The reroute monitoring characterises the pressure vessels; it does not observe the seizure force directly. |
| `intel.limit.focused-positive-intent` | The movement is actionable warning, but it does not settle Ravellan's wider political intent. |
| `intel.limit.focused-negative-currency` | This negative observation is time-sensitive; preparation may begin after the collection window. |
| `intel.limit.landing-positive-timing` | Concentration strongly supports preparation but does not reveal the exact execution time. |
| `intel.limit.landing-negative-pivot` | No concentration now does not rule out a later pivot. |
| `intel.limit.auxiliary-current-tasking` | This diagnoses the current tasking chain, not every future Ravellan option. |
| `intel.limit.auxiliary-mixed` | Available tasking links do not distinguish coercion from broader preparation. |
| `intel.limit.sequence-window` | A sustained sequence supports preparation but gives no direct timing warning. |
| `intel.limit.sequence-single` | One preparation milestone does not establish a sustained sequence. |
| `intel.limit.sequence-negative` | Recent pressure without a new milestone does not prove earlier preparation is absent. |
| `intel.limit.sequence-partial` | The recent operational sequence is incomplete or mixed. |
| `intel.limit.liaison-narrow` | Partner reporting is narrower and is not independently diagnostic. |
| `intel.limit.liaison-unclear` | Partner reporting does not resolve the tasking chain. |

# 9. Evidence summary refs

| Definition | Summary ref | Exact copy |
| --- | --- | --- |
| `opening-pressure-ambiguous` | `intel.evidence.opening-pressure` | Ravellan has increased ambiguous maritime pressure around Beacon Channel. |
| `shipping-probe-ambiguous` | `intel.evidence.shipping-pressure` | Pressure vessels continue to shadow and interfere with commercial traffic. |
| `staging-logistics-anomaly` | `intel.evidence.logistics-anomaly` | Logistics activity near known staging areas is above the routine baseline. |
| `combat-elements-dispersed` | `intel.evidence.combat-dispersed` | Within routine coverage, the major combat elements expected for a rapid seizure still appear dispersed. |
| `cycle4-pressure-pattern-ambiguous` | `intel.evidence.pressure-pattern` | Ravellan's visible pressure pattern has changed, but the change does not establish why. |
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

# 10. Per-definition source and limitation mapping

| Definition(s) | Source-context ref | Limitation ref |
| --- | --- | --- |
| `opening-pressure-ambiguous` | `intel.source.routine-opening` | `intel.limit.pressure-ambiguous` |
| `shipping-probe-ambiguous` | `intel.source.routine-maritime` | `intel.limit.surface-only` |
| `staging-logistics-anomaly` | `intel.source.routine-logistics` | `intel.limit.logistics-indirect` |
| `combat-elements-dispersed` | `intel.source.routine-disposition` | `intel.limit.routine-coverage` |
| `cycle4-pressure-pattern-ambiguous` | `intel.source.visible-pattern` | `intel.limit.pattern-ambiguous` |
| both reroute definitions | `intel.source.reroute-monitoring` | `intel.limit.reroute-tasking-only` |
| `focused-staging-buildup` | `intel.source.focused-staging` | `intel.limit.focused-positive-intent` |
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

# 11. Judgement refs

| Assessment | Ref | Exact copy |
| --- | --- | --- |
| unclear / weak | `intel.judgement.unclear-weak` | We do not have enough to tell whether the pressure is the operation or cover for one. |
| unclear / conflicted | `intel.judgement.unclear-conflicted` | The reporting points in both directions. I cannot responsibly call Ravellan's intent. |
| preparation / weak | `intel.judgement.preparation-weak` | My read is that Ravellan is preparing a real move, but the wider picture remains thin or contested. |
| preparation / coherent | `intel.judgement.preparation-coherent` | This now looks like real preparation. The reporting is starting to hold together. |
| coercion / weak | `intel.judgement.coercion-weak` | My read is that the pressure itself is the operation, but that remains a thin or contested judgement. |
| coercion / coherent | `intel.judgement.coercion-coherent` | This increasingly looks like coercion rather than cover for an immediate seizure. |

# 12. Warning and public-claim refs

| Ref | Exact copy |
| --- | --- |
| `intel.warning.usable` | We have direct movement worth acting on, even though the wider intent picture may still be incomplete. |
| `intel.warning.lost` | We no longer have a current physical warning sign we can rely on. |
| `intel.public-claim.preparation` | We can substantiate a seizure-preparation case. |
| `intel.public-claim.coercion` | We can substantiate a coercive or deceptive pressure case. |

`intel.warning.lost` is required for total reducer/change handling but is unreachable in canonical Kestrel under the current producer envelope.

# 13. Gap and watch-for refs

| Assessment | Warning | Gap ref / exact copy | Watch ref / exact copy |
| --- | --- | --- | --- |
| unclear / weak | none | `intel.gap.unclear-weak` — We cannot connect the visible pressure to a real seizure force. | `intel.watch.unclear-weak` — Watch for physical concentration or military tasking. |
| unclear / conflicted | none | `intel.gap.conflicted-none` — We cannot reconcile the logistics activity with the apparently dispersed force elements. | `intel.watch.conflicted-none` — Watch for independent direct observation of force movement or tasking. |
| unclear / conflicted | usable | `intel.gap.conflicted-warning` — We can see movement worth acting on, but not what wider campaign it belongs to. | `intel.watch.conflicted-warning` — Watch for sequence corroboration or contrary coercive tasking. |
| preparation / weak | none | `intel.gap.preparation-weak-none` — We do not yet have a clean physical picture of an executable force package. | `intel.watch.preparation-weak-none` — Watch for direct concentration or a corroborating preparation sequence. |
| preparation / weak | usable | `intel.gap.preparation-weak-warning` — We need to know whether the physical warning belongs to sustained preparation. | `intel.watch.preparation-weak-warning` — Watch for tasking or sequence corroboration and movement toward execution. |
| preparation / coherent | none | `intel.gap.preparation-coherent-none` — We still lack direct timing and execution warning. | `intel.watch.preparation-coherent-none` — Watch for landing-force concentration or movement toward execution. |
| preparation / coherent | usable | `intel.gap.preparation-coherent-warning` — The remaining uncertainty is when Ravellan will cross into execution. | `intel.watch.preparation-coherent-warning` — Watch for movement from staging into execution. |
| coercion / weak | none | `intel.gap.coercion-weak` — We do not know how quickly the pressure could pivot into preparation. | `intel.watch.coercion-weak` — Watch for new force concentration or preparation milestones. |
| coercion / coherent | none | `intel.gap.coercion-coherent` — We need to know whether the coercive campaign is changing character. | `intel.watch.coercion-coherent` — Watch for new preparation signposts or physical concentration. |

No other assessment/warning pair has player copy.

# 14. Assessment-change and cause refs

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

Evidence-change cause refs:

| Cause | Ref | Exact copy |
| --- | --- | --- |
| none | `intel.change-cause.none` | No material evidence change drove this update. |
| new-evidence | `intel.change-cause.new-evidence` | New reporting changed the picture. |
| staleness | `intel.change-cause.staleness` | Earlier reporting is now too old to carry the same weight. |
| supersession | `intel.change-cause.supersession` | A newer observation replaced an older answer to the same question. |
| mixed | `intel.change-cause.mixed` | New reporting and the aging or replacement of earlier reporting changed the picture. |

Normal presentation may suppress `initial`, `unchanged`, or `none` lines when they add no decision value. It may not suppress warning acquisition, public-action-space change, or a material staleness/supersession explanation merely because the intent assessment string stayed unchanged.

# 15. Lattice default target order

When Lattice is operational, HQ must preselect exactly one unused target each C4/C5. The player may retarget without spending a normal intervention. There is no `collect nothing` option while any unused target exists.

Priority order by standing main priority:

| Main priority | First choice → second → third |
| --- | --- |
| `beacon-security` | landing → sequence → auxiliary |
| `partner-cooperation` | sequence → auxiliary → landing |
| `ravellan-understanding` | auxiliary → sequence → landing |

Remove targets already used. Do not remove landing because focused staging already produced a report; Lattice landing is diagnostically stronger. Final target choice remains explicit in the persisted #102 task transition.

# 16. Model validation

Reject a model that does not prove all of the following:

- exact 19 definition IDs, no more or fewer;
- exact four question IDs and five producer kinds;
- exact ordinary schedule;
- exact producer mappings;
- no removed integrated-auxiliary ID;
- every directional definition has source context and limitation refs;
- every source-sensitive definition has a corroboration group;
- no ambiguous definition is diagnostic, warning-bearing, or public-case eligible;
- warning-bearing definition implies preparation;
- fixed observed cycle is not after current-through cycle;
- `focused-staging-empty` current through C5, not C6;
- same-question and explicit supersession graph is acyclic;
- all semantic arrays are canonical order;
- every ref resolves to exactly one exact copy string;
- exact nine assessment/warning gap/watch mappings;
- no directionless credible public-case copy;
- Lattice default orders contain all three targets exactly once;
- no same-target C4/C5 schedule is legal.

# 17. Digest boundary

The semantic digest covers this entire canonical model:

- IDs;
- definitions;
- question/producer/source/corroboration metadata;
- lifetimes;
- mappings;
- supersession;
- reducer semantics ID;
- exact decision-significant English copy;
- Lattice default target order insofar as it affects the target recommendation surface.

Reordering an unordered semantic collection canonicalises to the same digest; changing any semantic value changes the digest.
