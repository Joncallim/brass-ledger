---
type: v2-recommendation-contract
status: active
---

# Staff Recommendation Policy

Backlink: [[README]]

This is the implementation authority for **#98 — deterministic belief-safe staff recommendation and dissent**. [[36-KESTREL-AGENDA-COURSE-MATRIX]] supplies Kestrel course metadata/ties. [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns the bounded C5 package-composition step.

## Product purpose

Delegation should mean:

> my headquarters is acting according to the direction I gave it, through professional officers who can disagree.

It must not mean:

> a hidden AI score picked the best move for me.

Every issue has one responsible officer, authored legal courses, one deterministic staff recommendation and optional visible dissent from another chief using the same HQ belief/public state.

Delegate executes the recommendation. Intervene selects a different legal authored course. Defer exists only where authored.

## Information boundary

Recommendation may read only:

- current visible/authored issue and course metadata;
- HQ belief/evidence safe state;
- standing command direction;
- known commitments/obligations;
- known institutional capability;
- public campaign state needed by the issue;
- responsible/dissenting chief's authored professional worldview;
- safe observable terminal crisis family at C6.

It may not read:

- hidden Ravellan posture/preparation;
- raw adversary observations/action IDs/policy rows;
- future outcomes;
- oracle/counterfactual data;
- player score/win probability;
- hidden utility/option score;
- future player input.

Changing hidden truth alone while all legitimate recommendation inputs remain fixed must leave recommendation/dissent deep-equal.

## Course metadata

Kestrel courses use the bounded fields in [[36-KESTREL-AGENDA-COURSE-MATRIX]]:

- `supports`
- `crossesBoundary`
- `style`
- `costs`
- explicit belief/capability/commitment/public-state prerequisites;
- explicit commitment effect where relevant;
- professional concern/tie metadata;
- `requiresIntervention` where authorised.

Tags are semantic filters/reasons, never numbers.

## Step 0 — legal player course set

Start from authored courses legal for the issue/current public state.

A course can be player-legal even if staff may not recommend it.

If no player-legal course exists, content is invalid; engine does not invent one.

## Step 1 — recommendation-applicable set

From the legal player set, exclude only explicit **authority/applicability** constraints—not chief preferences.

Examples:

- course prerequisite not met;
- attribution issue absent/route unavailable without legitimate evidence;
- capability-specific action before capability exists;
- `requiresIntervention = true` course, which is commander-only;
- C5 package-composition applicability frozen in [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

This is not a professional quality filter.

Kestrel's `request-partner-liaison` remains player-legal but is excluded here because it always costs personal intervention.

If this set becomes empty while player-legal courses exist, content/composition is invalid unless 39 explicitly defines a package-level derivation that selects candidates after other issue recommendations.

## Step 2 — standing protected boundary

Apply the commander's protected boundary first.

If at least one candidate does not cross the declared boundary, remove candidates that do.

If every candidate crosses it:

- keep all;
- emit `no-clean-option` / equivalent reason;
- never fabricate a safe option.

## Step 3 — main priority

If at least one remaining candidate explicitly supports the main priority, keep those.

If none support it, keep current set and do not fabricate support.

## Step 4 — default style

If at least one remaining candidate matches the commander's default style, keep those.

`neutral` is not a style match; it remains only when no declared-style match exists.

## Step 5 — tolerated temporary cost

If several candidates remain and at least one incurs the commander's declared tolerable cost rather than another authored course cost, prefer that candidate set.

The cost is still shown. “Tolerable” does not mean free/beneficial.

## Step 6 — commitment handling

Known explicit commitments are never silently ignored.

After standing-direction filtering:

- where one candidate honours an active commitment and another breaches it, prefer honour unless a higher already-applied command-direction distinction removed that course;
- any recommended breach carries an explicit breach reason/warning;
- a promise/obligation is not a hard prohibition unless its contract says so.

C5 partner-authority/tempo interactions use the complete-package rules in 39 rather than independently pretending consultation has or lacks time.

## Step 7 — responsible-chief professional tie-break

If >1 candidate remains, apply the responsible chief's issue-specific authored preference among the remaining set from [[36-KESTREL-AGENDA-COURSE-MATRIX]].

Chief worldview can:

- provide professional concerns;
- explain why a tie is broken;
- produce dissent.

It cannot silently remove a course **before** command direction is applied.

If a reachable final tie lacks an authored preference, content validation fails. Do not use array order, lexical order, seed or randomness.

## C5 package composition

C5 contains interacting issues. A set of independently valid recommendations is not sufficient if their combination is illegal.

Use the bounded composition in [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]]:

1. derive non-authority intended orders in the frozen order;
2. calculate whether the intended package needs immediate partner authority;
3. apply the attribution recommendation-applicability rule (use attribution is staff-applicable only with legitimate evidence + active rapid consultation channel + non-withdrawn partner; otherwise Hold is staff baseline);
4. derive partner-authority recommendation with its rapid-channel/withdrawal/package constraints;
5. validate the complete **all-Delegate staff package**.

Invariant:

> the all-Delegate staff package must always be a legal complete command set.

If not, it is a content/recommendation defect; UI may not repair it silently.

This is one bounded Kestrel composition step, not a generic multi-issue optimiser.

## Professional worldview

Worldview produces explainable perspective, never hidden score.

### Intelligence

Values legitimate evidence, protects against unsupported attribution and recognises uncertainty. Can still recommend acting under uncertainty when command direction requires it.

### Operations

Values credible ability to deny a threat and avoiding unrecoverable readiness collapse. Knows only HQ belief, not actual hidden threat.

### Political

Values partner consent/authority and explicit commitments while preserving enough freedom to respond. Can recommend breach only through authored package/state logic with explicit warning.

## Recommendation result

Authoritative result contains only stable structured semantics such as:

- issue ID;
- responsible officer;
- recommended order ID;
- ordered decisive reason refs;
- visible concern refs;
- optional dissent records.

No global score.

Normally expose 2–4 decisive reasons, not every matching tag.

Reason families may include:

- `protect-boundary:*`
- `no-clean-option:*`
- `support-priority:*`
- `follow-style:*`
- `accept-tolerated-cost:*`
- `belief:*`
- `commitment-honour:*`
- `commitment-breach:*`
- `capability:*`
- `authority:*`
- `professional:*`

Presentation renders ordinary prose; player does not see rule IDs.

## Dissent

Dissent is advisory, not a second vote.

A dissenting chief evaluates the **same HQ belief/public known state** through an authored concern/preference.

Dissent record:

- dissenting officer;
- preferred legal order where applicable;
- reason refs;
- no hidden truth/score.

Kestrel requirements:

- C3 supports Intelligence/Operations disagreement from the same `unclear + conflicted` belief;
- C5 supports Political/Operations conflict around authority/tempo/readiness/commitment.

Changing hidden Ravellan truth alone cannot create/remove dissent.

## Implicit delegation

This engine still outputs an explicit recommendation and the ledger still persists explicit `delegate` disposition.

The Command Room may initialise every issue locally to Delegate so the commander interacts mainly with exceptions. The browser cannot choose or recompute the recommended delegated final order.

The all-Delegate package legality invariant makes this UI model safe.

## Examples

Operations may recommend holding reserve because the commander protected readiness and the HQ picture remains uncertain, while another chief warns that response time is being lost.

Political may recommend honouring consultation because a promise/channel exists, while Operations warns that immediate visible action cannot wait unless the rapid channel already supports it.

These explanations refer to known state, not hidden truth.

## Required #98 tests

At minimum:

- hidden truth changes with same legitimate inputs → equal recommendation/dissent;
- commander-only legal course remains visible to player but cannot become recommendation;
- protected boundary precedence;
- all-candidates-cross preserves candidates + no-clean-option reason;
- priority after boundary;
- style only after priority;
- tolerated cost only as later preference;
- commitment honour/default and explicit breach warning;
- authored chief tie determinism;
- missing reachable tie rejected;
- chief dissent from same belief;
- C1 formal consultation not universal baseline; partner direction can select it;
- Lattice protection follows standing understanding direction or intervention rather than universal staff default;
- liaison is never delegated;
- C5 attribution staff applicability depends on rapid formal channel/public state, never hidden truth;
- every reachable C5 all-Delegate staff package is complete/legal;
- safe C6 crisis family controls terminal staff ownership/tie, raw #99 action IDs absent;
- no numeric/global utility field exists;
- V1 advice unchanged.

## Rejection conditions

Reject #98 if it adds weighted utility, chief pre-filtering ahead of command direction, hidden-world access, random/seed/array tie-breaking, commander-only alternatives as free delegated actions, invalid all-Delegate staff packages, LLM-generated live recommendations or a generic rule engine beyond the concrete Kestrel need.