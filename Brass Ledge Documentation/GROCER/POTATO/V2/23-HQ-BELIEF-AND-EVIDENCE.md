---
type: v2-hq-belief-contract
status: active
---

# HQ Belief And Evidence Contract

Backlink: [[README]]

This is the product/tradecraft authority for **#100 — HQ belief / intelligence projection**.

- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns exact code/replay seams.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns exhaustive algebraic/temporal/equivalence coverage.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns exact definitions, mappings and copy.
- [[23D-HQ-BELIEF-STATE-SPACE-VECTORS.json]] owns machine-readable golden vectors.
- [[26-LATTICE-COLLECTION-MATRIX]] owns future #102 task persistence and target production.
- [[37-RAVELLAN-WORLD-EFFECT-MATRIX]] owns safe world manifestations.

# 1. Product purpose

Intelligence should make uncertainty **usable** without exposing a probability meter, hidden answer key or staff-analysis minigame.

The Intelligence Chief should answer in ordinary language:

1. What do you think is happening?
2. Which facts drive that judgement?
3. What contradicts it or remains unknown?
4. What observable sign would change the picture?
5. Do we have direct tactical warning, or only an estimate?
6. If a public case is available, what exactly can we substantiate?

No player-facing percentages, High/Medium/Low confidence, hidden posture/preparation, raw action/policy row, or oracle truth.

# 2. Bounded tradecraft model

Kestrel deliberately uses a small playable subset of professional intelligence practice:

- competing hypotheses;
- indicators and stronger diagnostic evidence;
- source/method and limitations separated from judgement;
- contrary reporting retained rather than averaged away;
- named collection against decision-relevant gaps;
- information currency treated as current relevance rather than deletion;
- explicit change/consistency of judgement;
- watch-for indicators;
- tactical indications-and-warning separated from broader estimation;
- internal judgement separated from a public evidentiary case;
- public claims requiring corroboration rather than one privileged report.

Do not build full ACH, Bayesian probabilities, source-reliability dice, confidence taxonomies or a generic multi-claim intelligence framework.

# 3. The command question

Stable claim ID:

`ravellan-intent`

Question:

> **Is Ravellan preparing a real near-term move on Beacon, or is the pressure itself currently the main operation?**

Competing analytical directions:

- `preparation` — activity materially supports a real near-term seizure option;
- `coercion` — current pressure is primarily coercive/political rather than cover for an imminent prepared seizure.

Hidden `testing` is not a player hypothesis. It may produce preparation, coercion, conflicted or ambiguous evidence depending on observable behaviour.

# 4. Three independent products

Never collapse these into one confidence value.

## Intent assessment

Exactly six internal states:

- `unclear / weak`
- `unclear / conflicted`
- `preparation / weak`
- `preparation / coherent`
- `coercion / weak`
- `coercion / coherent`

Meaning:

- `coherent` — one direction has diagnostic support and no current opposite directional evidence;
- directional `weak` — a responsible best direction exists, but it is indicator-only or qualified by lower-grade contrary evidence;
- `conflicted` — comparable evidence classes point both ways;
- `unclear / weak` — no current directional basis exists.

These identifiers are never shown as confidence labels.

## Tactical warning

- `none`
- `usable`

`usable` means HQ has a current authorised **physical preparation signpost** worth acting on.

A preparation assessment alone does not create warning. Warning may remain usable while the wider assessment is conflicted or even algebraically coercion/weak.

The game must support:

> “I think they are preparing, but we still lack current direct warning.”

and:

> “We have movement worth acting on, but the wider intent picture remains disputed.”

## Public-case basis

Pure derived basis:

```ts
{ state: "none"; direction: null }
| {
    state: "tentative"
    direction: "preparation" | "coercion" | null
    supportingEvidenceInstanceIds: readonly string[]
    supportingCorroborationGroupIds: readonly string[]
  }
| {
    state: "credible-source-sensitive"
    direction: "preparation" | "coercion"
    supportingEvidenceInstanceIds: readonly [string, string]
    supportingCorroborationGroupIds: readonly [string, string]
  }
```

A public claim is directional:

- preparation — a seizure-preparation case;
- coercion — a coercive/deceptive pressure case.

This basis is not persisted by #100. #101 later persists only irreversible source use and freezes the claim/support basis at use time.

# 5. Information boundary

Keep distinct:

- **World truth** — actual hidden state/history.
- **Authorised source fact** — exact physical/action-history fact one named observation rule may inspect.
- **Evidence definition** — canonical meaning of a report type.
- **Evidence occurrence** — one historical report instance.
- **Role-current evidence** — occurrence relevance for assessment, warning or public case at a specific cycle.
- **HQ products** — deterministic reductions.
- **Player brief** — bounded safe copy.

Changing hidden truth while authorised source facts/evidence occurrences/public state remain fixed must leave HQ products and normal player copy deep-equal.

Narrative prose is never parsed into intelligence. Hidden posture is never a sensor input. R6 terminal action/row is never intelligence evidence.

# 6. Evidence definitions and occurrences

Exact 19 definitions are [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

A definition freezes:

- question and implication;
- indicator/diagnostic class;
- source group and corroboration group;
- source-context/limitation/summary refs;
- warning/public roles;
- three role-specific relevance rules;
- producer kind and supersession.

An occurrence freezes:

- deterministic instance ID;
- definition ID;
- strict authoritative origin;
- actual observed cycle;
- three derived role-current-through cycles;
- semantic fields copied from the definition.

Runtime producers cannot redefine a definition’s meaning.

# 7. Exact assessment reducer

Semantic ID:

`kestrel-binary-hypothesis-v1`

For assessment-current, non-superseded evidence define:

- `Pdiag` — preparation diagnostic exists;
- `Cdiag` — coercion diagnostic exists;
- `Pind` — preparation indicator exists;
- `Cind` — coercion indicator exists.

Apply exactly:

1. both diagnostics → `unclear / conflicted`;
2. preparation diagnostic only:
   - coercion indicator present → `preparation / weak`;
   - otherwise → `preparation / coherent`;
3. coercion diagnostic only:
   - preparation indicator present → `coercion / weak`;
   - otherwise → `coercion / coherent`;
4. no diagnostics:
   - indicators both directions → `unclear / conflicted`;
   - preparation indicators only → `preparation / weak`;
   - coercion indicators only → `coercion / weak`;
   - neither → `unclear / weak`.

Evidence quantity never chooses direction. A surviving diagnostic direction must display its material contrary indicator and is `weak`, not coherent.

The complete 16-row table is [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]].

# 8. Internal basis pattern

Assessment label alone is not enough to explain the reasoning. The snapshot therefore retains exactly:

- `no-direction`
- `indicator-preparation`
- `indicator-coercion`
- `indicator-conflict`
- `diagnostic-preparation-clear`
- `diagnostic-preparation-qualified`
- `diagnostic-coercion-clear`
- `diagnostic-coercion-qualified`
- `diagnostic-conflict`

This is internal provenance, not a confidence label.

Combined with warning, there are 15 algebraically legal presentation states. [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] supplies exact gap/watch copy for all 15, including states current Kestrel producers cannot reach.

# 9. Warning reducer and currency

Use warning-current, non-superseded occurrences only.

`usable` iff at least one occurrence has:

- implication `preparation`; and
- warning role `usable`.

Select one deterministic warning basis occurrence.

Warning is more time-sensitive than assessment or public use:

- focused buildup observed C4 supports assessment/public case through C6;
- its direct warning is current only C4–C5;
- without refreshed Lattice landing collection, C6 has no clean current warning from that report.

At C5/C6 the player always receives an explicit ordinary-language warning status, including when no current direct warning exists.

# 10. Public-case reducer

Public attribution is stricter than internal estimation.

Use public-current eligible evidence. Opposite-direction blockers include any opposite occurrence current for **assessment or public-case use**.

Credible direction D requires:

1. one source-sensitive diagnostic occurrence supporting D;
2. no current opposite directional occurrence;
3. one additional source-sensitive D occurrence from another `corroborationGroupId`.

Return exactly two deterministic support occurrences/groups.

One diagnostic source is tentative. Two indicators are tentative. Directionless credible is invalid.

Different source labels do not automatically prove independence; the model’s explicit corroboration group controls.

# 11. Currency is relevance, not forgetting

Each evidence definition has independent:

- assessment relevance;
- warning relevance;
- public-case relevance.

Stale evidence remains historical. Superseded evidence remains historical. Neither enters the relevant current reducer.

If current products change because information aged out, the player-facing update must explain that the earlier report is now too old for the same operational use.

Important asymmetry:

- focused positive: assessment/public C4–C6; warning C4–C5;
- focused negative: assessment C4–C5; public C4–C6.

The negative report is stale for current intent at C6 because C5 could have begun preparation, but may still support a truthful public claim about the earlier pressure campaign.

# 12. Persistent supersession

A later same-question occurrence replaces older same-question evidence where its definition says so. Explicit asymmetric replacement also applies.

Supersession is permanent:

```text
routine A
→ focused B replaces A
→ Lattice C replaces B
```

A and B remain historical but never return to current analysis if C later becomes stale.

Different questions remain independent and may legitimately contradict.

# 13. Timeline

Ordinary evidence:

- C1 ambiguous opening pressure;
- C2 ambiguous shipping pressure;
- C3 routine logistics anomaly + apparently dispersed combat elements;
- C4 generic ambiguous pressure-pattern change;
- C5/C6 no unconditional new report.

C3 dispersed reporting means **within routine coverage**, not global hidden truth.

Directed results:

- C2 reroute → C3;
- C3 focused staging → C4;
- C4 Lattice target → C5;
- C5 different unused Lattice target → C6;
- C4 liaison → C5.

Operational Lattice later has no no-task or same-target-retask option. Focused staging does not consume the stronger Lattice landing question.

# 14. C6 semantics

C6 intelligence is the last pre-manifestation picture. The safe overt crisis is then projected separately.

A C5 Task Collection result may arrive before the overt crisis is shown, but it uses C5/latest-normal facts only. It cannot inspect R6 action or row.

Terminal debrief separates:

1. what HQ believed at each historical decision point;
2. what actually happened.

Terminal truth never rewrites prior analysis, source limitations, warning or public claim.

# 15. Product/evidence delta

Assessment change alone is insufficient. The complete derived delta reports:

- assessment change;
- warning initial/unchanged/gained/refreshed/lost cause;
- public-case state and direction change;
- evidence update cause;
- added occurrence IDs;
- per-role staleness IDs;
- newly superseded IDs.

A task result, warning loss/acquisition or newly actionable public case cannot be hidden merely because the headline assessment string stayed unchanged.

Exact total enums/algorithms are [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

# 16. Player-facing Intelligence Chief brief

Required path is bounded to:

- one judgement;
- at most two supporting facts;
- at most one contrary fact;
- exactly one key gap;
- at most one watch-for;
- at most one material update line;
- one separate warning-status line where required;
- later, a safe public-claim label only when #101 exposes a current unspent credible case.

Each displayed evidence fact carries concise source/method and limitation copy.

Do not expose:

- `weak/conflicted/coherent` labels;
- indicator/diagnostic labels;
- internal public-case state;
- occurrence origins, revisions or hashes;
- raw source facts;
- hidden state;
- numeric/categorical confidence;
- full evidence history in the required command path.

Exact copy/ranking/mappings are [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

# 17. Assessment change

Exactly:

- `initial`
- `unchanged`
- `narrowed`
- `strengthened`
- `weakened`
- `conflicted`
- `cleared-conflict`
- `reopened`
- `reversed`

All 36 previous/current assessment pairs map exactly once; no fallback.

# 18. Persistence and identity

#100 persists no evidence occurrence or product and adds no ledger entry. V2 remains `0.4.0-prototype`.

The `kestrel-hq-belief-v1` semantic digest covers:

- all definitions and role relevance;
- ordinary/reroute/focused mappings;
- reducer semantics;
- source/corroboration/supersession metadata;
- decision-significant copy.

#102 later has a separate producer digest. #103 binds both into final Kestrel content identity before normal player-facing Kestrel use.

# 19. Required proof

#100 must prove:

- all 16 assessment rows;
- all 10 algebraic assessment/warning pairs;
- all 15 basis-pattern/warning presentation mappings;
- exact 19 definitions;
- role-specific relevance and warning loss;
- one-source/directionless public credibility rejection;
- ordinary/reroute/focused history correctness;
- stale retention and permanent supersession;
- hidden/private/future non-interference;
- pure derivation/content identity;
- all generated vectors in [[23D-HQ-BELIEF-STATE-SPACE-VECTORS.json]] through the test-only oracle specified by 23A.

# 20. Rejection conditions

Reject #100 if it:

- persists belief/evidence or changes the V2 persisted version;
- uses a score, vote count or probability;
- lets any weak contrary indicator automatically veto diagnostic evidence;
- hides contrary evidence from a qualified judgement;
- conflates assessment, warning and public case;
- uses one universal evidence lifetime;
- forgets stale evidence or resurrects superseded evidence;
- grants public credibility from one source or without direction;
- makes focused staging remove the stronger Lattice landing target;
- permits same-target retask or zero-cost no-task;
- reads hidden posture/R6 action or parses narrative prose into analysis;
- derives history from current/future state;
- exposes internal provenance to players;
- changes semantics without changing the model digest;
- duplicates analysis in server/browser;
- implements #102 task persistence or a generic intelligence framework inside #100.
