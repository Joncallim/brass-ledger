---
type: v2-hq-belief-trusted-read-source-contract
status: active
---

# HQ Belief Trusted Read Source

Backlink: [[README]]

This document makes the #100 replay/import trust boundary structural. It is narrower than any earlier signature in [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] that appears to accept an arbitrary `V2Session` directly.

# 1. Problem

A TypeScript parameter named `trustedSession: V2Session` is still just a raw serialisable session type.

Nothing prevents a future server/import caller from:

1. parsing attacker-controlled JSON as `V2Session`;
2. skipping trusted replay;
3. deriving a forged player intelligence brief from tampered action/preparation history.

Comments and call-site discipline are not enough for the normal player boundary.

# 2. Opaque verified history source

Create a sim-private opaque runtime object equivalent to:

```ts
declare const v2VerifiedHqHistoryBrand: unique symbol

type V2VerifiedHqHistory = Readonly<{
  [v2VerifiedHqHistoryBrand]: true
  sessionIdentity: V2Identity
  finalRevision: number
  finalStateHash: string
  intentDeclaration: V2IntentDeclarationLedgerEntry
  ravellanByCycle: ReadonlyMap<number, V2RavellanDecisionLedgerEntry>
  commandByCycle: ReadonlyMap<number, V2CommandSetLedgerEntry>
}>
```

It is:

- not serialisable;
- not constructible outside the sim module through a public object literal;
- derived only after successful authoritative validation;
- immutable after construction.

The brand is compile-time defence; module-private construction and runtime validation are the real boundary.

# 3. Verification entrypoint

Provide a public sim entrypoint equivalent to:

```ts
verifyV2HistoryForHqProjection(input: {
  session: V2Session
  trustedIdentity: V2Identity
  trustedAgendaProvider: V2TrustedAgendaProvider
}): V2VerifiedHqHistory
```

It must:

1. run the existing trusted #99 replay validator over the supplied session;
2. reject every replay/hash/revision/order/content/agenda mismatch already rejected by #99;
3. build the bounded history index from the replay-validated/canonical session result;
4. independently reject duplicate or missing entries required by the index;
5. return the opaque immutable source.

If the existing replay validator returns only a report rather than a canonical session object, a successful report may authorise indexing the exact validated input; do not silently introduce a second replay implementation.

# 4. Public derivation signatures

Normal exported projection APIs accept the opaque source, not raw `V2Session`:

```ts
deriveV2HqBeliefAtCycle(
  verifiedHistory: V2VerifiedHqHistory,
  resolvedModel: V2ResolvedHqBeliefModel,
  cycle: 1 | 2 | 3 | 4 | 5 | 6,
): V2HqBeliefSnapshot

deriveV2CurrentHqBelief(
  verifiedHistory: V2VerifiedHqHistory,
  resolvedModel: V2ResolvedHqBeliefModel,
): V2HqBeliefSnapshot

deriveV2HqBeliefHistory(
  verifiedHistory: V2VerifiedHqHistory,
  resolvedModel: V2ResolvedHqBeliefModel,
): readonly V2HqBeliefSnapshot[]
```

Pure lower-level reducers accept only evidence/product values and remain directly testable.

Do not export a second “unsafe convenience” entrypoint that accepts raw session input.

# 5. Live authoritative flow

For a live partial session, normal orchestration may call `verifyV2HistoryForHqProjection` after the current-cycle Ravellan transition and before projection.

Kestrel has six cycles; correctness takes precedence over speculative replay-cache optimisation.

A later performance change may cache the opaque verified source only when keyed by:

- complete session identity;
- final revision;
- final state hash/digest;
- trusted agenda/content identity.

A cache is non-authoritative and must be invalidated on any key change. Do not build it in #100 unless profiling proves necessary.

# 6. Import flow

Required:

```text
raw JSON
→ strict V2 schema parse
→ resolve trusted live identity/content
→ verifyV2HistoryForHqProjection
→ derive #100 products
→ derive strict player-safe DTO
```

Forbidden:

```text
raw JSON
→ V2Session parse
→ deriveV2HqBelief*(raw session)
```

# 7. Model/content binding

After #103, normal player projection additionally requires:

- session content identity matches resolved Kestrel content;
- Kestrel content identity includes the exact #100 semantic digest;
- resolved model digest recomputes correctly.

Before #103, #100 functions may be exercised in tests/internal fixtures but are not exposed as a normal player-facing Kestrel route.

# 8. Phase readiness

The verified history source can contain a valid session in the intermediate state after command N and before Ravellan N+1.

`deriveV2CurrentHqBelief` still fails with `v2_hq_belief_not_ready` when no current-cycle Ravellan decision exists.

Historical queries for completed pre-command cuts remain valid.

# 9. Required tests

At minimum:

- normal projection API cannot be called with `V2Session` without an explicit unsafe type cast;
- no exported raw-session convenience function exists;
- tampered imported action/preparation/row/hash/revision/order is rejected before any brief is produced;
- wrong trusted identity/content/agenda is rejected;
- successful #99 replay yields an immutable verified source;
- mutating the original input after verification cannot change the verified source;
- duplicate/missing history entries cannot enter the verified index;
- intermediate valid session verifies but current projection remains not-ready;
- historical projection from the same verified source is deterministic;
- source/model scenario/content mismatch rejected;
- safe DTO never contains the opaque source or entry refs;
- V1 unaffected.

# 10. Rejection conditions

Reject #100 if:

- a normal exported derivation accepts raw `V2Session`;
- a server/import route can bypass replay through a convenience helper;
- the “verified” source retains mutable references to caller-owned arrays/objects;
- it reimplements replay inconsistently with #99;
- it trusts a model whose digest/content identity does not match;
- it serialises the brand/source into player data;
- it adds a speculative cache without complete identity/revision/hash keys.
