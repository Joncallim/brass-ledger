---
type: v2-headless-execution-contract
status: active
---

# Headless Six-Cycle Execution Contract

Backlink: [[README]]

This document is the implementation authority for **#104 — complete replay-valid Kestrel execution without browser dependency**. It owns orchestration only. Game rules remain in shared/sim/content under [[30-ARCHITECTURE-CONTRACT]].

## Purpose

The headless path exists so the full six-cycle game can be:

- executed deterministically;
- replay-verified;
- exercised by [[31-HEADLESS-DESIGN-LAB]];
- inspected through a belief-safe transcript;
- used for the later 3-player non-gating formative smoke.

It must call the same authoritative transitions later used by server/browser. It is not a simplified second implementation.

## Inputs

A run receives:

- resolved V2/Kestrel content identity;
- campaign seed;
- one valid immutable opening standing direction;
- a command provider receiving only the normal player-safe current projection;
- optional non-authoritative test/run-control metadata.

The normal provider never receives hidden world/Ravellan state, `AdversaryObservation`, private ledger, oracle-frontier state or future branches.

[[31-HEADLESS-DESIGN-LAB]] may run a **separate test-only oracle-frontier explorer** around verified simulator states. It is not a command provider and never chooses actions for a canonical run.

## Player-safe headless projection

Use the same information principles as [[38-PLAYER-SAFE-PROJECTION-CONTRACT]]. Before the final browser DTO exists, the headless adapter may expose only the safe information needed to decide legally:

- cycle/revision;
- situation/change summary;
- standing direction;
- HQ judgement/reasons/gaps;
- public Kestrel state/known commitments;
- current agenda issues;
- responsible officer, staff recommendation/reasons/dissent;
- legal player alternatives and personal-attention costs;
- safe cross-issue requirement/conflict refs;
- eligible Lattice targets / commander-only liaison where legal;
- safe Cycle-6 crisis family and only final routes legal under [[27-KESTREL-TERMINAL-MATRIX]].

Never expose hidden posture/preparation, raw Ravellan action/signal records, target selector inputs, truth provenance, future outcomes or a best-option score.

## Canonical execution

### Opening

1. resolve canonical content/ruleset identity;
2. create canonical V2 initial state including #99 Ravellan state;
3. persist/verify initial digest;
4. apply immutable standing intent;
5. enter Cycle 1.

### Cycles 1–5

For each cycle, use the authoritative lifecycle/ledger order implemented by sim:

1. Ravellan/world system transition;
2. due consequence/lifecycle transitions;
3. authorised observations/collection results → HQ evidence/assessment;
4. agenda construction;
5. staff recommendation/reason/dissent derivation;
6. safe player projection;
7. command provider returns **one complete intended player command package**;
8. simulator derives delegated staff orders and validates the complete atomic final-order set, including [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] constraints;
9. invalid/stale/incomplete/incompatible packages fail — never auto-correct, sample-then-repair or silently Delegate another issue;
10. authoritative order/consequence/capability/coalition→Ravellan signal transitions execute order-independently where required;
11. every persisted mutation is replay-verifiable under [[30-ARCHITECTURE-CONTRACT]];
12. produce belief-safe consequence transcript;
13. advance the cycle.

Preserve whatever explicit system/player ledger entries the committed simulator requires. Headless must not collapse them into one synthetic transition merely for convenience.

### Cycle 6

1. execute authoritative Ravellan terminal decision;
2. project the safe overt crisis family;
3. update any legitimate HQ/public state due before command;
4. derive **only** routes legal under [[27-KESTREL-TERMINAL-MATRIX]];
5. obtain one legal final player course;
6. apply final-route authoritative state effects and terminal resolution;
7. produce classification + two-layer debrief;
8. persist final state/digest;
9. complete trusted replay verification.

No Cycle-6 Task Collection exists.

## Command-provider authority

A provider may be scripted, deterministic lab policy, or interactive plain-text adapter.

It returns player authority only:

- one disposition per authoritative agenda issue;
- intervention order ID where intervening;
- legal defer where applicable;
- legal Task Collection choice / commander-only liaison action where applicable;
- final Cycle-6 route.

It does **not** return delegated final order IDs as authority, staff recommendations, state patches, consequences, Ravellan actions/signals, partner-authority result or terminal outcome.

For a provider that makes no personal changes, the untouched all-Delegate package must be legal in every reachable state. If it is not, that is a recommendation/content defect, not something headless repairs.

## Invalid-provider behavior

Fail with a structured error that identifies cycle / issue or package constraint / rejection code. Preserve the last verified canonical state for diagnostics.

Do not:

- silently substitute Delegate;
- alter another issue to satisfy a cross-issue rule;
- retry a different random action;
- mutate provider output into legality.

Interactive callers may explicitly ask the human for a corrected command after a rejection; automated policy bugs must fail.

## Determinism / replay

Identical content identity, seed, standing intent and deterministic provider outputs must produce identical:

- ordered ledger;
- HQ evidence/assessment history;
- Ravellan/action/signal history;
- persistent consequences;
- final post-route state;
- final digest/classification.

Every successful run must pass normal trusted V2 replay. A run is not successful if a persisted transition cannot be recomputed/verified.

Human-readable timestamps/log formatting stay outside canonical state/digest.

## Transcript

Normal transcript remains belief-safe and player-like.

Per cycle show:

- situation/change;
- HQ judgement/evidence gap;
- staff intended action/reasons/dissent;
- legal alternatives and known costs/requirements;
- personal exceptions vs delegated work;
- consequence beats;
- unresolved next pressure.

When C5 public attribution is available, the transcript must disclose the known one-shot/source-exposure cost before selection, exactly as the future UI will.

Terminal transcript shows classification, post-route public state, **What HQ believed**, then **What was actually happening** only after terminal completion.

## Batch execution / design lab

Provide a bounded programmatic API suitable for #107. Runs are isolated and deterministic; counterfactual cloning belongs to the lab layer and never mutates the source/canonical history.

Do not add parallelism merely for speed if it compromises deterministic evidence.

## Human-smoke sequencing

The headless runner makes the formative smoke technically possible after #104, but the study must **not run until #107's structural gate is complete**.

Sequence:

`#104 complete → #107 complete → 3-player non-gating formative smoke → continuation/redesign decision → #105/#106 main browser tranche`

The smoke remains governed by [[35-HUMAN-PLAYTEST-HARNESS]]. Headless must not add coaching, preferred-strategy hints or hidden truth to support it.

## Required #104 tests

At minimum prove:

- complete C1→C6 scripted run reaches terminal classification and trusted replay;
- at least one replayable run for each Ravellan opening posture;
- same inputs/provider outputs → identical ledger/final digest;
- provider sees no hidden state/oracle data;
- untouched all-Delegate packages are legal in representative reachable states including C5;
- invalid/incompatible package fails rather than being repaired;
- C2/C5 cross-system composition and coalition→Ravellan signals follow [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]] / [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]];
- terminal route set uses [[27-KESTREL-TERMINAL-MATRIX]] and post-route state is replayed;
- Cycle-6 Task Collection rejected;
- hidden truth appears only in terminal debrief / isolated diagnostics;
- batch runs isolated/deterministic;
- V1 CLI/headless behavior remains green.

## Rejection conditions

Reject #104 if headless duplicates game rules, exposes hidden truth to normal providers, uses an oracle gameplay policy, auto-repairs invalid command packages, hides cross-issue errors, trusts saved state without replay, depends on browser/server runtime, runs the human smoke before #107, or expands into generic orchestration beyond the bounded Kestrel need.
