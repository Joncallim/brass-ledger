---
type: v2-lattice-contract
status: active
---

# Lattice Collection Matrix

Backlink: [[README]]

This is the implementation authority for **#102 — Lattice Cell and Kestrel directed collection**.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns assessment/warning/public-case meaning.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns evidence occurrence/reducer integration.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns exhaustive target-history evidence.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact predeclared evidence definitions/copy.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-issue command interaction.

Lattice is one concrete institutional capability, not a generic technology tree.

# 1. Product purpose

Protecting Lattice through three early windows gives the headquarters a new verb:

> **Ask one specific operational question without spending normal personal attention.**

It does not add intelligence points, probabilities, rerolls or a passive bonus.

Operational Lattice answers exactly two of three questions before the final response. The commander chooses which uncertainty remains unresolved.

# 2. Investment schedule

Exactly:

- C1 `0 → 1`;
- C2 `1 → 2`;
- C3 `2 → operational`.

All advances must occur on schedule. Missing one makes Kestrel maturity unreachable. No catch-up, partial bonus, acceleration or refund.

Operational from C4.

# 3. Command-by-exception task flow

When Lattice is operational:

- C4 contains one Task Collection target;
- C5 contains one different unused target;
- Task Collection consumes zero normal interventions;
- HQ preselects one unused target from standing main priority;
- the player may retarget to another unused target without spending normal intervention;
- leaving the target untouched executes the HQ selection;
- there is no `collect nothing` course while an unused target exists;
- there is no C6 task.

This is implicit delegation applied to the new capability. A free no-op would be a dominated ceremonial button.

# 4. Exact target IDs and defaults

Stable target IDs:

- `landing-force-staging`
- `auxiliary-tasking`
- `operational-sequence`

The invalid former ID `political-operational-sync` must not survive in code/content. The sensor observes operational sequence, not political messaging.

Remove already-used targets and choose the first remaining target:

| Main priority | First → second → third |
| --- | --- |
| `beacon-security` | landing → sequence → auxiliary |
| `partner-cooperation` | sequence → auxiliary → landing |
| `ravellan-understanding` | auxiliary → sequence → landing |

Default ordering expresses standing direction, not a hidden optimum. #107 still tests target dominance.

# 5. Why same-target retasking is illegal

The exhaustive model evaluated C4→C5 and C5→C6 observations across all 257 #100-relevant private histories.

C6 adds neither a normal Ravellan action nor preparation progression. A C5 repeat would therefore inspect the same facts as the first result:

- landing — same C5/C6 preparation;
- auxiliary — same latest normal C5 action/preparation;
- sequence — same latest two normal actions C4/C5.

Every repeat returned the same evidence definition and changed no assessment, warning, public case, recommendation input or route input. It is a fake choice.

Each target may be tasked at most once in Kestrel.

# 6. Focused staging does not consume landing

C3 focused staging and Lattice landing answer the same broad physical question at different analytical strengths:

- `focused-staging-buildup` — preparation indicator + warning current C4–C5;
- `lattice-landing-concentration` — diagnostic preparation + warning current through C6.

Lattice landing replaces the older focused report and upgrades assessment.

Across all 138 focused-positive private histories, landing changes the C5 assessment:

- 118 preparation/weak → preparation/coherent;
- 20 unclear/conflicted → preparation/weak.

Therefore focused collection never marks the Lattice landing target used or ineligible.

# 7. Task/result timing

## C4 target

```text
persist C4 task
→ C5 Ravellan normal decision/world cut exists
→ derive authorised source fact
→ instantiate C5 evidence occurrence
→ derive C5 HQ products
```

## C5 target

```text
persist C5 task
→ no later normal Ravellan transition occurs
→ use C5/latest-normal pre-manifestation facts
→ instantiate C6 evidence occurrence
→ derive C6 pre-manifestation HQ products
→ show safe overt crisis
```

C5→C6 result never reads R6 terminal action or policy row.

# 8. Evidence semantics and collection producer model

All result evidence meanings are already predeclared in `kestrel-hq-belief-v1` by [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

#102 owns a separate resolved content model:

`kestrel-collection-v1`

It contains/digests:

- exact target IDs;
- mandatory C4/C5 task rules;
- one-shot target rule;
- default target ordering;
- result timing;
- authorised raw-fact domains;
- raw fact → source fact → existing #100 definition-ID mappings;
- liaison fallback mapping;
- exact applicability rules.

#102 may not redefine evidence implication, diagnosticity, role relevance, source/corroboration group, supersession or copy.

#103 includes both the #100 belief-model digest and #102 collection-model digest in final Kestrel content identity.

# 9. Observation boundary

Every collection result follows:

```text
verified task/history
→ target-authorised hidden-fact extractor
→ bounded source fact
→ existing #100 definition ID
→ runtime occurrence
→ #100 role reducers
```

Hidden posture is never input. Holding authorised facts fixed while changing posture produces deep-equal occurrence semantics.

# 10. Landing-force staging

Question:

> **Are the units needed for a Beacon seizure actually concentrating?**

Primary value: physical indications and warning.

Authorised input:

- result-cut Ravellan preparation only.

No posture/action input.

| Preparation | Definition | Effect |
| --- | --- | --- |
| none | `lattice-landing-dispersed` | coercion indicator; no warning |
| developing/ready | `lattice-landing-concentration` | preparation diagnostic; usable warning |

Both directional results are source-sensitive and current from result cycle through C6.

The result replaces prior focused-staging evidence but not unrelated questions.

# 11. Auxiliary tasking

Question:

> **Are the vessels pressuring shipping part of a coercive tasking chain, or is the wider connection still unclear?**

Primary value: strongest diagnostic coercion path.

Authorised inputs:

- result-cut preparation;
- latest normal Ravellan action.

| Condition | Definition | Effect |
| --- | --- | --- |
| preparation none + action probe/deception | `lattice-auxiliary-coercive` | coercion diagnostic; no warning |
| every other combination | `lattice-auxiliary-mixed` | ambiguous indicator |

The result replaces older reroute/liaison auxiliary evidence.

There is no preparation/integrated branch: it is unreachable under committed #99.

# 12. Operational sequence

Question:

> **Do Ravellan’s latest operational milestones form a sustained preparation sequence?**

Primary value: preparation-pattern/public-case evidence without tactical warning.

Authorised input:

- exactly the latest two verified **normal** Ravellan actions C4/C5.

| Pattern | Definition | Effect |
| --- | --- | --- |
| two prepare actions | `lattice-sync-preparation-sequence` | preparation diagnostic; no warning |
| exactly one prepare | `lattice-sync-preparation-signal` | preparation indicator; no warning |
| no prepare + at least one probe/deception | `lattice-sync-coercive-sequence` | coercion indicator; no warning |
| otherwise | `lattice-sync-partial` | ambiguous indicator |

The coercion branch remains an indicator because the two-action window cannot prove older preparation absent.

# 13. Target differentiation

Intended triangle:

- landing — strongest physical warning + diagnostic preparation;
- auxiliary — strongest diagnostic coercion;
- sequence — diagnostic preparation/public-case path without warning.

Representative identical-prestate contrasts:

- preparation exists + one recent prepare:
  - landing → diagnostic preparation + warning;
  - sequence → preparation indicator;
  - auxiliary → mixed;
- no preparation + coercive latest action:
  - auxiliary → diagnostic coercion;
  - landing → coercion indicator;
  - sequence → at most coercion indicator;
- two recent prepares:
  - landing → diagnostic preparation + warning;
  - sequence → diagnostic preparation without warning.

#107 must reject a globally dominated target/target order or prose-only differentiation. Do not hide equivalence with randomness.

# 14. Partner-liaison fallback

If Lattice is unavailable in C4, expose:

`request-partner-liaison`

Rules:

- commander-only;
- costs one normal intervention;
- creates liaison obligation;
- one C5 result;
- auxiliary question only;
- never diagnostic;
- never warning;
- no reusable capability.

Mapping:

- C5 preparation none + C5 probe/deception → `liaison-auxiliary-coercive-links`;
- every other combination → `liaison-auxiliary-unclear`.

The result replaces older C2 reroute auxiliary evidence.

There is no preparation/military-links branch under #99.

# 15. Public-case/source-use interaction

Lattice never directly creates persisted attribution state.

At a pre-command point:

```text
all due occurrences instantiate
→ #100 derives current assessment/warning/public case
→ #101 combines public case with unspent/used source state
→ agenda or terminal route derives
```

A C4 target can affect C5 attribution availability. A C5 target can affect C6 Hold And Expose availability.

Once source use is persisted `used`, later evidence cannot regenerate or relabel the claim.

# 16. #102 persistence/replay architecture

Before coding, inspect the then-current replay lifecycle and introduce the smallest replay-verifiable state/transition for:

- Lattice progress and missed maturity;
- operational status;
- target IDs already used;
- selected target and task cycle;
- due-result queue/authoritative origin;
- liaison request/obligation where applicable.

Reject/tamper-test:

- operational Lattice with no target while unused targets exist;
- repeated target;
- more than one target per cycle;
- C6 target;
- result before due cycle;
- result definition inconsistent with authorised facts;
- tampered task/result origin;
- duplicate occurrence;
- result attempting to override #100 definition semantics.

#100 evidence/products remain derived and are not duplicated in persisted state.

# 17. Required #102 tests

## Investment/task flow

- exact C1→C3 maturation;
- every missed advance blocks maturity;
- exactly one C4 target and one different C5 target;
- no no-task or same-target path;
- all six ordered target schedules;
- default target order exact for all three priorities;
- leaving target untouched executes HQ selection;
- retargeting costs zero normal interventions.

## Timing/information safety

- C4 task→C5 result;
- C5 task→C6 pre-manifestation result;
- no R6 action/row input;
- posture-only variation with authorised facts fixed gives equal result;
- exact `kestrel-collection-v1` mappings;
- no integrated auxiliary branch.

## Focused/Lattice relationship

- focus never consumes landing;
- landing replaces focus same-question evidence;
- positive focus warning can expire before C6;
- landing refreshes warning through C6;
- generated 138/138 assessment-upgrade invariant.

## Reducer/public-case composition

- occurrences exactly match predeclared #100 definitions;
- landing/auxiliary/sequence differ through assessment/warning/public case;
- unrelated questions can contradict;
- same-question older evidence never stacks/resurrects;
- public credibility requires diagnostic + independent corroboration;
- source use never regenerates after `used`.

## Viability/dominance

- at least one non-Lattice non-defeat route remains;
- no target or ordered target sequence globally dominated in every co-eligible state;
- default order is not treated as proof of optimality.

## Replay/compatibility

- every capability/task mutation replays/recomputes and rejects tampering/order changes;
- proper prototype version handling if persisted V2 shape changes;
- V1 unchanged.

# 18. Rejection conditions

Reject #102 if it:

- adds intelligence points/probabilities;
- permits no-task or same-target retask;
- lets focused collection consume landing;
- retains the misleading old sequence target ID;
- reads hidden posture or R6 action;
- invents integrated auxiliary preparation evidence;
- changes predeclared #100 evidence meaning;
- lets same-question reports stack as votes;
- makes liaison free/delegated/diagnostic/warning-capable;
- persists duplicate HQ belief;
- masks target equivalence with randomness;
- generalises a technology/collection plugin framework before a second scenario proves reuse.
