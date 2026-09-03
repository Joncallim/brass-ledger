---
type: v2-ravellan-world-effect-contract
status: active
---

# Ravellan World-Effect Matrix

Backlink: [[README]]

This document is the implementation authority for how the hidden Ravellan decision from [[22-RAVELLAN-EXECUTABLE-POLICY]] becomes **world effects, player-observable situation changes and HQ-authorised evidence** in Kestrel. It belongs to #103 content/world integration; it does not change #99's policy selection.

## Product purpose

Ravellan must feel like an actor whose choices change the situation, but the implementation may not turn an action ID into arbitrary authored drama.

Each normal Ravellan action therefore has a bounded effect projection.

The player sees observable manifestations, not the hidden action ID.

The same visible manifestation may be compatible with more than one hidden action. This preserves uncertainty.

## Timing

For Cycles 1–5:

1. the authoritative `ravellan-decision` for Cycle N selects the hidden normal action;
2. that action immediately creates the authored **Cycle-N world effect projection** below;
3. HQ may observe only the listed public/observable manifestation/evidence at the normal Cycle-N belief update;
4. no extra hidden-state-derived effect may be invented by UI/content;
5. coalition orders later in Cycle N may create Ravellan observations usable by Ravellan at Cycle N+1, per #99. That reverse observation path is separate from the HQ observation path here.

Cycle 6 instead uses the terminal behavior projection at the end of this file.

## Normal action — `probe_shipping`

### World effect

Ravellan applies visible ambiguous pressure to commercial movement near Beacon Channel.

It may include shadowing, inspections, auxiliary/coastguard interference and close presence without crossing into an overt attack.

### Player-observable manifestation

Use a cycle-appropriate authored summary from this fixed meaning:

- pressure on commercial traffic is continuing or intensifying;
- Ravellan remains below the threshold of obvious war;
- the manifestation does not establish whether the pressure is an end in itself or cover for preparation.

### HQ evidence

The action may create only **ambiguous** ordinary evidence unless a separate directed collection rule legitimately observes more.

- in Cycle 1, its visible pressure is represented by `opening-pressure-ambiguous` under [[23-HQ-BELIEF-AND-EVIDENCE]];
- in Cycle 2, the continuing pressure is represented by `shipping-probe-ambiguous`;
- in later cycles, it contributes to the cycle's general pressure-pattern summary but does not create a new directional evidence item by itself.

### Persistent-state effect

No generic coalition meter changes merely because the hidden action occurred.

Specific shipping delay/disruption is resolved in Cycle 2 through the authored shipping-response issue; later probe manifestations are consequence/situation beats unless another canonical matrix explicitly assigns a persistent transition.

Do not worsen partner consent, reserve, or Beacon exposure automatically from the action ID.

## Normal action — `seed_deception`

### World effect

Ravellan deliberately creates a misleading or internally inconsistent visible picture through exercises, movement, messaging or tasking patterns.

### Player-observable manifestation

The player may see contradictory/erratic visible indicators, but not the fact that they were deliberately planted.

Use ordinary language such as:

> Ravellan's visible pattern has become less consistent: some activity suggests preparation while other formations remain dispersed.

Do not label it “deception” before terminal truth reveal.

### HQ evidence

For the ordinary six-cycle path, `seed_deception` does **not** directly add a directional evidence item before Cycle 5. It contributes only an ambiguous manifestation and may explain why the fixed Cycle-3 conflicting bundle is genuinely observable.

The canonical Cycle-3 evidence remains exactly:

- `staging-logistics-anomaly` — preparation indicator;
- `combat-elements-dispersed` — coercion indicator.

This bundle is presented identically across hidden opening situations; `seed_deception` is one possible world reason those observations coexist, not a hidden selector of the HQ result.

Directed collection may later cut through or expose parts of the deception through [[23-HQ-BELIEF-AND-EVIDENCE]] / [[26-LATTICE-COLLECTION-MATRIX]].

### Persistent-state effect

None beyond the policy/history itself.

Do not create a generic confusion/deception meter.

## Normal action — `prepare_beacon_seizure`

### World effect

Advance the hidden seizure-preparation state exactly as #99 owns:

`none → developing → ready → ready`

No additional preparation step exists outside that canonical transition.

### Player-observable manifestation

Ordinary HQ observation does **not** automatically reveal the preparation action.

Visible pressure may plateau, thin, or continue as existing patrol/auxiliary activity while the important preparation happens away from the obvious confrontation.

This is why directed collection can be valuable.

### HQ evidence

The hidden action itself creates no automatic directional HQ evidence item.

Any preparation-related HQ evidence must come from:

- the fixed Cycle-3 observable bundle;
- Cycle-3 focused collection;
- Lattice Task Collection;
- partner liaison where authorised;
- another explicit evidence rule frozen in the canonical docs.

Do not translate `prepare_beacon_seizure` directly into “Intelligence detects preparation.”

### Persistent-state effect

Only Ravellan's hidden preparation/posture history changes here. Coalition persistent records do not change automatically.

## Normal action — `pause_consolidate`

### World effect

Ravellan reduces immediate visible pressure and consolidates/waits rather than directly escalating.

### Player-observable manifestation

Visible patrol/harassment intensity eases or pulls farther away from the focal confrontation.

The player does not know whether this means:

- deterrence worked;
- a feint is ending;
- Ravellan is consolidating;
- activity is moving out of sight;
- the opponent is waiting for coalition fatigue.

### HQ evidence

The pressure reduction is **ambiguous**. It never directly proves coercion or abandonment of preparation.

It feeds the canonical Cycle-4 pressure-pattern evidence below where relevant.

### Persistent-state effect

None to coalition persistent records merely from the pause.

Do not automatically recover coalition reserve or partner state because Ravellan pauses.

## Cycle-specific visible pressure projection

The fixed Kestrel emotional/agenda structure remains, but the exact situation wording must reflect the hidden action's legitimate manifestation rather than asserting a lull that did not occur.

### Cycle 1

Ravellan is always `probe_shipping` under #99.

Player situation:

- increased maritime pressure/patrol activity;
- partner asks what coalition intends;
- HQ cannot distinguish testing/coercion/preparation.

This is the authored opening probe.

### Cycle 2

Cycle-1 shipping pressure persists long enough to create the canonical shipping-response issue regardless of the newly selected Cycle-2 hidden action.

Overlay the new Cycle-2 action:

- `probe_shipping` → shipping pressure intensifies/continues;
- `seed_deception` → shipping pressure continues while visible exercise/messaging cues become contradictory;
- `prepare_beacon_seizure` → shipping pressure continues from the prior probe while some new Ravellan effort shifts away from the obvious lane; no hidden preparation is revealed.

`pause_consolidate` is illegal in Cycle 2.

Therefore all three legal hidden actions still support the same canonical shipping-response agenda without pretending they are the same world action.

### Cycle 3

The canonical two-item conflicting evidence bundle is shown before command.

The current Ravellan action may affect the visible pressure wording but may not add/remove one side of that mandatory conflict:

- `probe_shipping` → pressure remains active;
- `seed_deception` → public/visible pattern becomes more contradictory;
- `prepare_beacon_seizure` → overt pressure may remain steady while activity elsewhere is unclear;
- `pause_consolidate` → visible pressure eases.

All remain compatible with the same `unclear + conflicted` HQ assessment before any Cycle-3 focused collection result exists.

### Cycle 4 — pressure-pattern change

Replace any unconditional “Ravellan patrol lull” assumption with an **ambiguous pressure-pattern change** keyed to the actual action:

- `pause_consolidate` → visible patrol/harassment lull;
- `prepare_beacon_seizure` → obvious shipping pressure thins/plateaus while activity elsewhere becomes harder to read;
- `seed_deception` → visible posture becomes contradictory/erratic rather than clearly escalating;
- `probe_shipping` → pressure continues but does not by itself answer whether something else is being prepared.

All four create the same ordinary evidence ID:

`cycle4-pressure-pattern-ambiguous`

- implication: `ambiguous`;
- diagnostic class: `indicator`;
- source group: `visible-pressure-pattern`;
- observed Cycle 4;
- active through Cycle 5, expires before Cycle 6 current-assessment reduction;
- summary text is action-specific as above but must not reveal the hidden action ID.

The Cycle-4 commander issue remains the same strategic choice: use the ambiguous window to recover, prepare quietly, or press visibly. The wording should be “How do we use/respond to this change in pressure?” rather than assuming a universal lull.

### Cycle 5

The fixed collision remains:

- Beacon warning/uncertainty has reached a decision point;
- partner authority deadline matters;
- reserve state may be strained/brittle;
- attribution may be available from legitimate evidence.

Current Ravellan action changes only the observable situation overlay:

- `probe_shipping` → overt pressure remains high;
- `seed_deception` → public/operational picture remains contradictory;
- `prepare_beacon_seizure` → overt activity may not rise proportionally to the hidden preparation;
- `pause_consolidate` → visible pressure eases, which is not proof the crisis is over.

The player's HQ assessment is determined by the active evidence catalogue, including focused/Lattice/liaison results, not by this hidden action label.

## Shipping-pressure consequence in Cycle 2

Ravellan's persistent Cycle-1 probe creates a real external/adversary pressure. The coalition's Cycle-2 response conditions the visible severity.

The consequence reveal may classify:

### Quiet escort

- Ravellan-caused pressure continues;
- coalition response keeps disruption limited but does not eliminate delay;
- show “shipping delay” as a non-persistent consequence beat.

### Visible patrol surge

- Ravellan-caused pressure is directly contested;
- immediate shipping disruption is limited;
- coalition pays reserve/partner/observation costs from [[25-KESTREL-CONSEQUENCE-MATRIX]].

### Reroute and monitor

- Ravellan created the pressure;
- coalition deliberately accepts larger civilian disruption to preserve reserve/create observation opportunity;
- label the large disruption `player-conditioned` or `player-caused` according to the exact beat: Ravellan caused the pressure, coalition caused the reroute severity.

Do not introduce a permanent shipping meter for the prototype.

## Action-history access for collection

[[26-LATTICE-COLLECTION-MATRIX]] may inspect the recent **verified Ravellan action history** only where a named collection target explicitly authorises it, e.g. `political-operational-sync` or `auxiliary-tasking`.

Normal HQ belief/recommendation/UI code may not receive raw action history merely because collection content can inspect it.

This is a world-to-authorised-evidence boundary, not a widening of player information.

## Cycle 6 terminal projection

#99 selects one terminal behavior.

### `attempt_seizure`

Player-observable fact:

A limited Ravellan move against Beacon is now underway. This is an overt world event; the player does not need hidden-intelligence permission to know an attack has begun.

Do not reveal the prior posture/preparation history until the post-run truth debrief.

### `threshold_challenge`

Player-observable fact:

Ravellan creates a high-pressure confrontation/threshold event without the observable force package of a prepared seizure.

The player knows the current crisis family but not whether earlier activity was a feint, aborted preparation, or testing that escalated.

### `abort_and_pressure`

Player-observable fact:

The immediate military confrontation recedes; Ravellan preserves political/strategic pressure rather than attempting the seizure.

The player still receives a terminal command problem—how to exploit/expose/accept the de-escalation—rather than an automatic victory banner.

## Replay / content proof

Persist or deterministically reconstruct enough world-effect evidence to prove:

- each Ravellan decision uses only its frozen manifestation rule;
- same action/cycle/history produces same world/public effect;
- the UI never receives the hidden action ID as explanation before terminal debrief;
- ordinary HQ evidence created here matches [[23-HQ-BELIEF-AND-EVIDENCE]] exactly;
- Cycle-4 situation summary varies correctly without changing the canonical agenda arbitrarily;
- Cycle-2 shipping issue remains reachable for every legal Cycle-2 hidden action because the Cycle-1 probe pressure persists;
- no persistent coalition state changes solely because a world-effect writer thought an action “should hurt more”.

## Required #103 tests

At minimum prove:

- all four normal action projections in every legal cycle produce only the authorised effect set;
- Cycle-1 probe manifests as the opening pressure;
- every legal Cycle-2 action retains the shipping-response agenda with the correct overlay;
- Cycle-3 HQ belief remains the canonical fixed conflict regardless of hidden action absent directed collection;
- Cycle-4 action-specific situation summaries all map to `cycle4-pressure-pattern-ambiguous` and never expose the action ID;
- hidden preparation action alone creates no automatic HQ preparation evidence;
- terminal behavior is observable in Cycle 6 while prior hidden history remains hidden until debrief;
- action-effect projection never changes V1 content.

## Rejection conditions

Reject #103 content if it invents per-action damage/meters, reveals `prepare_beacon_seizure` directly to HQ, uses the UI to interpret hidden action IDs, spawns unplanned agenda items merely for drama, or lets the same action have arbitrary designer-chosen effects in different runs without an authored cycle/history rule above.
