---
type: v2-hq-belief-brief-delta-contract
status: active
---

# HQ Belief Brief And Delta Matrix

Backlink: [[README]]

This is the exact authority for **#100 briefing selection, product-change totality, and safe update composition**.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns product meaning.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns implementation/replay seams.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns generated reachability.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns evidence definitions and exact copy registry.
- [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] owns final server-to-player DTOs.

The purpose of this document is to prevent a correct reducer from becoming an incorrect player briefing through omitted contrary evidence, warning hidden behind an unchanged estimate, or several simultaneous product changes collapsed into one vague sentence.

# 1. Internal basis patterns

The intent reducer returns one of exactly nine internal patterns in addition to the six-state assessment:

| Basis pattern | Reducer condition | Assessment |
| --- | --- | --- |
| `no-direction` | no directional evidence | unclear / weak |
| `indicator-preparation` | preparation indicator(s) only | preparation / weak |
| `indicator-coercion` | coercion indicator(s) only | coercion / weak |
| `indicator-conflict` | indicators both directions, no diagnostics | unclear / conflicted |
| `diagnostic-preparation-clear` | preparation diagnostic, no coercion evidence | preparation / coherent |
| `diagnostic-preparation-qualified` | preparation diagnostic + coercion indicator(s), no coercion diagnostic | preparation / weak |
| `diagnostic-coercion-clear` | coercion diagnostic, no preparation evidence | coercion / coherent |
| `diagnostic-coercion-qualified` | coercion diagnostic + preparation indicator(s), no preparation diagnostic | coercion / weak |
| `diagnostic-conflict` | diagnostics both directions | unclear / conflicted |

`basisPattern` is internal provenance. It is never shown as a confidence label.

# 2. Algebraically legal briefing states

The brief layer is total over these **15** `basisPattern × warning` states, even when current Kestrel producers do not reach one:

1. no-direction / warning none
2. indicator-preparation / none
3. indicator-preparation / usable
4. indicator-coercion / none
5. indicator-conflict / none
6. indicator-conflict / usable
7. diagnostic-preparation-clear / none
8. diagnostic-preparation-clear / usable
9. diagnostic-preparation-qualified / none
10. diagnostic-preparation-qualified / usable
11. diagnostic-coercion-clear / none
12. diagnostic-coercion-qualified / none
13. diagnostic-coercion-qualified / usable
14. diagnostic-conflict / none
15. diagnostic-conflict / usable

No other pairing is algebraically legal:

- no-direction cannot have usable warning because warning evidence is directional preparation evidence;
- indicator-coercion + warning becomes indicator-conflict;
- diagnostic-coercion-clear + warning becomes diagnostic-coercion-qualified.

Current producer reachability is a separate #23B result and may not be used to omit total branches.

# 3. Exact gap/watch-for semantics

Copy refs are stable semantic IDs. Exact English belongs in the #23C copy registry.

| Basis pattern | Warning | Key-gap ref | Watch-for ref |
| --- | --- | --- | --- |
| no-direction | none | `intel.gap.no-direction` | `intel.watch.no-direction` |
| indicator-preparation | none | `intel.gap.indicator-preparation-none` | `intel.watch.indicator-preparation-none` |
| indicator-preparation | usable | `intel.gap.indicator-preparation-warning` | `intel.watch.indicator-preparation-warning` |
| indicator-coercion | none | `intel.gap.indicator-coercion` | `intel.watch.indicator-coercion` |
| indicator-conflict | none | `intel.gap.indicator-conflict-none` | `intel.watch.indicator-conflict-none` |
| indicator-conflict | usable | `intel.gap.indicator-conflict-warning` | `intel.watch.indicator-conflict-warning` |
| diagnostic-preparation-clear | none | `intel.gap.diagnostic-preparation-clear-none` | `intel.watch.diagnostic-preparation-clear-none` |
| diagnostic-preparation-clear | usable | `intel.gap.diagnostic-preparation-clear-warning` | `intel.watch.diagnostic-preparation-clear-warning` |
| diagnostic-preparation-qualified | none | `intel.gap.diagnostic-preparation-qualified-none` | `intel.watch.diagnostic-preparation-qualified-none` |
| diagnostic-preparation-qualified | usable | `intel.gap.diagnostic-preparation-qualified-warning` | `intel.watch.diagnostic-preparation-qualified-warning` |
| diagnostic-coercion-clear | none | `intel.gap.diagnostic-coercion-clear` | `intel.watch.diagnostic-coercion-clear` |
| diagnostic-coercion-qualified | none | `intel.gap.diagnostic-coercion-qualified-none` | `intel.watch.diagnostic-coercion-qualified-none` |
| diagnostic-coercion-qualified | usable | `intel.gap.diagnostic-coercion-qualified-warning` | `intel.watch.diagnostic-coercion-qualified-warning` |
| diagnostic-conflict | none | `intel.gap.diagnostic-conflict-none` | `intel.watch.diagnostic-conflict-none` |
| diagnostic-conflict | usable | `intel.gap.diagnostic-conflict-warning` | `intel.watch.diagnostic-conflict-warning` |

Required meanings:

- `no-direction` — cannot connect visible pressure to either a real force package or a stable coercive tasking chain; watch for physical concentration or diagnostic tasking/sequence.
- `indicator-preparation` — signs lean toward preparation but do not yet form a diagnostic sequence; with warning, direct movement is actionable but the wider campaign remains uncorroborated.
- `indicator-coercion` — signs lean toward coercion but do not rule out a rapid pivot; watch for concentration/preparation milestones.
- `indicator-conflict` — lower-grade reports point both ways; with warning, physical movement is actionable even though the lower-grade interpretation remains split.
- `diagnostic-preparation-clear` — preparation is strongly supported; without warning, exact timing/physical execution remains missing; with warning, the remaining gap is execution threshold.
- `diagnostic-preparation-qualified` — preparation remains the best judgement but a coercive indicator does not fit; warning may be current or absent.
- `diagnostic-coercion-clear` — coercive tasking is strongly supported; watch for a change in character or physical preparation.
- `diagnostic-coercion-qualified` — coercion remains the best judgement but preparation indicators exist; if warning is usable, the brief must state that the physical signpost may govern near-term action even while the wider judgement remains coercion.
- `diagnostic-conflict` — diagnostic reporting itself disagrees; with warning, the commander still has an actionable physical signpost despite unresolved intent.

# 4. Evidence ranking

Rank current occurrences within a direction:

1. diagnostic before indicator;
2. warning-bearing before non-warning **only within the same diagnosticity class**;
3. newer observed cycle;
4. definition ID;
5. instance ID.

Diagnosticity always outranks warning for choosing the representative analytical basis. Warning is then shown through its own explicit block.

This prevents a warning-bearing indicator from hiding a diagnostic report in a conflicted state.

# 5. Directional brief selection

For preparation/coercion assessments:

1. select the highest-ranked same-direction occurrence as primary basis;
2. if a second basis slot exists, prefer a same-direction occurrence from another question and then another corroboration group before another from the same question/group;
3. if any opposite-direction occurrence remains assessment-current, select the highest-ranked opposite occurrence as the mandatory contrary fact;
4. if warning is usable and its basis occurrence is not already present as basis or contrary, include it in the warning block as an additional safe evidence entry.

Maximum unique safe evidence entries:

- two analytical basis entries;
- one contrary entry;
- one warning-basis entry only when it is not already represented.

The typical path remains smaller. The fourth entry exists only for an algebraic hostile state where two analytical facts, a contrary fact and a different physical-warning fact are all material.

# 6. Conflicted brief selection

For `indicator-conflict` or `diagnostic-conflict`:

1. select exactly one preparation representative and one coercion representative;
2. use the ranking above independently within each direction;
3. display directions in stable order: preparation, then coercion;
4. if warning is usable and its basis occurrence is not one of those representatives, include it in the warning block as an additional safe evidence entry.

A warning-bearing preparation indicator does not replace a preparation diagnostic in a diagnostic conflict. The warning line references the indicator separately.

# 7. Unclear/weak selection

For `no-direction`:

- show the newest current ambiguous occurrence when one exists;
- otherwise rely on the authored gap;
- do not manufacture a directional basis from missing information.

# 8. Warning block

Warning is explicit and independent of the judgement.

Internal form:

```ts
{ state: "none"; basisInstanceId: null }
| { state: "usable"; basisInstanceId: string }
```

Safe form:

```ts
{
  state: "none" | "usable"
  statementRef: string
  basisEvidence: V2PlayerSafeEvidenceEntry | null
}
```

Rules:

- usable warning is always shown;
- at C5 and C6, warning none is also shown explicitly as “no current direct warning” in ordinary language;
- at C1–C4, warning none may be omitted unless needed to explain a warning loss in a synthetic/hostile projection;
- the warning basis is the newest warning-current occurrence, then stable definition/instance ID;
- a report may remain assessment/public-case relevant after it stops being warning-current;
- C6 labels the block as part of the last pre-manifestation picture.

# 9. Total internal product delta

Adjacent pre-command snapshots derive:

```ts
type V2HqBeliefDelta = {
  assessmentChange:
    | "initial" | "unchanged" | "narrowed" | "strengthened"
    | "weakened" | "conflicted" | "cleared-conflict"
    | "reopened" | "reversed"

  assessmentBasisChange: "initial" | "unchanged" | "changed"

  warningChange:
    | "initial" | "unchanged" | "gained" | "refreshed" | "lost"

  publicCaseStateChange:
    | "initial" | "unchanged" | "opened" | "strengthened"
    | "weakened" | "closed"

  publicCaseDirectionChange:
    | "initial" | "unchanged" | "established" | "clarified"
    | "became-conflicted" | "reversed" | "cleared"

  publicCaseSupportChange:
    | "initial" | "unchanged" | "changed" | "cleared"

  updateCause:
    | "none" | "new-evidence" | "staleness" | "supersession" | "mixed"

  addedInstanceIds: string[]
  staleForAssessmentInstanceIds: string[]
  staleForWarningInstanceIds: string[]
  staleForPublicCaseInstanceIds: string[]
  newlySupersededInstanceIds: string[]
}
```

All arrays use stable canonical order.

# 10. Exact assessment-change algorithm

Given previous P and current C assessment:

1. no previous snapshot → initial;
2. exact assessment equality → unchanged;
3. directional preparation ↔ coercion → reversed;
4. same direction weak → coherent → strengthened;
5. same direction coherent → weak → weakened;
6. current unclear/conflicted → conflicted;
7. previous unclear/conflicted and current unclear/weak → cleared-conflict;
8. previous any unclear and current directional → narrowed;
9. previous directional and current unclear/weak → reopened.

This is total over all 36 pairs. No default branch.

`assessmentBasisChange` compares the exact `basisPattern` and deterministic representative analytical basis/contrary IDs. It may be `changed` while the six-state assessment is unchanged.

# 11. Exact warning-change algorithm

- no previous snapshot → initial;
- both none → unchanged;
- none → usable → gained;
- usable → none → lost;
- both usable with same basis instance → unchanged;
- both usable with different basis instance → refreshed.

# 12. Exact public-case state change

- no previous snapshot → initial;
- same state → unchanged;
- none → tentative or credible → opened;
- tentative → credible → strengthened;
- credible → tentative → weakened;
- tentative or credible → none → closed.

No other state pair exists.

# 13. Exact public-case direction change

Use `direction` from the public-case object:

- no previous snapshot → initial;
- same direction, including null → unchanged;
- previous none/null → current preparation/coercion → established;
- previous tentative/null → current preparation/coercion → clarified;
- previous preparation/coercion → current tentative/null → became-conflicted;
- previous preparation ↔ coercion → reversed;
- previous preparation/coercion → current none/null → cleared.

Evaluate `clarified` before generic `established`.

# 14. Exact public support change

Compare ordered support occurrence IDs and corroboration-group IDs:

- no previous snapshot → initial;
- exact equality → unchanged;
- previous support non-empty and current support empty → cleared;
- otherwise → changed.

A new support basis must be detectable even when public-case state and direction are unchanged.

# 15. Update-cause algorithm

Derive cause classes from the role-current and supersession deltas:

- `new-evidence` when at least one newly observed occurrence affects a current product and no staleness/supersession also affects a product;
- `staleness` when a prior occurrence ceases to be current for at least one role and no new evidence/supersession also affects a product;
- `supersession` when a newly observed occurrence replaces older evidence and no independent staleness also affects a product;
- `mixed` when two or more cause classes materially affect products;
- `none` when no role-current evidence/product/support basis changed.

An occurrence can be added and supersede another in the same transition; that is `mixed` only when both addition and replacement independently affect the derived products or displayed basis. Do not classify a purely mechanical hidden change as a player update.

# 16. Safe structured update

Do not collapse all product changes into one `summaryRef`.

Use a safe update equivalent to:

```ts
type V2PlayerSafeIntelligenceUpdate = {
  items: readonly (
    | { kind: "warning"; ref: string }
    | { kind: "public-case"; ref: string }
    | { kind: "assessment"; ref: string }
  )[]
  causeRef: string | null
}
```

Rules:

- at most one item of each kind;
- fixed display order: warning, public-case, assessment;
- warning gained/refreshed/lost always creates a warning item;
- public-case item appears in final player projection only when #101 says current action availability/claim changed; #100 retains the internal product delta regardless;
- assessment item appears for every non-initial, non-unchanged assessment change, or when the assessment is unchanged but `assessmentBasisChange = changed` and that changed basis is material to the displayed explanation;
- `causeRef` is included when staleness or supersession would otherwise look like an unexplained analyst mood swing;
- simultaneous material changes produce simultaneous structured items; none may be discarded to satisfy a one-line presentation cap.

The UI may render these as compact sentences or status lines. It may not merge them in a way that changes meaning.

# 17. Public-case safe claim

When #101 exposes a current actionable public case, the safe claim block contains:

```ts
type V2PlayerSafePublicClaim = {
  claim: "seizure-preparation" | "coercive-pressure-campaign"
  claimRef: string
  supportingEvidence: readonly [
    V2PlayerSafeEvidenceEntry,
    V2PlayerSafeEvidenceEntry,
  ]
  oneShotCostRef: string
  protectedCollectionCostRef: string
}
```

The coercion claim means the recent pressure campaign can be substantiated as coercive/deceptive. It does **not** mean Ravellan cannot now prepare or execute a seizure.

The preparation claim substantiates physical preparation. It does not itself provide current tactical warning unless the separate warning product is usable.

# 18. Mutation tests

Required failing mutants:

- warning-bearing indicator displaces a diagnostic representative;
- diagnostic direction hides its surviving contrary indicator;
- conflicted brief omits one direction;
- usable warning omitted because assessment string is unchanged;
- public case opens but safe update is dropped because assessment is unchanged;
- same public headline/direction receives a new support basis but support change stays unchanged;
- one `summaryRef` silently chooses one of simultaneous warning/public/assessment changes;
- C5/C6 warning none represented only by missing field;
- warning block exposes diagnosticity, source group, origin hash or internal instance ID;
- coercive-pressure claim rendered as “no seizure preparation exists”;
- preparation public claim rendered as current tactical warning without warning-role evidence;
- array insertion/locale/seed changes evidence selection or update order.

# 19. Closure rule

#100 briefing/delta architecture is complete only when:

- all 16 reducer rows produce one basis pattern;
- all 15 algebraically legal briefing states resolve to exact gap/watch refs;
- all 36 assessment pairs and every warning/public/support pair are total;
- simultaneous product changes survive safe projection;
- material contrary evidence and warning-basis evidence cannot be hidden;
- safe copy preserves the difference between current estimate, current warning and a historical/public claim.
