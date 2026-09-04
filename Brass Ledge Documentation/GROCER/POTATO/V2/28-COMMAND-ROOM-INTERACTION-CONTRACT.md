---
type: v2-command-room-contract
status: active
---

# Command Room Interaction Contract

Backlink: [[README]]

This is the player-facing authority for **#105 — command by exception without recreating approval paperwork**. It presents only [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] data; sim owns rules and #100 analysis.

# Start gate

`#104 complete → #107 complete → 3-player formative smoke does not trigger stop/redesign → #105/#106`

# Player questions

The Command Room should make it easy to answer:

1. What changed?
2. What does Intelligence currently think, and what direct warning do we actually have?
3. What will HQ do if I leave it alone?
4. Why / where is the disagreement or cost?
5. Which one or two things do I personally change?

No mandatory Briefing → Memos → Chiefs → Final Review chain.

# One command surface

Show:

- compact situation/change;
- bounded Intelligence-Chief brief;
- standing direction;
- personal-attention budget;
- consequential agenda;
- intended staff course + 2–4 reasons;
- known costs/commitments;
- dissent;
- legal alternatives;
- safe package requirements/conflicts;
- one `Issue Orders` action.

Full history/evidence stays secondary.

# Intelligence Chief surface

Use the server/sim-derived safe brief from [[23-HQ-BELIEF-AND-EVIDENCE]] / [[38-PLAYER-SAFE-PROJECTION-CONTRACT]].

Required path is bounded to:

- one judgement;
- <=2 basis facts;
- <=1 contrary fact;
- exactly one key gap;
- <=1 watch-for signpost;
- optional assessment-change message;
- separate safe tactical-warning wording where material.

The UI must support both without treating either as an error:

- preparation judgement + warning none;
- conflicted judgement + warning usable.

Never infer warning by parsing judgement prose. Warning is a distinct safe DTO semantic.

Do not render normal-player:

- internal `weak|conflicted|coherent` labels;
- `indicator|diagnostic` labels;
- #100 internal public-case enum;
- raw evidence selector/source facts;
- hidden action/preparation/posture;
- confidence percentage/bar/band;
- required-path evidence ledger dump.

The interface should communicate in ordinary language, not intelligence doctrine jargon.

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
- player explicitly undoes/changes an earlier intervention;
- never silently replace one.

Task Collection remains separate zero-normal-intervention action once Lattice operational.

# Commander-only exceptional actions

Exactly three Kestrel courses are `requiresIntervention = true` and must never appear as staff intended action:

## C2 `public-accusation`

- one normal intervention;
- unsupported/unilateral under current weak/ambiguous public case;
- show partner/commitment risk + Intel concern;
- visible standing style cannot auto-select it.

## C4 `request-partner-liaison`

- one normal intervention;
- show liaison obligation;
- never free delegated fallback.

## C5 `use-attribution`

- one normal intervention;
- show one-shot/source/authority costs;
- partner-oriented standing intent cannot auto-burn source;
- staff intended action is Hold.

Safe DTO exposes `requiresIntervention`; UI does not infer authority from labels/copy.

# Issue anatomy

1. issue title / why now;
2. responsible officer + intended course;
3. decisive reasons;
4. known immediate/future cost/commitment/authority requirement;
5. dissent/concern;
6. commander controls.

No raw rule IDs/tags.

# C5 warning-sensitive staff intent

When #100 warning is usable, C5 Operations may recommend reinforcement even if the wider judgement remains conflicted, exactly as returned by sim under [[36-KESTREL-AGENDA-COURSE-MATRIX]].

UI must show:

- direct warning as a separate information fact;
- staff recommendation/reasons derived by sim;
- any standing-direction tension, e.g. protected reserve red line.

React never recomputes “warning means reinforce.”

# C5 package constraints

UI may explain safe constraints but is not authority.

Visible semantics include:

- active C1 rapid channel + Honour can authorise immediate sensitive action;
- without rapid channel, Honour too slow for same-cycle visible reinforcement/public attribution;
- Act buys unilateral tempo at breach/political cost;
- Concession buys coordinated authority at severe cost;
- withdrawn partner may Honour without restoring access;
- commander-only attribution use consumes intervention + compatible authority.

Invalid draft cannot submit. UI never silently changes another issue. Server validates.

# Attribution known-cost disclosure

Before C5 Use show:

- legitimate #101 opportunity is one-shot;
- public use changes credible→used;
- C6 Hold And Expose removed;
- protected source exposed/compromised;
- one intervention consumed;
- immediate authority must be compatible.

Do not expose #100 internal public-case basis as a hidden “credibility meter.”

# Standing direction / public state

Show standing direction in ordinary language.

Lead with what changed. Use safe Beacon/reserve/partner/commitment/capability/authority state + safe C6 crisis family.

No raw hidden state/signals/actions/future branches or V1 predicted events.

# Command summary / submission

Adjacent to `Issue Orders`, summarize:

> **You are personally changing:** …
>
> **Staff will handle:** …

Submission sends player authority only:

- cycle;
- expected revision;
- one disposition per issue;
- intervention order IDs;
- legal Task Collection target.

Never send recommendation, HQ assessment/warning, partner-authority result, consequences or state patches as player authority.

# Invalid / stale state

Invalid package:

- explain safe conflict;
- keep draft editable;
- no silent repair.

Stale revision:

- no silent retry;
- refresh authoritative projection;
- show changed situation/Intel/recommendation/reasons;
- preserve only safely remappable choices.

# Consequence transition

After successful orders always show [[29-CONSEQUENCE-REVEAL-CONTRACT]] before next Command Room.

# C1 / C6

C1 intent is one concise opening command surface, zero intervention.

C6 displays only [[27-KESTREL-TERMINAL-MATRIX]] routes for safe crisis family. Clean Quiet against seizure uses the separate warning product; UI does not infer this predicate itself.

# Accessibility / density

Keyboard-operable labelled issue groups, associated Intel/reasons/dissent, announced budget/errors, predictable focus, no colour-only meaning.

Required reading priority:

1. what changed;
2. Intel judgement + direct warning/gap where material;
3. intended staff action;
4. decisive reasons/disagreement/known cost;
5. exception controls.

# Required #105 tests

Prove:

- bounded #100 brief only;
- preparation/no-warning and conflicted/usable-warning safe UI states;
- no warning inference in React;
- implicit Delegate + legal all-Delegate package;
- browser never supplies delegated final order;
- intervention/undo/two-token limit;
- exactly three commander-only actions;
- Task Collection zero token;
- warning-sensitive C5 recommendation displayed exactly from sim;
- safe package conflicts displayed/no repair;
- withdrawn + Honour selectable;
- one-shot/source/intervention attribution cost before use;
- safe C6 crisis + pruned route set;
- no hidden/internal confidence/model data;
- stale draft cannot silently commit;
- keyboard/accessibility;
- V1 unchanged.

# Rejection conditions

Reject #105 if it recreates approval workflow, computes intelligence/recommendation/package/terminal rules in React, infers warning from judgement text, exposes internal confidence/source facts, lets commander-only course Delegate, hides known costs, silently repairs packages, displays pruned routes, exposes hidden truth or adds unrelated pre-gate polish.
