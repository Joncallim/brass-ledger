---
type: v2-headless-execution-contract
status: active
---

# Headless Six-Cycle Execution Contract

Backlink: [[README]]

This is the implementation authority for **#104 — complete replay-valid Kestrel execution without browser dependency**. It owns orchestration only; shared/content/sim own game rules.

# 1. Purpose

Headless exists so the complete six-cycle game can be:

- executed deterministically;
- replay-verified;
- exercised by [[31-HEADLESS-DESIGN-LAB]];
- inspected through player-safe text;
- used for the 3-player formative smoke.

It calls the same authoritative transitions/readouts later used by server/browser. It is never a simplified second game.

# 2. Inputs

A run receives:

- resolved canonical V2/Kestrel content identity;
- resolved digest-verified `kestrel-hq-belief-v1` bundle;
- resolved digest-verified `kestrel-collection-v1` bundle once #102 exists;
- campaign seed;
- immutable standing direction;
- command provider receiving only safe current projection;
- optional non-authoritative test-control metadata.

The normal provider never receives hidden Ravellan state, raw observations, private ledger, source facts, evidence origins, internal assessment/basis/public-case enums, oracle state or future branches.

# 3. Player-safe headless projection

Use [[38-PLAYER-SAFE-PROJECTION-CONTRACT]]. Expose only:

- cycle/revision;
- safe situation/change;
- standing direction;
- bounded Intelligence-Chief judgement/basis/contrary/gap/watch/update;
- explicit warning status where required;
- public campaign/commitment/capability/source-use state;
- agenda/recommendation/reasons/dissent;
- legal alternatives/attention cost;
- Lattice recommended target + eligible target overrides;
- safe package requirements;
- safe C6 crisis + legal routes.

Never expose hidden state/action/row, #100 source facts, occurrence origins/hashes, internal confidence/diagnostic/basis/public-case state, oracle/future result or best-option score.

# 4. Canonical opening

1. resolve trusted content identity and both semantic model bundles;
2. create canonical V2 initial state including #99 Ravellan state and #101 campaign state;
3. persist/verify initial digest;
4. apply standing intent;
5. enter C1.

# 5. Canonical C1–C5 orchestration

For each cycle:

1. execute authorised Ravellan/system transition in canonical ledger order;
2. resolve any **persisted** due consequence/capability lifecycle transition;
3. reconstruct every evidence occurrence due at this pre-command cut:
   - #100 ordinary/reroute/focused;
   - #102 Lattice/liaison from replay-valid task history;
4. pass the complete occurrence set through #100 exactly once to derive:
   - assessment;
   - current warning;
   - public-case basis;
   - delta;
   - safe brief;
5. derive current source-use availability from #100 + #101;
6. build agenda/task default;
7. derive staff recommendation/reasons/dissent from authorised products/public state;
8. project safe player state;
9. call command provider once;
10. sim derives delegated final orders/default Lattice target, applies optional overrides and validates complete package;
11. invalid/stale/incomplete/incompatible package fails; no repair;
12. execute authoritative command consequences, task persistence, source use and reverse observations;
13. every persisted mutation is replay-verifiable;
14. derive safe consequence transcript;
15. advance.

Critical rule:

> A due #102 evidence occurrence is incorporated **before** the #100 reducers for that same command window. Never derive #100 first and append evidence afterward.

Do not invent `hq-belief-update` transition.

# 6. #100 phase safety

After command advances state to N+1 but before Ravellan decision N+1, current belief is not ready.

Headless must not render the next command window in that intermediate state. A direct query returns the dedicated not-ready error rather than relabelling previous analysis.

# 7. Lattice task authority

At C4/C5 when operational:

- safe projection contains one HQ-recommended unused target;
- provider may return an optional target override or null;
- null accepts staff default;
- sim resolves/persists final target;
- no no-task;
- C5 target differs from C4;
- focused collection never consumes landing target;
- target override costs zero normal intervention.

Provider never returns the final delegated target as authority.

# 8. C6 exact order

1. execute/persist Ravellan terminal decision;
2. resolve C5 task result from authorised C5/latest-normal facts—never R6 action/row;
3. derive final pre-manifestation #100 snapshot/public case;
4. derive current source availability;
5. project safe overt crisis family;
6. derive routes from [[27-KESTREL-TERMINAL-MATRIX]] using **current** warning;
7. obtain one legal final player route;
8. apply terminal state/source effects;
9. classify + produce two-layer debrief;
10. persist final state/digest;
11. complete trusted replay.

No C6 Task Collection.

# 9. Pure intelligence determinism

HQ evidence/products are not persisted authoritative state.

Require:

- same trusted history + semantic bundles → deep-equal snapshots/briefs;
- derivation leaves state/revision/hash/final digest unchanged;
- final session contains no duplicate HQ-belief history;
- historical transcript/debrief reconstructs from ledger + exact model bundles;
- role-specific warning can expire/refresh without rewriting evidence history.

“H​Q intelligence history” means derived history, not saved mutation log.

# 10. Command-provider authority

Provider returns only:

- one disposition per agenda issue;
- intervention order ID where applicable;
- legal Defer;
- optional Lattice target override;
- final C6 route.

It does not return:

- delegated final orders/default target;
- recommendation;
- HQ evidence/products;
- claim direction/support basis;
- consequences;
- Ravellan actions/signals;
- authority result/outcome.

Untouched all-Delegate/default-task package must be legal.

# 11. Invalid provider

Fail with structured cycle/issue/task/package error and preserve last verified state.

Never silently Delegate, choose another target, repair another issue, sample another action or mutate provider output into legality.

# 12. Determinism / replay

Identical:

- content identity;
- belief + collection semantic bundles;
- seed;
- standing intent;
- deterministic provider outputs

must produce identical:

- authoritative ordered ledger;
- persisted campaign/task/source state;
- derived HQ history;
- Ravellan history/signals;
- final post-route state/digest/classification.

Every successful run passes trusted replay for persisted truth; #100 is recomputed from replay-valid history + exact bundles.

# 13. Transcript

Per cycle show:

- situation/change;
- bounded judgement/basis/contrary/gap/watch/update;
- explicit warning status at C5/C6 and whenever usable earlier;
- staff intended action/default Lattice target;
- reasons/dissent;
- legal alternatives/target overrides/known costs;
- personal exceptions vs delegated work;
- consequence beats;
- unresolved pressure.

No internal enums/evidence dump.

When attribution is available, disclose exact safe claim + one-shot source cost.

Terminal transcript:

1. post-route classification/state;
2. `What HQ believed` — exact historical safe briefs, including warning gain/refresh/loss;
3. `What was actually happening` — terminal-only truth.

No hindsight rewrite.

# 14. Batch / lab

Provide bounded programmatic API for #107. Runs are isolated/deterministic; counterfactual cloning never mutates source.

The lab may inspect internal derived products but normal policy/provider inputs remain safe.

# 15. Human-smoke sequence

`#104 complete → #107 complete → 3-player smoke → continuation/redesign → #105/#106`

No coaching, preferred-strategy hints or hidden truth.

# 16. Required #104 tests

Prove:

- complete C1→C6 run + trusted replay;
- one replayable run per opening posture;
- same canonical inputs/bundles/provider → same ledger/digest/intelligence history;
- provider sees no hidden/internal/source/oracle state;
- current brief only after current Ravellan decision;
- due #102 evidence enters before same-window #100 reducers;
- derivation pure;
- all-Delegate/default-target package legal;
- optional target override only; no no-task/repeat;
- invalid package/target fails without repair;
- C2/C5 package/signals exact;
- C5/C6 warning gain/refresh/loss transcript-safe;
- C6 route uses current warning/public case;
- terminal `What HQ believed` equals reconstructed historical briefs;
- no C6 task;
- hidden truth only terminal debrief/isolated diagnostics;
- batch deterministic;
- V1 CLI/headless green.

# 17. Rejection conditions

Reject #104 if it persists/duplicates HQ belief, derives #100 before adding due #102 evidence, uses implicit content singleton, exposes source/internal state to provider, lets provider author delegated target, offers no-task/repeat, derives next brief before Ravellan phase, duplicates game rules, repairs invalid output, trusts saved state without replay, rewrites history with terminal truth, runs smoke before #107 or expands into generic orchestration.
