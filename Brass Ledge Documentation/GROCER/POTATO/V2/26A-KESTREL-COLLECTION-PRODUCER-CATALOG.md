---
type: v2-kestrel-collection-producer-catalog
status: active
---

# Kestrel Collection Producer Catalog

Backlink: [[README]]

This is the exact content/producer authority for **#102**.

It deliberately separates:

- **what an evidence definition means** — owned by `kestrel-hq-belief-v1` in [[23C-HQ-BELIEF-EVIDENCE-CATALOG]]; from
- **which task/history facts produce that definition** — owned here by `kestrel-collection-producer-v1`.

Where [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] lists Lattice/liaison producer mappings or default target order for completeness, this document is the narrower authority. #100 predeclares the evidence definitions but does not implement these producer rules.

# 1. Canonical producer identity

Stable model ID:

`kestrel-collection-producer-v1`

It has its own deterministic semantic digest.

#103 must include both:

- the `kestrel-hq-belief-v1` semantic digest; and
- the `kestrel-collection-producer-v1` semantic digest

in the final Kestrel content identity.

Changing task timing, default target order, target eligibility, authorised facts, producer mappings, or liaison rules changes the collection-producer digest even when the evidence definitions themselves do not change.

# 2. Exact target IDs

- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

Exactly these three.

# 3. Exact task schedule

When Lattice is operational:

- C4 — exactly one target;
- C5 — exactly one different unused target;
- no C6 task;
- no same-target repeat;
- no zero-cost no-task while an unused target exists.

Result timing:

- C4 task → C5 evidence occurrence;
- C5 task → C6 pre-manifestation evidence occurrence.

C5→C6 result uses the latest normal-world cut. It never reads the R6 terminal action or row.

# 4. Default target order

HQ preselects the first unused target in the standing-main-priority order:

| Main priority | Ordered targets |
| --- | --- |
| `beacon-security` | landing → sequence → auxiliary |
| `partner-cooperation` | sequence → auxiliary → landing |
| `ravellan-understanding` | auxiliary → sequence → landing |

Aliases:

- landing → `landing-force-staging`;
- auxiliary → `auxiliary-tasking`;
- sequence → `political-operational-sync`.

The player may retarget to another unused target at zero normal-intervention cost. Leaving the selection untouched executes the preselection.

# 5. Task origin

#102 chooses the smallest replay-verifiable persisted transition for task selection.

This document does **not** predeclare a new `task-collection` ledger discriminator during #100.

After #102 freezes the transition, every result occurrence origin must reference:

- the actual authoritative task-selection ledger entry; and
- every authoritative Ravellan decision whose fields the producer consumed.

The occurrence origin type must use the then-current actual `V2ActionLedgerEntry` discriminator union. It may not rely on a future action kind invented in #100.

# 6. Landing-force producer

Authorised fact:

- post-decision seizure preparation at the result cut.

No posture, policy row or action ID.

| Preparation | Source fact | #100 definition ID |
| --- | --- | --- |
| `none` | `no-concentration-observed` | `lattice-landing-dispersed` |
| `developing` | `concentration-observed` | `lattice-landing-concentration` |
| `ready` | `concentration-observed` | `lattice-landing-concentration` |

Result origins:

- C4 task→C5: task-selection entry + C5 Ravellan decision;
- C5 task→C6: task-selection entry + C5 Ravellan decision.

The C6 terminal Ravellan decision is never an input.

# 7. Auxiliary-tasking producer

Authorised facts:

- post-decision preparation at the latest normal result cut;
- latest normal Ravellan action at that cut.

No posture or policy row.

| Preparation/action | Source fact | #100 definition ID |
| --- | --- | --- |
| `none` + `probe_shipping` | `coercive-tasking` | `lattice-auxiliary-coercive` |
| `none` + `seed_deception` | `coercive-tasking` | `lattice-auxiliary-coercive` |
| every other legal combination | `mixed` | `lattice-auxiliary-mixed` |

There is no integrated-preparation branch.

Result origins:

- C4 task→C5: task-selection entry + C5 Ravellan decision;
- C5 task→C6: task-selection entry + C5 Ravellan decision.

# 8. Political/operational-sequence producer

Authorised facts:

- the latest two **normal** Ravellan actions at the result cut.

No posture, preparation or terminal action.

| Latest two normal actions | #100 definition ID |
| --- | --- |
| two `prepare_beacon_seizure` | `lattice-sync-preparation-sequence` |
| exactly one `prepare_beacon_seizure` | `lattice-sync-preparation-signal` |
| no prepare + at least one `probe_shipping` or `seed_deception` | `lattice-sync-coercive-sequence` |
| otherwise | `lattice-sync-partial` |

Result origins include both C4 and C5 Ravellan decision refs:

- C4 task→C5: task-selection entry + C4 and C5 Ravellan decisions;
- C5 task→C6: task-selection entry + C4 and C5 Ravellan decisions.

The same source window at C5/C6 is why repeating sequence is invalid.

# 9. Partner-liaison producer

Trigger:

- C4 `request-partner-liaison` command-set entry.

Authorised facts:

- C5 post-decision preparation;
- C5 latest normal Ravellan action.

| Preparation/action | #100 definition ID |
| --- | --- |
| `none` + `probe_shipping` or `seed_deception` | `liaison-auxiliary-coercive-links` |
| every other legal combination | `liaison-auxiliary-unclear` |

Origin:

- C4 command-set + C5 Ravellan decision.

No military-links/integrated branch exists.

# 10. Eligibility

At C4/C5 a Lattice target is eligible iff:

- Lattice is operational;
- target is one of the exact three IDs;
- target has not been selected earlier in the run;
- no other Lattice target is already selected for this cycle;
- current cycle is C4 or C5.

Do not remove landing because ordinary focused staging previously answered the broad physical question. Lattice landing is a diagnostic upgrade.

No additional “question is relevant enough” heuristic is permitted in Kestrel. Such a heuristic would create an unstated recommendation/eligibility engine and could remove an option based on hidden or subjective state.

# 11. Result occurrence rules

#102 supplies only:

- target/task identity;
- replay-valid origin refs;
- result cycle;
- exact catalogued definition ID selected by the table above.

#100 occurrence instantiation copies all semantic fields from [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

#102 may not override implication, diagnosticity, warning role, public-case role, source/corroboration group, lifetime, supersession or copy.

# 12. Collection model validation

Reject unless:

- exact three target IDs;
- each default priority order contains all three exactly once;
- exact C4/C5 schedule;
- same-target repeat impossible;
- no no-task branch;
- exact authorised fact sets;
- exact raw-fact→definition mappings;
- every output definition exists in `kestrel-hq-belief-v1` and has the expected producer/question ID;
- no removed integrated output;
- all origin entry cycles/kinds match the actual #102 ledger design;
- sequence origin includes both C4 and C5 normal Ravellan decisions;
- R6 action/row excluded;
- canonical arrays/maps have deterministic order.

# 13. Generated proof

The #100 state-space audit consumes this model conceptually and proves:

- six ordered two-target schedules;
- zero same-target retask value;
- all three unused targets remain eligible after focused staging;
- 138/138 focused-positive histories are upgraded by landing;
- no integrated auxiliary output is reachable.

After #102 implementation, regenerate those facts through the actual replay-valid task transition rather than copying them.

# 14. Rejection conditions

Reject #102/#103 if they:

- put target defaults or Lattice producer mapping inside #100 reducer code;
- redefine #100 evidence meanings;
- invent a task ledger kind before #102 chooses the actual replay integration;
- omit one authoritative observation ref from sequence origins;
- permit same-target repeat or no-task;
- remove landing because focused collection occurred;
- introduce a subjective/hidden eligibility heuristic;
- let R6 terminal action influence a result;
- preserve the same Kestrel content identity after producer semantics change.
