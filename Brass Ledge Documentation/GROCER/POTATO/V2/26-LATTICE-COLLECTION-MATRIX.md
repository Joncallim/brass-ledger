---
type: v2-lattice-contract
status: active
---

# Lattice Collection Matrix

Backlink: [[README]]

This is the implementation authority for **#102 — Lattice Cell and Kestrel directed collection**. It is one concrete capability, not a generic technology tree.

[[23-HQ-BELIEF-AND-EVIDENCE]] owns evidence definitions and reducers. [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the static-definition/runtime-occurrence boundary. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns package/attribution interactions.

# Product purpose

Lattice should feel valuable because sustained investment gives the commander a **new verb**:

> protect this institution now, then later ask one specific question without spending normal personal attention.

It does not add `+intel`, probability, rerolls or hidden score.

The three targets answer mechanically different questions. They are not three labels for “reveal Ravellan's posture”.

# Investment schedule

Exactly three scheduled advances:

- C1: 0 → 1;
- C2: 1 → 2;
- C3: 2 → `3-operational`.

All must occur on schedule. Missing one makes Kestrel maturity unreachable. No catch-up, partial bonus, accelerated investment or refund.

Operational from C4.

# Task Collection

Operational Lattice unlocks:

`task-collection`

Rules:

- available C4 and C5 only;
- one named eligible target per cycle;
- zero normal intervention cost;
- task/result authority persisted/replayed under #102;
- no immediate HQ assessment change;
- result arrives at next canonical HQ-belief point: C4→C5, C5→C6;
- result becomes a canonical #100 evidence occurrence;
- no C6 task;
- result never directly mutates hidden Ravellan state or sets assessment/recommendation.

# Observation boundary

Use:

```text
verified hidden history
→ target-authorised observation extractor
→ bounded source fact
→ predeclared #100 evidence definition
→ runtime occurrence
→ #100 reducers
```

Hidden posture is never an input.

Holding authorised facts fixed while changing posture alone must produce identical result.

# Named questions / targets

Exactly:

- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

Each target ID is also the stable `questionId` for its directed evidence.

No free-text target.

# Eligibility / retasking

A target is eligible when:

- Lattice is operational;
- current cycle is C4 or C5;
- no unresolved same-cycle Lattice task already exists;
- the named question remains materially unresolved;
- the most recent result for that question is not authored as conclusive for the remainder of Kestrel.

**Retasking the same target is legal when those conditions still hold.**

Retasking consumes that cycle's Task Collection opportunity, so it competes directly with broadening collection to another question.

The newer same-question occurrence uses `replace-older-same-question` semantics and supersedes the older active answer. It does **not** stack as another vote.

A coherent overall `ravellan-intent` assessment does not automatically resolve every named question. Another question may still provide physical warning, expose contradiction, strengthen a public case or alter later route/advice space.

# Result timing / current relevance

Tasked in Cn:

1. persist target/task authority;
2. Ravellan/world advances normally;
3. at Cn+1 belief point inspect only target-authorised verified facts;
4. derive bounded source fact;
5. instantiate the exact canonical evidence definition at the actual result cycle;
6. reduce through #100.

Directional Lattice results use current relevance through terminal C6 unless superseded by a newer same-question observation.

Stale/superseded prior occurrences remain historical for debrief; they simply stop driving the current estimate.

# Target 1 — `landing-force-staging`

Question:

> Are units required for a Beacon seizure actually concentrating?

Primary value: **physical indications-and-warning**.

Authorised input:

- seizure-preparation state at result time only.

No posture or recent action ID.

Source context: dedicated Lattice physical/staging collection.

## Preparation `developing|ready`

Definition:

`lattice-landing-concentration`

- questionId `landing-force-staging`;
- implication preparation;
- diagnosticity diagnostic;
- warning usable;
- public-case source-sensitive;
- supersession policy replace-older-same-question;
- current relevance through terminal.

Meaning: landing elements associated with previous seizure exercises are concentrating near embarkation areas.

This can create coherent preparation if uncontradicted and usable warning even if wider assessment remains conflicted.

Because #99 preparation never regresses from developing/ready back to none during the normal Kestrel policy, content may mark a sufficiently direct positive concentration result as conclusive for retasking eligibility if #107 confirms a repeat look cannot change any later decision. Do not assume this mechanically without the authored eligibility rule/test.

## Preparation `none`

Definition:

`lattice-landing-dispersed`

- questionId landing-force-staging;
- implication coercion;
- diagnosticity indicator;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current relevance through terminal.

Meaning: the force package required for rapid Beacon seizure remains dispersed.

This negative result is **not automatically conclusive**: Ravellan can still begin preparation later, so a C5 retask after a C4 negative result may legitimately update the question at C6.

A Lattice landing occurrence also explicitly supersedes older focused-staging evidence for the same physical question where the canonical #100 definitions say so.

# Target 2 — `auxiliary-tasking`

Question:

> Are vessels pressuring shipping integrated into wider military preparation or primarily part of coercive pressure?

Primary value: strongest Kestrel question for **understanding the pressure mechanism / diagnosing coercion**.

Authorised inputs:

- result-time seizure preparation;
- most recent verified normal Ravellan action within the collection interval.

No posture.

Source context: dedicated Lattice tasking/command-channel collection.

## Preparation + active probe

Condition:

- preparation developing/ready;
- latest action `probe_shipping`.

Definition `lattice-auxiliary-integrated`:

- questionId auxiliary-tasking;
- preparation indicator;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current through terminal.

Auxiliary integration alone does not prove force readiness/timing.

## No preparation + probe/deception

Condition:

- preparation none;
- latest action `probe_shipping|seed_deception`.

Definition `lattice-auxiliary-coercive`:

- questionId auxiliary-tasking;
- coercion **diagnostic**;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current through terminal.

This can diagnose coercion because this target is authorised to inspect both tasking and physical preparation state.

## Otherwise

Definition `lattice-auxiliary-mixed`:

- questionId auxiliary-tasking;
- ambiguous indicator;
- warning none;
- public-case none;
- replace-older-same-question;
- current through terminal.

A newer auxiliary occurrence replaces older reroute, liaison or Lattice auxiliary evidence for this same question. It does not delete landing/sync evidence.

# Target 3 — `political-operational-sync`

Question:

> Are Ravellan's recent operational milestones forming one sequence with the pressure campaign?

Primary value: **pattern/sequence and preparation-oriented public analytic case**, not tactical warning.

Authorised input:

- two most recent verified normal Ravellan actions at result time.

No posture/preparation input.

Source context: dedicated Lattice cross-sequence analysis/collection.

## Two recent prepare actions

Definition `lattice-sync-preparation-sequence`:

- questionId political-operational-sync;
- preparation diagnostic;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current through terminal.

## Exactly one recent prepare action

Definition `lattice-sync-preparation-signal`:

- questionId political-operational-sync;
- preparation indicator;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current through terminal.

## No recent prepare + probe/deception

Definition `lattice-sync-coercive-sequence`:

- questionId political-operational-sync;
- coercion **indicator only**;
- warning none;
- public-case source-sensitive;
- replace-older-same-question;
- current through terminal.

Do not mark diagnostic: recent pressure/deception does not prove preparation established earlier is absent, because this target does not observe preparation state.

## Otherwise

Definition `lattice-sync-partial`:

- questionId political-operational-sync;
- ambiguous indicator;
- warning none;
- public-case none;
- replace-older-same-question;
- current through terminal.

A C5 retask of sync after a non-conclusive C4/C5 result updates the rolling two-action window and replaces the prior sync occurrence; it never becomes a second vote.

# Target-choice differentiation

Intended triangle:

- **landing** — best physical warning;
- **auxiliary** — best diagnostic coercion path;
- **sync** — best sustained preparation-sequence/public-case path.

Representative contrasts:

- physical preparation + one recent prepare:
  - landing → diagnostic preparation + usable warning;
  - sync → preparation indicator;
- no preparation + coercive latest action:
  - auxiliary → diagnostic coercion;
  - landing → coercion indicator;
  - sync → at most coercion indicator;
- two recent prepare actions:
  - sync → diagnostic preparation/no warning;
  - landing → warning if physical preparation present;
- mixed states can make one target ambiguous while another directional.

#107 must branch target choice **and any legal retask** from identical pre-task state and reject:

- prose/evidence-count-only differentiation;
- a globally dominated target;
- an always-retask or always-broaden policy that is universally superior where both are supposed to be meaningful;
- a result whose claimed warning/public-case role never changes downstream choice/route space.

# Contradiction / supersession

Different question IDs remain independent. Better collection may legitimately reveal a mixed/changing world.

- different-question evidence does not automatically delete contradiction;
- newer same-question occurrence replaces the older active answer;
- explicit asymmetric cross-definition supersession remains where frozen in #100;
- active opposing directions across different questions → unclear/conflicted;
- usable physical warning may coexist with conflicted intent.

# Emergency partner-liaison fallback

If Lattice is unavailable in C4, expose exactly:

`request-partner-liaison`.

It is commander-only under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]:

- one normal intervention;
- liaison obligation active;
- one C5 result;
- no reusable capability;
- answers only `auxiliary-tasking`;
- never diagnostic;
- never usable warning.

Source context: partner liaison/reporting.

Maps the same authorised auxiliary facts to:

- `liaison-auxiliary-military-links` — preparation indicator, source-sensitive;
- `liaison-auxiliary-coercive-links` — coercion indicator, source-sensitive;
- `liaison-auxiliary-unclear` — ambiguous, public case none.

All use questionId auxiliary-tasking and replace-older-same-question.

A liaison result therefore replaces an older C2 reroute clue for the same question.

# Public-case / attribution interaction

Lattice never directly creates #101 attribution state.

Evidence enters #100:

- eligible indicators may produce tentative public-case basis with direction where unambiguous;
- eligible uncontradicted diagnostics may produce `credible-source-sensitive` with required direction.

#101 then owns the persisted directional opportunity and one-shot source use.

A later result may change an **unspent** case state/direction before use, but can never rewrite `used.direction` or regenerate a spent opportunity.

# Replay / architecture

#102 must persist/replay or deterministically reconstruct, under [[30-ARCHITECTURE-CONTRACT]]:

- scheduled advances/missed reachability;
- operational state;
- task target/cycle/queue;
- enough task history to prove retasking eligibility and source interval;
- authorised verified facts/stable refs sufficient to recompute result;
- result occurrence/definition ID where persistence is actually needed;
- liaison action/obligation/result.

The #100 belief remains derived; all result evidence definitions are already in `kestrel-hq-belief-v1`.

A bounded #102 collection-producer definition/digest should cover target IDs, authorised fact windows, result mappings, retask/conclusive eligibility and liaison mapping so #103 can include those semantics in final Kestrel content identity.

# Required #102 tests

At minimum:

- exact scheduled maturity/missed-advance failure;
- Task Collection changes action/info space and costs zero normal interventions;
- one target per cycle;
- C4→C5 and C5→C6 result timing;
- retask legal only for unresolved/non-conclusive question;
- newer same-question occurrence replaces older occurrence including same definition ID;
- repeated collection never stacks votes;
- all target branches deterministic;
- posture-only variation with authorised facts fixed → same result;
- player projection contains no hidden posture/preparation/action IDs;
- result uses predeclared #100 evidence definition rather than setting analysis directly;
- landing concentration can create usable warning;
- landing negative can later be updated if preparation emerges;
- sync diagnostic preparation can create coherent preparation without warning;
- auxiliary diagnostic coercion can create coherent coercion without warning;
- sync negative remains indicator only;
- public-case direction follows exact evidence semantics;
- different-question contradictions retained;
- reroute/liaison/Lattice same-question replacement exact;
- at least two target/retask choices from identical pre-state create different downstream mechanics;
- no target/retask policy globally dominates every co-eligible state;
- liaison costs one intervention, creates obligation, cannot Delegate/diagnose/warn;
- at least one viable non-Lattice non-defeat history;
- later evidence cannot recreate or rewrite a used attribution claim;
- V1 unchanged.

# Rejection conditions

Reject #102 if it becomes a tech tree/intel-point system, reads hidden posture, turns retasking into additive evidence farming, forbids a strategically useful recheck solely for UI simplicity, lets sync infer diagnostic coercion from recent actions alone, reveals hidden truth directly, makes targets equivalent, treats preparation assessment as warning, hides fake choice with randomness, makes liaison free/delegated, redefines #100 evidence semantics, persists duplicate belief or generalises arbitrary collection targets before another scenario proves reuse.
