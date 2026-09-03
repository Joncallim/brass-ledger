---
type: v2-browser-e2e-contract
status: active
---

# Browser E2E Contract

Backlink: [[README]]

This document is the implementation authority for **#108 — V2 browser E2E vertical slice**. It verifies that the browser preserves the already-authoritative V2 game rather than creating a second set of rules.

## Purpose

Browser E2E proves:

- the complete player path works through the real server/sim contracts;
- implicit delegation still produces explicit authoritative command evidence;
- stale revisions fail safely;
- hidden truth remains hidden;
- Kestrel can reach and display terminal outcomes/debrief correctly;
- V1 remains available.

It cannot prove that the game is fun.

## Test environment

Use the real built web application against the real V2 server/API boundary with deterministic test content/seed fixtures.

Test-only fixtures may create known hidden starting states for hostile non-interference assertions, but:

- the browser must not receive a special hidden-state endpoint;
- production DTO/API code must remain the path under test;
- test setup state is injected before the user-facing request path, not through browser-accessible mutation authority.

## Required full-run golden path

Provide at least one complete six-cycle browser run from opening intent through terminal debrief that:

1. declares the immutable four-question standing direction;
2. submits Cycle-1 command with at least one issue left at implicit Delegate;
3. exercises an authored personal intervention;
4. creates and later honours or breaches a real commitment;
5. exercises the Lattice or liaison information path;
6. reaches Cycle 5 with more than two credible intervention candidates;
7. submits a legal Cycle-6 final course;
8. displays terminal classification;
9. displays “What HQ believed” before/alongside the separate completed-run hidden-truth debrief;
10. exports/reads a session that passes trusted replay.

The golden path should not be treated as the one correct strategy. Additional hostile routes below exercise alternatives.

## Implicit delegation proof

In at least one cycle:

- do not click/interact with one or more issue controls;
- confirm UI presents staff intended action/reasons;
- click `Issue Orders`;
- inspect the authoritative server/session result and prove an explicit `delegate` disposition exists for the untouched issue;
- prove the browser did not send the delegated final order ID as authority;
- prove sim/server resolved the actual delegated order.

Reject a UI that requires an approve/delegate click for every issue.

## Intervention-budget behavior

E2E must prove:

- selecting one intervention updates visible personal-attention usage;
- selecting a second reaches the limit;
- a third cannot be submitted;
- reverting an earlier intervention to Delegate frees the token;
- no earlier intervention is silently replaced;
- legal Defer remains distinct from intervention.

The server remains the ultimate validator even if client affordances prevent illegal drafts.

## Stale-revision hostile route

Create a real stale-write condition between browser draft and submission.

Prove:

- server rejects with the established stale-revision contract;
- browser does not retry silently;
- browser refreshes/reconciles authoritative state;
- changed issue/recommendation/reason is made visible to the player;
- no outdated order is committed;
- draft choices are retained only when they still map safely to unchanged authoritative issue/order IDs; otherwise the player must re-review that issue.

## Hidden-truth non-interference route

Create paired V2 test sessions with:

- different hidden Ravellan posture/preparation/world truth;
- identical player-public campaign state;
- identical HQ belief/evidence;
- identical known commitments/capability/agenda inputs.

Through the normal API/browser projection, prove deep-equivalent player-facing:

- situation summary where hidden truth is not legitimately observable;
- Intelligence Chief assessment/reasons;
- agenda membership;
- staff recommendation/reasons/dissent;
- legal orders;
- consequence projection before any truth-revealing event.

Do not compare only screenshots. Assert DTO/semantic DOM content so a hidden-field leak cannot hide off-screen.

## Ravellan observation boundary route

Execute two otherwise equivalent player command histories where one authored public action emits a Ravellan observation and the other does not.

Prove:

- the current-cycle UI does not show a same-cycle clairvoyant Ravellan reaction;
- the following cycle may legitimately diverge according to #99 policy;
- the browser never receives raw `AdversaryObservation` records.

## Intelligence/Lattice route

Exercise:

- Lattice maturity through all three scheduled advances;
- Cycle-4 named Task Collection;
- no immediate assessment change on task submission;
- next-cycle authored evidence/result;
- updated natural-language HQ assessment through #100;
- no numeric confidence/percentage/band;
- no hidden posture/preparation value;
- no normal-intervention token spent by Task Collection.

Also exercise a non-Lattice fixture/history proving liaison:

- costs one normal intervention;
- returns narrower evidence;
- creates the liaison obligation;
- does not produce a corroborating result.

## Commitment/recovery route

E2E must exercise at least one explicit promise/obligation and a costly recovery path.

Example hostile path:

- create consultation promise;
- take an authored unilateral course that breaches it;
- verify consequence reveal names the breach and partner change;
- later use political concession where legal;
- verify immediate access can recover while concession remains a terminal severe cost.

Also exercise reserve recovery:

- create reserve strain;
- use emergency consolidation;
- verify reserve improves while Beacon exposure worsens.

The UI must not present recovery as free restoration.

## Consequence-reveal information safety

For a non-terminal cycle, assert that reveal contains the canonical five-part semantics where applicable:

- observed change;
- belief-safe cause;
- persistent callback;
- unresolved pressure;
- future influence point.

Prove no hidden truth, oracle result, exact future event or “right choice” language appears.

## Cycle-6 route/outcome route

Use deterministic fixtures to cover all four final course families across E2E runs or targeted terminal setup tests:

- Quiet Denial;
- Joint Visible Denial;
- Emergency Mobilisation;
- Hold And Expose.

Prove legal availability comes from public/known campaign state and matches [[27-KESTREL-TERMINAL-MATRIX]].

At minimum cover terminal UI for:

- Strategic Success;
- Costly Success;
- Political Defeat;
- Operational Defeat.

A single golden browser run need not produce every outcome; use deterministic targeted terminal histories while preserving normal authoritative API execution.

## Terminal truth-reveal boundary

Before final resolution, hidden Ravellan opening posture/preparation must not appear.

After terminal completion, the debrief may show:

- opening posture;
- posture transitions;
- preparation progression;
- genuine/deceptive signals;
- policy reasoning.

Assert this truth data is only included/rendered for a terminal-complete session through the authorised debrief projection.

## Replay/export closure

At least the full golden browser run must:

- end with canonical final digest;
- export/read through supported V2 path;
- pass trusted replay with live canonical content;
- preserve exact ordered intent/Ravellan/command/system evidence.

Tampered saved/browser-local state must not become authoritative.

## V1 coexistence

Retain a focused V1 browser E2E/smoke proving:

- V1 scenario still opens;
- V1 normal command flow still uses its existing semantics;
- V2 routes/DTO assumptions do not silently replace V1 behavior.

Do not require V1 to adopt V2 interaction design.

## Accessibility in E2E

Exercise primary flow using keyboard only for at least one cycle:

- navigate issue groups;
- reveal/select intervention;
- undo to Delegate;
- reach and activate `Issue Orders`;
- read/focus consequence reveal and advance.

Assert semantic labels/status/error regions rather than relying only on screenshots.

## Required #108 proof set

#108 does not close until the suite demonstrates:

- complete six-cycle authoritative browser run;
- implicit-delegation authority boundary;
- intervention budget/undo;
- stale-write rejection/reconciliation;
- paired hidden-truth non-interference;
- Ravellan next-cycle observation timing;
- Lattice and liaison paths;
- promise breach + recovery;
- terminal route/outcome/debrief boundaries;
- trusted replay of browser-produced session;
- keyboard primary flow;
- V1 coexistence.

## Rejection conditions

Reject #108 if tests mock away the authoritative server/sim boundary, assert only screenshots while missing hidden DTO leakage, auto-repair stale writes, treat a golden route as proof of balance/fun, bypass trusted replay, or allow test-only hidden-state endpoints into the production browser contract.
