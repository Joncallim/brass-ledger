---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This is the implementation authority for the V2 server-to-normal-player information boundary. [[23-HQ-BELIEF-AND-EVIDENCE]] owns HQ intelligence semantics, [[25-KESTREL-CONSEQUENCE-MATRIX]] owns persisted directional attribution state, [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-issue authority and [[27-KESTREL-TERMINAL-MATRIX]] owns final route legality.

# Product rule

Hidden information should be impossible to leak accidentally because the normal player DTO simply does not contain it.

Never send raw V2 session/state to browser/headless and rely on presentation to ignore private fields.

Safe projection derives only from:

- derived HQ player-safe intelligence brief;
- public/known campaign records;
- standing direction/known commitments/capability;
- authoritative agenda/recommendations;
- legitimately observable world/crisis effects.

# Forbidden normal-player fields

No direct/nested:

- hidden Ravellan posture;
- hidden seizure-preparation enum;
- raw `AdversaryObservation`;
- raw Ravellan action/policy-row IDs;
- raw collection selector inputs/action history;
- raw #100 source facts;
- raw evidence-definition lookup tables;
- private player/system ledger entries;
- pre/post hashes/digests not required for mutation;
- oracle/counterfactual state;
- future branches/predicted terminal result;
- score/win probability;
- numeric/categorical intelligence confidence;
- internal `weak/conflicted/coherent` labels;
- internal `indicator/diagnostic` labels;
- internal public-case-basis enum before #101 creates a legitimate player-known opportunity;
- raw sim fields merely because serialisable.

Allowed safe authority metadata includes revision, safe issue/order IDs, public state enums and explicit personal-attention requirement.

# Strict modes

Use strict unknown-key-rejecting discriminated schemas equivalent to:

- opening-intent;
- command-room;
- consequence-reveal;
- terminal-debrief.

No giant nullable raw-state DTO.

# Opening intent

May include player-safe scenario identity/title, revision, four question/answer IDs/copy and known opening situation. Never seeded Ravellan state.

# Command Room projection

## Header

- cycle;
- revision;
- safe situation/change;
- personal-attention limit/usage;
- known deadlines/commitment/capability notices.

## Standing direction

Stable safe IDs/copy only.

## Intelligence Chief brief

The normal intelligence surface is **bounded and decision-oriented**, not an evidence dashboard.

Expose safe semantics equivalent to:

- one `judgementRef`;
- max two basis entries;
- max one contrary entry;
- exactly one `keyGapRef`;
- zero/one `watchForRef`;
- zero/one `assessmentChangeRef` when materially changed;
- zero/one `warningRef` when tactical warning is material;
- legal named collection questions supplied through capability authority.

A basis/contrary entry may contain only player-safe refs equivalent to:

```ts
{
  summaryRef: string
  sourceContextRef: string
}
```

`sourceContextRef` tells the player the collection/method context in ordinary language, for example:

- routine coverage;
- focused collection;
- dedicated Lattice collection;
- partner liaison/reporting.

It is **not** a reliability/confidence score.

Do not expose full evidence history on the required path.

### Warning presentation

Warning is separate from broader judgement.

Preserved meanings:

- warning none — do not invent “low warning” or percentage;
- warning usable — “We have direct movement worth acting on, even though the wider picture may still be disputed.”

Normal player must be able to encounter:

- preparation judgement with no usable warning;
- conflicted judgement with usable warning.

UI never infers warning from judgement prose.

### Assessment-change presentation

Show one short line only when useful.

The line must explain **why** the picture changed when the cause is player-relevant:

- new evidence;
- earlier information becoming stale;
- a newer observation superseding an older report;
- mixed causes.

Examples of preserved meaning:

- “Focused collection has narrowed the picture toward preparation.”
- “Our earlier staging report is now too old to lean on.”
- “The new direct observation replaces the earlier routine picture.”

Do not expose the internal change/change-cause enums as a meter or timeline ladder.

### Public case / attribution opportunity

#100's internal basis enum is not directly exposed.

When #101 has created a legitimate player-known opportunity, expose a safe discriminated summary equivalent to:

```ts
{ state: "none" | "tentative" }
| {
    state: "credible" | "used"
    claimRef: string
  }
```

The `claimRef` must preserve what the case actually substantiates, e.g.:

- “We can substantiate a real seizure-preparation sequence.”
- “We can substantiate a coercive/deceptive pressure operation.”

Do not expose raw internal direction enum if content architecture already provides a safe semantic ref.

A generic “credible case” label with no subject is rejected.

If state is `used`, preserve the safe claim label for consequences/debrief; later evidence may not silently rewrite what was publicly claimed.

# Public state

Safe summaries for:

- Beacon exposure/preparation;
- reserve;
- partner consent;
- consultation promise/channel;
- C5 partner authority;
- political concession;
- liaison obligation;
- Lattice progress/operational/unreachable;
- attribution opportunity + safe claim label when legitimately known.

# Safe terminal crisis family

At C6 expose only:

- seizure-underway;
- threshold-confrontation;
- pressure-receding.

Never raw #99 terminal action IDs.

# Agenda issue / alternative

For each issue expose:

- issue ID/title/why now;
- responsible officer;
- intended/recommended course/copy;
- decisive reasons;
- visible concern/dissent;
- legal alternatives/copy;
- Defer availability;
- `requiresIntervention` / attention cost where applicable;
- known immediate/commitment/source cost;
- safe cross-issue requirement/conflict refs.

UI must not infer exceptional authority from labels/prose.

## Exact commander-only projection

Exactly these three may project `requiresIntervention = true`:

- C2 public-accusation;
- C4 request-partner-liaison;
- C5 use-attribution.

They never appear as staff intended course.

For C5 attribution use, safe copy must include:

- one-shot opportunity;
- protected-source exposure;
- compatible immediate authority;
- the **specific current credible claim** being exposed.

# Task Collection

Expose eligible target IDs/copy as separate zero-normal-intervention action.

Do not expose hidden result tables/selector facts.

If retasking the same target is currently legal under #102, UI may show it again; the copy should make clear that the commander is **rechecking/updating the same question**, not gaining another additive bonus.

# Consequence projection

May include:

- cycle resolved/revision;
- 1–5 material safe beats;
- safe causal attribution;
- player/history callbacks;
- updated public state/authority summaries;
- updated intelligence change/warning where material;
- unresolved pressure;
- safe progression action.

Private truth provenance discarded before serialization.

Terminal consequence projection uses post-route state.

# Terminal debrief

Only terminal-complete replay-valid session receives terminal truth.

## `whatHqBelieved`

Reconstruct major **player-safe historical** briefs from [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

Include where material:

- judgement;
- bounded basis/contrary entries with source context;
- gap/watch-for;
- warning;
- assessment-change line as it appeared then;
- safe public-case claim/opportunity state available then.

Stale/superseded historical evidence remains reconstructible; terminal truth cannot rewrite or delete what HQ actually had at the time.

## `whatActuallyHappened`

Dedicated debrief-safe truth may explain opening posture, transitions, preparation progression, genuine/deceptive signals, final policy reason and final-route interaction.

Never serialize raw private session/world even here.

If the commander publicly used attribution, debrief must preserve the **claim actually used** separately from what terminal truth later showed.

# Hidden-truth non-interference

Use pure narrow projection functions. Normal browser/headless path receives parsed strict safe DTOs only; no debug truth flag.

Paired sessions with different hidden truth but identical legitimate HQ evidence/public/standing/capability/observable inputs must project deep-equal normal semantics.

If hidden truth first changes a legitimate observation, safe DTO may differ only through that path.

# Mutation boundary

Player may submit only:

- opening standing choices;
- issue dispositions/intervention order IDs;
- legal Task Collection target;
- final terminal course;
- expectedRevision.

Player may not submit recommendation, delegated final order, consequence patches, HQ evidence/assessment/warning/public-case state, Ravellan state/action, partner-authority result or terminal outcome.

`requiresIntervention` is read-only server-derived authority metadata.

# Cross-issue refs

DTO may expose safe refs such as:

- personal intervention required;
- visible action needs compatible partner authority;
- public attribution spends this specific one-shot source/case;
- draft conflicts with authority choice.

No hidden truth/predicted outcome.

All-Delegate package is legal by construction; changed draft may become incompatible. UI may explain/prevent but never silently repair; server validates.

# Readout / replay stability

Prefer stable semantic refs rather than locale prose in canonical derived content.

A session projected under same ruleset/content identity must reproduce equivalent safe semantics.

The #100 evidence/readout model and #101 directional attribution semantics participate in Kestrel content/replay identity under their owning contracts.

# Required tests

At minimum prove:

- strict schemas reject private/unknown fields;
- raw V2 session/state cannot parse as player DTO;
- opening excludes seeded Ravellan state;
- paired hidden-truth projections equal when legitimate inputs equal;
- no raw adversary action/observation/row/ledger/hash/future branch leaks;
- no raw #100 source facts/model tables/internal picture/diagnostic/public-case enum leaks;
- every directional basis entry includes safe sourceContextRef;
- Intel brief respects 2-basis/1-contrary/1-gap/1-watch-for bounds;
- preparation assessment + warning none distinct from usable warning;
- conflicted assessment + warning usable representable;
- browser cannot infer warning from judgement text;
- staleness-driven assessment change explains staleness rather than silently changing wording;
- supersession-driven change explains replacement;
- credible attribution exposes a **specific safe claim label**, never generic directionless credible;
- used claim label remains stable through terminal debrief;
- exactly three Kestrel courses project requiresIntervention;
- none of them recommendation/delegable;
- known cost descriptors present without hidden outcome leakage;
- Task Collection exposes zero-token choices and legal retask semantics but no hidden result branch;
- C5 partner-authority safe;
- C6 only safe crisis family/pruned routes;
- non-terminal debrief request fails closed;
- terminal whatHqBelieved equals historical safe semantics rather than hindsight;
- terminal truth only explicit debrief-safe fields;
- terminal consequence state post-route;
- V1 DTO/API unchanged.

# Rejection conditions

Reject V2 projection if it serialises raw session/state then redacts in React, exposes unused private state, permits debug truth, leaks confidence/diagnostic/public-case internals, omits source/method context entirely, silently changes judgement because evidence aged out, infers warning from judgement copy, exposes a generic directionless credible attribution case, lets later evidence rewrite the claim already used publicly, dumps full evidence history into required play, lets UI infer commander authority, omits known costs, permits exceptional course through Delegate, exposes raw #99 terminal IDs/predicted outcomes or lets client-supplied derived state become authority.
