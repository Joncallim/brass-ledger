---
type: v2-architecture-contract
status: active
---

# V2 Architecture Contract

Backlink: [[README]]

## Boundaries

`packages/shared` owns serialisable Zod contracts and pure derived readout types.
`packages/content` owns authored Kestrel data and validation. `packages/sim` owns
deterministic transitions, recommendation derivation, adversary policy, belief
update, consequence progression, terminal resolution and replay validation.
`packages/headless` owns non-browser campaign/laboratory execution. `apps/server`
owns session mutation, expectedRevision checks, save persistence, scenario
resolution and strict player-safe projection delivery. `apps/web` renders only
the safe projection and submits player authority; it never receives raw V2 state.

World truth, HQ belief, campaign/institution state, and presentation may be
represented with nested contracts but must have separate types/fields and
explicit transition/derivation functions.

World truth is persisted/replayable and may be read only by world/external/
consequence/explicit observation functions that are authorised to inspect it.

Adversary policy may read only cycle, its own persisted posture/preparation, and
its separate persisted `AdversaryObservation` projection; identity and seed are
initialisation-only under [[22-RAVELLAN-EXECUTABLE-POLICY]].

HQ evidence/assessment follows [[23-HQ-BELIEF-AND-EVIDENCE]] and is the only
intelligence input to recommendations/player-visible intelligence. Directed
collection may inspect only the specific world/action-history facts authorised
by [[26-LATTICE-COLLECTION-MATRIX]], then produces ordinary HQ evidence.

Presentation must never derive hidden facts locally. The browser/server boundary
is [[38-PLAYER-SAFE-PROJECTION-CONTRACT]].

## Replay and compatibility

V2 is a versioned ruleset, not an in-place reinterpretation of V1 campaigns.
V1 schemas, sessions, import/export and replay remain supported under their
existing versions. V1 sessions are never silently migrated to V2.

V2 replay rebuilds from canonical initial state plus the complete authoritative
ordered action/system ledger, verifies every persisted pre/post transition and
compares final state.

Its canonical digest is a full SHA-256 of stable key-sorted JSON tagged `v2`,
covering ruleset/content identity, action sequence, pre-state, post-state and
final state. V2 identity contains immutable canonical content digest plus explicit
ruleset version; import rejects a live-registry mismatch before replay. Seeded
selection is allowed only where a canonical contract explicitly authorises it.

The required V2 digest envelope remains:

`{ tag, rulesetVersion, contentDigest, initialState, action, preState, postState }`

The final-session digest uses the same envelope with the complete ordered ledger
and reconstructed final state.

## Prototype format-version rule

Pre-gate V2 formats are intentionally disposable prototype formats.

Whenever an implementation issue changes any persisted V2 state shape, ledger
entry discriminator/shape, replay transition semantics, or canonical persisted
identity contract, it must:

1. inspect the current live `v2CurrentRulesetVersion`;
2. advance to the next repository-consistent prototype minor version rather than silently accepting the old shape;
3. add paired parsing/import/replay tests proving the previous prototype payload is not silently reinterpreted as the new format;
4. add no migration between prototype formats unless a separate explicit product/engineering decision authorises one;
5. leave V1 parsing/replay behavior unchanged.

Do not freeze a future numeric version in planning docs because #99/#100 etc. may
land sequentially. The implementer chooses the next monotonic prototype version
from the actual committed repository state.

This rule resolves the recurring “does this schema change require a version
boundary?” question: **yes, if canonical persisted/replay semantics changed.**

## Authoritative mutation / ledger invariant

Every authoritative persisted state mutation must satisfy one of exactly two
patterns:

### A. Replay-verifiable ledger transition

The mutation is represented by an explicit canonical ledger entry whose trusted
replay recomputes/validates the transition and state hashes/revision.

### B. Pure derived readout

The value is not persisted as authoritative state at all; it is deterministically
derived from already-verified canonical state/content whenever needed.

There is no third pattern where persisted state changes “between” ledger entries
without replay evidence.

Saved client/browser data is never a substitute for a trusted transition.

## Downstream ledger integration after #99

#99 owns the first-class Ravellan transition and the current canonical
intent/Ravellan/command ordering proof. #100 onward will introduce additional
HQ-belief/consequence/capability state.

Do **not** pre-emptively widen `ravellan-decision` to own unrelated HQ or
consequence state merely to preserve its current adjacency to `command-set`.

After #99 is committed/closed, the next implementation issue that needs a new
persisted pre-command state transition must inspect the actual committed #99
replay validator and choose the smallest explicit replay-safe integration:

- add a narrowly named deterministic system ledger entry if a new authoritative
  state mutation genuinely occurs between existing entries; or
- keep the value purely derived if persistence is unnecessary.

Any new entry requires:

- strict schema discriminator;
- exact cycle/order validation;
- replay recomputation/tamper rejection;
- hash/revision coverage;
- prototype version bump under the rule above;
- V1 isolation.

A future issue must not silently change #99 ordering tests to make a new state
mutation pass. If the committed #99 structure cannot accommodate the required
canonical gameplay order without a material redesign, raise
`BLOCKED: PRODUCT DECISION REQUIRED` / architecture escalation with the concrete
conflict before coding around it.

This is the one downstream integration detail intentionally conditioned on the
final #99 implementation rather than guessed while #99 is still uncommitted.

## Server mutation

Server mutation remains authoritative and revision-protected. One submitted
cycle command set is one atomic player-authority mutation even if deterministic
system transitions have separate canonical ledger entries around it.

Headless and server call the same sim transitions. The web client may not send
arbitrary derived recommendations or mutate a whole session.

## Player-safe projection

[[38-PLAYER-SAFE-PROJECTION-CONTRACT]] owns the strict V2 player DTO boundary.
Server endpoints return dedicated safe projections, never raw world truth, truth
provenance, future preparation, adversary observations/action IDs, oracle data,
private ledger fields or full session state.

Agenda membership, legal orders, task targets, reasons and reveal derive only
from HQ belief plus public campaign state/content. Holding those legitimate
inputs constant while changing hidden truth must produce deep-equal player-safe
projection.

Terminal truth is exposed only through the explicit terminal-complete debrief
projection; even then the server creates dedicated debrief-safe fields rather
than serialising raw hidden state.

## Recommendation integrity

Recommendation input is limited to HQ belief, standing intent, chief worldview,
known commitments, institutional state, visible issue/course metadata and public
campaign state.

[[24-STAFF-RECOMMENDATION-POLICY]] owns precedence. [[36-KESTREL-AGENDA-COURSE-MATRIX]]
owns Kestrel metadata/tie-break content.

Output is recommended order/disposition semantics plus ordered discrete reason/
concern/dissent references. It contains no omniscient/global score.

Tests hold belief/public inputs constant while changing world truth and prove
equal recommendations. Different chief views may disagree from the same belief.

## Reuse and non-reuse

Reuse deterministic session/replay primitives, registry resolution, action-ledger
integrity, expectedRevision, headless runner, save tombstones and accessible
presentation patterns.

Do not reuse the mandatory memo packet, mandatory Chiefs stage, old scenario
assumptions, UI-owned game rules, V1 predicted-events presentation or generic
plugin frameworks as V2 semantics.
