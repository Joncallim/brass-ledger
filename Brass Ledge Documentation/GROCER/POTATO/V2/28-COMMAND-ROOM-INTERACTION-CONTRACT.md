---
type: v2-command-room-contract
status: active
---

# Command Room Interaction Contract

Backlink: [[README]]

This is the player-facing authority for **#105 — command by exception without recreating an approval workflow**. It introduces no simulation rules; it presents the safe authoritative state from [[38-PLAYER-SAFE-PROJECTION-CONTRACT]].

## Start gate

Do not begin the main browser tranche until:

`#104 complete → #107 complete → 3-player formative smoke does not trigger stop/redesign`

under [[50-EXECUTION-PLAN]] / [[35-HUMAN-PLAYTEST-HARNESS]].

## Product rule

The player should answer five questions quickly:

1. What changed?
2. What will my headquarters do if I leave it alone?
3. Why?
4. Where is the disagreement/cost?
5. Which one or two things do I personally change?

No mandatory Briefing → Memos → Chiefs → Final Review chain.

## One command surface

Each cycle uses one primary Command Room containing:

- compact situation/change;
- standing direction;
- personal-attention budget;
- ordered consequential agenda;
- responsible officer + intended order;
- 2–4 decisive reasons;
- known direct cost/commitment;
- visible dissent;
- authored alternatives;
- safe cross-issue requirement/conflict notices;
- one `Issue Orders` action.

History/detail may be secondary disclosure, never mandatory paperwork.

## Implicit delegation

Every issue opens locally as:

`delegate`

The player need not click Approve/Delegate.

Conceptually:

> **Operations intends: Hold the reserve.**
>
> [why]
>
> **Change this order**

If untouched, browser submits `delegate`; server/sim derives the actual delegated order from authoritative recommendation.

The untouched all-Delegate package must be legal in every reachable state. If not, that is a content/recommendation defect — never something React repairs.

## Issue anatomy

Order content as:

1. human issue title / why now;
2. responsible officer + intended course;
3. decisive reasons;
4. known immediate/future commitment cost that the commander can legitimately know;
5. dissent/concern;
6. commander controls.

Do not dump matched tags/rules or expose implementation labels.

## Commander controls / authority

`Change this order` reveals legal authored alternatives.

Selecting a normal alternate:

- changes disposition to `intervene`;
- consumes one normal personal-attention token.

Returning to Delegate returns the token.

If Defer exists in some future/legal issue, expose it only where authoritative content allows it; do not invent it merely for UI symmetry.

### Commander-only liaison

`request-partner-liaison` is `requiresIntervention = true` under [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

It must:

- never appear as staff intended/delegated course;
- clearly consume one normal intervention;
- show the known liaison obligation before selection.

Task Collection remains separate and costs no normal intervention once Lattice is operational.

## Personal-attention budget

Show plainly, e.g.:

> **Personal attention: 1 of 2 used**

Do not theme it as energy/action points/mana.

At 2/2:

- other alternatives remain inspectable;
- third normal intervention cannot submit;
- selecting another requires explicitly undoing/changing an earlier intervention;
- never silently replace an earlier choice.

## Cross-issue package constraints

Some C5 choices are only meaningful/compatible as part of a complete package. The safe DTO may expose requirement/conflict refs; browser may explain/prevent an invalid draft, but **does not own the rule**.

Required behavior:

- untouched staff package is legal;
- changed draft may become incompatible;
- explain the conflict in player-safe language;
- do not silently change another issue;
- server remains final validator.

### C5 partner authority / tempo

Player must be able to understand before submission:

- active C1 formal consultation channel + `honour-consultation` can authorise an immediate partner-sensitive C5 action;
- without that rapid channel, honouring remains legal but is too slow for same-cycle visible reinforcement/public attribution;
- `act-then-inform` buys immediate unilateral tempo at breach/political cost;
- political concession buys immediate coordinated authority at severe cost;
- withdrawn partner may still honour commitments without being forced into concession, but that does not restore access.

Do not show hidden outcome predictions; these are known authority/timing constraints.

## Attribution must disclose the one-shot/source trade

When C5 `use-attribution` is legal, show **before selection** that:

- the current credible attribution opportunity is one-shot;
- public use spends it (`credible → used`);
- Hold And Expose will therefore not be available at C6 unless another explicitly authorised future rule existed (none does in Kestrel);
- public attribution exposes/compromises the protected source and is a known severe cost.

This is not an omniscient preview. It is the immediate known cost of publishing the evidence.

Do not hide this until the consequence screen.

## Standing direction

Show compact ordinary-language direction, e.g.:

> Keep Beacon secure · Do not burn the reserve without asking · Political heat is acceptable · Prepare quietly by default

No normal-player `mainPriority` / `redLine` implementation jargon. Intent is immutable during Kestrel.

## Situation / intelligence / public state

Lead with what changed since the last command.

Use only [[38-PLAYER-SAFE-PROJECTION-CONTRACT]]:

- safe world manifestation;
- HQ judgement/reasons/gaps;
- public Beacon/reserve/partner/commitment/capability state;
- safe Cycle-6 crisis family;
- no raw hidden state/signal/action IDs.

## Known-cost boundary

May show:

- direct reserve/exposure/civilian cost;
- explicit promise/obligation creation/breach;
- authority/timing requirement;
- one-shot/source cost;
- belief-safe chief concern.

May not show:

- hidden Ravellan response;
- exact future event;
- predicted terminal classification;
- probability;
- best-choice badge/global score;
- V1 `predictedEvents` on V2.

## Command summary / Issue Orders

Adjacent to one `Issue Orders` action, summarise:

> **You are personally changing:** …
>
> **Staff will handle:** …

Do not make this a second mandatory review screen.

Submission sends:

- cycle;
- `expectedRevision`;
- one disposition per authoritative agenda issue;
- selected legal Task Collection / commander-only liaison action where applicable.

Browser never sends delegated final order output, partner-authority result, consequences or state patches as authority.

## Rejection / stale reconciliation

For invalid cross-issue package:

- explain safe conflict;
- keep draft editable;
- never auto-repair another issue.

For stale revision:

- do not retry silently;
- refresh authoritative projection;
- show changed issue/recommendation/reason;
- preserve only choices that still map safely; otherwise require review.

## Consequence transition

Successful orders always flow through [[29-CONSEQUENCE-REVEAL-CONTRACT]] before the next Command Room. Do not skip the causal payoff.

## Cycle 1

Opening four-question standing-intent declaration is one concise command surface, not settings. It costs no intervention.

## Cycle 6

Display only routes legal under [[27-KESTREL-TERMINAL-MATRIX]] for the safe overt crisis family.

The player sees known campaign state and immediate route costs. Do not show pruned player-safe dominated routes merely to increase button count.

Prior hidden Ravellan history remains hidden until terminal debrief.

## Accessibility / density

Primary flow must be keyboard-operable with semantic labelled issue groups, associated recommendation/dissent, announced budget/errors, predictable focus and no colour-only meaning.

Default required reading remains:

1. what changed;
2. intended action;
3. decisive reasons;
4. disagreement/known cost/requirement;
5. exception controls.

Keep full history/evidence/doctrine/diagnostics out of the required path.

## Required #105 tests

At minimum prove:

- all issues default Delegate and untouched package is server-legal;
- browser never supplies delegated final order as authority;
- intervention/undo/two-token limit deterministic;
- liaison never delegates and consumes one token;
- Task Collection does not consume normal token;
- safe C5 cross-issue conflicts displayed; invalid draft cannot submit; no silent repair;
- withdrawn + honour remains selectable without forced concession;
- one-shot attribution + source-exposure cost shown before use;
- safe Cycle-6 crisis family + pruned legal route set only;
- no raw hidden state/action/signal/predicted outcome;
- stale draft cannot commit silently;
- keyboard/accessibility flow;
- V1 client semantics unchanged.

## Rejection conditions

Reject #105 if it recreates approval paperwork, requires Delegate clicks, computes recommendation/package legality in React as authority, hides a known one-shot/source/commitment cost, silently repairs incompatible orders, displays pruned trap routes, exposes hidden truth, auto-submits orders, or spends scope on pre-gate polish unrelated to the plain-text fun hypothesis.
