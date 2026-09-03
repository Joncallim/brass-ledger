---
type: v2-headless-execution-contract
status: active
---

# Headless Six-Cycle Execution Contract

Backlink: [[README]]

This document is the implementation authority for **#104 — V2 headless six-turn campaign execution**. It defines how the complete Kestrel slice is run and replayed without browser dependency. It is execution infrastructure, not a new gameplay system.

## Product purpose

Before building the Command Room, the complete six-cycle experiment must be playable, replayable and inspectable headlessly.

The headless path exists to support:

- fast deterministic mechanics verification;
- complete authored-route tests;
- the strategy/design laboratory;
- a non-gating plain-text formative human smoke before browser polish;
- trusted replay/import evidence.

It must call the same authoritative simulation transitions later used by the server/browser. It may not become a separate simplified game implementation.

## Ownership

`packages/headless` owns orchestration of a V2 run.

It does **not** own:

- order legality;
- Ravellan policy;
- HQ belief reduction;
- recommendations;
- consequences;
- Lattice results;
- terminal outcomes.

Those remain in shared/sim/content according to [[30-ARCHITECTURE-CONTRACT]].

## Canonical run inputs

A complete Kestrel headless run receives:

- resolved canonical V2 scenario/content identity;
- campaign seed;
- one valid opening standing-intent declaration;
- a command provider/policy that receives only the player-safe current command projection and returns legal player dispositions/task choices;
- optional deterministic run-control metadata for tests (maximum cycle guard, transcript mode).

The ordinary command provider must not receive hidden world truth, Ravellan private state, adversary observations, oracle data or future state.

The `oracle` policy is not part of normal #104 execution; #107 may explicitly wrap the headless runner with separate test-only truth access.

## Player-safe headless projection

Before the browser DTO exists, #104 may expose a **headless player projection** containing only the minimum data required to make a legal command:

- cycle;
- player-language standing direction;
- belief-safe situation/change summary refs;
- HQ Intelligence Chief judgement/reasons/gaps;
- current agenda issue IDs/titles;
- responsible officer;
- authoritative staff recommendation and discrete reason refs;
- authored dissent refs;
- legal dispositions/orders/defer availability;
- intervention budget/current draft usage where applicable;
- legal Task Collection/liaison target IDs when available;
- public persistent-state summaries required to understand known commitments/recovery.

It must not expose hidden Ravellan posture/preparation, adversary-observation records, truth provenance, oracle data, future event branches or a best-option score.

The later #105 player DTO may replace/refine presentation shape, but hidden-information non-interference must already hold here.

## Canonical execution sequence

The headless runner must use the authoritative V2 lifecycle rather than inventing its own loop.

### Opening

1. resolve canonical scenario/content identity;
2. create canonical initial V2 state, including #99 Ravellan opening state;
3. persist/verify initial digest;
4. apply the one immutable standing-intent declaration;
5. enter Cycle 1.

### Cycles 1–5

For each cycle:

1. execute the authoritative Ravellan/world system transition in canonical ledger order;
2. advance authored consequences/lifecycles due at cycle start;
3. resolve authorised observations/collection results into HQ evidence and assessment;
4. build the authoritative agenda;
5. derive responsible-officer recommendation/reasons/dissent;
6. produce the player-safe headless command projection;
7. call the command provider exactly once for that command window;
8. validate the returned atomic command set/task actions through normal sim contracts;
9. reject illegal/stale/incomplete commands; do not auto-correct them;
10. apply authoritative order/consequence/observation/capability transitions;
11. persist the canonical ledger/state hashes/revision;
12. produce the belief-safe consequence reveal/transcript record;
13. advance to the next cycle.

Where current repository implementation splits these into more than one revisioned system/action ledger entry, preserve the canonical ledger ordering rather than forcing one synthetic headless transaction.

### Cycle 6

1. execute the authoritative Ravellan terminal decision;
2. update legitimate HQ belief/public crisis state;
3. derive legal final courses from [[27-KESTREL-TERMINAL-MATRIX]];
4. obtain one legal final player course from the command provider;
5. resolve terminal Beacon/partner/cost outcome;
6. produce terminal classification and two-layer debrief evidence;
7. persist final canonical state/digest;
8. run trusted replay verification against the completed session.

No Cycle-6 Task Collection is legal.

## Command-provider contract

A headless command provider may be:

- a scripted fixture sequence;
- a deterministic named policy used by tests/lab;
- an interactive plain-text adapter for formative smoke/manual runs.

It receives only the player-safe projection plus any provider-local deterministic state.

It returns player authority only:

- explicit issue dispositions;
- selected authored intervention order IDs where intervening;
- legal defer choices;
- legal task/liaison target choice where applicable;
- final Cycle-6 course.

It does not return:

- delegated final order IDs as authority;
- staff recommendations;
- resolved consequences;
- Ravellan actions;
- state patches.

The simulator remains authoritative.

## Invalid-provider behavior

If a provider returns an illegal command:

- fail the run with a structured headless command error identifying cycle/issue/rejection code;
- preserve the last verified canonical state for diagnostics;
- do not silently choose Delegate;
- do not retry with a different action unless the caller explicitly implements an external interactive correction loop.

Automated policy bugs must fail tests rather than being hidden by forgiving orchestration.

## Determinism

Given identical:

- V2/content identity;
- seed;
- opening intent;
- deterministic command-provider outputs;

headless execution must produce identical:

- ordered action/system ledger;
- HQ evidence/assessment history;
- Ravellan history;
- consequence records;
- final state/digest;
- terminal classification.

Human-readable timestamps or non-authoritative logging metadata must not enter canonical digest/state.

## Trusted replay closure

Every successfully completed headless run must be replay-verifiable through the normal V2 trusted replay path using canonical live content.

The runner must not declare success if:

- final digest mismatches;
- content identity mismatches;
- ledger ordering/revision/hash fails;
- replay recomputation produces a different Ravellan decision, belief assessment, consequence transition, recommendation-relevant state or terminal result.

If some later issue's transition is not yet replay-verifiable, #104 is not complete.

## Headless transcript

Provide a deterministic, belief-safe plain-text transcript mode for developers and the non-gating formative smoke.

Per cycle it should show, in player language:

- situation/change summary;
- Intelligence Chief judgement and key evidence/gap;
- each agenda issue with staff intended course/reasons/dissent;
- legal player alternatives;
- submitted player exceptions/delegated items;
- consequence beats;
- unresolved next pressure.

Terminal transcript additionally shows:

- terminal classification;
- immediate outcome explanation;
- **What HQ believed** history;
- **What was actually happening** debrief after completion.

Do not show hidden truth before the terminal debrief merely because the runner is a CLI/developer tool, unless an explicit separate diagnostic/oracle flag is used outside the normal player transcript.

## Formative smoke support

After #104 is complete and replay-valid, the project may run the already-authorised **3-player non-gating formative smoke** using the plain-text headless slice before the browser UI exists.

The runner should support this without adding tutorial/coaching logic.

It must not:

- suggest a preferred strategy;
- reveal hidden state;
- auto-select invalid/missing input;
- generate synthetic human evidence.

Human evidence still belongs in [[80-HUMAN-PLAYTESTS]].

## Batch execution

Expose a bounded programmatic API suitable for #107 to run many deterministic seed/policy combinations without spawning browser/server processes.

Batch execution must:

- isolate run state;
- not mutate global scenario/content state;
- retain deterministic result ordering;
- permit counterfactual cloning only through #107's explicit lab layer;
- surface failures rather than dropping failed runs.

Do not add parallelism merely for speed if it compromises deterministic ordering/logging or complicates the prototype.

## Compatibility

V1 CLI/headless behavior remains supported.

Do not reinterpret existing V1 flags/output as V2 semantics. Add an explicit V2 mode/scenario path according to existing CLI conventions.

## Required #104 tests

At minimum prove:

- complete Cycle-1-through-6 scripted Kestrel run reaches a terminal classification and passes trusted replay;
- at least one valid run for each Ravellan opening posture is replayable;
- authored viable final-route families can be exercised through legal histories;
- same seed/intent/provider outputs produce identical final digest/history;
- provider receives no hidden Ravellan state/observations/oracle data;
- illegal provider command fails rather than auto-delegating/auto-fixing;
- Cycle-6 Task Collection is rejected;
- hidden truth appears only in explicit terminal debrief/diagnostic mode;
- batch runs remain isolated/deterministic;
- V1 CLI/headless tests remain green.

## Rejection conditions

Reject #104 if it duplicates simulation rules in `packages/headless`, treats saved state as trusted without replay, auto-corrects illegal policies, exposes hidden truth in the normal headless player projection, depends on browser/server runtime, or adds generic orchestration/framework scope beyond the Kestrel experiment.
