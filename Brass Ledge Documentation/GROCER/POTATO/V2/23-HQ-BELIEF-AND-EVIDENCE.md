---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/tradecraft authority for **#100 — HQ belief / intelligence projection**.

- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact files, APIs, history cut-offs, replay context and content identity.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns exhaustive reducer/producer/trajectory coverage.
- [[26-LATTICE-COLLECTION-MATRIX]] owns later Lattice and liaison producers using the same evidence vocabulary.
- [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns safe world manifestations.

# Product purpose

Intelligence should create decision-relevant uncertainty, not a probability-management minigame.

The Intelligence Chief must answer, compactly:

1. **What do you think is happening?**
2. **What facts drive that judgement?**
3. **What does not fit or remain unknown?**
4. **What observable sign would change the picture?**
5. **Do we have direct tactical warning, or only an assessment?**
6. **If a public case exists, what specific claim can we actually substantiate?**

Normal play shows no numeric probability, High/Medium/Low confidence, evidence score, hidden Ravellan posture/preparation, raw action/policy-row ID or oracle truth.

# Tradecraft subset

Kestrel uses only a small playable subset of real intelligence practice:

- competing hypotheses;
- observable indicators/signposts;
- stronger diagnostic evidence;
- contrary reporting retained rather than averaged away;
- source/method context and limitation;
- named collection tied to a command question;
- information separated from analytic judgement;
- current relevance separated from historical existence;
- explicit explanation when a judgement changes;
- indications-and-warning separated from broader estimate;
- internal estimate separated from a public evidentiary case.

Do not implement full ACH, Bayesian inference, source-reliability scoring, confidence taxonomy, analyst skill stats or a generic multi-claim intelligence framework.

# Command question

Stable claim ID:

`ravellan-intent`

Human question:

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

Analytic directions:

- `preparation` — current activity materially supports a real near-term seizure option;
- `coercion` — current pressure is primarily the coercive/political operation rather than cover for an imminent prepared seizure.

Hidden `testing` is not a third player hypothesis. A testing opponent may legitimately produce preparation, coercion, ambiguous or conflicting evidence.

# Three independent intelligence products

Never collapse these.

## 1. Intent assessment

Direction:

- `preparation`
- `coercion`
- `unclear`

Internal picture:

- `weak`
- `conflicted`
- `coherent`

Exactly six legal states:

- `unclear + weak`
- `unclear + conflicted`
- `preparation + weak`
- `preparation + coherent`
- `coercion + weak`
- `coercion + coherent`

These are internal semantics, not visible confidence labels.

## 2. Tactical warning

State:

- `none`
- `usable`

`usable` means HQ has a current authorised **physical warning signpost** that materially improves the ability to act against a Beacon seizure.

A preparation assessment does not create warning.

A physical warning can remain usable while the wider estimate is conflicted.

Valid examples:

> “I think they are preparing, but we still lack direct warning.”

> “We have movement worth acting on, but I still cannot settle the wider intent picture.”

The derived warning object retains the exact warning-bearing evidence occurrence ID. Canonical Kestrel has at most one current warning-bearing occurrence because later landing evidence replaces earlier landing evidence.

## 3. Public-case basis

Internal basis is discriminated and directional:

```ts
{ state: "none"; direction: null }
| { state: "tentative"; direction: "preparation" | "coercion" | null }
| {
    state: "credible-source-sensitive"
    direction: "preparation" | "coercion"
    supportingEvidenceInstanceIds: string[]
    supportingSourceGroups: string[]
  }
```

This is not persisted campaign opportunity/state.

A credible public case requires:

1. at least one current source-sensitive **diagnostic** occurrence supporting direction D;
2. at least one additional current source-sensitive occurrence supporting D from a different `sourceGroup`;
3. no current opposite directional evidence of any class.

One diagnostic report can support a strong internal judgement while leaving only a tentative public case. This is intentional.

A directionless credible case is invalid.

Later #101 persists only irreversible source use, not a mutable mirror of this derived basis.

# Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised source fact** — exact physical/action-history fact a named observation rule may inspect.
- **Evidence definition** — canonical meaning of a kind of report.
- **Evidence occurrence** — one historical report instance in a run.
- **HQ products** — deterministic reductions of current occurrences.
- **Player brief** — bounded safe text/semantic refs.

Changing hidden truth while authorised source facts and evidence occurrences remain fixed must leave every HQ product and safe brief deep-equal.

# Evidence definition

Each static definition owns:

- `definitionId`;
- claim ID `ravellan-intent`;
- stable `questionId`;
- implication `preparation | coercion | ambiguous`;
- diagnosticity `indicator | diagnostic`;
- internal `sourceGroup` used for corroboration independence;
- player-safe `sourceContextRef`;
- player-safe `limitationRef`;
- player-safe `summaryRef`;
- `warningRole: none | usable`;
- `publicCaseRole: none | source-sensitive`;
- current-relevance lifetime rule;
- producer kind `ordinary | reroute | focused | lattice | liaison`;
- supersession policy;
- explicit superseded definition IDs.

Rules:

- diagnostic evidence is directional, never ambiguous;
- warningRole usable is legal only on preparation evidence;
- publicCaseRole source-sensitive is legal only on directional evidence;
- every directional definition has source/method context and a limitation;
- sourceGroup is a real corroboration-independence group, not display order or score.

The canonical model contains exactly the 19 definitions in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

# Runtime evidence occurrence

A derived occurrence owns:

- deterministic unique `instanceId`;
- `definitionId`;
- stable generated `sourceRef` or task reference;
- actual observed cycle;
- derived current-through cycle;
- semantic fields copied from the canonical definition.

Runtime producers cannot override definition semantics.

Occurrence identity is the SHA-256 of a tagged canonical tuple equivalent to:

```ts
{
  tag: "v2-hq-evidence-occurrence",
  definitionId,
  observedCycle,
  sourceRef
}
```

Do not use ambiguous string concatenation. Duplicate tuples/instance IDs are errors.

# Currency is relevance, not forgetting

An occurrence is current at cycle Q iff:

- `observedCycle <= Q <= currentThroughCycle`; and
- it has not been superseded by a later observed occurrence.

A stale or superseded report remains in historical evidence. It is not deleted and is still available for causal callbacks and terminal `What HQ believed` reconstruction.

If a product changes because information became stale, player-safe update copy must say so rather than presenting an unexplained analyst mood swing.

# Supersession is persistent

Directed questions use stable IDs:

- `landing-force-staging`
- `auxiliary-tasking`
- `political-operational-sync`

Supersession modes:

- `explicit-only`
- `replace-older-same-question`

At query Q, occurrence A is superseded if any later-observed B by Q:

- uses replace-older-same-question and shares A's question ID; or
- explicitly lists A's definition ID.

Once superseded, A never re-enters a later current reducer merely because B becomes stale or is itself superseded. Supersession is a historical replacement fact, not a temporary filter.

Different questions remain independent and may contradict.

# Indicator versus diagnostic

## Indicator

Suggestive but compatible with more than one reasonable explanation.

## Diagnostic

Substantially discriminates between the two Kestrel hypotheses. It still does not reveal hidden posture or guarantee future behaviour.

Diagnosticity is categorical, not a hidden numeric weight.

# Exact intent reducer

Reducer semantics ID for the first implemented model:

`kestrel-binary-hypothesis-v1`

Let current non-superseded evidence produce booleans:

- `Pdiag` — preparation diagnostic exists;
- `Cdiag` — coercion diagnostic exists;
- `Pind` — preparation indicator exists;
- `Cind` — coercion indicator exists.

Apply exactly:

1. Pdiag + Cdiag → `unclear + conflicted`.
2. Pdiag only:
   - Cind present → `preparation + weak`;
   - no Cind → `preparation + coherent`.
3. Cdiag only:
   - Pind present → `coercion + weak`;
   - no Pind → `coercion + coherent`.
4. No diagnostics:
   - Pind + Cind → `unclear + conflicted`;
   - Pind only → `preparation + weak`;
   - Cind only → `coercion + weak`;
   - neither → `unclear + weak`.

Ambiguous evidence never chooses direction.

Evidence count never determines direction. A diagnostic direction survives any number of opposite indicators, but those indicators prevent `coherent` and must be surfaced as contrary evidence.

The complete 16-row table is in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

# Warning reducer

Warning is usable iff one current, non-superseded occurrence has:

- preparation implication; and
- warningRole usable.

Return the warning state plus the deterministic warning-bearing instance ID.

Contrary intent evidence does not erase a genuine physical warning signpost. Coherent preparation without warning-role evidence remains warning none.

# Public-case reducer

Ignore evidence with publicCaseRole none.

- no eligible direction → `none/null`;
- eligible evidence on both directions → `tentative/null`;
- one eligible direction without the corroborated diagnostic rule → `tentative/D`;
- one eligible direction with at least one diagnostic, a second supporting sourceGroup and no current opposite directional evidence → `credible-source-sensitive/D`.

For tentative/credible states return deterministic supporting occurrence IDs. For credible, identify the primary diagnostic occurrence and corroborating occurrence(s) in stable order.

The public case is stricter than the internal estimate. For example, diagnostic preparation plus a contrary coercion indicator can yield `preparation + weak` internally while the public case remains tentative.

# Ordinary evidence timeline

## C1 — `opening-pressure-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- producer ordinary;
- current C1–C2;
- no warning/public case;
- routine/opening source context.

## C2 — `shipping-probe-ambiguous`

- question `ravellan-intent-general`;
- ambiguous indicator;
- producer ordinary;
- current C2–C3;
- no warning/public case;
- routine maritime context.

## C3 — mandatory competing signposts

### `staging-logistics-anomaly`

- preparation indicator;
- producer ordinary;
- routine regional-logistics context;
- current C3–C4;
- no warning/public case.

### `combat-elements-dispersed`

- coercion indicator;
- producer ordinary;
- routine force-disposition context;
- current C3–C4;
- no warning/public case.

Meaning is bounded:

> Within routine coverage, expected major combat elements still appear dispersed.

It is not global truth. Coverage may be incomplete, deceived or miss movement elsewhere.

Together the fixed pair yields `unclear + conflicted`.

## C4 — `cycle4-pressure-pattern-ambiguous`

- ambiguous indicator;
- producer ordinary;
- visible pressure-pattern context;
- current C4–C5;
- no warning/public case.

Action-specific safe world prose may differ, but analytical evidence remains this generic ambiguity.

# C2 reroute result observed C3

Only when authoritative C2 final order is `reroute-and-monitor`.

Authorised raw inputs:

- verified C2 Ravellan normal action;
- verified C2 post-decision preparation.

No posture or later/current state.

Exactly one current C3–C5 occurrence:

## `reroute-auxiliary-coercive`

Condition:

- preparation none; and
- C2 action probe/deception.

Semantics:

- coercion indicator;
- question auxiliary-tasking;
- producer reroute;
- replace older same-question;
- no warning/public case.

## `reroute-auxiliary-unclear`

Every other authorised input:

- ambiguous indicator;
- same question/lifetime;
- no warning/public case.

There is no preparation/integrated reroute branch. It was unreachable under #99's C2 state/action combinations and is removed.

# C3 focused staging result observed C4

Only when authoritative C3 final order is `focus-staging-collection`.

Authorised raw input:

- verified C4 post-decision preparation at result time.

No posture, C4 action ID or future/current shortcut.

## `focused-staging-buildup`

Preparation developing/ready:

- preparation indicator;
- question landing-force-staging;
- focused collection context;
- current C4–C6;
- warning usable;
- public case source-sensitive;
- replace older same-question;
- explicitly supersedes `combat-elements-dispersed`.

It creates actionable physical warning without claiming complete intent certainty.

## `focused-staging-empty`

Preparation none:

- coercion indicator;
- same question/context/lifetime;
- no warning;
- public case source-sensitive;
- replace older same-question;
- explicitly supersedes `staging-logistics-anomaly`.

A testing opponent with no concentration may legitimately look coercive through this sensor.

# Future Lattice / liaison evidence

All remaining definitions are predeclared in the same canonical model; #100 does not produce them.

## Lattice landing

- `lattice-landing-concentration` — preparation diagnostic + usable warning + source-sensitive;
- `lattice-landing-dispersed` — coercion indicator + no warning + source-sensitive.

## Lattice auxiliary

- `lattice-auxiliary-coercive` — coercion diagnostic + no warning + source-sensitive;
- `lattice-auxiliary-mixed` — ambiguous indicator + no public case.

There is no preparation/integrated auxiliary definition. The former branch was unreachable under the exact result-time action/preparation state space.

## Lattice operational sequence

- `lattice-sync-preparation-sequence` — preparation diagnostic + no warning + source-sensitive;
- `lattice-sync-preparation-signal` — preparation indicator + no warning + source-sensitive;
- `lattice-sync-coercive-sequence` — coercion indicator only + no warning + source-sensitive;
- `lattice-sync-partial` — ambiguous indicator.

## Partner liaison

- `liaison-auxiliary-coercive-links` — coercion indicator + source-sensitive;
- `liaison-auxiliary-unclear` — ambiguous indicator.

There is no preparation/military-links liaison branch for the same reachability reason.

Lattice target IDs are one-shot in Kestrel. A later Lattice landing occurrence may replace earlier focused landing evidence; a later Lattice auxiliary occurrence may replace earlier reroute/liaison evidence. Different questions remain independent.

# Reason and provenance selection

The internal snapshot retains:

- representative supporting/contrary assessment occurrence IDs;
- warning-bearing occurrence ID;
- public-case supporting occurrence IDs/source groups;
- complete evidence delta from the previous pre-command snapshot.

## Directional assessment

Select player-safe basis in this order:

1. primary supporting diagnostic occurrence, if any;
2. supporting warning-bearing occurrence, if distinct;
3. newest supporting occurrence from another sourceGroup/question;
4. newest remaining supporting occurrence.

Maximum two basis facts.

If an opposite directional occurrence exists, select the highest-ranked material contrary occurrence and show it. A diagnostic direction surviving an opposite indicator may never hide that indicator.

## Conflicted assessment

Show exactly one representative preparation occurrence and one representative coercion occurrence.

Within a direction rank:

1. diagnostic before indicator;
2. warning-bearing before non-warning;
3. newer observed cycle before older;
4. definition ID then instance ID.

## Unclear weak

Show the newest current ambiguous occurrence or the authored coverage-gap explanation.

Model/array/source insertion order, seed and locale never break ties.

# Product delta

Assessment change alone is insufficient because warning/public-case state can change while the assessment label remains identical.

Every snapshot after C1 carries derived delta equivalent to:

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

`warning lost` is not a legal Kestrel trajectory under current lifetimes and monotonic preparation. A legal generated history that loses warning fails validation.

Evidence-change cause rules:

- additions without replacement/staleness → new-evidence;
- only aging out → staleness;
- replacement without independent staleness → supersession;
- multiple cause classes → mixed;
- initial/identical evidence set → none where appropriate.

A required player update cannot be suppressed merely because assessmentChange is unchanged when warning was acquired or action-space-changing public-case state changed.

# Assessment-change taxonomy

Exactly:

- initial
- unchanged
- narrowed
- strengthened
- weakened
- conflicted
- cleared-conflict
- reopened
- reversed

Mapping:

1. no previous → initial;
2. exact equality → unchanged;
3. preparation↔coercion directional flip → reversed;
4. same direction weak→coherent → strengthened;
5. same direction coherent→weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted + current unclear/weak → cleared-conflict;
8. previous any unclear + current directional → narrowed;
9. previous directional + current unclear/weak → reopened.

All 36 legal previous/current pairs resolve exactly once.

# Player-facing Intelligence Chief brief

Normal required path is compact:

- one judgement;
- at most two basis facts, with concise source/method context;
- at most one material contrary fact;
- one decision cue:
  - direct warning when usable; otherwise
  - the key gap and optional watch-for signpost;
- one short update line only when evidence/product change is materially relevant;
- when a later source-use action is available, a separate safe label stating the exact public claim.

The full safe projection may retain gap/watch-for metadata for expansion/accessibility, but the default command path must not require reading a dossier.

Canonical judgement meanings:

- preparation weak — “My read is that they're preparing a real move. I don't trust the wider picture yet.”
- preparation coherent — “This now looks like real preparation. The reporting is starting to line up.”
- coercion weak — “I think the pressure itself is the operation. That's still a thin read.”
- coercion coherent — “This increasingly looks like coercion, not cover for an immediate seizure.”
- unclear conflicted — “The reports point in both directions.”
- unclear weak — “We don't have enough to tell whether the pressure is the operation or cover for one.”

# Exact key-gap/watch-for matrix

| Assessment | Warning | Key gap | Watch for |
| --- | --- | --- | --- |
| unclear + weak | none | relationship between visible pressure and a real seizure force | physical concentration or military tasking |
| unclear + conflicted | none | reconcile the competing reports | independent direct observation of movement/tasking |
| unclear + conflicted | usable | wider meaning of the observed physical warning | corroboration of preparation or contrary coercive tasking |
| preparation + weak | none | whether the preparation read forms an executable picture | direct concentration or corroborating sequence evidence |
| preparation + weak | usable | whether the physical warning belongs to a sustained preparation sequence | tasking/sequence corroboration or movement toward execution |
| preparation + coherent | none | physical timing and executable force movement | direct landing-force concentration or movement toward execution |
| preparation + coherent | usable | timing/threshold for execution | movement from staging into execution |
| coercion + weak | none | how quickly pressure could pivot into real preparation | new concentration or preparation milestones |
| coercion + coherent | none | whether the coercive campaign is changing character | new preparation signposts or physical concentration |

Exactly these nine assessment/warning combinations are reachable.

# Timing

HQ intelligence is derived at the pre-command point after the current-cycle Ravellan decision exists.

Historical cycle Q uses:

- Ravellan decisions through Q;
- command sets only through Q-1;
- evidence results due at or before Q;
- no command Q or future entry.

Queued results:

- C2 reroute → C3;
- C3 focused staging → C4;
- C4 Lattice task → C5;
- C5 Lattice task → C6;
- C4 liaison → C5.

## C6 special cut

C6 uses this sequence:

1. hidden terminal behaviour is selected;
2. any C5 task result resolves against authorised pre-manifestation/result-time facts;
3. final pre-manifestation HQ snapshot is derived;
4. current public-case availability is derived;
5. terminal behaviour manifests as the safe overt crisis family;
6. the commander selects the terminal response.

On the C6 command surface, the overt crisis is current fact. The `ravellan-intent` readout is labelled as the **last pre-manifestation intelligence picture**, not displayed as if HQ is still debating whether an already visible seizure exists.

# Persistence and attribution handoff

#100 persists no evidence occurrence, assessment, warning or public-case basis and adds no ledger entry. Persisted version remains `0.4.0-prototype`.

Later #101 does not persist `none/tentative/credible` as a mirror. It persists only irreversible source use, including:

- used cycle;
- claim direction;
- exact supporting evidence occurrence IDs/source groups exposed.

Current availability is always derived from the current public-case basis plus unspent/used source state.

# State-space and resource bounds

Canonical generated expectations are in [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]], including:

- 19/19 definitions reachable in the producer envelope;
- 16 reducer rows;
- 9 assessment/warning pairs;
- 15 composite product states;
- 45 complete product trajectories;
- per-cycle state counts 1/1/1/4/13/11;
- maximum 9 historical occurrences and 4 current occurrences;
- zero useful same-target retasks;
- zero warning-loss trajectories;
- persistent no-resurrection supersession.

# Required #100 tests

## Reducer and products

- exhaustive 16-row reducer table;
- all six assessment states;
- diagnostic direction + opposite indicator → directional weak with contrary shown;
- diagnostics both directions → unclear conflicted;
- indicators both directions only → unclear conflicted;
- evidence multiplicity never changes direction;
- preparation assessment + warning none;
- conflicted assessment + warning usable;
- public-case independent corroboration and direction;
- one diagnostic source alone → coherent internal assessment but tentative public case;
- directionless credible rejected.

## Definitions, occurrences and validation

- exact 19-ID set; no extra/orphan/dead definition;
- all definitions reached in envelope;
- exact producer kind;
- every directional definition has sourceGroup/context/limitation;
- runtime occurrence copies canonical semantics and uses hash identity;
- duplicate occurrence rejected;
- fixed/dynamic lifetimes exact;
- ordinary schedule cannot instantiate directed definitions;
- max history/current bounds 9/4.

## Supersession

- newer same-question evidence replaces older, including same definition ID in synthetic validation;
- supersession is persistent and no old evidence resurrects through a replacement chain;
- focused→later landing and reroute/liaison→later auxiliary replacement exact;
- unrelated questions remain independent;
- graph acyclic.

## Timeline and hidden-information fairness

- mandatory C3 conflict across hidden openings/actions;
- routine C3 disposition never reads hidden preparation;
- reroute uses historical C2 authorised facts;
- focused uses C4 result-time preparation;
- same/future command entries cannot alter a historical pre-command snapshot;
- action-specific C4 prose cannot alter evidence;
- hidden posture/policy-row changes with authorised facts fixed leave result equal.

## Delta and briefing

- all 36 assessment transitions;
- all product-only transition classes detected;
- evidence-change cause exact;
- newly acquired warning cannot be suppressed by unchanged assessment;
- basis/contrary selection exact and array-order independent;
- all nine key-gap/watch-for states;
- compact brief bounds.

## Architecture and identity

- derivation pure/deep-equal and leaves session/hash/revision unchanged;
- no #100 ledger/version change;
- model bundle digest verified;
- semantic digest changes for definition, schedule, mapping, sourceGroup/context/limitation, lifetime, supersession, reducer or canonical intelligence-copy change;
- unverified imported history cannot project;
- V1 unchanged.

# Rejection conditions

Reject #100 if it:

- persists belief/evidence or adds a ledger transition;
- mirrors derived public-case availability as mutable state;
- uses a majority vote or lets weak contrary indicators always veto diagnostics;
- hides a material contrary indicator from a directional judgement;
- allows a coherent assessment automatically to become a public case without independent corroboration;
- forgets stale reports or permits superseded evidence to resurrect;
- permits repeat same-target Lattice collection in Kestrel despite identical output;
- retains dead integrated-auxiliary definitions;
- loses public-case direction or exact supporting evidence;
- infers warning from assessment;
- lets reducers or recommendation inspect hidden state/source facts;
- treats routine coverage as global truth;
- parses narrative prose into evidence;
- derives historical state from current/future entries;
- derives from untrusted saves;
- lets browser/server duplicate analysis;
- builds a generic multi-claim/plugin framework.
