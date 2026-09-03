---
type: v2-hostile-review-record
status: active
---

# V2 Hostile Reviews

Backlink: [[README]]

## Bootstrap attack set

Eight independent attack angles were completed during the original V2 bootstrap.

| Angle | Material finding | Remediation / status |
| --- | --- | --- |
| Game-design/fun | Delegation could be a ceremonial click; interventions might not collide; anticipation was aspirational. | Lead advice, bounded collision, implicit delegation and consequence-to-next-pressure contracts now make this mechanically testable; human proof still pending. |
| Strategy depth | Intent could be ceremonial; non-dominance had no relation. | Require causal intent use plus Pareto/Decision-Elasticity/strategy-separation diagnostics. |
| Adversary/fairness | World-truth-readable adversary contradicted observation-only fairness. | `AdversaryObservation` boundary and #99 authored policy. |
| Narrative/persistence | Consequences lacked transitions, promises could be implicit, recovery was non-executable. | Concrete Kestrel records, explicit promises/obligations and authored recovery matrices. |
| Information/uncertainty | Provenance/endpoint could leak posture; confidence was open. | Authored evidence, natural-language judgement and strict player-safe projection. |
| Replay/state integrity | Ledger payload, digest, content identity and atomicity were underspecified. | V2 canonical replay/digest/action contracts and prototype version boundaries. |
| AI-agent ambiguity | Agents could invent timing, severity, predicates and confidence thresholds. | Numbered Kestrel authority documents freeze implementation decisions. |
| Scope/YAGNI | Generic lifecycle/recommendation systems were premature singleton abstractions. | Concrete Kestrel types first; generalise only after another real use. |

## First downstream composed-system review — 2026-09-03

After the detailed #100–#108 contracts were authored, they were attacked as one game rather than as isolated files.

| Attack | Finding | Correction |
| --- | --- | --- |
| Commander ownership | Chief “professional acceptability” could remove courses before standing intent. | [[24-STAFF-RECOMMENDATION-POLICY]] now makes worldview advisory/tie-break/dissent only; command direction has precedence. |
| Adversary branch reachability | CF-1 needed weak coverage but opening ordinary watch did not explicitly emit it. | Ordinary C1 watch now emits authored detectable weak coverage; reinforced watch emits credible. |
| Strategy coverage | Coalition-led play had no deterministic probe policy. | Added `coalition-first` to [[31-HEADLESS-DESIGN-LAB]]. |
| Fake choice | Policy outcomes could differ while individual options were still cosmetic. | Added counterfactual Decision Elasticity. |
| Final rock-paper-scissors | Hidden posture could become a secret final answer key. | Terminal route predicates depend on built campaign state, not prior hidden posture. |
| Lattice dominance | Three scheduled advances risked making Lattice mandatory. | Narrower one-token liaison counterplay plus mandatory non-Lattice viability test. |
| Death spiral | Persistent deterioration could remove all decisions. | Costly reserve/partner/Beacon/Lattice recovery routes plus reachability diagnostics. |
| Success snowball | Early success could make the end trivial. | Lab flags late windows with inelastic interventions/uniform routes; no rubber-banding fix allowed. |
| Clerical UI regression | V2 could still be “click Delegate repeatedly.” | Command Room defaults locally to Delegate; player acts on exceptions. |
| Consequence overload | Rich state could recreate V1 reading burden. | 1–5 material causal beats, deeper history secondary. |
| Headless divergence | CLI/test path could reimplement game rules. | #104 must use the same authoritative transitions and trusted replay. |
| Premature full-game scope | Post-gate ideas could leak into Kestrel. | [[32-POST-GATE-GAME-ARCHITECTURE]] remains explicitly provisional. |

## Second composed-system review — 2026-09-03

A further hostile pass tested the *composition* of intelligence, recommendation, simultaneous orders and terminal resolution. These defects are resolved by [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

| Attack | Material defect found | Amendment |
| --- | --- | --- |
| Intelligence oracle leakage | Focused/Lattice result tables used hidden Ravellan `posture` to decide what a sensor saw. The prose hid the enum but the result still depended directly on secret intent. | Target result selectors are posture-blind and may read only explicitly authorised physical preparation/action-history facts. Same authorised facts + different posture must produce identical evidence. |
| Binding promise trivialisation | Political's C1 final tie-break almost always selected formal consultation, making a supposedly consequential promise the universal delegated baseline. | Final tie now prefers informal liaison unless standing partner priority/style selects the commitment. |
| Promise without benefit | If formal consultation only created liability, informal liaison could dominate it. | Active formal consultation now supplies the established channel required for a C2 joint-warning + visible-surge coordinated package. |
| Fallback cost bypass | `request-partner-liaison` costs one intervention, but recommendation tags could make it the delegated order and therefore free. | Add one bounded `requiresIntervention` authority flag; liaison is the sole Kestrel use and is never staff-recommended. |
| Baseline partner sensitivity missing | C2 public accusation could avoid partner damage simply because the player never made the optional formal promise. | C2 accusation is explicitly unilateral and always worsens partner; active promise adds breach rather than creating the baseline cost. |
| Simultaneous-order race | C5 partner consultation and visible actions could resolve differently depending on issue/array application order. Reinforcement/recovery endpoint clamping could also be order-dependent. | Effects derive from the complete atomic command set; C5 has explicit partner-authority result; ordinal deltas aggregate then clamp once. |
| Relationship/authority conflation | `partner-consent = cooperative` automatically implied joint military authority, so consultation could become cosmetic. | Add concrete `partner-authority = pending/joint/unilateral/concession`; terminal joint action requires authority, not sentiment alone. |
| Reserve observation double-count | Two qualifying C5 orders could count as two Ravellan “deployments” in one cycle. | Exhaustion signal counts qualifying deployment cycles, max one event per cycle. |
| False seizure warning | Generic credible attribution—including strong coercion evidence—qualified as `usableWarning`. | Warning is preparation-specific HQ assessment only. |
| Forced irrational finale | If Ravellan backed down while Beacon was unprepared and political/intelligence routes were unavailable, Emergency Mobilisation could be the only legal final button. | Quiet Denial is always the restrained fallback for threshold/abort; against seizure it still requires prepared denial. |
| Terminal costs only in prose | Joint/Emergency courses often did not change reserve/partner state, so “heavy response” could equal a clean Strategic Success. | Final courses apply authoritative post-route reserve/partner/attribution effects; successful Emergency always carries `emergency-surge` severe cost. |
| Information route mechanically cosmetic | Hold And Expose could equal Quiet Denial whenever both were legal. | Hold And Expose now uses the credible opportunity and can improve partner consent; it remains physically unsafe against a seizure without prior denial preparation. |
| Terminal hidden-ID coupling | Cycle-6 staff ownership referred directly to #99 terminal action IDs. | Derive a safe observable crisis family (`seizure-underway`, `threshold-confrontation`, `pressure-receding`) for staff/player paths. |
| Verification sequencing | UI work was scheduled before the machine lab despite #107 existing to falsify the game cheaply. | #107 and the 3-player formative smoke now occur immediately after complete #104 headless execution, before #105/#106. |

## Re-review invariants after 39

Future implementation/review must actively attempt to falsify:

- collection posture-blindness;
- complete-command-set order independence;
- liaison intervention cost;
- C2 coordinated vs unilateral escalation distinction;
- explicit C5 partner authority;
- post-route terminal state changes;
- non-seizure quiet fallback;
- no universal final course;
- no pre-terminal hidden truth in recommendation/player DTOs;
- V1/replay/version isolation.

## Remaining genuinely human-owned unknowns

The expanded specification intentionally does **not** resolve through design review:

- whether two interventions feels right;
- whether six command windows is the right pacing;
- whether implicit delegation is understood/owned by real players;
- whether Lattice feels worth protecting rather than merely being mechanically relevant;
- whether the amount/tone of required prose is enjoyable;
- whether players experience regret, vindication, tension, surprise and voluntary replay desire.

These remain human evidence under [[35-HUMAN-PLAYTEST-HARNESS]] / [[40-EVALUATION-CONTRACT]]. A coherent machine contract is not a fun result.

## Required re-review

Every implementation issue still receives its domain-specific independent review. A review can validate a contract; it cannot certify human fun.