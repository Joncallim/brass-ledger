---
type: v2-recommendation-contract
status: active
---

# Staff Recommendation Policy

Backlink: [[README]]

This document is the implementation authority for **#98 — staff recommendation reason engine**. It defines how a responsible officer recommends an authored course without hidden-world access, numeric utility, or automatic commander substitution.

## Product purpose

Delegation should feel like **“my headquarters is acting according to the direction I gave it”**, not “the AI picked the best move.”

Every command issue therefore has:

- one responsible lead officer;
- two or three authored legal courses;
- one deterministic staff recommendation derived from HQ belief, known commitments, institutional capability, chief worldview and standing command direction;
- optional visible dissent from another chief who evaluates the same belief-safe situation differently.

Delegate executes the lead recommendation. Intervene selects a different authored course. Defer is legal only where the issue explicitly allows it.

## Hard information boundary

Recommendation derivation may read only:

- the visible/current agenda issue and its authored course metadata;
- HQ belief from [[23-HQ-BELIEF-AND-EVIDENCE]];
- standing command intent;
- known commitments/promises/obligations;
- visible/persisted institutional capability state;
- the responsible chief’s authored professional worldview;
- public campaign state required by the issue.

It may not read:

- hidden Ravellan posture or preparation;
- adversary observation state unless that information separately entered HQ belief/public state;
- future outcomes;
- oracle data;
- player score/win probability;
- a hidden global option score.

Holding all legal recommendation inputs constant while changing hidden world truth must produce a deep-equal recommendation result.

## Authored course metadata

Each Kestrel course exposes only bounded semantic tags needed by this prototype. Do not build a general policy language.

A course may declare:

- `supports`: zero or more of `beacon-security`, `partner-cooperation`, `ravellan-understanding`;
- `crossesBoundary`: zero or more of `civilian-shipping`, `partner-consultation`, `reserve-readiness`;
- `style`: one of `quiet-preparation`, `visible-deterrence`, `partner-consultation`, or `neutral`;
- `costs`: zero or more of `weaker-deterrence`, `political-friction`, `reserve-strain`;
- required HQ-belief/evidence/capability predicates;
- commitment effect: `honour`, `breach`, `none`, or a specific authored obligation transition;
- professional tags used by the responsible chief’s Kestrel worldview.

These tags explain and filter authored choices. They are not numbers and are never multiplied/summed.

## Step 1 — legal/applicable course set

Start only with authored courses that are legal in the current issue.

A course is inapplicable if an explicit belief/capability prerequisite is not met. Examples:

- Cycle-5 attribution does not exist without legitimate evidence;
- a Lattice-specific action does not exist before Lattice is operational;
- a course requiring partner participation is unavailable if authored state has already removed that participation.

Do not hide an otherwise legal but costly course merely because staff dislikes it.

If the issue has no legal course, content validation must fail; recommendation code must not invent one.

## Step 2 — professional acceptability

The responsible chief applies a small authored Kestrel worldview to the legal set. This is a **filter/reason step**, not a score.

Professional worldview principles for the prototype:

### Intelligence lead

Prefers courses that preserve legitimate uncertainty, improve/act on evidence, and avoid unsupported attribution. It may still recommend acting under uncertainty when the commander's priority/boundary makes waiting professionally unacceptable.

### Operations lead

Prefers courses that preserve credible ability to deny a real threat and avoid creating an unrecoverable readiness problem. It does not know whether the threat is real beyond HQ belief.

### Political lead

Prefers courses that preserve partner consent and explicit commitments while maintaining enough coalition freedom to respond. It may recommend breaking a promise only when the authored issue leaves a more important command objective otherwise exposed; the breach must be stated explicitly.

A worldview may reject a course as professionally unacceptable only through an authored predicate attached to that issue/course. Do not create a generic hidden utility model.

If professional filtering would remove every legal course, restore the full legal set and mark the issue as a professional conflict: staff must still recommend one course while explaining that every available option violates a professional concern.

## Step 3 — standing-direction precedence

Apply the commander’s four opening directions lexicographically to the remaining candidate set.

### 3A. Protected boundary

If at least one candidate does **not** cross the commander’s protected boundary, remove candidates that do cross it.

If every candidate crosses the boundary, keep all candidates and attach a visible reason that no viable course fully protects the stated boundary.

### 3B. Main priority

If at least one remaining candidate explicitly supports the commander’s main priority, retain those candidates.

If none explicitly support it, retain the current set and do not fabricate support.

### 3C. Default style

If at least one remaining candidate matches the commander’s default style, retain those candidates.

`neutral` does not count as a style match; it remains only if no candidate matches the declared style.

### 3D. Tolerated temporary cost

If more than one candidate remains and at least one incurs the commander’s declared tolerable cost rather than another declared course cost, prefer that candidate set.

This does **not** make the tolerated cost free or good. The recommendation must say what is being spent.

## Step 4 — commitment resolution

Known explicit commitments are never silently ignored.

After standing-direction filtering:

- if one remaining candidate honours an active commitment and another breaches it, the responsible chief prefers honour **unless** the honouring course fails an already-applied protected-boundary or main-priority condition that the breaching course satisfies;
- when a breach is recommended, the recommendation must carry a commitment-breach reason reference and ordinary-language warning;
- a promise/obligation is not a legal prohibition unless its own authored contract says so.

This rule must not be reimplemented as a trust/morality score.

## Step 5 — responsible-chief tie-break

If more than one candidate still remains, apply the responsible chief’s issue-specific authored preference order among those remaining courses.

This is the final tie-break and must be visible as a professional reason when material.

If content omits the required preference order for a reachable tie, validation fails. Engine code may not choose array order, lexical order, randomness or seed as an implicit recommendation tie-break.

## Recommendation result

The authoritative recommendation result contains:

- issue ID;
- responsible officer;
- recommended order ID;
- ordered discrete reason references;
- zero or more visible concern/dissent references;
- no global score.

Reason references are canonical structured IDs; presentation turns them into authored plain language.

The recommendation should normally expose **2–4 meaningful reasons**, not every matching tag. The first reasons should explain the decisive filters/tie-breaks that actually selected the course.

Possible reason families include:

- `protect-boundary:*`
- `support-priority:*`
- `follow-style:*`
- `accept-tolerated-cost:*`
- `belief:*`
- `commitment-honour:*`
- `commitment-breach:*`
- `capability:*`
- `professional:*`
- `no-clean-option:*`

Exact IDs are content/contract-owned and must remain stable for replay/readout tests.

## Dissent

Dissent is not a second vote and does not change the lead recommendation automatically.

A dissenting chief evaluates the **same HQ belief and known state** through an authored issue-specific concern predicate. A dissent record contains:

- dissenting officer;
- preferred authored order where applicable;
- one or more reason references;
- no hidden truth and no score.

Canonical Kestrel requirements:

- Cycle 3 must be able to produce Intelligence/Operations disagreement from the same HQ belief;
- Cycle 5 must be able to produce Political/Operations conflict around commitment versus tempo/readiness.

Changing hidden Ravellan truth alone must never create/remove dissent.

## Natural-language presentation examples

The engine returns reason references; presentation/content renders prose such as:

> **Operations recommends keeping the reserve back.**
>
> You told the headquarters not to burn through the reserve without asking, and Intelligence still cannot confirm a prepared seizure.
>
> **Operations concern:** moving now would improve response time but use the reserve again.

or:

> **Political recommends honouring consultation.**
>
> You made an explicit commitment to consult the partner, and joint action still remains available if we wait for their answer.
>
> **Operations objects:** another delay reduces the time available to reinforce Beacon.

Do not render rule IDs, scores or implementation labels.

## Implicit delegation is a presentation rule

The authoritative command contract still persists an explicit `delegate` disposition. The future Command Room may initialise every issue as Delegate so the player only interacts with exceptions. That UI convenience must not change this recommendation engine or allow the browser to choose the recommendation.

## Required #98 tests

At minimum prove:

- same HQ belief/intent/commitment/capability plus different hidden Ravellan truth → identical recommendation;
- protected-boundary filtering wins when a viable non-crossing candidate exists;
- all-candidates-cross preserves choices and emits `no-clean-option` rather than inventing safety;
- main-priority filtering follows the protected-boundary step;
- default style only breaks remaining choices;
- tolerated cost is a later preference and remains visible as a cost;
- active commitment is honoured by default when standing-direction constraints do not require breach;
- breach can be recommended only through an authored reachable case and emits an explicit breach reason;
- responsible-chief authored tie-break resolves a reachable final tie deterministically;
- missing tie-break content for a reachable tie is rejected;
- two chiefs can disagree from the same HQ belief without either reading hidden truth;
- reason references are stable/discrete and no numeric/global score exists;
- V1 advice contracts remain unchanged.

## Rejection conditions

Reject #98 if it introduces a weighted utility function, hidden option ranking, LLM-generated recommendation, world-truth access, random/seed tie-break, automatic player intervention, or a generic rule engine broader than the concrete Kestrel need.
