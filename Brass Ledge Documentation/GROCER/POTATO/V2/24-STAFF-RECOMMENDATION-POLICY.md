---
type: v2-recommendation-contract
status: active
---

# Staff Recommendation Policy

Backlink: [[README]]

This is the implementation authority for **#98 — deterministic belief-safe staff recommendation and dissent**. [[23-HQ-BELIEF-AND-EVIDENCE]] owns HQ intelligence products, [[36-KESTREL-AGENDA-COURSE-MATRIX]] owns Kestrel metadata/ties, and [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] owns bounded complete-package composition.

# Product purpose

Delegation should mean:

> my headquarters is acting according to the direction I gave it, through professional officers who can disagree.

It must not mean hidden scoring chooses for the player, an omniscient analyst supplies the right answer, or staff spends exceptional commander authority by accident.

Every issue has one responsible officer, authored legal courses, one deterministic recommendation and optional visible dissent using the same legitimate HQ/public state.

Delegate executes recommendation. Intervene selects a different player-legal authored course. Defer exists only where authored.

# Information boundary

Recommendation may read only the **specific derived/public products an issue actually needs**:

- current authored issue/course metadata;
- #100 **intent assessment** where the issue is estimative/strategy-sensitive;
- #100 **tactical warning** where the issue is physically warning-sensitive;
- bounded player-safe evidence/reason refs only for explanation/dissent, not as an alternate hidden scoring model;
- standing command direction;
- known commitments/obligations;
- known institutional/public campaign state;
- responsible/dissenting chief worldview;
- safe overt C6 crisis family;
- later #101 persisted `attribution-opportunity` where that issue exists.

Recommendation must **not** read:

- hidden Ravellan posture/preparation;
- raw adversary observations/action IDs/policy rows;
- raw #100 observation source facts;
- oracle/counterfactual truth;
- future outcomes/input;
- player score/global utility;
- #100 internal `publicCaseBasis` directly as a substitute for #101 campaign opportunity state.

Changing hidden truth alone while all legitimate inputs remain fixed must leave recommendation/dissent deep-equal.

# Assessment vs warning

These are separate inputs.

- Broad **intent assessment** answers what HQ thinks Ravellan's current campaign means.
- **Tactical warning** answers whether HQ has a direct actionable physical signpost relevant to seizure response.

Do not infer warning from preparation assessment.

A course tie may use warning only where [[36-KESTREL-AGENDA-COURSE-MATRIX]] explicitly says it is warning-sensitive.

Current Kestrel use:

- C5 Beacon-posture Operations tie is warning-sensitive;
- other pre-C6 ties remain assessment/public-state based unless explicitly frozen otherwise;
- C6 route legality uses warning under [[27-KESTREL-TERMINAL-MATRIX]], not recommendation invention.

This keeps warning valuable without turning it into a hidden universal bonus.

# Course authority

Metadata fields:

- `supports`;
- `crossesBoundary`;
- `style`;
- `costs`;
- explicit prerequisites/commitment effect;
- professional concern/tie metadata;
- `requiresIntervention` where authorised.

Exactly these three order IDs are commander-only:

1. `public-accusation`;
2. `request-partner-liaison`;
3. `use-attribution`.

They remain player-legal under prerequisites, never recommendation-applicable/Delegate, consume one normal intervention and expose known immediate/authority cost before selection.

No standing priority/style/tolerated cost can make a commander-only course re-enter the recommendation set.

# Recommendation algorithm

## Step 0 — player-legal set

Start from authored player-legal courses for current issue/public state.

If none exists, content invalid.

## Step 1 — recommendation-applicable set

Remove only explicit authority/applicability constraints:

- unmet prerequisite/capability/public-state/belief product;
- `requiresIntervention = true`;
- bounded package applicability from [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

Do not remove courses because a chief dislikes them.

If player-legal courses exist but staff set becomes empty without an explicitly authored package reason, content invalid.

## Step 2 — protected boundary

If at least one candidate does not cross the commander's protected boundary, remove candidates that do.

If all cross, retain all and emit `no-clean-option`/equivalent. Never fabricate a safe option.

## Step 3 — main priority

If one or more remaining courses support main priority, retain those. Otherwise keep current set.

## Step 4 — default style

If one or more remaining courses match declared style, retain those. `neutral` is not a style match.

## Step 5 — tolerated cost

If multiple candidates remain and some incur the declared tolerable cost instead of another course cost, prefer that set. Tolerable remains a real cost.

## Step 6 — commitment handling

Among surviving recommendation-applicable courses, honour an active explicit commitment over breach unless a higher command-direction distinction already removed the honouring course.

Any recommended breach carries explicit reason/warning.

## Step 7 — responsible-chief professional tie

Apply exact issue/state-aware tie from [[36-KESTREL-AGENDA-COURSE-MATRIX]].

The tie may consume #100 assessment/warning only where 36 explicitly freezes that input.

Chief worldview supplies concerns/tie/dissent but cannot pre-filter standing direction.

Missing reachable tie is validation failure. No array/lexical/random/seed ordering.

# Political baselines

To preserve command-by-exception:

- C1: informal liaison > formal consultation final tie;
- C2 public posture: silence > joint warning among staff-applicable courses;
- C3 reassurance: routine contact > reassurance;
- C5 attribution: Hold is always staff baseline because Use is commander-only.

Partner-oriented priority/style can select the positive non-exceptional action before the tie.

# C5 Beacon warning-sensitive tie

After Steps 0–6 and package applicability, Operations uses [[36-KESTREL-AGENDA-COURSE-MATRIX]]:

1. warning `usable` → quiet reinforce > visible reinforce > hold;
2. else assessment direction `preparation` → quiet > visible > hold;
3. else → hold > quiet > visible.

Important precedence:

- a protected reserve boundary can remove reinforcement **before** this tie;
- usable warning does not authorise Operations to violate commander's red line;
- when warning exists but command direction prevents the professional preference, recommendation/reasons/dissent should expose that tension rather than hide it.

Thus the player can experience:

> “Operations sees a direct warning and wants reinforcement, but your standing direction told the headquarters not to spend the reserve without asking.”

That is desirable command drama, not a contradiction.

# Attribution boundary

#100 internal `publicCaseBasis` is **not** a direct recommendation/applicability input for C5 attribution.

Later #101 owns persisted/public campaign `attribution-opportunity`:

- issue exists only where #101 says a legitimate unspent opportunity exists;
- staff recommendation is Hold;
- player may explicitly intervene to Use under package authority.

This prevents recommendation code from bypassing one-shot campaign state or source-consumption history by re-deriving credibility directly from current evidence.

# C5 complete-package composition

Use [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]] rather than assuming independent issue recommendations combine legally.

Core invariant:

> the all-Delegate staff package is always a legal complete command set.

Package composition applies complete-package partner-consultation red line, rapid-channel authority and final Political tie exactly as frozen in 39/36.

If all-Delegate package is invalid, recommendation/content is defective; browser/headless may not repair it silently.

# Professional worldviews

## Intelligence

Values legitimate evidence, explicit contradiction and avoiding unsupported attribution. Can dissent when operational action outruns the picture but does not know hidden truth.

## Operations

Values credible physical denial and avoiding unrecoverable readiness collapse. May use both the broad assessment and explicit tactical-warning product where the course matrix authorises them.

## Political

Values partner consent/authority/commitments while preserving freedom to respond. Exceptional attribution remains commander-only even if politically useful.

# Recommendation result

Stable structured semantics:

- issue ID;
- responsible officer;
- recommended order ID;
- ordered decisive reason refs;
- concern refs;
- optional dissent.

No score.

Render normally 2–4 decisive reasons, not every matched rule/evidence item.

Reason families may include boundary, priority, style, tolerated cost, assessment, tactical warning, commitment, capability, authority and professional concern.

# Dissent

Dissent evaluates the same legitimate derived/public state. Advisory, not a second vote.

Kestrel requirements include:

- C3 Intelligence/Operations disagreement from the same `unclear + conflicted` assessment;
- C5 Operations/Political conflict around warning, readiness, authority/tempo or commitment where authored.

Changing hidden Ravellan truth alone cannot create/remove dissent.

# Implicit delegation

Command Room may initialise every issue locally to Delegate, but sim owns recommendation and delegated final order.

Commander-only courses are excluded, and all-Delegate package must be legal.

# Required #98 tests

At minimum prove:

- hidden truth changes with same legitimate assessment/warning/public state → equal recommendation/dissent;
- exactly three commander-only courses remain player-legal when applicable but can never become recommendation under all standing intents;
- selecting each commander-only course consumes one intervention;
- C2 visible style never auto-accuses; C5 partner intent never auto-uses attribution;
- protected-boundary → priority → style → tolerated cost → commitment → professional tie precedence;
- all-candidates-cross emits no-clean-option;
- C1/C2/C3 positive political actions follow standing partner direction or intervention;
- Lattice protection follows understanding direction/intervention;
- **C5 `unclear + conflicted` + warning usable uses warning-sensitive reinforcement tie**;
- C5 same conflicted assessment + warning none uses hold-first tie;
- preparation assessment + warning none uses prep tie but terminal code still sees warning none;
- reserve red line can override warning-sensitive tie through normal precedence and produces explicit warning/constraint reason;
- #100 internal public-case basis alone cannot create C5 attribution issue/recommendation; only #101 opportunity can;
- every C5 all-Delegate package legal;
- safe C6 crisis family/27 route set, no raw #99 action ID;
- no numeric/global utility;
- V1 unchanged.

# Rejection conditions

Reject #98 if it adds weighted utility, chief pre-filtering before command direction, hidden-world/raw-source-fact access, infers tactical warning from assessment, ignores usable warning on a 36-authorised warning-sensitive tie, reads #100 public-case basis to bypass #101 opportunity state, uses random/array tie-breaking, allows commander-only Delegate, produces invalid all-Delegate package, uses LLM-generated live advice or generalises beyond bounded Kestrel need.
