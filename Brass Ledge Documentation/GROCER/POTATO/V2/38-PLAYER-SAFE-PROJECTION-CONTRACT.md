---
type: v2-player-safe-projection-contract
status: active
---

# Player-Safe Projection Contract

Backlink: [[README]]

This document is the implementation authority for the **V2 server-to-player information boundary** used by #105, #106 and #108. It defines what the browser/headless normal-player path may receive. It does not define hidden simulation state.

## Product purpose

Hidden information should be impossible to leak accidentally because the player projection simply does not contain it.

Do not pass a raw V2 session/campaign object to the browser and rely on React to ignore private fields.

The server/sim derives a dedicated safe projection from:

- HQ belief/evidence;
- public/known campaign state;
- current authoritative agenda/recommendations;
- player-owned standing direction/commitments/capabilities;
- legitimately observable current world effects.

## Never present in normal player DTOs

The projection must not contain, directly or nested:

- Ravellan hidden posture;
- Ravellan hidden seizure-preparation enum;
- raw `AdversaryObservation` records;
- hidden Ravellan action IDs such as `prepare_beacon_seizure` / policy row IDs;
- hidden world-truth provenance;
- oracle/counterfactual state;
- future event/action branches;
- predicted terminal outcome;
- player score/win probability;
- numeric intelligence probability/confidence;
- complete private action ledger/system-transition entries;
- canonical pre/post state hashes/digests not required for safe mutation;
- other private V2 state fields merely because they are serialisable.

The browser may receive `revision`/safe action IDs necessary for authoritative mutation. Those are not hidden game truth.

## Projection modes

Use a discriminated player-safe projection rather than one giant nullable object.

Conceptual modes:

- `opening-intent`;
- `command-room`;
- `consequence-reveal`;
- `terminal-debrief`.

Exact TypeScript names may differ, but schemas must be strict and reject unknown keys.

## Opening-intent projection

May contain only:

- V2 scenario/player-safe identity/title;
- current revision;
- four ordinary-language question/answer IDs needed to submit the immutable standing direction;
- brief known opening situation.

Must not contain Ravellan opening posture/preparation selected from seed.

Submission sends only the authoritative intent declaration values + expected revision.

## Command-room projection

### Header / situation

- cycle number;
- current authoritative revision;
- player-safe situation/change summary refs/text;
- current personal-intervention limit (`2` for prototype) and no authoritative “used” value until a local draft exists;
- safe deadline/commitment/capability notices.

### Standing direction

Return stable player-safe choice IDs / rendered copy for:

- what matters most;
- protected boundary;
- tolerated temporary cost;
- default HQ style.

Do not expose implementation field labels as normal copy, but stable safe IDs may be used by the web client for rendering/tests.

### Intelligence

May contain:

- one `ravellan-intent` player-facing judgement ref/text;
- selected active evidence summary refs safe for display;
- unresolved gap/contradiction refs;
- legal named collection target descriptors when the current authoritative capability/action space exposes them.

Must not contain:

- internal direction/picture-state enums if the web does not need them;
- implication/diagnostic-class fields unless a later advanced-detail surface is explicitly authorised (not required for Kestrel);
- hidden truth source/provenance;
- raw collection-result selector inputs.

Preferred prototype boundary: render-ready judgement/reason/gap refs rather than internal evidence semantics.

### Public campaign state

Expose only player-known summaries needed for strategy, e.g.:

- Beacon current vulnerability summary;
- whether Beacon denial preparation is known complete;
- reserve condition summary;
- partner consent summary;
- consultation promise / liaison obligation in explicit plain-language state;
- Lattice investment progress (`0/3`, `1/3`, `2/3`, operational) and missed/unavailable status;
- attribution opportunity when legitimately known.

These may use dedicated **player-safe enums** distinct from private simulation types where doing so reduces accidental coupling.

Do not expose hidden severe-cost flags whose meaning is only terminal interpretation before they become ordinary known consequences.

### Agenda

For each issue expose:

- stable issue ID;
- title/why-now player copy ref;
- responsible officer safe identity;
- staff intended/recommended order ID and player copy;
- 2–4 decisive reason refs/text;
- visible concern/dissent records;
- authored alternative order IDs/copy;
- whether Defer is legal;
- known immediate cost/commitment copy for each legal alternative where contractually known.

Do not expose:

- course scoring;
- hidden applicability predicates;
- hidden world reasons;
- resolved final delegated order as browser authority beyond the recommendation already displayed.

The browser submits disposition/order IDs only under [[28-COMMAND-ROOM-INTERACTION-CONTRACT]].

### Task / liaison actions

Expose only currently legal safe actions:

- Task Collection target IDs/copy if Lattice operational and target eligible;
- liaison fallback if legally available;
- associated known intervention/obligation cost.

Do not expose result branches or what each target would reveal under hidden truth.

## Consequence-reveal projection

May contain:

- cycle just resolved;
- current revision;
- ordered 1–5 material consequence beats;
- belief-safe cause/attribution text/ref;
- player/history callback refs;
- updated public record summaries;
- unresolved pressure/uncertainty;
- safe progression label/action.

Each beat is already player-safe. Do not send a private provenance enum to the browser merely to let React decide how much truth to reveal.

If internal truth provenance is needed to derive wording, perform that derivation in sim/server and discard private fields from the DTO.

The browser does not need raw pre/post state, ledger entries or hidden event/action records.

## Terminal-debrief projection

Only a terminal-complete, replay-valid session may receive terminal-debrief truth.

The projection contains two explicitly separated sections.

### `whatHqBelieved`

Player-safe reconstruction of major assessment/evidence available at decisive windows.

### `whatActuallyHappened`

Now—and only now—may the projection include dedicated **debrief-safe** truth fields such as:

- opening Ravellan posture label/explanation;
- posture-transition explanations;
- preparation progression explanation;
- genuine/deceptive signal explanations;
- final Ravellan policy reason;
- interaction between campaign-built state and final route.

Do not reuse raw private session/world objects even in the terminal debrief. Create explicit debrief DTO fields so future hidden mechanics cannot leak automatically.

No numeric utility/weight exists to expose.

## Server derivation boundary

Prefer pure derivation functions with narrow inputs, conceptually:

- `projectV2OpeningIntent(...)`;
- `projectV2CommandRoom(...)`;
- `projectV2ConsequenceReveal(...)`;
- `projectV2TerminalDebrief(...)`.

Exact names are implementation-owned.

The web app receives only parsed strict player DTOs.

The server must not respond with raw `session.state` alongside the projection “for debugging”. Development diagnostics belong on separate non-player internal tooling that is not reachable from the production player route.

## Hidden-truth non-interference

For command/reveal modes, construct paired authoritative sessions with:

- different hidden Ravellan posture/preparation/world truth;
- same legitimate HQ belief/evidence;
- same public campaign state;
- same standing direction/commitments/capability;
- same observable current world manifestation where the test claims equivalence.

Safe projection must be deep-equal except for noncanonical transport metadata deliberately excluded from comparison.

If hidden truth changes an authorised world manifestation/evidence first, the player projection may then legitimately differ through that safe state. The test must not demand blindness to a fact the player actually observed.

## Terminal truth gating

Test that calling/requesting terminal-debrief projection on a non-terminal session fails closed rather than returning a partially redacted truth object.

Do not rely on the browser hiding a debrief tab.

## Mutation boundary

Player DTOs may include only the identifiers/revision data needed to submit legal actions.

The browser may submit:

- standing-intent choices;
- issue dispositions and selected intervention order IDs;
- legal Task Collection/liaison target ID where applicable;
- final terminal course;
- `expectedRevision`.

It may not submit:

- recommendation reasons as authority;
- delegated final order output;
- consequence state patches;
- HQ belief assessment;
- Ravellan state/action;
- terminal outcome.

Server/sim recomputes all of those.

## Readout stability / replay

Player-facing prose may be content-ref based, but stable semantic IDs must allow deterministic test assertions.

Do not put locale-dependent rendered strings inside canonical simulation hashes unless existing architecture explicitly requires it. Prefer semantic refs in authoritative/readout state and render copy outside simulation hashing where repository conventions allow.

A replay-valid canonical state must re-project to equivalent player-safe semantics under the same content version.

## Required tests

At minimum prove:

- all projection schemas are `.strict()` / unknown-key rejecting or equivalent;
- raw V2 state/session cannot parse as a player DTO;
- opening projection excludes seeded Ravellan state;
- paired hidden-truth command-room projection deep-equal when HQ/public inputs equal;
- paired consequence projection deep-equal under same visible authoritative result;
- player DTO contains no adversary observation/action/policy row, private ledger/hash, probability/confidence or future branch fields;
- Task Collection DTO exposes target choices but no target result matrix/hidden truth;
- non-terminal terminal-debrief request fails closed;
- terminal debrief exposes only explicit debrief-safe truth fields, not raw world state;
- browser mutation payload cannot include state patches/recommendation/final outcome private data;
- V1 DTO/API contracts remain unchanged.

## Rejection conditions

Reject V2 browser/server integration if it serialises the raw session and redacts in React, exposes private state behind unused JSON fields, permits a debug query flag on the player endpoint to reveal truth, includes predicted events/outcomes, or lets client-submitted derived state become authority.
