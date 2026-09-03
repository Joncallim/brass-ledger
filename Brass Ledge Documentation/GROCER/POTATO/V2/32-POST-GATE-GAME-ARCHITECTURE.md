---
type: v2-post-gate-architecture
status: provisional
---

# Post-Gate Game Architecture

Backlink: [[README]]

This document is **not implementation authority before the V2 human fun gate passes**. It records the current best long-form product direction so the Kestrel prototype tests toward a coherent game rather than an undefined future.

Nothing in this file may expand pre-gate implementation scope. Where it conflicts with active prototype contracts, the active numbered contracts win.

## Long-form product thesis

A mature Brass Ledger should be:

> A strategy game about setting direction, trusting imperfect people, personally intervening in only a few things, and then living with what the organisation and its opponents do as a result.

The enduring player thought remains:

> “I caused this. I have a plan for what to do about it. I need to see what happens next.”

## Event-driven Command Windows

If Kestrel validates command-by-exception, future scenarios should not assume equal calendar turns.

Time should advance until something genuinely deserves commander attention.

A future **Command Window** may be triggered when:

- a protected boundary may be crossed;
- chiefs cannot reconcile a consequential disagreement;
- an irreversible commitment is available;
- a persistent consequence matures;
- an external/adversary action materially changes the situation;
- a capability creates a new strategic opportunity;
- two otherwise manageable pressures collide.

If nothing important requires command, the headquarters should work and time should advance.

This is a post-gate hypothesis, not a Kestrel rule change.

## Command Bets — provisional evolution of accepted risk

A future signature mechanic should be tested if Kestrel shows that players understand causal history but still struggle to articulate what risk they intentionally accepted.

When the commander deliberately leaves a meaningful exposure unresolved, record the authored assumption they are betting on.

Examples:

> Ravellan is unlikely to exploit thin Beacon coverage before the reserve recovers.

> The partner will tolerate one unilateral patrol surge.

> Current shipping pressure is coercion rather than cover for a seizure.

Later the game can resolve the bet as:

- held;
- failed;
- still unresolved.

This should remain a concrete authored proposition, never a risk meter or wager currency.

Do **not** implement Command Bets before human evidence shows they would clarify rather than add ceremony.

## Chiefs as persistent people, not trust meters

If Kestrel's dissent is engaging, future chiefs should gain discrete memories rather than numeric relationship scores.

Possible memory records:

- `backed-on-beacon`;
- `overruled-on-reserve`;
- `warning-vindicated`;
- `warning-disproved`;
- `recovery-promised`;
- `recovery-promise-broken`;
- `publicly-undercut`.

Memories may alter later authored behavior, willingness to escalate dissent, or what a chief chooses to raise.

The goal is recognisable personality and history:

> “Of course Briggs wants this.”

and occasionally:

> “Interesting. Even Briggs thinks we should wait.”

Do not build chief-chatbot/freeform conversation as the core system.

## Institutional strategy / builds

If Lattice proves that qualitative capability unlocks create strategic identity, future scenarios should offer a small set of competing institutional initiatives rather than a generic technology tree.

Candidate examples:

### Intelligence fusion cell

Unlock: task a named uncertainty outside normal personal-intervention economy.

### Contingency planning group

Potential unlock: prepare one conditional order that can execute when an explicit authored trigger occurs.

### Coalition liaison team

Potential unlock: resolve one consultation-sensitive issue through joint staff channels rather than personal intervention.

### Sustainment surge group

Potential unlock: convert a lull into deeper recovery without abandoning one entire operational posture.

The player should only be able to meaningfully develop a subset during one campaign.

Every initiative must change legal actions/information/decision structure, not merely improve numbers.

Do not implement any initiative beyond Lattice before the human gate and a second scenario design justify it.

## Standing-direction adaptation

Kestrel keeps opening intent immutable to test whether strategy identity matters.

If that succeeds, a longer campaign may permit **limited adaptation at an act boundary**, e.g. revise one standing direction after major evidence/strategic change.

Changing direction should itself become part of history; chiefs/external actors may notice the shift.

Do not allow per-turn optimisation of standing intent.

## Full campaign shape

Do not return automatically to a fixed 12-month structure.

Provisional target:

- roughly 8–10 meaningful Command Windows;
- actual count scenario-dependent;
- three pacing acts.

### Act I — Orientation

Establish standing direction, first relationships, opening uncertainty and first institutional opportunity.

### Act II — Commitment

Accumulate promises, exposures, institutional identity, chief history and irreversible choices. Earlier assumptions begin paying off or hurting.

### Act III — Convergence

Previously separate pressures collide. Recovery remains possible but expensive. Terminal crisis tests the campaign built.

The acts are pacing/design structure, not necessarily explicit level labels in UI.

## State-triggered storylets, not drama rubber-banding

Future narrative variation should be authored from actual persistent state/history.

Examples:

- repeated reserve use → sustainment warning/storylet;
- consultation promise honoured repeatedly → partner offers broader authority;
- intelligence warning overruled then vindicated → chief behaves differently in later dispute;
- repeated civilian disruption → domestic/political pressure.

Eligibility derives from state/history, not from the player “doing too well” or “needing excitement”.

No adaptive difficulty/drama director should spawn crises merely to balance performance.

## Future scenario package

After at least a second concrete scenario exists, evaluate whether the following truly form a reusable authored scenario contract:

- strategic objective;
- opposing actors/objectives;
- known opening situation;
- hidden world state;
- adversary policies/observations;
- intelligence claims/questions/evidence;
- persistent promises/exposures/preparation/investments/opportunities;
- institutional initiatives;
- pressure processes;
- state-triggered storylets;
- costly recovery options;
- terminal crisis families.

Do not generalise from Kestrel alone. A second scenario is the minimum evidence for extracting shared semantics.

## Future emotional pacing requirement

Long scenarios should deliberately create variation in emotional function, not simply rising numeric pressure:

- ownership;
- consequence;
- doubt;
- relief/payoff;
- temptation;
- collision;
- recovery;
- reckoning.

Do not mechanically force one emotion per turn. Use this as content-review vocabulary.

## Future anti-snowball principle

Success should create **new options and commitments**, not simply easier numbers.

Examples:

- strong partner relationship → access to a joint operation that creates a consultation commitment;
- strong intelligence → credible attribution opportunity that may burn a source or create political stakes;
- strong readiness → credible visible-deterrence option that also reveals posture to the opponent.

A successful campaign should expand the strategic space rather than turn later windows off.

## Future anti-death-spiral principle

Until the final convergence, serious deterioration should usually produce different painful choices rather than fewer choices.

Recovery:

- must cost something immediately;
- must not erase history;
- should often create a different exposure.

Kestrel's emergency consolidation and political concession are the prototype examples.

## Product questions deliberately left to human evidence

Do not freeze these from design preference alone:

- whether two interventions is the correct budget;
- whether six windows is too short/long;
- ideal full-campaign window count;
- number of chiefs a player can comfortably understand;
- ideal prose density;
- how often surprise/external events should occur;
- whether standing intent should become revisable;
- how many institutional initiatives belong in one campaign;
- whether Command Bets clarify agency or add paperwork;
- how much chief memory materially improves attachment/strategy.

## Gate relationship

This document may guide what designers observe during Kestrel testing, but it must not alter the pass criteria in [[40-EVALUATION-CONTRACT]].

If Kestrel fails the human fun gate, revisit this architecture from the evidence rather than assuming the long-form vision merely needs more content/polish.
