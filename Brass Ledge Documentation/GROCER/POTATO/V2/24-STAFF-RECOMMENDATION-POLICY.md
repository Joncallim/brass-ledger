---
type: v2-recommendation-contract
status: active
---

# Staff Recommendation Policy

Backlink: [[README]]

This is the implementation authority for **#98 — deterministic belief-safe staff recommendation and dissent**. [[36-KESTREL-AGENDA-COURSE-MATRIX]] supplies Kestrel metadata/ties. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns bounded complete-package composition.

## Product purpose

Delegation should mean:

> my headquarters is acting according to the direction I gave it, through professional officers who can disagree.

It must not mean hidden scoring chooses for the player or that staff can spend exceptional commander authority by accident.

Every issue has one responsible officer, authored legal courses, one deterministic staff recommendation and optional visible dissent from another chief using the same HQ/public state.

Delegate executes recommendation. Intervene selects a different player-legal authored course. Defer exists only where authored.

## Information boundary

Recommendation may read only:

- current authored issue/course metadata;
- HQ belief/evidence;
- standing command direction;
- known commitments/obligations;
- known institutional/public campaign state;
- responsible/dissenting chief worldview;
- safe overt terminal crisis family.

Never read hidden Ravellan posture/preparation, raw adversary observations/action IDs/rows, future outcomes/input, oracle data, player score or hidden utility.

Changing hidden truth alone with all legitimate inputs fixed must leave recommendation/dissent deep-equal.

# Course authority

Kestrel course metadata includes:

- `supports`;
- `crossesBoundary`;
- `style`;
- `costs`;
- explicit prerequisites/commitment effect;
- professional concern/tie metadata;
- `requiresIntervention` where authorised.

## Commander-only Kestrel courses

Exactly these three order IDs are `requiresIntervention = true`:

1. `public-accusation` — unsupported unilateral public attribution under the weak/ambiguous C2 picture;
2. `request-partner-liaison` — emergency non-Lattice fallback that consumes one normal intervention and creates an obligation;
3. `use-attribution` — public C5 use of the one-shot credible case that exposes/compromises the protected source.

These courses:

- remain player-legal when their normal prerequisites hold;
- are excluded from the staff recommendation candidate set regardless of priority/style/tolerated cost;
- can never execute through Delegate;
- consume one normal personal intervention when chosen;
- must display their known immediate/authority cost before selection.

This is a bounded authority rule, not a professional-quality filter. No other Kestrel course becomes commander-only without explicit product decision.

# Recommendation algorithm

## Step 0 — legal player set

Start from every authored player-legal course for current issue/state.

If none exists, content is invalid.

## Step 1 — recommendation-applicable set

Remove only explicit authority/applicability constraints:

- prerequisite/capability/belief/public-state failure;
- `requiresIntervention = true`;
- bounded C5 package applicability under [[39]].

Do not remove a course merely because a chief dislikes it.

If the player has legal courses but staff set is empty without an explicitly authored package-level reason, content is invalid.

## Step 2 — protected boundary

If at least one candidate does not cross the commander's protected boundary, remove those that do.

If every candidate crosses it, keep all and emit `no-clean-option`/equivalent reason.

## Step 3 — main priority

If at least one candidate supports the main priority, retain those. Otherwise keep current set.

## Step 4 — default style

If at least one remaining candidate matches declared style, retain those. `neutral` is not a style match.

A commander-only course does not re-enter merely because it is the only course matching a style.

Example: `public-accusation` cannot become staff recommendation just because the standing default is visible deterrence.

## Step 5 — tolerated cost

If multiple candidates remain and some incur the declared tolerated cost rather than another authored course cost, prefer that set. Tolerable never means free.

## Step 6 — commitment handling

Among surviving recommendation-applicable courses, honour active commitment over breach unless a higher already-applied command distinction removed the honouring course.

Any recommended breach carries explicit warning. A promise is not hard prohibition unless its contract says so.

## Step 7 — responsible-chief tie

Use issue-specific authored tie from [[36]]. Chief worldview can provide concerns/final tie/dissent but never pre-filter standing direction.

Missing reachable tie is content validation failure. Never use array/lexical/random/seed ordering.

# Key political baselines

To preserve command-by-exception:

- C1 Political final tie: `informal-liaison > formal-consultation-agreement`;
- C2 public posture final tie among recommendation-applicable courses: `remain-silent > joint-non-attributive-warning` (`public-accusation` is commander-only);
- C3 reassurance final tie: `routine-contact > reassure-partner`.

Partner-oriented priority/style can select the positive political action before the tie. Under other philosophies, the commander spends an intervention if they want the additional political benefit.

This prevents beneficial political actions from becoming universal free staff improvements while preserving strategic identity.

# C5 package composition

C5 interacting issues cannot be recommended independently and then assumed compatible.

Use [[39]]:

1. derive non-authority staff intended orders;
2. determine whether intended package needs immediate partner authority;
3. C5 attribution staff baseline is always **`hold-attribution`** when issue exists because `use-attribution` is commander-only;
4. derive partner-authority recommendation from rapid-channel/withdrawal/intended-package constraints;
5. validate complete all-Delegate package.

Invariant:

> the all-Delegate staff package is always a legal complete command set.

If not, recommendation/content is defective; browser/headless may not repair it.

# Professional worldviews

### Intelligence

Values legitimate evidence and avoiding unsupported attribution. Recognises uncertainty and can dissent when action outruns evidence.

### Operations

Values credible denial and avoiding unrecoverable readiness collapse using HQ belief only.

### Political

Values partner consent/authority/commitments while preserving freedom to respond. Exceptional public attribution remains commander-only even if Political sees benefits.

# Recommendation result

Stable structured semantics only:

- issue ID;
- responsible officer;
- recommended order ID;
- ordered decisive reason refs;
- concern refs;
- optional dissent.

No score.

Normally render 2–4 decisive reasons, not every matched tag.

Reason families may include boundary, priority, style, tolerated cost, belief, commitment, capability, authority and professional concern.

# Dissent

Dissent evaluates the same HQ/public known state. It is advisory, not a second vote, and cannot read hidden truth.

Kestrel must support:

- C3 Intelligence/Operations disagreement from same `unclear + conflicted` belief;
- C5 Political/Operations conflict around authority/tempo/readiness/commitment.

# Implicit delegation

Command Room may initialise every issue locally to Delegate, but sim still owns recommendation and delegated final order.

Because commander-only courses are excluded from recommendation and all-Delegate package is legal, doing nothing never silently spends those exceptional authorities.

# Required #98 tests

At minimum prove:

- hidden truth changes with same legitimate inputs → equal recommendation/dissent;
- each commander-only course remains player-legal when prerequisites hold but can never become recommendation under any of 81 standing-intent combinations;
- selecting each commander-only course consumes exactly one normal intervention;
- C2 visible-deterrence style never auto-selects `public-accusation`;
- C5 partner priority/style never auto-selects `use-attribution`;
- protected-boundary/priority/style/tolerated-cost/commitment/tie precedence;
- all-candidates-cross emits no-clean-option rather than fake safety;
- C1 formal consultation, C2 joint warning and C3 reassurance follow standing partner direction or intervention rather than universal default;
- Lattice protection follows understanding direction/intervention;
- every C5 all-Delegate staff package legal;
- C5 attribution recommendation always Hold when issue exists;
- safe C6 crisis family controls terminal staff tie, never raw #99 ID;
- no numeric/global utility;
- V1 unchanged.

## Rejection conditions

Reject #98 if it adds weighted utility, chief pre-filtering before command direction, hidden-world access, random/array tie-breaking, allows any commander-only course through Delegate, lets visible style auto-accuse, lets partner intent auto-burn source, creates invalid all-Delegate packages, generates live recommendations with LLMs or generalises beyond bounded Kestrel need.
