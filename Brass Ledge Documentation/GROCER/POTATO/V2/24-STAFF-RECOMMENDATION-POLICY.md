---
type: v2-recommendation-contract
status: active
---

# Staff Recommendation Policy

Backlink: [[README]]

This is the implementation authority for **#98 — deterministic belief-safe staff recommendation and dissent**.

- [[23-HQ-BELIEF-AND-EVIDENCE]] owns HQ intelligence products.
- [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]] owns the verified projection context needed during live play and replay.
- [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] owns complete intelligence-state coverage.
- [[36-KESTREL-AGENDA-COURSE-MATRIX]] owns issue metadata/ties.
- [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns complete-package composition.

# Product purpose

Delegation should mean:

> My headquarters is acting according to the direction I gave it, through professional officers who can disagree.

It must not mean hidden scoring chooses for the player, an omniscient analyst supplies the answer, or staff spends exceptional commander authority accidentally.

Every issue has one responsible officer, authored legal courses, one deterministic recommendation and optional visible dissent using the same legitimate HQ/public state.

Delegate executes recommendation. Intervene selects another player-legal authored course. Defer exists only where authored.

# Verified-prefix input

Recommendation/agenda derivation must work from the `V2VerifiedProjectionContext` responsibility in [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]].

During live play/replay of command cycle Q, the input contains only:

- trusted identity/model bundle;
- current replay-verified state/revision;
- ledger prefix through the current Q Ravellan decision;
- command sets only through Q-1;
- current #100 derived snapshot/public state.

It does not contain unverified command Q evidence or future saved entries.

Evolve the committed state-only trusted agenda-provider API under #98. This is an in-memory API change, not a persisted V2 format change.

# Information boundary

Recommendation may read only the exact derived/public products an issue needs:

- authored issue/course metadata;
- #100 intent assessment where estimate matters;
- #100 tactical warning where explicitly warning-sensitive;
- bounded evidence/source-context refs for explanation/dissent, not a second scoring system;
- #100 current public-case basis only to determine whether the source-sensitive attribution issue exists and what claim it concerns;
- persistent source-use state to prove the source is still unspent;
- standing direction;
- known commitments/obligations/capability/public campaign state;
- responsible/dissenting chief worldview;
- safe overt C6 crisis family.

Recommendation must not read:

- hidden Ravellan posture/preparation;
- raw adversary observations/actions/policy rows;
- raw #100 observation source facts;
- oracle/counterfactual truth;
- future command/outcome data;
- player score/global utility;
- client-supplied claim direction/evidence basis;
- a persisted none/tentative/credible attribution mirror.

Changing hidden truth alone while all legitimate inputs remain fixed leaves recommendation/dissent deep-equal.

# Assessment, warning and public case are different inputs

- intent assessment answers what HQ thinks Ravellan's campaign means;
- tactical warning answers whether direct physical movement is worth acting on;
- public-case basis answers what HQ can currently substantiate publicly with protected sourcing.

Do not infer one from another.

Current Kestrel uses:

- C5 Beacon Operations tie may use warning;
- some ties may use assessment where frozen in 36;
- C5 attribution issue existence may use current credible public-case basis + unspent source;
- staff still never recommends `use-attribution`;
- C6 route legality belongs to 27.

# Course authority

Metadata fields:

- supports;
- crossesBoundary;
- style;
- costs;
- player-known prerequisites/commitment effects;
- professional concern/tie metadata;
- requiresIntervention where authorised.

Exactly these are commander-only:

1. `public-accusation`;
2. `request-partner-liaison`;
3. `use-attribution`.

They remain player-legal under prerequisites, never recommendation-applicable/Delegate, cost one normal intervention and disclose known costs before selection.

No standing priority/style/tolerated cost can re-enter one into the recommendation set.

# Recommendation algorithm

## Step 0 — player-legal set

Start from authored player-legal courses under current player-known state.

No legal course is a content error.

## Step 1 — recommendation-applicable set

Remove only:

- unmet player-known prerequisite/capability/current derived-product requirement;
- requiresIntervention courses;
- bounded package-inapplicability from 39.

Do not remove a course because a chief dislikes it.

If player-legal courses remain but the staff set becomes empty without an authored package reason, content is invalid.

## Step 2 — protected boundary

If at least one candidate does not cross the protected boundary, remove those that cross.

If all cross, retain all and emit `no-clean-option`. Never fabricate a safe course.

For C5 interacting actions, evaluate partner-consultation boundary at complete-package level under 39.

## Step 3 — main priority

If one or more remaining courses support the main priority, retain them. Otherwise keep the set.

## Step 4 — default style

If one or more remaining courses match declared style, retain them. Neutral is not a style match.

## Step 5 — tolerated cost

If multiple candidates remain and some incur the declared tolerable cost rather than another candidate cost, prefer those. Tolerable remains a real cost.

## Step 6 — commitment handling

Among survivors, honour an active explicit commitment over breach unless a higher command-direction distinction already removed the honouring course.

Any recommended breach exposes an explicit reason/warning.

## Step 7 — responsible-officer professional tie

Apply the exact state-aware tie from 36.

A tie may consume assessment/warning only where 36 explicitly authorises it.

Chief worldview creates concern/tie/dissent but never pre-filters standing direction.

A missing reachable tie is validation failure. No array, lexical, random or seed ordering.

# Political command-by-exception baselines

- C1: informal > formal final tie;
- C2: silence > joint warning among staff-applicable courses;
- C3: routine contact > reassurance;
- C5 attribution: Hold always staff baseline because Use is commander-only.

Partner-oriented priority/style can select the positive non-exceptional course before the final tie.

# C5 Beacon warning-sensitive tie

After Steps 0–6 and package applicability:

1. warning usable → quiet reinforce > visible reinforce > hold;
2. else assessment preparation → quiet > visible > hold;
3. else → hold > quiet > visible.

A protected reserve boundary can remove reinforcement before this tie. Warning never authorises staff to ignore the commander's red line.

When warning exists but the standing boundary blocks the professional preference, reasons/dissent must expose that tension.

# C5 attribution issue

Issue exists only when:

- source-use state is unspent; and
- current verified #100 public-case basis is credible-source-sensitive with direction and independent corroborating support.

The agenda/recommendation projection carries safe claim semantics, not internal raw enums/evidence IDs.

Staff recommendation is always Hold.

Hold persists nothing and does not freeze the case for C6.

Use remains commander-only. Sim re-derives the exact current basis from verified context when validating the player's command and persists source use; it never trusts client-supplied claim/evidence fields.

# C5 complete-package composition

Use 39 rather than assuming issue-local recommendations combine legally.

Core invariant:

> The all-Delegate staff package is always a legal complete command set.

Package composition applies complete-package partner-consultation boundary, rapid-channel authority and exact Political tie.

If all-Delegate is invalid, recommendation/content is defective. Browser/headless cannot repair it silently.

# Professional worldviews

## Intelligence

Values legitimate evidence, explicit contradiction, source limitations and avoiding unsupported public claims. May dissent when operations outrun the picture but never knows hidden truth.

## Operations

Values physical denial and avoiding unrecoverable readiness collapse. May use broad assessment and separate warning only where 36 authorises it.

## Political

Values partner consent/authority/commitments while preserving response freedom. Source use remains commander-only even when a current case is credible.

# Recommendation result

Structured semantics:

- issue ID;
- responsible officer;
- recommended order ID;
- ordered decisive reason refs;
- concern refs;
- optional dissent.

No score.

Normally render 2–4 decisive reasons, not every rule/evidence item.

Reason families may include boundary, priority, style, tolerated cost, assessment, warning, evidence limitation, commitment, capability, authority and professional concern.

# Dissent

Dissent evaluates the same legitimate derived/public state. It is advice, not a second vote.

Kestrel requirements include:

- C3 Intelligence/Operations disagreement from the same `unclear + conflicted` state;
- C5 Operations/Political conflict around warning, readiness, authority/tempo or commitment where authored.

Hidden truth alone cannot create/remove dissent.

# Implicit delegation

Command Room may initialise every issue locally to Delegate, but sim owns recommendation and final delegated order.

Commander-only courses are excluded. All-Delegate must be legal.

# Required #98 tests

## Prefix/replay safety

- live full-session and verified-prefix recommendation agree;
- replay provider sees only verified prefix, not current/future unverified ledger entries;
- changing command Q/future entries cannot affect Q agenda/recommendation;
- unverified import cannot generate advice;
- provider API evolution changes no persisted V2 schema/version;
- #99 replay/order tests remain green.

## Information integrity

- same legitimate assessment/warning/public/source state + changed hidden truth → equal recommendation/dissent;
- raw source facts/hidden action/posture cannot enter recommendation API;
- warning used only on warning-sensitive ties;
- public-case current basis used only for issue/claim applicability, never weighted utility;
- client cannot choose claim basis.

## Authority/precedence

- exact three commander-only remain player-legal but never recommendation under every standing intent;
- each costs one intervention;
- protected boundary → priority → style → tolerated cost → commitment → professional tie;
- all-candidates-cross emits no-clean-option;
- C1/C2/C3 positive Political actions follow partner direction or intervention;
- Lattice protection follows understanding direction or intervention.

## C5

- conflicted assessment + warning usable uses reinforcement-oriented professional tie;
- same assessment + warning none uses hold-first tie;
- preparation assessment + warning none uses preparation tie but no terminal warning benefit;
- reserve red line can override warning tie and emits constraint reason;
- attribution issue absent for unspent source + tentative/no case;
- attribution issue present for credible current case + unspent source;
- issue absent after source used;
- Hold recommended for both claim directions and freezes no C6 case;
- every all-Delegate package legal;
- safe C6 route set contains no raw #99 action.

## General

- no numeric/global utility;
- all ties deterministic;
- V1 unchanged.

# Rejection conditions

Reject #98 if it:

- keeps the state-only replay agenda provider once history is required;
- derives from unverified full save/future entries;
- adds weighted utility;
- lets chief preference pre-filter command direction;
- accesses hidden world/source facts;
- infers warning from assessment;
- reads a persisted credible mirror;
- trusts client claim/evidence basis;
- allows commander-only Delegate;
- produces invalid all-Delegate package;
- uses array/random tie-breaking;
- uses runtime LLM advice;
- generalises beyond bounded Kestrel need.
