---
type: v2-command-room-contract
status: active
---

# Command Room Interaction Contract

Backlink: [[README]]

This is the player-facing authority for **#105 — command by exception without recreating approval paperwork**. It presents only [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] data; sim owns all rules.

## Start gate

`#104 complete → #107 complete → 3-player formative smoke does not trigger stop/redesign → #105/#106`

## Player questions

The Command Room should make it easy to answer:

1. What changed?
2. What will HQ do if I leave it alone?
3. Why?
4. What costs/disagreement/requirement matter?
5. Which one or two things do I personally change?

No mandatory Briefing → Memos → Chiefs → Final Review chain.

# One command surface

Show:

- situation/change;
- standing direction;
- personal-attention budget;
- consequential agenda;
- intended staff course + 2–4 reasons;
- known costs/commitments;
- dissent;
- legal alternatives;
- safe cross-issue requirements/conflicts;
- one `Issue Orders` action.

Full history/detail stays secondary.

# Implicit delegation

Every issue begins locally `delegate`.

Untouched issue submits Delegate; server/sim derives actual delegated order. Browser never sends delegated final order as authority.

The untouched all-Delegate package must be legal. If not, recommendation/content is defective.

# Commander controls

`Change this order` reveals authored legal alternatives.

A normal alternate changes disposition to `intervene` and consumes one normal token. Returning to Delegate returns token.

At 2/2:

- other choices remain inspectable;
- third normal intervention cannot submit;
- player must explicitly undo/change an earlier intervention;
- never silently replace one.

Task Collection remains separate zero-normal-intervention action once Lattice operational.

## Commander-only exceptional actions

Exactly three Kestrel courses are explicitly marked `requiresIntervention` and must **never** appear as staff intended action:

### C2 `public-accusation`

- always one normal intervention;
- unsupported/unilateral under current weak/ambiguous evidence;
- player sees partner/commitment risk and Intelligence concern before selection;
- “show strength” standing style cannot auto-select it.

### C4 `request-partner-liaison`

- always one normal intervention;
- player sees real liaison obligation before selection;
- never a free delegated intelligence fallback.

### C5 `use-attribution`

- always one normal intervention;
- player sees one-shot loss + source exposure + authority requirement before selection;
- partner-oriented standing intent cannot auto-burn the source;
- staff intended action for this issue is Hold.

The safe DTO should expose `requiresIntervention`/equivalent semantic authority so UI does not infer this list from labels.

# Issue anatomy

Order:

1. human issue title / why now;
2. responsible officer + intended course;
3. decisive reasons;
4. known immediate/future cost/commitment/authority requirement;
5. dissent/concern;
6. commander controls.

No raw rule IDs/tags.

# C5 package constraints

UI may explain safe constraints but is not authority.

Required visible semantics:

- active C1 formal channel + Honour can authorise immediate sensitive action;
- without rapid channel, Honour remains legal but too slow for same-cycle visible reinforcement/public attribution;
- Act Then Inform buys unilateral tempo at breach/political cost;
- concession buys immediate coordinated authority at severe cost;
- withdrawn partner may Honour without restoring access;
- selecting commander-only public attribution additionally consumes one intervention.

Invalid draft cannot submit. UI never silently changes another issue. Server independently validates.

# Attribution known-cost disclosure

Before C5 `use-attribution` selection show:

- credible case is one-shot;
- public use spends it (`credible → used`);
- C6 Hold And Expose will no longer be available;
- protected source will be exposed/compromised (known severe cost);
- one normal intervention is consumed;
- immediate authority must be compatible.

These are known direct costs, not hidden future outcome prediction.

# Standing direction / situation / intelligence

Show standing direction in ordinary language only.

Lead with what changed. Use safe HQ judgement/gaps, public Beacon/reserve/partner/commitment/capability/authority state and safe C6 crisis family.

Never show raw hidden state/signal/action IDs, future branch/probability or V1 predicted events.

# Command summary / submission

Adjacent to `Issue Orders`, summarise:

> **You are personally changing:** …
>
> **Staff will handle:** …

Submission sends only player authority:

- cycle;
- expected revision;
- one disposition per issue;
- chosen intervention order IDs (including commander-only ones);
- legal Task Collection selection where applicable.

Never send recommendation, partner-authority result, consequences or state patches as authority.

# Rejection / stale state

Invalid package:

- explain safe conflict;
- keep draft editable;
- no silent repair.

Stale revision:

- no silent retry;
- refresh authoritative projection;
- show changed issue/recommendation/reason;
- preserve only safely remappable choices.

# Consequence transition

After successful orders always show [[29-CONSEQUENCE-REVEAL-CONTRACT]] before next Command Room.

# Cycle 1 / Cycle 6

C1 intent is one concise opening command surface and costs no intervention.

C6 displays only [[27-KESTREL-TERMINAL-MATRIX]] routes for safe overt crisis family. Do not pad with pruned futile/dominated buttons.

# Accessibility / density

Keyboard-operable labelled issue groups, associated reasons/dissent, announced budget/errors, predictable focus, no colour-only meaning.

Required reading stays shallow:

1. what changed;
2. intended action;
3. decisive reasons;
4. known cost/disagreement/requirement;
5. exception controls.

# Required #105 tests

Prove:

- implicit Delegate + legal all-Delegate package;
- browser never supplies delegated final order;
- normal intervention/undo/two-token limit;
- **exactly** C2 accusation, C4 liaison and C5 attribution use are commander-only, never staff intended, always cost one intervention;
- visible style cannot auto-accuse;
- partner intent cannot auto-use attribution;
- Task Collection costs no normal token;
- safe C5 conflicts/requirements displayed; invalid draft blocked with no repair;
- withdrawn + Honour remains selectable;
- one-shot/source/intervention cost shown before attribution use;
- safe C6 crisis family + pruned route set;
- no hidden/predicted data;
- stale draft cannot silently commit;
- keyboard/accessibility;
- V1 unchanged.

## Rejection conditions

Reject #105 if it recreates approval workflow, lets React compute authoritative rules, lets any commander-only course Delegate, auto-accuses from standing style, auto-burns source from standing priority, hides known exceptional-action costs, silently repairs packages, displays pruned terminal traps, exposes hidden truth or spends pre-gate scope on unrelated polish.
