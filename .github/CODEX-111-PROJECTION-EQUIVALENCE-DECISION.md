# PR #111 product decision — semantic projection equivalence vs replay identity

This decision resolves the blocker where two raw histories share the same #100 projection key but produce different replay-bound evidence `instanceId`s because trusted ledger-entry hashes/origin refs differ.

## Decision

**#100 state-space projection equivalence is semantic, not replay-exact.**

Do not widen the projection key merely because two otherwise-equivalent histories have different canonical ledger-entry refs, revisions, `postStateHash` values, origin source strings, or derived evidence `instanceId`s.

Those fields remain authoritative and exact in production for replay integrity, tamper evidence, deterministic runtime references, and later persisted source-use provenance. They are not themselves dimensions of the 23B semantic state-space quotient.

23B's generated objects are semantic evidence histories/product trajectories. 23A's origin + instance-ID contract is the replay/identity boundary. Both must be proved, separately.

## Required semantic normalization

Before comparing histories/snapshots/trajectories for projection sufficiency or generated vector equality, replace opaque replay identities with canonical semantic occurrence references.

A semantic occurrence reference must preserve every field that can affect intelligence meaning or reducer/player behavior, including at minimum:

- definition ID;
- observed cycle;
- question/claim;
- implication;
- diagnosticity;
- source group and corroboration group;
- assessment/warning/public-case current-through values;
- source-context / limitation / summary refs;
- warning/public-case roles;
- multiplicity where legal;
- supersession relationships;
- occurrence continuity across adjacent snapshots.

It must exclude replay-incidental identity material such as:

- `instanceId` itself;
- canonical ledger-entry revisions/hashes;
- raw origin entry refs;
- raw observation `source` strings when they do not change evidence semantics;
- session/save IDs or other serialization provenance.

Use deterministic alpha-renaming/canonical tokens for occurrences (for example `e0`, `e1`, ... assigned from the semantic occurrence structure), and rewrite every internal ID reference in the compared semantic form consistently:

- warning basis;
- analytical basis / contrary selections;
- public-case support IDs;
- added/stale/superseded ID arrays;
- adjacent-delta basis/support comparisons.

The normalization must preserve **identity relationships**, not literal hash values. If the same occurrence remains the basis in two adjacent snapshots, the normalized reference must remain the same token. A genuinely new/refreshed occurrence must get a distinct token even when its definition is the same. Observed cycle and occurrence lineage must therefore remain material.

## Runtime semantics do not change

Do **not** change production 23A/23D behavior to make the quotient easier:

- production evidence instance ID remains SHA-256 over model digest + definition + observed cycle + exact origin;
- production origin remains bound to trusted ledger refs;
- production warning/public support/basis/delta objects continue to use exact instance IDs;
- 23D exact-ID comparisons remain the runtime algorithm;
- normal player DTOs still do not expose replay origin hashes.

The oracle only canonicalizes those opaque IDs when classifying semantic equivalence and generating semantic state-space vectors.

## Projection-sufficiency rule

Two raw histories may remain in one projection class when their only differences are replay/provenance identities and their **alpha-normalized semantic fingerprints are deep-equal for every #100 base output and every frozen full-envelope collection course**.

If two histories sharing a projection key differ after semantic normalization in any of the following, the projection key is insufficient and must be widened by the narrowest actual semantic input:

- evidence definition or observed timing;
- currentness or supersession;
- semantic selected basis/contrary/warning support;
- public-case direction/state/corroboration structure;
- assessment/basis pattern/warning;
- semantic delta classification;
- any player-safe evidence/copy meaning;
- any frozen #102 source fact or evidence definition reached.

Do not widen the key using a raw hash/source string merely to force exact instance-ID equality.

## Required regression for the discovered counterexample

Use the reported raw-history pair (or a reconstructed minimal equivalent) where the C5 package differs only in attribution provenance:

- `c5-visible-reinforce-plus-attribution`
- `c5-visible-reinforce`

and where exact trusted ledger hashes / evidence instance IDs differ.

Prove all of the following:

1. exact production replay origins differ;
2. exact production evidence instance IDs differ and each matches the required SHA-256 identity derivation;
3. the alpha-normalized semantic evidence/snapshot/trajectory fingerprints are equal if no semantic intelligence field differs;
4. the histories therefore do not split the #100 projection solely because of cryptographic provenance;
5. a mutation that changes a genuine semantic evidence field does break normalized equivalence.

## Separate replay-identity proof

Add/retain a distinct test suite that does **not** normalize identities and proves:

- exact origin binds the correct trusted ledger entry;
- origin mutation changes the instance ID;
- identical trusted replay/origin deterministically reproduces the same ID;
- forged/mismatched origin is rejected;
- different replay provenance cannot collide silently.

This proof is orthogonal to the 23B semantic state-space counts/hashes.

## Canon reconciliation

During PR #111 canon reconciliation, update 23A/23B/23D narrowly enough to make the two domains explicit:

- **replay-exact identity domain** — origin/instance IDs, integrity and deterministic runtime references;
- **semantic state-space domain** — alpha-normalized evidence/product histories used for equivalence classes and generated coverage vectors.

Do not change #100 evidence meanings, reducers, role relevance, #102 task semantics, or runtime delta algorithms as part of this decision.

Continue the one-pass execution after applying this decision. Stop again only if a difference survives semantic normalization and requires a genuine product-rule choice.