---
type: v2-command-room-contract
status: active
---

# Command Room Interaction Contract

Backlink: [[README]]

This is the player-facing authority for **#105 — command by exception without recreating approval paperwork**. It renders only [[38-PLAYER-SAFE-PROJECTION-CONTRACT]] data; sim owns every rule.

# 1. Start gate

`#104 complete → #107 complete → formative smoke does not trigger stop/redesign → #105/#106`

# 2. Player questions

The surface should answer:

1. What changed?
2. What does Intelligence currently think?
3. What current direct warning do we actually have?
4. What will HQ do if I leave it alone?
5. Why, and where is the disagreement/cost?
6. Which one or two things do I personally change?

No mandatory Briefing → Memos → Chiefs → Final Review chain.

# 3. One command surface

Show:

- compact situation/change;
- bounded Intelligence-Chief brief;
- standing direction;
- normal personal-attention budget;
- consequential agenda;
- intended staff course + 2–4 reasons;
- known costs/commitments;
- dissent;
- legal alternatives;
- safe package conflicts;
- Lattice default/retarget control when operational;
- one `Issue Orders` action.

Full evidence/history stays secondary.

# 4. Intelligence Chief surface

Use only the server/sim-derived safe brief.

Required path:

- one judgement;
- <=2 basis facts;
- <=1 contrary fact;
- exactly one key gap;
- <=1 watch-for;
- <=1 material update line;
- separate warning-status line;
- exact safe public claim only when actionable.

Each displayed fact includes concise source/method and limitation context.

Do not render:

- internal weak/conflicted/coherent;
- indicator/diagnostic/basis-pattern labels;
- internal public-case state/support IDs;
- raw evidence origins/hashes/source facts;
- hidden Ravellan state/action;
- confidence percentage/bar/band;
- full evidence ledger in required path.

## Total presentation states

The UI must render every one of the 15 algebraically legal basis-pattern/warning mappings from 23C, including combinations current producers do not reach.

It must support without error:

- preparation judgement + no current warning;
- conflicted judgement + current warning;
- coercion/weak judgement + separate preparation warning.

## Warning status

Never infer warning from judgement prose.

- any usable warning is shown;
- at C5/C6, explicit current warning or explicit “no current direct warning” is always shown;
- if a C4 focused warning becomes stale by C6, the update explains that its direct-warning value expired even if the report still supports assessment/public case;
- a newer Lattice landing report may refresh warning.

React displays the safe status returned by server/sim; it does not calculate currentness.

# 5. Implicit delegation

Every agenda issue begins locally Delegate.

Untouched issue submits Delegate. Sim derives the final delegated order. Browser never sends the delegated final order as authority.

Untouched all-Delegate package must be legal.

# 6. Commander controls

`Change this order` reveals authored alternatives.

A normal alternate changes disposition to Intervene and consumes one normal token. Returning to Delegate returns it.

At 2/2:

- other choices remain inspectable;
- third normal intervention cannot submit;
- player explicitly releases/changes an earlier one;
- never silently replace one.

# 7. Commander-only exceptional courses

Exactly:

## C2 `public-accusation`

- one normal intervention;
- unsupported/unilateral under current evidence;
- disclose partner/promise risk + Intel objection;
- visible style cannot auto-select.

## C4 `request-partner-liaison`

- one normal intervention;
- disclose liaison obligation;
- never delegated fallback.

## C5 `use-attribution`

- one normal intervention;
- disclose exact current public claim, one-shot source exposure and authority requirement;
- partner priority cannot auto-use;
- staff recommendation is Hold.

Safe DTO provides `requiresIntervention`; UI never infers it from copy.

# 8. Lattice target control

When operational, Lattice is a separate zero-normal-intervention institutional action.

Show:

- HQ-selected unused target;
- remaining eligible unused targets;
- plain-language question/purpose for each;
- zero normal attention cost;
- previous used target at C5 where relevant.

Stable IDs:

- landing-force-staging;
- auxiliary-tasking;
- operational-sequence.

Rules:

- no no-task option;
- C5 cannot repeat C4 target;
- focused staging never removes landing target;
- player may retarget to another eligible target at zero normal token;
- returning to HQ selection clears the override;
- no hidden result preview.

The client sends only `taskTargetOverride` or null. Sim derives/persists the final target. The summary should count a retarget as a deliberate commander change, but not as one of the two normal interventions.

# 9. Issue anatomy

1. issue title/why now;
2. responsible officer + intended course;
3. decisive reasons;
4. known cost/commitment/authority requirement;
5. dissent/concern;
6. commander controls.

No raw rule IDs/tags.

# 10. C5 warning-sensitive staff intent

When current #100 warning is usable, Operations may recommend reinforcement even if wider judgement remains conflicted, exactly as returned by sim.

Show:

- warning as a separate fact;
- staff recommendation/reasons;
- standing-direction tension, e.g. protected reserve.

React never recomputes “warning means reinforce.”

If warning is stale/lost, it cannot remain visually presented as current or grant warning-specific recommendation/terminal benefit.

# 11. C5 package constraints

Visible safe semantics:

- active rapid channel + Honour can authorise immediate sensitive action;
- without rapid channel, Honour is too slow for same-cycle visible reinforcement/source use;
- Act buys unilateral tempo at breach/political cost;
- Concession buys coordinated authority at severe cost;
- withdrawn partner may Honour without restoring access;
- source Use needs intervention + compatible authority.

Invalid draft cannot submit. UI does not silently alter another issue. Server validates independently.

# 12. Attribution disclosure

There is no visible none/tentative/credible ladder.

When no current corroborated case is actionable, no source-use issue appears.

When available, before Use show:

- exact preparation or coercion claim;
- source use is one-shot;
- C6 source route removed after use;
- protected source exposed;
- one normal intervention;
- compatible authority needed.

After use, preserve the used claim in public state/debrief.

# 13. Standing direction / public state

Show standing direction in ordinary language and safe Beacon/reserve/partner/commitment/capability/authority state.

No raw hidden state/signals/actions/future branches or V1 predicted events.

# 14. Command summary / submission

Adjacent to `Issue Orders`:

> **You are personally changing:** …
>
> **Staff will handle:** …

Include zero-token Lattice retarget under personal changes when present, clearly separate from normal intervention count.

Submission sends only:

- cycle;
- expected revision;
- one disposition per issue;
- intervention order IDs;
- optional `taskTargetOverride`.

Never send delegated final orders/target, recommendation, HQ products, claim basis, authority result, consequences or state patches.

# 15. Invalid / stale state

Invalid package:

- explain safe conflict;
- retain editable draft;
- no silent repair.

Stale revision:

- no silent retry;
- refresh authoritative projection;
- show changed situation/Intel/warning/recommendation/target default;
- preserve only choices safely remappable under new eligibility.

A stale target override that is now used/ineligible is dropped only with explicit notice, never silently submitted as another target.

# 16. Consequence transition

After successful orders always show [[29-CONSEQUENCE-REVEAL-CONTRACT]] before the next Command Room.

# 17. C1 / C6

C1 standing-intent declaration is one concise zero-intervention opening surface.

C6:

- show safe overt crisis only;
- label Intel as pre-manifestation picture;
- show explicit current warning status;
- show only 27-pruned routes;
- clean Quiet uses server-derived current warning predicate, not UI inference.

# 18. Accessibility / density

Keyboard-operable labelled groups, associated Intel/reasons/dissent, announced budget/target/errors, predictable focus, no colour-only meaning.

Required reading order:

1. what changed;
2. Intel judgement + current warning/gap;
3. staff intended action/default task;
4. decisive reasons/disagreement/known cost;
5. exception controls.

# 19. Required #105 tests

Prove:

- bounded safe #100 brief only;
- all 15 algebraic presentation states render;
- C5/C6 explicit warning usable/none;
- focused-warning stale loss and Lattice refresh displayed correctly;
- no warning inference in React;
- implicit Delegate + legal all-Delegate package;
- browser never supplies delegated final order;
- intervention/undo/2-token limit;
- exactly three commander-only courses;
- Lattice recommended target, no no-task/repeat, zero-token retarget and optional override submission;
- focused collection does not remove landing;
- warning-sensitive C5 advice displayed exactly from sim;
- safe package conflicts/no repair;
- withdrawn+Honour selectable;
- exact public claim/source/intervention cost before Use;
- no visible credibility ladder;
- safe C6 crisis/pruned routes;
- no hidden/internal model data;
- stale draft cannot silently commit/remap;
- keyboard/accessibility;
- V1 unchanged.

# 20. Rejection conditions

Reject #105 if it recreates approval workflow, computes intelligence/recommendation/package/terminal rules in React, infers warning from prose or stale history, omits explicit warning-none at C5/C6, exposes internal confidence/source facts, lets client author delegated Lattice target, offers no-task/same-target/old target ID, makes focused collection consume landing, allows commander-only Delegate, hides known costs, shows a credibility meter, silently repairs packages, displays pruned routes, leaks hidden truth or adds unrelated pre-gate polish.
