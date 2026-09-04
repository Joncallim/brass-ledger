---
type: v2-hq-belief-state-space
status: active
---

# HQ Belief State-Space Authority

Backlink: [[README]]

This is the exhaustive state-space authority for **#100**. It exists because prose examples and a handful of fixtures are not sufficient proof that the composed intelligence system is total, non-omniscient and decision-useful.

Use with:

- [[23-HQ-BELIEF-AND-EVIDENCE]] — product/tradecraft meaning;
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] — code/replay/content placement;
- [[26-LATTICE-COLLECTION-MATRIX]] — later directed producers;
- [[27-KESTREL-TERMINAL-MATRIX]] — warning-sensitive terminal consumption;
- [[31-HEADLESS-DESIGN-LAB]] — implemented reachability/dominance proof.

Where an older example says “nine assessment/warning states”, this file corrects it. The final reducer admits **ten assessment/warning states** and **fifteen evidence-basis/warning presentation states**.

# 1. State dimensions

For current assessment evidence, define booleans:

- `Pdiag` — at least one current preparation diagnostic;
- `Cdiag` — at least one current coercion diagnostic;
- `Pind` — at least one current preparation indicator;
- `Cind` — at least one current coercion indicator.

Evidence count never enters reduction.

Separately derive:

- tactical warning from warning-current preparation evidence;
- public-case basis from public-case-current eligible evidence;
- current evidence-basis pattern for briefing selection;
- historical evidence delta from prior-cycle occurrences.

These products intentionally use related evidence but do not share one universal “active” lifetime.

# 2. Exhaustive intent reducer

Reducer semantics ID:

`kestrel-binary-hypothesis-v2`

Evaluate exactly:

| Pdiag | Cdiag | Pind | Cind | Assessment | Basis pattern |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | any | any | unclear / conflicted | `diagnostic-conflict` |
| 1 | 0 | any | 1 | preparation / weak | `diagnostic-preparation-qualified` |
| 1 | 0 | any | 0 | preparation / coherent | `diagnostic-preparation-clear` |
| 0 | 1 | 1 | any | coercion / weak | `diagnostic-coercion-qualified` |
| 0 | 1 | 0 | any | coercion / coherent | `diagnostic-coercion-clear` |
| 0 | 0 | 1 | 1 | unclear / conflicted | `indicator-conflict` |
| 0 | 0 | 1 | 0 | preparation / weak | `indicator-preparation` |
| 0 | 0 | 0 | 1 | coercion / weak | `indicator-coercion` |
| 0 | 0 | 0 | 0 | unclear / weak | `no-direction` |

A diagnostic direction survives lower-grade contrary indicators, but:

- the picture becomes weak, not coherent;
- the strongest material contrary occurrence is mandatory in the safe brief;
- public attribution remains stricter than the internal estimate.

Both a majority-vote reducer and an “any contrary item always vetoes direction” reducer are invalid.

# 3. Algebraically legal assessment/warning states

Warning is usable only when at least one warning-current occurrence has preparation implication and `warningRole = usable`.

The reducer therefore admits exactly these ten assessment/warning combinations:

| Assessment | Warning none | Warning usable |
| --- | --- | --- |
| unclear / weak | legal | impossible |
| unclear / conflicted | legal | legal |
| preparation / weak | legal | legal |
| preparation / coherent | legal | legal |
| coercion / weak | legal | **legal** |
| coercion / coherent | legal | impossible |

`coercion / weak + usable warning` is legal when a coercion diagnostic coexists with a preparation warning indicator. The HQ may judge that pressure is principally coercive while still treating observed physical movement as actionable.

This combination may be rare or unreachable in current Kestrel authored histories, but the reducer/briefing layer must handle it correctly rather than crash or suppress the warning.

# 4. Exhaustive briefing basis states

Assessment alone is insufficient to choose an honest key gap/watch-for line. For example, `preparation / weak` can mean:

- only suggestive preparation indicators exist; or
- a preparation diagnostic exists but a contrary coercion indicator remains.

Those require different explanations.

The snapshot therefore carries internal `basisPattern` with exactly:

- `no-direction`;
- `indicator-preparation`;
- `indicator-coercion`;
- `indicator-conflict`;
- `diagnostic-preparation-clear`;
- `diagnostic-preparation-qualified`;
- `diagnostic-coercion-clear`;
- `diagnostic-coercion-qualified`;
- `diagnostic-conflict`.

This is analytic provenance, not a player confidence label.

Combining basis pattern with legal warning overlay gives exactly fifteen presentation states:

| Basis pattern | Warning none | Warning usable |
| --- | --- | --- |
| no-direction | legal | impossible |
| indicator-preparation | legal | legal |
| indicator-coercion | legal | impossible |
| indicator-conflict | legal | legal |
| diagnostic-preparation-clear | legal | legal |
| diagnostic-preparation-qualified | legal | legal |
| diagnostic-coercion-clear | legal | impossible |
| diagnostic-coercion-qualified | legal | legal |
| diagnostic-conflict | legal | legal |

The content model must map all fifteen legal states. Impossible states fail validation.

## Required gap/watch-for meaning

- `no-direction` — identify the missing relationship between visible pressure and a real force package.
- `indicator-preparation` — ask for direct concentration/tasking/timing corroboration.
- `indicator-coercion` — ask whether pressure could pivot into physical preparation.
- `indicator-conflict` — ask for an independent observation capable of discriminating between the competing indicators.
- `diagnostic-preparation-clear` — ask for execution timing/threshold and direct warning if absent.
- `diagnostic-preparation-qualified` — explicitly reconcile the surviving coercion indicator; do not present the case as clean.
- `diagnostic-coercion-clear` — watch for a change in character toward physical preparation.
- `diagnostic-coercion-qualified` — explicitly reconcile the physical/preparation indicator; if warning is usable, state that it remains actionable despite the wider coercion judgement.
- `diagnostic-conflict` — say that strong evidence supports both directions and identify the decisive unresolved discriminator.

Warning overlay changes the immediate action language, not the underlying basis pattern.

# 5. Deterministic reason selection

For a directional assessment:

1. select the newest diagnostic supporting occurrence if one exists;
2. if warning is usable and its basis occurrence is not selected, include the newest warning occurrence next;
3. otherwise include the newest supporting indicator if room remains;
4. select the strongest contrary occurrence separately: diagnostic before indicator, then newest, then stable instance ID.

For unclear/conflicted:

- select the strongest/newest preparation occurrence;
- select the strongest/newest coercion occurrence;
- ensure a warning-bearing occurrence is the selected preparation occurrence when warning is usable.

For unclear/weak:

- select the newest ambiguous occurrence or authored coverage-gap ref.

Normal safe brief remains bounded to at most two basis entries and one contrary entry.

# 6. Role-specific currency

A single expiry window for assessment, warning and public attribution is invalid. Tactical warning is more time-sensitive than an estimative judgement; a public case about past conduct can remain usable after a report is no longer timely enough for immediate warning.

Each static evidence definition therefore owns three role-specific relevance rules:

- `assessmentRelevance`;
- `warningRelevance` (`none` where not a warning source);
- `publicCaseRelevance` (`none` where not public-case eligible).

Each runtime occurrence derives three corresponding current-through cycles.

Validation rules:

- warning relevance exists only for preparation evidence with `warningRole = usable`;
- warning relevance may not outlive assessment relevance;
- public-case relevance exists only for directional source-sensitive evidence;
- stale-for-assessment, stale-for-warning and stale-for-public-case are independently derivable;
- stale/superseded occurrences remain historical and never disappear from debrief reconstruction.

## Canonical Kestrel role-currency matrix

| Evidence family | Assessment relevance | Warning relevance | Public-case relevance |
| --- | --- | --- | --- |
| C1 opening pressure | C1–C2 | none | none |
| C2 shipping pressure | C2–C3 | none | none |
| C3 routine signposts | C3–C4 | none | none |
| C4 generic pressure pattern | C4–C5 | none | none |
| C2 reroute result | C3–C5 | none | none |
| C3 focused buildup, observed C4 | C4–C6 | **C4–C5** | C4–C6 |
| C3 focused empty, observed C4 | C4–C6 | none | C4–C6 |
| C4 Lattice result, observed C5 | C5–C6 | through C6 when warning-capable | C5–C6 when eligible |
| C5 Lattice result, observed C6 | C6 | C6 when warning-capable | C6 when eligible |
| C4 liaison result, observed C5 | C5–C6 | none | C5–C6 when eligible |

Consequences:

- focused staging can change C5 advice but, without refreshed physical collection, does not automatically supply clean C6 tactical warning;
- a C4 Lattice landing result observed C5 remains timely through C6;
- non-warning diagnostics can still make an intent judgement coherent without enabling warning-specific route benefits;
- public-case evidence can retain historical/political utility independently from warning currency.

# 7. Warning delta

Warning change is separate from assessment change.

Derive exactly:

- `initial`;
- `unchanged`;
- `gained`;
- `refreshed` — still usable, but a newer same-question/source occurrence now supplies it;
- `lost-stale`;
- `lost-superseded`;
- `lost-mixed`.

A warning can change while assessment remains unchanged. The safe brief/reveal must explain this where operationally material.

At C5/C6, the player-facing brief always explicitly states either:

- the direct warning currently available; or
- that HQ lacks current direct warning, in ordinary language.

Do not make the player infer “warning none” from a missing box.

# 8. Evidence-update delta

Assessment state equality does not mean nothing happened. A collection result may confirm an existing judgement, replace an older answer or age out without changing the six-state estimate.

Derive one bounded update object from previous/current occurrence sets:

```text
assessmentChange
warningChange
updateCause
newOccurrenceIds
staleOccurrenceIds
supersededOccurrenceIds
```

`updateCause` is exactly:

- `none` — no material evidence-set or warning/assessment change;
- `new-evidence` — new current report(s), no replacement/staleness;
- `supersession` — a new report replaces an older answer to the same question or an explicit superseded definition;
- `staleness` — prior report leaves a relevant role with no new/replacement report driving the change;
- `mixed` — more than one of those processes materially affects the readout.

A superseding report is classified `supersession`, not automatically `mixed` merely because it is also new.

The normal brief may show at most one update line, selected in this order:

1. player-tasked/liaison result arrival;
2. warning gained/lost/refreshed;
3. assessment direction/picture change;
4. staleness materially changing the basis;
5. other new evidence that changes displayed basis/contrary fact.

This makes institutional/collection payoff visible even when the headline judgement does not change.

# 9. Public-case traceability

A credible public case is not merely `{ credible, direction }`. It must preserve the specific current evidence basis that supports the claim.

#100 returns equivalent internal data:

```ts
{
  state: "none"
  direction: null
  basisInstanceIds: []
}

{
  state: "tentative"
  direction: "preparation" | "coercion" | null
  basisInstanceIds: string[]
  contraryInstanceIds: string[]
}

{
  state: "credible-source-sensitive"
  direction: "preparation" | "coercion"
  basisInstanceIds: string[] // non-empty; includes a current eligible diagnostic
  contraryInstanceIds: []
}
```

The credible basis list is deterministic: all current public-case-eligible supporting occurrences, sorted diagnostic first, then newest, then stable instance ID.

#101 may compute/persist a case fingerprint when the player actually spends the source:

```text
SHA-256(
  beliefModelSemanticDigest,
  claimDirection,
  sorted basisInstanceIds
)
```

The normal player never sees raw instance IDs/hash. They see the specific claim and bounded source/method summaries.

# 10. Derived opportunity vs persisted source use

Before the source is spent, `none/tentative/credible` is fully derivable from #100 and must not be duplicated as mutable #101 campaign truth.

Persist only source disposition/history equivalent to:

```ts
{ state: "unspent" }
| {
    state: "used"
    direction: "preparation" | "coercion"
    usedCycle: number
    caseFingerprint: string
  }
| {
    state: "expired"
    expiredCycle: number
    lastCaseFingerprint: string | null
  }
```

Current player-legitimate attribution opportunity is:

- if source disposition is unspent — derive from current #100 public-case basis;
- if used/expired — expose that absorbing state.

Consequences:

- no pre-command “synchronise derived credibility into persisted state” transition;
- C5 Hold leaves source unspent and the C6 opportunity is re-derived from C6 evidence;
- C5 Use is the authoritative persisted transition to used and freezes the actual claim fingerprint/direction;
- terminal non-use may expire the source in the terminal transition;
- later evidence never regenerates or rewrites a used claim.

This removes a duplicate-truth/replay surface from #101.

# 11. Collection timing state-space

Kestrel ordering is:

```text
Ravellan decision CN
→ result(s) due at CN pre-command point
→ HQ intelligence
→ player command/task CN
```

Therefore:

- C4 task observes the C5 result-time state/action history and returns at C5;
- C5 task returns at C6 after the terminal Ravellan decision, but #99 performs no further normal action/preparation progression after C5.

For every current Kestrel target, a C5 repeat of the same target already answered at C5 would inspect the same decision-significant facts:

- landing — preparation is unchanged by the C6 terminal selector;
- auxiliary — latest normal action/preparation remain C5 facts;
- sync — two latest normal actions remain C4+C5.

Because the C5 occurrence is already current through C6, repeating that target in C5 can only reproduce the same semantic result and consume the opportunity to ask another question.

Therefore Kestrel freezes:

> **Each Lattice target may be tasked at most once per run.**

Operational Lattice can answer at most two of the three targets before the final response.

This is a bounded prototype rule, not a claim that real collection should never retask. A longer post-gate campaign with a genuinely changing observation horizon may reopen retasking.

# 12. Full target sequence enumeration

With three target IDs and two task windows, legal Lattice sequences are exactly:

- landing → auxiliary;
- landing → sync;
- auxiliary → landing;
- auxiliary → sync;
- sync → landing;
- sync → auxiliary;
- one target only where the second task is voluntarily omitted or no longer applicable;
- no target where Lattice never matured.

No same-target pair is legal.

#107 must branch all six ordered two-target sequences for every reachable C4 pre-task state and report:

- assessment/warning/public-case trajectory;
- C5 recommendation/package effect;
- C6 route-set effect;
- terminal Pareto/classification/severe effect;
- target-order dominance/equivalence.

If one ordered sequence is globally dominated, that is a product finding; do not hide it with random results.

# 13. Content identity binding

#100 exports canonical belief-model definition + semantic digest but does not yet create the final Kestrel scenario content identity.

Be honest about the boundary:

- #100 can prove deterministic model semantics/digest;
- #100 sim APIs require an explicitly supplied trusted model bundle;
- no production browser/server path may choose an arbitrary model for a saved session;
- #103 must bind the model digest and later #102 collection-producer digest into Kestrel `contentDigest` before #104/browser play;
- only after that binding may replay-valid saved identity select the production model automatically.

Do not claim #100 alone proves old-session model binding.

# 14. State-space test inventory

#100 implementation must exhaust:

## Reducer classes

- all 16 combinations of Pdiag/Cdiag/Pind/Cind;
- warning overlay wherever preparation evidence can carry warning;
- exactly 10 legal assessment/warning outputs;
- exactly 15 legal basis-pattern/warning presentation states;
- impossible states rejected by content validation.

## Public case

Enumerate public-role evidence presence by direction/diagnosticity and prove:

- no eligible direction → none/null;
- one indicator direction → tentative/that direction;
- eligible both directions → tentative/null;
- one diagnostic direction + no opposite directional evidence → credible/that direction;
- lower-grade opposite evidence can leave internal judgement directional but public case tentative;
- credible basis always has deterministic non-empty basis IDs and no contrary IDs.

## Currency

For every evidence family and query C1–C6 prove assessment/warning/public-case currentness separately and historical retention always.

## Supersession

Enumerate:

- focused → Lattice landing;
- reroute → liaison;
- reroute/liaison → Lattice auxiliary;
- unrelated-question coexistence;
- same-cycle contradictory replacement rejection;
- no same-definition repeated occurrence in Kestrel one-shot target rules.

## Timeline

Enumerate all legal C2 reroute/non-reroute × C3 focus/non-focus × six Lattice target orders × liaison fallback × Ravellan normal action/preparation histories supported by #99.

At minimum compare every final snapshot on:

- evidence history/current sets by role;
- assessment/basis pattern;
- warning and warning delta;
- public-case state/direction/basis;
- bounded brief refs;
- history purity.

## Persistence boundary

Prove no #100 state/ledger/version mutation and no duplicated unspent attribution credibility in #101.

# 15. Review stop rule

Further architecture change is justified only by:

- a failed exhaustive test above;
- a concrete contradiction with another canonical subsystem;
- #107 reachable-state dominance/fairness evidence;
- or fresh-player evidence.

An alternative mechanic being imaginable is not itself a defect.
