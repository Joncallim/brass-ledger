---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This document is the implementation authority for the V2 server-to-normal-player information boundary used by #104/#105/#106/#108. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] supplies additional safe cross-issue/terminal semantics.

## Product rule

Hidden information should be impossible to leak accidentally because the normal player DTO simply does not contain it.

Never send a raw V2 session/state to the browser/headless player adapter and rely on presentation code to ignore private fields.

The safe projection derives only from:

- HQ belief/evidence already legitimate for the player;
- public/known campaign records;
- player-owned standing direction/known commitments/capability;
- current authoritative agenda/recommendations;
- legitimately observable current world/crisis effects.

## Forbidden in normal player DTOs

No direct or nested:

- hidden Ravellan posture;
- hidden seizure-preparation enum;
- raw `AdversaryObservation` records;
- Ravellan normal/terminal action IDs or policy-row IDs;
- raw collection selector inputs/action history;
- hidden truth provenance;
- private action/system ledger entries;
- pre/post state hashes/digests not needed for safe mutation;
- oracle/counterfactual state;
- future event/action branches or predicted terminal result;
- player score/win probability;
- numeric intelligence probability/confidence;
- raw simulation state fields merely because they are serialisable.

`revision`, safe issue/order/action IDs and player-safe state enums are allowed where required for authoritative interaction.

## Strict discriminated modes

Use strict unknown-key-rejecting schemas equivalent to:

- `opening-intent`;
- `command-room`;
- `consequence-reveal`;
- `terminal-debrief`.

Do not use one giant nullable raw-state DTO.

## Opening intent

May contain:

- player-safe scenario identity/title;
- revision;
- the four ordinary-language standing-direction question/answer IDs;
- brief known opening situation.

Must exclude seeded Ravellan state.

## Command Room projection

### Header

Expose:

- cycle;
- revision;
- safe situation/change refs/text;
- prototype personal-attention limit;
- known deadlines/commitment/capability notices.

### Standing direction

Expose player-safe IDs/copy for the four chosen directions. Normal copy must not require implementation field labels.

### Intelligence

Expose:

- player-facing `ravellan-intent` judgement ref/text;
- selected active evidence summaries;
- unresolved gap/contradiction refs;
- currently legal named collection targets.

Prefer render-ready semantic refs rather than internal direction/picture/diagnostic enums. Never expose hidden source truth or target-result branches.

### Public Kestrel state

Expose belief/public summaries for:

- Beacon vulnerability;
- known Beacon denial preparation;
- reserve condition;
- partner consent;
- consultation promise;
- **Cycle-5 partner authority** (`pending`, `none`, `joint`, `unilateral`, `concession`) in ordinary player language once relevant;
- political concession;
- liaison obligation;
- Lattice progress/operational/unreachable status;
- attribution opportunity when legitimately known.

These may use dedicated safe enums/copy distinct from private simulation types.

### Observable terminal crisis family

At Cycle 6 expose only the safe family from [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]:

- `seizure-underway`;
- `threshold-confrontation`;
- `pressure-receding`.

Do **not** expose raw #99 `attempt_seizure`, `threshold_challenge` or `abort_and_pressure` IDs in the normal player/recommendation DTO. The safe family communicates the overt current event while preserving prior hidden history until debrief.

### Agenda issue

For each issue expose only:

- stable issue ID/title/why-now;
- responsible officer safe identity;
- staff intended/recommended order ID/copy;
- 2–4 decisive reason refs/text;
- visible concern/dissent;
- authored alternatives/copy;
- Defer availability;
- `requiresIntervention` / personal-attention cost where authored;
- known immediate cost/commitment copy;
- safe cross-issue **requirement/conflict refs** necessary to construct a legal complete atomic command set under 39.

Requirement/conflict refs may state things like “this visible action needs a partner-authority choice that permits it.” They may not explain hidden Ravellan state or future outcomes.

Do not expose hidden applicability predicates, course scores or private reasoning.

### Task / liaison

Expose only currently legal safe actions and known costs:

- eligible Lattice target IDs/copy;
- liaison fallback when legal, explicitly marked as consuming one personal intervention and creating the known obligation.

Never expose what hidden condition would produce each collection result.

## Consequence Reveal projection

May contain:

- cycle resolved;
- revision;
- ordered 1–5 material belief-safe consequence beats;
- safe cause/attribution text/ref;
- player/history callbacks;
- updated public state summaries including partner authority where relevant;
- unresolved pressure/uncertainty;
- safe progression label/action.

Private truth provenance is consumed during derivation and discarded before DTO serialization.

After Cycle 6, final reserve/partner/attribution summaries must reflect the **post-route authoritative state** from 39, not merely the pre-route campaign state.

## Terminal debrief

Only a terminal-complete, replay-valid session may receive terminal truth.

Use two explicit sections:

### `whatHqBelieved`

Reconstruct the major assessment/evidence legitimately available at decisive windows.

### `whatActuallyHappened`

Dedicated debrief-safe truth fields may now explain:

- opening Ravellan posture;
- posture transitions;
- preparation progression;
- genuine/deceptive signals;
- final policy reason;
- how the campaign-built state/final route produced the outcome.

Do not serialize raw private session/world objects even here.

## Safe derivation boundary

Prefer pure, narrow functions conceptually equivalent to:

- opening projection;
- command-room projection;
- consequence projection;
- terminal-debrief projection.

The server/headless normal-player path receives parsed strict safe DTOs only.

No `debug=true` player endpoint may append raw truth/state.

## Hidden-truth non-interference

For command/reveal modes, paired sessions with different hidden posture/preparation but identical legitimate HQ/public/standing/capability/observable inputs must project deep-equal safe semantics.

If hidden truth first changes a legitimately observable manifestation/evidence, safe projection may then differ through that public state. Tests must not demand blindness to facts actually observed.

Collection isolation is stricter: target selectors themselves obey the posture-blind rules in 39.

## Terminal truth gating

Requesting terminal-debrief truth before terminal completion fails closed. Browser tab visibility is not a security boundary.

## Mutation boundary

Player may submit only authorised player authority:

- opening standing choices;
- issue dispositions/selected intervention orders;
- legal task/liaison target ID;
- final terminal course;
- `expectedRevision`.

Player may not submit recommendation reasons, delegated final order output, consequence patches, HQ assessment, Ravellan state/action, partner-authority result, terminal outcome or arbitrary state.

Server/sim recomputes all derived/system results.

## Cross-issue draft semantics

The safe DTO may contain requirement/conflict refs, but the browser does not own the rule.

Under 39:

- the untouched all-Delegate staff package is always legal;
- a player's changed draft may become incompatible;
- UI may prevent submission/explain the conflict;
- it must never silently change another issue to repair the draft;
- server remains final validator.

## Readout/replay stability

Prefer stable semantic refs in authoritative/readout state and render prose outside canonical hashes where repository conventions allow.

A replay-valid canonical state must reproduce equivalent safe semantics under the same content version.

## Required tests

At minimum prove:

- strict schemas reject unknown/private fields;
- raw V2 session/state cannot parse as a player DTO;
- opening projection excludes seeded Ravellan state;
- paired hidden-truth command/reveal projections are equal when legitimate inputs equal;
- no raw adversary action/observation/policy row/private ledger/hash/probability/future branch leaks;
- target DTOs expose choices/costs but no hidden result matrix;
- liaison is visibly one personal intervention and never looks delegated;
- C5 partner-authority safe state/requirements are available without raw private state;
- Cycle-6 projection exposes only safe crisis family;
- invalid cross-issue draft can be explained without leaking hidden truth;
- non-terminal debrief request fails closed;
- terminal debrief contains only explicit debrief-safe truth fields;
- terminal consequence state reflects post-route state;
- client cannot submit system/derived fields as authority;
- V1 DTO/API contracts remain unchanged.

## Rejection conditions

Reject V2 integration if it serialises raw session/state and redacts in React, exposes private state in unused JSON, permits a player debug truth flag, exposes raw #99 terminal action IDs, includes predicted outcomes, or lets client-submitted derived state become authority.