---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This is the implementation authority for the V2 server-to-normal-player information boundary.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns HQ intelligence meaning.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns derived/internal types.
- [[23C-HQ-BELIEF-EVIDENCE-CATALOG]] owns safe evidence/copy refs.
- [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persisted irreversible source use.
- [[26-LATTICE-COLLECTION-MATRIX]] owns delegated Lattice task flow.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns package authority.
- [[27-KESTREL-TERMINAL-MATRIX]] owns final-route legality.

# 1. Product rule

Hidden information should be difficult to leak accidentally because the normal player DTO simply does not contain it.

Never send raw V2 session/state to browser/headless and rely on presentation to ignore private fields.

Safe projection derives only from:

- bounded HQ player-safe intelligence brief;
- public/known campaign records;
- standing direction/known commitments/capability;
- authoritative agenda/recommendations/task default;
- legitimately observable world/crisis effects.

# 2. Forbidden normal-player fields

No direct or nested:

- hidden Ravellan posture/preparation;
- raw `AdversaryObservation`;
- raw Ravellan action/policy-row IDs;
- raw collection selector inputs/action history;
- raw #100 source facts;
- evidence-definition/producer mapping tables;
- evidence `basisPattern`, diagnosticity or role-current-through cycles;
- evidence occurrence origins, ledger refs, revisions or hashes;
- private player/system ledger entries;
- oracle/counterfactual state;
- future branches/predicted result;
- score/win probability;
- numeric/categorical intelligence confidence;
- internal `weak/conflicted/coherent` labels;
- internal public-case basis/state/support IDs;
- raw sim fields merely because serialisable.

Allowed safe authority metadata includes current revision, safe issue/order/target IDs, public state enums and explicit attention/compatibility semantics.

# 3. Strict projection modes

Use strict unknown-key-rejecting discriminated schemas for:

- opening intent;
- Command Room;
- consequence reveal;
- terminal debrief.

No giant nullable raw-state DTO.

# 4. Opening intent

May include safe scenario identity/title, revision, four question/answer IDs/copy and known opening situation.

Never include seeded Ravellan state.

# 5. Command Room header and standing direction

Header:

- cycle;
- revision;
- safe situation/change;
- normal personal-attention limit/usage;
- known deadlines/commitments/capability notices.

Standing direction uses stable safe IDs/copy only.

# 6. Intelligence Chief brief

The required intelligence surface is bounded and decision-oriented.

Expose safe semantics equivalent to:

- one `judgementRef`;
- at most two basis entries;
- at most one contrary entry;
- exactly one `keyGapRef`;
- at most one `watchForRef`;
- at most one material `updateRef`;
- a separate warning-status object;
- safe collection questions/default target supplied through capability authority.

A safe evidence entry may contain only:

```ts
{
  summaryRef: string
  sourceContextRef: string
  limitationRefs: readonly [string] | readonly [string, string]
}
```

No occurrence ID/origin/class/weight.

The normal required path never dumps full evidence history.

## Warning status

Warning is a separate safe semantic from judgement.

Equivalent DTO:

```ts
{ state: "usable"; statusRef: "intel.warning.usable" }
| { state: "none"; statusRef: "intel.warning.none-late" }
| { state: "not-emphasised" }
```

Rules:

- at C5 and C6, exactly one of `usable` or `none` is projected;
- at C1–C4, `not-emphasised` is permitted when no warning exists, but any usable warning must be shown;
- warning-none is never inferred from an absent component at C5/C6;
- UI never parses judgement text to infer warning.

The surface must safely support all algebraically legal #100 combinations, including `coercion / weak + usable warning`, even though that combination is not currently producer-reachable.

## Basis-pattern-safe copy

The internal `basisPattern` never appears in JSON.

It selects the exact safe gap/watch mapping in 23C, which distinguishes:

- indicator-only direction;
- diagnostic direction qualified by contrary indicators;
- indicator conflict;
- diagnostic conflict;
- warning overlays.

Two internal histories may share the same judgement sentence but require different gap/watch copy.

## Update explanation

Project at most one material update line.

It may explain:

- new/tasked evidence;
- warning gained/refreshed/lost;
- assessment change;
- public action-space change;
- staleness;
- supersession;
- mixed causes.

Do not expose internal enum labels as a progress meter.

A newly gained/lost warning, newly actionable public case or player-tasked result cannot be suppressed merely because the judgement sentence is unchanged.

# 7. Public attribution projection

Do **not** expose a `none → tentative → credible` ladder. That would turn the internal public-case reducer into another player-facing meter.

Before source use, normal Command Room exposes either:

```ts
{ state: "unavailable" }
```

or, only when the current #100 basis is credibly corroborated and #101 source use is unspent:

```ts
{
  state: "available"
  claimRef: "intel.public-claim.preparation" | "intel.public-claim.coercion"
  sourceCostRef: string
}
```

The raw basis direction/support IDs remain internal. Safe claim copy tells the player what can be substantiated.

After use, public state/debrief may expose:

```ts
{
  state: "used"
  claimRef: "intel.public-claim.preparation" | "intel.public-claim.coercion"
  usedCycle: 5 | 6
}
```

Later evidence/terminal truth never rewrites the used claim.

A generic subjectless “credible case” is invalid.

# 8. Public campaign state

Safe summaries may include:

- Beacon exposure/preparation;
- reserve;
- partner consent;
- consultation promise/channel;
- C5 partner authority;
- political concession;
- liaison obligation;
- Lattice progress/operational/unreachable;
- used Lattice target IDs as safe history;
- current public-claim opportunity as absent/available/used safe form.

# 9. Safe terminal crisis family

At C6 expose only:

- `seizure-underway`;
- `threshold-confrontation`;
- `pressure-receding`.

Never raw #99 terminal action IDs/rows.

The intelligence section is labelled as the pre-manifestation picture and remains separate from the overt crisis.

# 10. Agenda issue and alternative

For each issue expose:

- issue ID/title/why now;
- responsible officer;
- intended/recommended course/copy;
- decisive reasons;
- visible concern/dissent;
- legal alternatives/copy;
- Defer availability;
- `requiresIntervention` / normal attention cost;
- known immediate/commitment/source cost;
- safe package requirement/conflict refs.

UI never infers exceptional authority from labels/copy.

Exactly these may project `requiresIntervention = true`:

- C2 `public-accusation`;
- C4 `request-partner-liaison`;
- C5 `use-attribution`.

None appears as staff intended course.

C5 attribution Use copy includes:

- the exact safe current claim;
- one-shot nature;
- protected-source exposure;
- compatible authority requirement;
- one normal intervention.

# 11. Lattice Task Collection projection

When Lattice is operational, project a separate zero-normal-intervention task object equivalent to:

```ts
{
  kind: "task-collection"
  cycle: 4 | 5
  recommendedTargetId: "landing-force-staging" | "auxiliary-tasking" | "operational-sequence"
  eligibleTargets: readonly Array<{
    targetId: string
    questionRef: string
    purposeRef: string
  }>
  attentionCost: 0
}
```

Rules:

- exactly one HQ-recommended unused target;
- no `collect nothing` target;
- no already-used target;
- C5 eligible set excludes the C4 target;
- focused staging does not remove landing;
- hidden result branches/selector facts are absent.

The browser may submit only an optional override:

```ts
{ taskTargetOverride: targetId } | { taskTargetOverride: null }
```

`null` means accept the authoritative HQ recommendation. The browser never submits the final delegated target as authority.

Sim resolves/persists the final target under #102 and independently validates eligibility.

# 12. Consequence projection

May include:

- cycle/revision;
- 1–5 material safe beats;
- safe causality;
- player/history callbacks;
- updated public state/authority;
- intelligence update/warning status where material;
- unresolved pressure;
- safe progression action.

Private truth provenance is discarded before serialization.

Terminal consequence projection uses post-route state.

# 13. Terminal debrief

Only terminal-complete replay-valid session receives terminal truth.

## `whatHqBelieved`

Reconstruct historical player-safe briefs exactly, including:

- judgement;
- bounded basis/contrary entries with source/limitations;
- gap/watch;
- warning status as it existed;
- material update line;
- safe public claim available/used at that point.

Stale/superseded evidence remains reconstructible historically. Terminal truth cannot rewrite it.

## `whatActuallyHappened`

May explain opening posture, transitions, preparation progression, genuine/deceptive signals, final policy reason and route interaction through dedicated debrief-safe fields.

Never serialize raw private session/world.

If attribution was used, preserve the claim actually made separately from terminal truth.

# 14. Hidden-truth non-interference

Normal browser/headless paths receive parsed strict safe DTOs only; no debug-truth flag.

Paired sessions with different hidden truth but identical legitimate evidence/public/standing/capability/observable inputs must project deep-equal normal semantics.

If hidden truth changes a legitimate observation first, safe DTO may differ only through that path.

# 15. Mutation boundary

Player may submit only:

- opening standing choices;
- issue dispositions/intervention order IDs;
- optional legal Lattice target override;
- final terminal course;
- `expectedRevision`.

Player may not submit:

- recommendation/delegated final order;
- final delegated Lattice target;
- consequence patches;
- HQ evidence/assessment/warning/public-case state;
- public claim direction/support basis;
- Ravellan state/action;
- partner-authority result;
- terminal outcome.

# 16. Cross-issue refs

DTO may expose safe refs such as:

- personal intervention required;
- visible action needs compatible partner authority;
- attribution spends this specific one-shot source/claim;
- draft conflicts with authority choice.

No hidden prediction.

All-Delegate package is legal by construction. Modified draft may become incompatible; UI may explain/prevent but never silently repair. Server/sim validates.

# 17. Readout/replay stability

A session projected under the same ruleset/content identity reproduces equivalent safe semantics.

The #100 belief model and future #102 collection model participate in Kestrel content identity. Used public claim history is replayable persisted state.

# 18. Required tests

Prove:

- strict schemas reject unknown/private fields;
- raw session/state cannot parse as player DTO;
- opening excludes seeded Ravellan state;
- paired hidden-truth projections equal where legitimate inputs equal;
- no raw action/row/observation/ledger/hash/source-fact/model table leaks;
- no internal picture/diagnostic/basisPattern/public-case enum leaks;
- basis/contrary entries include source context and one/two limitation refs;
- brief bounds hold;
- all 15 algebraic basis-pattern/warning states project valid safe semantics;
- C5/C6 explicit usable/none warning status;
- warning gain/refresh/loss and staleness/supersession updates cannot be silently suppressed;
- public opportunity projects only unavailable/available/used with exact safe claim;
- one-source/tentative internal case never creates an available public action;
- used claim remains stable through debrief;
- exactly three courses require intervention and none is delegable;
- known costs present;
- Lattice object always has one recommended unused target and no no-task/repeat;
- optional override only; client cannot author final delegated target;
- focused staging does not remove landing;
- C5 partner authority safe;
- C6 only safe crisis/pruned routes;
- non-terminal debrief fails closed;
- `whatHqBelieved` equals historical safe semantics rather than hindsight;
- terminal state is post-route;
- V1 DTO/API unchanged.

# 19. Rejection conditions

Reject projection if it:

- serialises raw session/state then redacts in React;
- exposes unused private fields or debug truth;
- leaks confidence/diagnostic/basis/public-case internals;
- omits evidence limitation context;
- hides warning-none at C5/C6;
- silently changes judgement because evidence aged/replaced;
- exposes none/tentative/credible as a progression meter;
- exposes a subjectless public case or lets later truth rewrite a used claim;
- lets client submit final delegated task or no-task/repeat target;
- dumps full evidence history into required play;
- infers commander authority in UI;
- permits exceptional Delegate;
- exposes raw terminal IDs/predicted outcomes;
- accepts client-supplied derived state as authority.
