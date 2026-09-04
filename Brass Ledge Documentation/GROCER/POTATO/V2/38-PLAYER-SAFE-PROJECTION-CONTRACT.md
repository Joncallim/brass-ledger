---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This is the implementation authority for the V2 server-to-normal-player information boundary. [[23-HQ-BELIEF-AND-EVIDENCE]] owns the HQ intelligence semantics, [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns cross-issue authority semantics, and [[27-KESTREL-TERMINAL-MATRIX]] owns final route legality.

# Product rule

Hidden information should be impossible to leak accidentally because the normal player DTO simply does not contain it.

Never send raw V2 session/state to browser/headless player adapter and rely on presentation to ignore private fields.

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
- raw evidence selector facts;
- hidden truth provenance;
- private player/system ledger entries;
- pre/post hashes/digests not required for mutation;
- oracle/counterfactual state;
- future branches/predicted terminal result;
- score/win probability;
- numeric intelligence confidence;
- internal `weak/conflicted/coherent` picture labels;
- internal evidence `indicator/diagnostic` labels;
- internal public-case-basis enum before a later campaign rule turns it into a legitimate public opportunity;
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

## Intelligence Chief brief

The normal intelligence surface is **bounded and decision-oriented**, not an evidence dashboard.

Expose safe refs equivalent to:

- one `judgementRef`;
- max two `basisEvidenceRefs`;
- max one `contraryEvidenceRef`;
- exactly one `keyGapRef`;
- zero/one `watchForRef`;
- zero/one `assessmentChangeRef` when analysis materially changed;
- zero/one safe `warningRef` when tactical warning is operationally material;
- legal named collection targets/questions supplied through agenda/capability authority.

Do not expose the raw full evidence history in the required command path.

### Warning presentation

Warning is a separate safe semantic from the broader judgement.

Examples of preserved meaning:

- warning none: do not invent “low warning” or a percentage;
- warning usable: “We have direct movement worth acting on, even though the wider picture may still be disputed.”

The exact player copy is content-owned.

A normal player must be able to encounter:

- preparation judgement with **no** usable warning;
- conflicted judgement **with** usable warning.

The UI may never infer warning from preparation wording.

### Assessment-change presentation

Show a short change ref only when useful, e.g. “The picture has narrowed toward preparation” or “The indicators are now in conflict.”

Do not display the internal change enum as a score/history ladder.

### Public-case basis

#100's internal `none|tentative|credible-source-sensitive` basis is not directly exposed as a normal player enum.

Later #101 may expose a legitimate public attribution opportunity when campaign rules derive one. Until then, the normal brief can say only what the authorised evidence summaries themselves support; it must not advertise a hidden “credible” threshold.

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
- attribution opportunity when legitimately known under later campaign authority.

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
- `requiresIntervention` / personal-attention cost as authoritative safe semantic where applicable;
- known immediate/commitment/source cost copy;
- safe cross-issue requirement/conflict refs needed for a legal complete package.

UI must not infer exceptional authority from an order name/prose.

### Exact Kestrel commander-only projection

When legal, exactly these three alternatives project `requiresIntervention = true` and one normal personal-attention cost:

- C2 `public-accusation`;
- C4 `request-partner-liaison`;
- C5 `use-attribution`.

They never appear as the staff intended course.

Safe known-cost descriptors include, where applicable:

- C2 accusation: unsupported/unilateral public accusation, partner/commitment risk;
- liaison: explicit liaison obligation;
- C5 attribution use: one-shot opportunity, protected-source exposure, compatible immediate authority.

No other Kestrel course projects this flag.

## Task Collection

Expose eligible Lattice target IDs/copy as a separate zero-normal-intervention action. Never hidden result tables/selector facts.

# Consequence projection

May include:

- cycle resolved/revision;
- 1–5 material safe beats;
- safe cause/attribution;
- player/history callbacks;
- updated public state/authority summaries;
- unresolved pressure;
- safe progression action.

Private truth provenance is discarded before serialization.

Terminal consequence projection shows post-route reserve/partner/attribution/source-cost state, not pre-route state.

# Terminal debrief

Only terminal-complete replay-valid session receives terminal truth.

Two explicit sections:

## `whatHqBelieved`

Reconstruct, from [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], the major **player-safe** Intelligence-Chief briefs available at decisive cycles, including warning where it existed.

Do not rewrite history using the terminal truth.

## `whatActuallyHappened`

Dedicated debrief-safe truth may explain opening posture, transitions, preparation progression, genuine/deceptive signals, final policy reason and final-route interaction.

Never serialize raw private session/world even here.

# Derivation / hidden-truth non-interference

Use pure narrow projection functions. Normal browser/headless player path receives parsed strict safe DTOs only; no debug truth flag.

Paired sessions with different hidden truth but the same legitimate HQ evidence/public/standing/capability/observable inputs must project deep-equal normal semantics.

If hidden truth changes a legitimate observation first, safe DTO may then differ only through that observation/evidence path.

Collection selectors obey the stricter posture-blind rules in [[23-HQ-BELIEF-AND-EVIDENCE]], [[26-LATTICE-COLLECTION-MATRIX]] and [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

# Mutation boundary

Player may submit only:

- opening standing choices;
- issue dispositions/intervention order IDs;
- legal Task Collection target;
- final terminal course;
- `expectedRevision`.

It may not submit recommendation, delegated final order, consequence patches, HQ evidence/assessment/warning, Ravellan state/action, partner-authority result or terminal outcome.

`requiresIntervention` is read-only server-derived authority metadata; client cannot downgrade it or submit a commander-only order as Delegate.

# Cross-issue package refs

DTO may expose safe refs such as:

- this course requires personal intervention;
- this visible action needs compatible partner authority;
- public attribution spends source/opportunity;
- this draft combination conflicts with current authority choice.

No hidden truth/predicted outcome.

All-Delegate package is legal by construction; changed draft may become incompatible. UI may explain/prevent but never silently repair; server validates.

# Readout / replay stability

Prefer stable semantic refs rather than locale prose in derived canonical content.

A session projected under the same ruleset/content identity must reproduce equivalent safe semantics.

The #100 evidence model/readout refs participate in Kestrel's canonical content identity under [[23-HQ-BELIEF-AND-EVIDENCE]] / [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

# Required tests

At minimum prove:

- strict schemas reject private/unknown fields;
- raw V2 session/state cannot parse as player DTO;
- opening excludes seeded Ravellan state;
- paired hidden-truth normal projections equal when legitimate inputs equal;
- no raw adversary action/observation/row/ledger/hash/probability/future branch leaks;
- no internal picture/diagnostic/public-case enum leaks;
- Intelligence-Chief brief respects 2-basis/1-contrary/1-gap/1-watch-for bounds;
- preparation assessment with warning none is rendered distinctly from usable warning;
- conflicted assessment with warning usable is representable safely;
- browser cannot infer warning from judgement text;
- exactly three Kestrel courses project `requiresIntervention = true`;
- none of those three is staff recommendation or delegable;
- known cost descriptors are present without hidden-outcome leakage;
- Task Collection exposes choices/zero normal intervention but no hidden result branch;
- C5 partner-authority state safe;
- C6 only safe crisis family/pruned route set;
- non-terminal debrief request fails closed;
- terminal `whatHqBelieved` reconstructs historical player-safe briefs rather than terminal-truth-corrected analysis;
- terminal truth only explicit debrief-safe fields;
- terminal consequence state is post-route;
- V1 DTO/API unchanged.

# Rejection conditions

Reject V2 projection if it serialises raw session/state then redacts in React, exposes private state in unused JSON, permits player debug truth, leaks internal confidence/diagnostic/public-case enums, infers tactical warning from judgement copy, dumps the full evidence ledger into required play, lets UI infer commander-only authority, omits exceptional-action costs, permits exceptional course as Delegate, exposes raw #99 terminal IDs/predicted outcomes or lets client-supplied derived state become authority.
