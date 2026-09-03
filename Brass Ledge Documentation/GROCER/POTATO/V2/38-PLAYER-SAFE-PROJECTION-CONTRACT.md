---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This is the implementation authority for the V2 server-to-normal-player information boundary used by #104/#105/#106/#108. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] supplies cross-issue authority semantics; [[27-KESTREL-TERMINAL-MATRIX]] owns final route legality.

## Product rule

Hidden information should be impossible to leak accidentally because the normal player DTO simply does not contain it.

Never send raw V2 session/state to browser/headless player adapter and rely on presentation to ignore private fields.

Safe projection derives only from:

- legitimate HQ belief/evidence;
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
- hidden truth provenance;
- private player/system ledger entries;
- pre/post hashes/digests not required for mutation;
- oracle/counterfactual state;
- future branches/predicted terminal result;
- score/win probability;
- numeric intelligence confidence;
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
- personal-attention limit/usage semantics;
- known deadlines/commitment/capability notices.

## Standing direction

Stable safe IDs/copy for chosen directions; normal copy does not require implementation field labels.

## Intelligence

- natural-language judgement;
- selected safe evidence summaries;
- unresolved gaps;
- legal named collection targets.

Do not expose internal diagnostic enum/source truth/target result branches unless explicitly needed by a later safe detail surface (not required by Kestrel).

## Public state

Safe summaries for:

- Beacon vulnerability/preparation;
- reserve;
- partner consent;
- consultation promise/channel;
- C5 partner authority (`pending|none|joint|unilateral|concession`) once relevant;
- political concession;
- liaison obligation;
- Lattice progress/operational/unreachable;
- attribution opportunity when legitimately known.

## Safe terminal crisis family

At C6 expose only:

- `seizure-underway`;
- `threshold-confrontation`;
- `pressure-receding`.

Never raw #99 terminal action IDs.

## Agenda issue / order alternative

For each issue expose:

- issue ID/title/why-now;
- responsible officer;
- intended/recommended order ID/copy;
- decisive reasons;
- visible concern/dissent;
- legal alternatives/copy;
- Defer availability;
- **`requiresIntervention` / personal-attention cost as an authoritative safe semantic on each course where applicable**;
- known immediate/commitment/source cost copy;
- safe cross-issue requirement/conflict refs needed to construct a legal complete package.

The UI must not infer exceptional authority from an order name or prose.

### Exact Kestrel commander-only projection

When legal, these three alternatives must project `requiresIntervention = true` and one normal personal-attention cost:

- C2 `public-accusation`;
- C4 `request-partner-liaison`;
- C5 `use-attribution`.

They must never appear as the `recommendedOrderId` / staff intended course.

Their safe known-cost descriptors must include, as applicable:

- C2 accusation: unsupported/unilateral public accusation, partner/commitment risk;
- liaison: creates explicit liaison obligation;
- C5 attribution use: spends one-shot credible opportunity, exposes/compromises protected source, and requires compatible immediate authority.

These are direct known costs/authority requirements, not predicted hidden outcomes.

No other Kestrel course projects `requiresIntervention = true`.

## Task Collection

Expose eligible Lattice target IDs/copy as separate zero-normal-intervention action. Never hidden result table/selector facts.

# Consequence projection

May include:

- cycle resolved/revision;
- 1–5 material safe beats;
- safe cause/attribution;
- player/history callbacks;
- updated public state/authority summaries;
- unresolved pressure;
- safe progression action.

Private truth provenance is used during derivation then discarded.

Terminal consequence projection must show post-route reserve/partner/attribution/source-cost state, not pre-route campaign state.

# Terminal debrief

Only terminal-complete replay-valid session receives terminal truth.

Two explicit sections:

### `whatHqBelieved`

Major assessment/evidence available at decisive windows.

### `whatActuallyHappened`

Dedicated debrief-safe truth may explain opening posture, transitions, preparation progression, genuine/deceptive signals, final policy reason and final route interaction.

Never serialize raw private session/world even here.

# Derivation / hidden-truth non-interference

Use pure narrow projection functions. Normal browser/headless player path receives parsed strict safe DTOs only; no debug truth flag.

Paired sessions with different hidden truth but same legitimate HQ/public/standing/capability/observable inputs must project deep-equal normal semantics.

If hidden truth changes a legitimate observable fact first, safe DTO may then differ through that fact.

Collection selectors obey the stricter posture-blind rules from `23`/`26`/`39`.

# Mutation boundary

Player may submit only:

- opening standing choices;
- issue dispositions / intervention order IDs;
- legal Task Collection target;
- final terminal course;
- `expectedRevision`.

It may not submit recommendation, delegated final order, consequence patches, HQ belief, Ravellan state/action, partner-authority result or terminal outcome.

`requiresIntervention` is read-only server-derived authority metadata; client cannot downgrade it or submit a commander-only order as Delegate.

# Cross-issue package refs

DTO may expose safe refs such as:

- this course requires personal intervention;
- this visible action needs compatible partner authority;
- public attribution spends source/opportunity;
- this draft combination conflicts with current authority choice.

No hidden truth/predicted outcome.

All-Delegate package is legal by construction; changed draft may become incompatible. UI may explain/prevent but never silently repair; server validates.

# Readout/replay stability

Prefer stable semantic refs rather than locale strings in canonical hashes. Replay-valid state reprojects equivalent safe semantics under same content version.

# Required tests

At minimum prove:

- strict schemas reject private/unknown fields;
- raw V2 session/state cannot parse as player DTO;
- opening excludes seeded Ravellan state;
- paired hidden-truth normal projections equal when legitimate inputs equal;
- no raw adversary action/observation/row/ledger/hash/probability/future branch leaks;
- **exactly three Kestrel courses project `requiresIntervention = true`: accusation, liaison, attribution use**;
- none of those three can appear as staff recommendation;
- browser mutation cannot submit any of them as Delegate;
- known cost descriptors for each are present without hidden-outcome leakage;
- Task Collection exposes target choices but zero normal intervention and no hidden result branch;
- C5 partner-authority/requirement state safe;
- C6 only safe crisis family/pruned route set;
- non-terminal debrief request fails closed;
- terminal truth only explicit debrief-safe fields;
- terminal consequence state is post-route;
- V1 DTO/API unchanged.

## Rejection conditions

Reject V2 projection if it serialises raw session/state then redacts in React, exposes private state in unused JSON, permits player debug truth, makes UI infer commander-only authority from labels, omits the one-token requirement for any exceptional course, allows client to submit exceptional course as Delegate, exposes raw #99 terminal IDs/predicted outcomes or lets client-supplied derived state become authority.
