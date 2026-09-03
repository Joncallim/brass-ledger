---
type: v2-command-room-contract
status: active
---

# Command Room Interaction Contract

Backlink: [[README]]

This document is the implementation authority for the player-facing interaction model of **#105 — V2 Command Room UI**. It introduces no new simulation mechanic; it defines how the already-authoritative command-by-exception contract is presented.

## Product purpose

The player is the commander, not a clerk approving every staff action.

The Command Room should answer:

1. What changed?
2. What does my staff intend to do?
3. Why?
4. Where do my chiefs disagree?
5. Which one or two things do I personally want to change?

The UI must make **delegation implicit in interaction but explicit in the authoritative submitted command set**.

## One command surface

Do not recreate the V1 sequence of mandatory Briefing → Memos → Chiefs → Final Review screens.

For each cycle, render one primary Command Room containing:

- compact current situation/change summary;
- standing command direction summary;
- current personal-intervention budget;
- ordered agenda issues;
- responsible-officer recommendation/reasons;
- visible dissent where authored;
- legal intervention alternatives;
- legal defer control only where the issue permits it;
- one final `Issue Orders` action.

Detailed history/state may be accessible through secondary disclosure, but no secondary screen is mandatory to submit a legal command.

## Implicit delegation

When a cycle opens, every agenda issue begins in the local draft state:

`delegate`

The player does not need to click an “Approve” or “Delegate” button on each item.

Each issue should read conceptually as:

> **Operations intends to keep the reserve back.**
>
> [reasons]
>
> **Change this order**

If the player takes no action on that issue, the final command set still submits an explicit authoritative `delegate` disposition.

The browser does not compute the delegated order. It submits `delegate`; the server/sim uses the authoritative recommendation.

This is critical: implicit interaction must not become UI-owned recommendation logic.

## Issue card anatomy

Each agenda issue shows, in this priority order:

### 1. Human issue title / why now

One concise statement of what requires command attention now.

### 2. Responsible officer and intended course

Example:

> **Operations intends: Hold the reserve.**

Do not lead with implementation fields such as `recommendedOrderId`.

### 3. Decisive recommendation reasons

Render the 2–4 canonical reason references selected by [[24-STAFF-RECOMMENDATION-POLICY]] in ordinary language.

Do not dump every matched rule/tag.

### 4. Known cost/exposure

Show only known direct trade-offs or commitments associated with the intended course.

Do not show predicted hidden events, hidden posture, win probability, or omniscient outcome preview.

### 5. Dissent

If present, show the dissenting chief compactly:

> **Intelligence disagrees:** We still do not know whether the probe covers real preparation.

Dissent does not create a separate mandatory interaction.

### 6. Commander controls

Default state is delegated.

Primary control:

`Change this order`

Activating it reveals the one or two authored alternative orders.

Selecting an alternative changes the draft disposition to `intervene` and consumes one personal-intervention token in the local draft.

If the issue legally allows defer, expose `Defer` alongside the authored alternatives and explain the known consequence of delay without forecasting hidden truth.

## Intervention budget

Show the prototype budget plainly, e.g.:

> **Personal attention: 1 of 2 used**

Do not call these action points, energy, command mana, or another gamified resource.

When both interventions are used:

- other legal intervention alternatives remain inspectable;
- selecting a third intervention must require first returning another issue to Delegate/Defer or otherwise resolving the draft to the legal limit;
- do not silently replace an earlier intervention;
- do not disable explanation/history merely because the budget is exhausted.

Changing an intervened issue back to Delegate returns its token immediately in the local draft.

Defer consumes no intervention unless the authoritative issue contract explicitly says otherwise; Kestrel currently treats defer as zero-cost where legal.

## Standing direction presentation

Show the opening intent in player language, compactly.

Example:

> **Your direction**
>
> Keep Beacon secure · Do not burn the reserve without asking · Political heat is acceptable · Prepare quietly by default

Do not display `mainPriority`, `redLine`, `toleratedCost`, `defaultStyle` field names to normal players.

Intent is immutable during Kestrel. Do not add an edit control.

## Situation/change summary

Lead with **what changed since the previous command**, not a complete state dashboard.

The summary may include:

- newly matured consequence;
- new HQ intelligence judgement;
- changed partner position;
- Ravellan's observable action/effect;
- capability payoff;
- commitment deadline.

Stable background state belongs in optional detail.

Do not show raw internal enums/meters by default.

## No omniscient preview

The Command Room may show:

- explicit immediate authored cost of an order;
- known commitment created/breached;
- current staff reasoning;
- belief-safe likely concern expressed by a chief.

It may not show:

- exact future event;
- hidden Ravellan reaction;
- terminal outcome prediction;
- hidden probability;
- “best choice” badge;
- global option score.

Existing V1 `predictedEvents` behavior must not leak into V2 player presentation.

## Command summary before submission

A compact inline summary adjacent to `Issue Orders` should say what the commander is personally changing and what remains delegated.

Example:

> **You are personally changing:**
> - Move the reserve forward
> - Protect Lattice
>
> **Staff will handle:**
> - Partner reassurance
> - Shipping posture

This is not a second review screen. It is part of the same Command Room.

Do not require another confirmation modal unless destructive/session-level behavior outside ordinary command submission requires it.

## Issue Orders

The primary submission verb is:

**Issue Orders**

Avoid generic workflow language such as `Submit`, `Complete`, `Next`, or `Finish Turn` for the main command action.

Submission sends one atomic V2 command set with:

- current cycle;
- `expectedRevision`;
- exactly one disposition for every authoritative agenda issue.

The browser must not send final delegated order IDs as authority.

If the server rejects stale revision:

- do not retry silently;
- refresh/reconcile authoritative state;
- explain that the situation changed before orders were accepted;
- preserve only draft choices that can be safely remapped to the new authoritative issue IDs/orders; otherwise require the player to review the changed issue.

## After submission

Successful command submission transitions to the Consequence Reveal described in [[29-CONSEQUENCE-REVEAL-CONTRACT]].

Do not immediately dump the player into the next Command Room without showing the authoritative consequences of the orders they just issued.

## Cycle 1 opening intent

Kestrel begins with the four standing-direction questions before the first ordinary command set.

This should be one concise opening command-intent surface, not a settings form.

After the immutable declaration is authoritatively accepted, show the resulting direction in player language and enter the Cycle-1 Command Room.

Do not consume an intervention token.

## Cycle 6

Cycle 6 uses the same Command Room principles but presents the legal final courses from [[27-KESTREL-TERMINAL-MATRIX]].

The player sees:

- the observable crisis;
- current HQ judgement/evidence;
- current persistent history that legitimately affects availability;
- legal final courses;
- known immediate trade-offs.

Do not expose hidden prior Ravellan posture/preparation before orders resolve.

## Accessibility / keyboard contract

Every primary command flow must be operable by keyboard.

At minimum:

- semantic headings for situation and agenda;
- each issue is a labelled group;
- recommendation and dissent are programmatically associated with the issue;
- alternative-order selection uses native buttons/radio semantics as appropriate;
- obvious focus state;
- intervention-budget changes announced accessibly;
- stale-write/error messages use an announced status/error region;
- focus returns predictably when alternative choices collapse;
- no status relies on colour alone.

## Density rule

Required reading should remain shallow even though underlying state is deep.

Default view prioritises:

1. what changed;
2. staff intended action;
3. decisive reasons;
4. disagreement/known cost;
5. commander exception controls.

Do not put full consequence history, raw evidence ledger, all chief commentary, doctrine text or simulation diagnostics in the required path.

## Required #105 tests

At minimum prove:

- every issue defaults locally to Delegate but submitted command set contains an explicit disposition for every issue;
- browser never supplies/chooses the delegated final order as authority;
- intervention selection/undo updates the two-token draft budget deterministically;
- a third intervention cannot be submitted;
- legal defer is shown only where authored;
- reason/dissent rendering uses server-derived canonical refs and contains no hidden truth/score;
- standing intent uses player language and is not editable in Kestrel;
- stale-revision rejection cannot silently commit an outdated draft;
- no V2 surface renders `predictedEvents` or hidden posture/preparation;
- primary flow is keyboard-operable/accessibility-labelled;
- V1 client path remains available and unchanged in semantics.

## Rejection conditions

Reject #105 if it recreates mandatory packet/chiefs/review stages, requires clicking Delegate on every issue, computes recommendations in React, shows a best-option score, exposes hidden truth, automatically submits orders, or adds pre-gate graphics/polish unrelated to the plain-text fun hypothesis.
