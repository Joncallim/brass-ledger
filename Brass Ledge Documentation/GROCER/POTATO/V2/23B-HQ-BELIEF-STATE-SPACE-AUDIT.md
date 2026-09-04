---
type: v2-hq-belief-state-space-audit
status: active
---

# HQ Belief State-Space Audit

Backlink: [[README]]

This is the exhaustive architecture-coverage authority for **#100**. [[23-HQ-BELIEF-AND-EVIDENCE]] owns product/tradecraft semantics; [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns implementation seams. This document prevents another prose-only review from claiming completeness without enumerating the actual state space.

# 1. Coverage layers

Do not treat one kind of coverage as a substitute for another.

## A. Reducer-complete coverage

Enumerate every presence/absence combination of:

- preparation diagnostic (`Pdiag`);
- coercion diagnostic (`Cdiag`);
- preparation indicator (`Pind`);
- coercion indicator (`Cind`).

This is the complete 16-row categorical reducer truth table, independent of Kestrel producer reachability.

## B. Producer-envelope coverage

Enumerate the exact committed #99 adversary policy across:

- all three opening Ravellan postures;
- all authored C1–C5 coalition-to-Ravellan signal-emission choices in [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]];
- C2 reroute selected/not selected;
- C3 focused collection selected/not selected;
- Lattice unavailable/no liaison, Lattice unavailable/liaison, or Lattice operational with zero/one target in C4 and zero/one unused target in C5;
- the exact result-time facts frozen in [[23-HQ-BELIEF-AND-EVIDENCE]] and [[26-LATTICE-COLLECTION-MATRIX]].

This is an architecture envelope. It deliberately over-approximates later complete-package legality so absence from this envelope is a strong impossibility result. #107 later re-runs reachability through the complete authoritative game and may narrow, but never silently expand, this envelope.

## C. Temporal/history coverage

Enumerate complete C1→C6 product trajectories, not merely states in isolation. Historical derivation must use only the pre-command prefix legitimately available at the queried cycle.

## D. Player-information equivalence coverage

Group hidden histories by the same legitimate evidence/public information. Vary hidden posture, policy row, seed and unrelated private state within each group. Normal HQ products and player-safe briefs must remain deep-equal.

# 2. Canonical post-audit model

The audit assumes the following corrections are canonical:

1. #100 remains pure derived state.
2. The first implemented reducer semantics ID is `kestrel-binary-hypothesis-v1`; draft iterations before implementation do not consume runtime version numbers.
3. Lattice target IDs are one-shot per Kestrel run. At most two of three targets can be answered in C4/C5.
4. A Lattice landing target is ineligible after a current positive `focused-staging-buildup`, because #99 preparation is monotonic and another look cannot change the answer before terminal response. It remains eligible after `focused-staging-empty` because preparation can emerge later.
5. Same-question newer evidence replaces older evidence; it never adds another vote.
6. Supersession is persistent. Once an occurrence has been superseded by a later observed occurrence, it never resurrects merely because the superseding occurrence later becomes stale or is itself superseded.
7. Public-case credibility requires diagnostic evidence plus independent corroboration from a second `sourceGroup`, and no current opposite directional evidence.
8. #100 predeclares exactly the 19 reachable Kestrel evidence definitions listed below. Dead “integrated auxiliary” branches are removed.

# 3. Exact 19-definition vocabulary

The canonical model contains exactly:

## Ordinary

1. `opening-pressure-ambiguous`
2. `shipping-probe-ambiguous`
3. `staging-logistics-anomaly`
4. `combat-elements-dispersed`
5. `cycle4-pressure-pattern-ambiguous`

## C2 reroute

6. `reroute-auxiliary-coercive`
7. `reroute-auxiliary-unclear`

## C3 focused staging

8. `focused-staging-buildup`
9. `focused-staging-empty`

## Lattice landing

10. `lattice-landing-concentration`
11. `lattice-landing-dispersed`

## Lattice auxiliary

12. `lattice-auxiliary-coercive`
13. `lattice-auxiliary-mixed`

## Lattice sequence/synchronisation

14. `lattice-sync-preparation-sequence`
15. `lattice-sync-preparation-signal`
16. `lattice-sync-coercive-sequence`
17. `lattice-sync-partial`

## Partner liaison

18. `liaison-auxiliary-coercive-links`
19. `liaison-auxiliary-unclear`

The removed definitions are:

- `reroute-auxiliary-integrated`;
- `lattice-auxiliary-integrated`;
- `liaison-auxiliary-military-links`.

They were unreachable under the actual #99 policy/result timing: at each authorised auxiliary result point, a developing/ready preparation state never coexists with the exact active `probe_shipping` condition previously required by those branches. Keeping them would create dead content and false test coverage.

# 4. Exact intent-reducer truth table

`Pdiag/Cdiag/Pind/Cind` are booleans indicating whether at least one current, non-superseded occurrence of that class exists. Multiplicity never changes the result.

| Pdiag | Cdiag | Pind | Cind | Intent assessment |
|---:|---:|---:|---:|---|
| 0 | 0 | 0 | 0 | `unclear + weak` |
| 0 | 0 | 0 | 1 | `coercion + weak` |
| 0 | 0 | 1 | 0 | `preparation + weak` |
| 0 | 0 | 1 | 1 | `unclear + conflicted` |
| 0 | 1 | 0 | 0 | `coercion + coherent` |
| 0 | 1 | 0 | 1 | `coercion + coherent` |
| 0 | 1 | 1 | 0 | `coercion + weak` |
| 0 | 1 | 1 | 1 | `coercion + weak` |
| 1 | 0 | 0 | 0 | `preparation + coherent` |
| 1 | 0 | 0 | 1 | `preparation + weak` |
| 1 | 0 | 1 | 0 | `preparation + coherent` |
| 1 | 0 | 1 | 1 | `preparation + weak` |
| 1 | 1 | 0 | 0 | `unclear + conflicted` |
| 1 | 1 | 0 | 1 | `unclear + conflicted` |
| 1 | 1 | 1 | 0 | `unclear + conflicted` |
| 1 | 1 | 1 | 1 | `unclear + conflicted` |

Required negative tests:

- a majority-vote reducer fails;
- a reducer where any contrary indicator automatically vetoes a diagnostic direction fails;
- a reducer where a diagnostic direction remains `coherent` despite an opposite indicator fails;
- duplicate same-class occurrences do not alter direction.

# 5. Warning state space

Warning is separate from the intent assessment.

In canonical Kestrel, the exact reachable assessment/warning pairs are:

1. `unclear + weak / none`
2. `unclear + conflicted / none`
3. `unclear + conflicted / usable`
4. `preparation + weak / none`
5. `preparation + weak / usable`
6. `preparation + coherent / none`
7. `preparation + coherent / usable`
8. `coercion + weak / none`
9. `coercion + coherent / none`

Every other assessment/warning pair is rejected as unreachable under this model.

Particularly:

- warning never makes the assessment direction by itself;
- warning cannot coexist with `coercion` or `unclear + weak` in canonical Kestrel;
- warning can coexist with `unclear + conflicted`;
- preparation assessment can exist without warning.

Warning-bearing evidence is current through C6 and #99 preparation is monotonic. Therefore canonical Kestrel permits `warning acquired` but no `warning lost` trajectory. A generated legal history that loses warning is a contract failure, not a missing copy case.

# 6. Public-case state space

Public-case basis is stricter than the internal estimate and always retains claim direction where one exists.

Possible states:

- `none / null`;
- `tentative / preparation`;
- `tentative / coercion`;
- `tentative / null` when eligible public evidence points both ways;
- `credible-source-sensitive / preparation`;
- `credible-source-sensitive / coercion`.

Credible requires all of:

1. at least one current source-sensitive diagnostic occurrence supporting direction D;
2. at least one additional current source-sensitive occurrence supporting D from a **different `sourceGroup`**;
3. no current opposite directional evidence of any class.

This independent-corroboration rule fixes a prior contradiction: under the old one-diagnostic rule, every reachable coherent assessment was automatically a credible public case, so the stated product experience “strong internal judgement without a clean public case” was impossible.

A credible result returns the exact ordered supporting occurrence IDs and source groups. Later source use can therefore preserve what evidence was actually exposed rather than only a generic direction label.

# 7. Producer-envelope enumeration results

The reference enumeration used the exact #99 policy and every authored 37A emission choice, then projected all evidence-producing choices under the corrections above.

Results:

- raw signal/action histories explored: **62,208**;
- unique #100-relevant hidden-history projections: **257**;
- admissible evidence schedules after one-shot/conclusive-target rules: **6,368**;
- unique complete evidence histories: **218**;
- unique C1→C6 product trajectories: **45**;
- canonical evidence definitions reached somewhere in the envelope: **19/19**;
- maximum evidence occurrences in one six-cycle history: **9**;
- maximum simultaneously current, non-superseded occurrences: **4**.

These counts are regression expectations for the architecture model. If implementation changes them, the difference must be explained by a deliberate contract change or a bug. #107 will separately report the subset reachable through fully legal complete command packages.

# 8. Composite product-state counts by cycle

A composite product state is:

`intent assessment × tactical warning × public-case basis/direction`.

Producer-envelope counts:

| Cycle | Composite states |
|---:|---:|
| 1 | 1 |
| 2 | 1 |
| 3 | 1 |
| 4 | 4 |
| 5 | 13 |
| 6 | 11 |

There are **15 distinct composite product states** across the complete six-cycle envelope.

Fixed early states:

- C1: `unclear+weak / warning none / case none`;
- C2: same;
- C3: `unclear+conflicted / warning none / case none`.

The implementation test suite must materialise every one of the 15 composite states and every one of the 45 trajectories, or explain why full-game legality narrows a producer-envelope vector. It must never introduce a state outside the envelope without a documented product amendment.

# 9. Product-only transitions

An assessment-state-only change log is insufficient.

The enumeration found **nine distinct adjacent transition classes** where intent assessment remains unchanged but warning and/or public-case state changes. Examples include:

- `unclear+conflicted` stays unchanged while focused staging creates usable warning;
- `preparation+coherent` stays unchanged while a later landing result adds usable warning;
- `preparation+coherent` stays unchanged while independent corroboration upgrades a tentative case to credible;
- `coercion+weak` stays unchanged while a source-sensitive indicator creates a tentative coercion case;
- the assessment stays unchanged while contrary source-sensitive evidence changes a directional tentative case to conflicted tentative/null.

Therefore the snapshot must carry a complete product delta, not only `assessmentChange`:

```ts
type V2HqBeliefDelta = {
  assessmentChange: V2HqAssessmentChange
  warningChange: "initial" | "unchanged" | "acquired"
  publicCaseChanged: boolean
  evidenceChangeCause: "none" | "new-evidence" | "staleness" | "supersession" | "mixed"
  addedInstanceIds: string[]
  becameStaleInstanceIds: string[]
  supersededInstanceIds: string[]
}
```

`warning lost` is intentionally absent for Kestrel because it is unreachable. #101 owns player-facing attribution-availability changes derived from the current public-case object.

The required brief/reveal may suppress a non-material line, but tests must never suppress a newly acquired warning or a player-action-space-changing public case merely because the intent assessment string stayed the same.

# 10. Supersession is monotonic

At query cycle Q, occurrence A is superseded when any later-observed occurrence B in the historical evidence set satisfies either:

- B uses `replace-older-same-question` and has the same question ID; or
- B's definition explicitly lists A's definition ID.

Once true, A stays superseded at every later query cycle. B does not need to remain current, and B being superseded by C does not resurrect A.

Required hostile chain:

```text
routine report A
→ focused report B supersedes A
→ Lattice report C supersedes B
```

At the final query, A and B remain historical but neither re-enters the current reducer.

# 11. Lattice target state space

Each target can be selected at most once per run.

This is not an arbitrary simplification. Under the six-cycle timing and #99 policy, retasking the same target in C4 and C5 returned the **same definition for every one of the 257 unique hidden-history projections**:

- landing: concentration→concentration or dispersed→dispersed;
- auxiliary: coercive→coercive or mixed→mixed;
- sequence/sync: every one of its four branches repeated itself.

No retask produced a new warning, assessment, public case, recommendation input or route input. Retasking was therefore a mechanically fake choice and is removed.

Target eligibility:

- operational Lattice;
- C4 or C5;
- target unused in this run;
- landing target additionally absent when a current `focused-staging-buildup` already answers the same monotonic physical question conclusively for the remaining horizon.

A negative focused staging result does not remove landing eligibility because preparation may emerge in C5.

# 12. Auxiliary branch closure

The former “auxiliary integrated with preparation” result was dead under the exact source timing.

Canonical auxiliary results are now only:

- **coercive** — preparation none + authorised current pressure/deception action;
- **unclear/mixed** — every other authorised input.

This applies at the corresponding strength to reroute, Lattice auxiliary and liaison:

- reroute coercive is an indicator; otherwise unclear;
- Lattice auxiliary coercive is diagnostic; otherwise mixed;
- liaison coercive is an indicator; otherwise unclear.

Preparation-oriented information comes from landing-force staging or the multi-cycle operational-sequence target, not from an unreachable auxiliary branch.

# 13. Canonical evidence ordering and identity

Semantically unordered model collections are canonicalised before digesting. Evidence definitions, superseded ID lists and ordinary schedule lists use stable lexical ID order; array insertion order never changes content identity or output.

Runtime evidence occurrence ID is the SHA-256 of a tagged canonical tuple equivalent to:

```ts
{
  tag: "v2-hq-evidence-occurrence",
  definitionId,
  observedCycle,
  sourceRef
}
```

Do not use delimiter-concatenated identity vulnerable to ambiguous source strings.

Duplicate occurrence tuples are an error. All IDs/source refs are bounded generated identifiers, never free-form player text.

# 14. Product provenance

The derived snapshot must retain enough internal provenance to explain every product deterministically:

- intent representative supporting/contrary occurrence IDs;
- warning state plus its warning-bearing occurrence ID when usable;
- public-case state/direction plus ordered supporting occurrence IDs and source groups;
- evidence delta from the previous pre-command snapshot.

This is derived internal data. Normal player DTO receives only bounded safe refs/copy.

## Brief-selection order

### Directional assessment

1. primary diagnostic supporting occurrence if present;
2. current warning-bearing supporting occurrence if distinct;
3. newest remaining supporting occurrence from another source group/question;
4. newest material opposite-direction occurrence as the required contrary fact when one exists.

Maximum two basis facts plus one contrary fact.

### Conflicted assessment

Show exactly one representative preparation occurrence and one representative coercion occurrence. Within a direction rank diagnostic before indicator, warning-bearing before non-warning, newer observed cycle before older, then definition ID and instance ID.

### Unclear weak

Show the newest relevant ambiguous occurrence or the authored coverage-gap explanation.

Model array order, source insertion order, seed and locale never break display ties.

# 15. Historical cutoff

`deriveV2HqBeliefAtCycle(Q)` reconstructs the exact **pre-command** prefix for Q:

- include Ravellan decisions through Q;
- include command sets only through Q-1;
- exclude command set Q and all future entries;
- include only collection results due at or before Q;
- never read terminal/full-session current state in place of a historical entry.

Mutating same-cycle command Q or any later ledger entry in a test fixture must not change the Q snapshot.

# 16. Verified replay-prefix context

The committed #99 replay agenda provider currently receives only state, but #98 agenda/recommendation will require #100 history. Before #98 closes, replay must supply a canonical **verified ledger prefix** rather than forcing agenda code to inspect the untrusted full save.

Required context responsibility:

```ts
type V2VerifiedProjectionContext = {
  identity: V2Identity
  initialState: V2BootstrapState
  state: V2BootstrapState
  revision: number
  verifiedLedgerPrefix: readonly V2ActionLedgerEntry[]
}
```

During replay of command cycle Q, the prefix contains only entries already re-executed successfully: opening intent and the current Q Ravellan decision, but not the current command entry or any future entry.

#100 core history derivation must work from this prefix. Full-session wrappers are convenience functions that slice to the same prefix semantics.

The trusted agenda-provider API is evolved under #98 to receive this context. No persisted ledger/schema/version change is required for the API evolution, and #99 transition semantics remain unchanged.

# 17. Model binding

A self-consistent but wrong belief model must not be usable with a session accidentally.

Content resolves an immutable bundle equivalent to:

```ts
type V2ResolvedHqBeliefModel = {
  definition: V2HqBeliefModelDefinition
  digest: Sha256Digest
}
```

Sim recomputes the digest using the same canonical V2 serialization and rejects mismatch.

Cross-package test proves the content-exported digest equals sim's digest for the definition.

Before #103, #100 tests this bundle integrity directly. Once Kestrel content identity exists, the trusted content resolver must bind the exact model digest into `session.identity.contentDigest`; server/headless/replay may not select the model independently by scenario string alone.

# 18. C6 temporal cut

A C5 Task Collection result can matter at C6 only under this exact sequence:

1. #99 selects the hidden C6 terminal behaviour;
2. any C5 task result resolves against its authorised **pre-manifestation/result-time facts**;
3. #100 derives the final pre-manifestation HQ snapshot;
4. current public-case availability is derived from that snapshot and unspent/used source state;
5. the terminal behaviour manifests as the safe overt crisis family;
6. the commander selects a terminal response.

The terminal decision entry is policy selection, not proof that the overt attack has already occurred before collection reports.

At the C6 command surface, the overt crisis family is current fact. The `ravellan-intent` snapshot is labelled as the **last pre-manifestation intelligence picture**, not displayed as if HQ is still deciding whether an already visible seizure exists.

# 19. Resource and validation bounds

Kestrel validation requires:

- exactly 19 evidence definitions and the exact canonical ID set;
- cycles only 1–6;
- at most 9 evidence occurrences in one derived history;
- at most 4 current non-superseded occurrences;
- one occurrence per authorised producer/task result;
- unique instance IDs;
- every definition reachable in the producer envelope;
- every directional definition has sourceGroup/sourceContext/limitation refs;
- diagnostic evidence is directional, never ambiguous;
- warningRole usable only on preparation evidence;
- publicCaseRole source-sensitive only on directional evidence;
- fixed lifetime has valid authored cycle; directed dynamic evidence is never in the ordinary schedule;
- source-fact maps are total over their authorised input domains;
- no orphan/dead definition;
- supersession graph acyclic and references valid definitions.

# 20. Required generated test artifacts

#100 implementation must produce deterministic machine-readable test output containing:

- the 16 reducer rows;
- exact 19 definition IDs and producer reachability;
- the nine assessment/warning pairs;
- the six public-case state/direction forms;
- the 15 composite states;
- per-cycle counts `1,1,1,4,13,11`;
- 45 unique product trajectories;
- maximum history/current counts `9/4`;
- zero same-target retask with distinct output;
- zero dead definitions;
- zero warning-loss legal trajectory;
- all nine assessment-change categories reachable;
- every product-only transition class detected even when assessment is unchanged;
- persistent supersession/no-resurrection chain;
- historical prefix/future-noninterference proof;
- hidden-history equivalence/noninterference proof.

The generated artifact may live in tests rather than production output. It must be deterministic and reviewed whenever canonical evidence semantics change.

# 21. Limits of this audit

This audit exhausts the #100 reducer and the currently authored #99/37A/evidence-producer architecture envelope.

It does not claim:

- every envelope history is a legal complete Kestrel command package;
- any information state is fun or understandable;
- target choices are balanced in human play;
- the full game is complete.

#107 must enumerate the actual implemented legal campaign graph and reconcile it against these envelope counts. Human smoke remains responsible for comprehension and engagement.

# 22. Closure rule

#100 is not architecture-complete unless implementation tests reproduce the canonical state-space vectors above or document a deliberate approved amendment.

A review that samples a handful of examples, tests only the six output labels, or checks only final states is insufficient.
