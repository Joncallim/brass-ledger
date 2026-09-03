---
type: v2-kestrel-terminal-contract
status: active
---

# Kestrel Terminal Matrix

Backlink: [[README]]

This document is the implementation authority for the **Cycle-6 final-route availability and outcome predicates** consumed by #103 and later headless/UI work. It does not change Ravellan's terminal-behaviour choice in [[22-RAVELLAN-EXECUTABLE-POLICY]].

## Product purpose

Cycle 6 must test the campaign the player actually built.

It must **not** collapse to:

> “Guess Ravellan's hidden posture and click the matching counter.”

Final courses therefore depend on accumulated physical preparation, reserve condition, partner consent, commitments and legitimate intelligence. The same final order can be sensible in one history and disastrous or unnecessarily costly in another.

## Inputs

Terminal coalition resolution may read only the verified campaign state available after Ravellan's Cycle-6 terminal behaviour is selected:

- Ravellan terminal behaviour: `attempt_seizure`, `threshold_challenge`, or `abort_and_pressure`;
- `beacon-exposure`;
- `beacon-preparation`;
- `reserve-condition`;
- `partner-consent`;
- `consultation-promise`;
- `political-concession`;
- `liaison-obligation`;
- `attribution-opportunity`;
- current HQ `ravellan-intent` assessment/evidence state;
- authored severe-cost/history flags from [[25-KESTREL-CONSEQUENCE-MATRIX]].

The coalition terminal resolver may use actual Ravellan terminal behaviour because the event is now occurring in the world. Player-facing pre-order presentation may reveal only what is legitimately observable about that behaviour at Cycle 6; it must not expose prior hidden posture/preparation.

## Derived terminal predicates

### Prepared denial

`preparedDenial = beacon-preparation == prepared`

### Exposure controlled

`exposureControlled = beacon-exposure != open`

### Usable warning

`usableWarning =` current HQ assessment is `preparation + weak` or `preparation + coherent`, **or** an active credible attribution opportunity/equivalent authored preparation evidence supplies a legitimate warning.

`unclear + conflicted` is not a usable warning by itself. The player may still choose a military route; it simply cannot claim the information advantage required by the strongest Quiet Denial result.

### Partner access

`partnerAccess = partner-consent != withdrawn`

A political concession may restore `partner-consent` to at least `conditional` before terminal evaluation. The concession remains a severe cost; it does not create a hidden extra access override.

### Joint authority

`jointAuthority = partnerAccess` AND one of:

- `partner-consent = cooperative`;
- `partner-consent = uneasy` and consultation promise is not `breached`;
- `partner-consent = conditional` and `political-concession = active` or an authored honoured consultation/fulfilled liaison obligation supplies the authority.

A `breached` consultation promise with merely `conditional` consent is not sufficient for clean joint authority unless political concession explicitly recovered it.

### Credible exposure case

`credibleExposure = attribution-opportunity == credible OR attribution-opportunity == used`

### Reserve can surge

- `usable` → yes;
- `strained` → yes, with terminal cost;
- `brittle` → only effectively if `preparedDenial` is also true; otherwise brute-force mobilisation cannot produce a clean physical denial.

## Final course availability

### Quiet Denial

Stable ID: `quiet-denial`

Legal when:

- `preparedDenial` is true.

It remains legal with weak/conflicted intelligence, but its best outcome requires `usableWarning` and controlled exposure.

If Beacon was never prepared, this route is unavailable rather than becoming a meaningless “quiet” button with no plan behind it.

### Joint Visible Denial

Stable ID: `joint-visible-denial`

Legal when:

- `jointAuthority` is true;
- reserve condition is not `brittle`, **or** `preparedDenial` is true.

A brittle reserve plus no prepared denial makes a credible joint military response unavailable.

### Emergency Mobilisation

Stable ID: `emergency-mobilisation`

Always legal while the campaign remains non-corrupt/replay-valid.

This is the final brute-force comeback route. `brittle` reserve may make it fail physically if no prepared denial exists, but the player must still be allowed to attempt it rather than receiving a hidden hard lock.

### Hold And Expose

Stable ID: `hold-and-expose`

Legal when:

- `credibleExposure` is true;
- `partnerAccess` is true.

This route uses legitimate intelligence and coalition politics to resist a manufactured crisis without automatically making a large military surge.

It does not require the HQ assessment to be `coercion`; the player can choose it against a suspected real move, but physical success against an actual seizure then depends on prior Beacon preparation.

## Physical Beacon outcome

Resolve `beaconHeld` from Ravellan terminal behaviour and the selected final course.

### Ravellan: `attempt_seizure`

#### Quiet Denial

Beacon is held if all are true:

- `preparedDenial`;
- `exposureControlled`;
- `usableWarning`.

If prepared but either exposure is `open` or warning is not usable, Beacon is held only if reserve condition is `usable`; this represents the prepared plan surviving through retained reaction capacity but creates severe operational cost.

Otherwise Beacon is lost.

#### Joint Visible Denial

Beacon is held if:

- `jointAuthority`;
- and either reserve condition is `usable` or `strained`, or `preparedDenial` is true.

If reserve is `brittle` and there is no prepared denial, Beacon is lost.

#### Emergency Mobilisation

Beacon is held if:

- reserve is `usable`; or
- reserve is `strained`; or
- reserve is `brittle` **and** `preparedDenial` is true.

If reserve is `brittle` and Beacon was not prepared, the emergency surge is too late/fragile and Beacon is lost.

#### Hold And Expose

Beacon is held only if:

- `credibleExposure`;
- `preparedDenial`;
- `exposureControlled`.

The political exposure does not physically stop a genuine prepared seizure by itself. Prior denial preparation must carry the physical burden.

### Ravellan: `threshold_challenge`

No prepared seizure is executed. Beacon remains physically held for all four legal final courses.

The important differentiation is political access and self-inflicted cost below.

A route can therefore “hold Beacon” while still producing political defeat.

### Ravellan: `abort_and_pressure`

Beacon remains physically held for all legal final courses.

The final choice determines whether the coalition preserves itself cheaply, spends unnecessary readiness/political capital, or converts legitimate evidence into a stronger political position.

## Partner-access outcome

Start from terminal `partnerAccess`.

Then apply route-specific political effects.

### Quiet Denial

Does not itself worsen partner access.

If the campaign already ended with `partner-consent = withdrawn`, access remains lost.

### Joint Visible Denial

Requires joint authority, so successful execution preserves immediate partner access. Existing concession/breach costs remain visible in outcome classification.

### Emergency Mobilisation

If consultation promise is `breached` and partner consent is `conditional`, emergency unilateral mobilisation causes partner access to fail at terminal resolution unless `political-concession = active` explicitly recovered immediate authority.

If partner consent is `withdrawn`, access remains lost.

Otherwise immediate access survives but may be a costly success.

### Hold And Expose

If `credibleExposure` and partner access exist, the route preserves immediate access. If the evidence had only become public through an earlier promise breach, that breach remains a severe cost but does not automatically erase current access unless partner state says so.

## Authored overreaction cost

Create the terminal severe-cost flag `overreaction` when the coalition commits a disproportionately expensive visible military response to a non-seizure outcome.

For Kestrel:

- `emergency-mobilisation` against `threshold_challenge` → `overreaction = true`;
- `emergency-mobilisation` against `abort_and_pressure` → `overreaction = true`;
- `joint-visible-denial` against `abort_and_pressure` → `overreaction = true`;
- `joint-visible-denial` against `threshold_challenge` → `overreaction = true` only if reserve ends `brittle` or partner support required an active political concession;
- Quiet Denial never creates the overreaction flag by itself;
- Hold And Expose never creates the military overreaction flag.

This is a discrete terminal interpretation, not a hidden utility score.

## Severe-cost set

`severeCost = true` if any canonical severe-cost condition from [[25-KESTREL-CONSEQUENCE-MATRIX]] is present, including:

- reserve ends `brittle`;
- consultation promise is `breached`;
- political concession is `active`;
- liaison obligation is `breached`;
- partner remains only `conditional` because immediate support was recovered through concession/breach history;
- `overreaction = true`;
- an authored attempt-seizure route used emergency/strained reaction because warning/exposure failed despite prior preparation.

Do not count the number of severe costs into a player score.

## Terminal classification

Evaluate in this order.

### Operational Defeat

If `beaconHeld = false`:

**Outcome:** `operational-defeat`

This classification takes precedence even if partner access remains.

### Political Defeat

Else, if `partnerAccessAfterRoute = false`:

**Outcome:** `political-defeat`

Beacon remains physically secure but coalition access/control is strategically untenable.

### Costly Success

Else, if `severeCost = true`:

**Outcome:** `costly-success`

Beacon is secure and partner access survives, but the campaign ends with a major self-inflicted or unavoidable strategic cost.

### Strategic Success

Else:

**Outcome:** `strategic-success`

Beacon is secure, coalition access survives, and no canonical severe-cost condition dominates the result.

There is no scalar victory score.

## Route differentiation requirements

The authored seed/history matrix must include reachable examples demonstrating all of the following:

1. **Quiet intelligence-led denial:** Lattice/evidence and Beacon preparation make Quiet Denial a clean answer to an actual seizure without requiring a visible mobilisation.
2. **Coalition-led deterrence:** healthy consultation/consent makes Joint Visible Denial a strong answer where a damaged partnership would make it unavailable or costly.
3. **Reserve-backed recovery:** Emergency Mobilisation can still save Beacon after earlier mistakes when reserve/preparation has not crossed the authored failure boundary.
4. **Information/political route:** Hold And Expose can cleanly defeat a threshold challenge/feint when credible evidence and partner access exist.
5. **No universal route:** each final course must have at least one viable history in which another legal course yields a strictly better terminal classification or Pareto profile.

## Examples that must be reachable in tests

### Example A — prepared intelligence route

History:

- Beacon prepared;
- exposure contained/thin;
- usable warning;
- reserve usable/strained;
- partner access intact;
- Ravellan attempts seizure.

Quiet Denial → Beacon held; can be Strategic Success if no severe cost.

Emergency Mobilisation → Beacon held but normally Costly Success because the heavier response spends more than necessary.

### Example B — feint with credible attribution

History:

- credible exposure case;
- partner access healthy;
- Ravellan threshold challenge;
- reserve usable.

Hold And Expose → Strategic Success where no prior severe cost exists.

Emergency Mobilisation → Costly Success through overreaction.

### Example C — damaged partnership

History:

- partner consent withdrawn;
- Beacon prepared;
- Ravellan threshold challenge.

Quiet Denial may hold Beacon physically but terminal classification is Political Defeat.

Joint Visible Denial and Hold And Expose are unavailable because required partner access/authority does not exist.

### Example D — brittle comeback limit

History:

- reserve brittle;
- Beacon not prepared;
- exposure open;
- Ravellan attempts seizure.

Emergency Mobilisation remains legal but Beacon is lost → Operational Defeat.

This state must be reachable only through avoidable accumulated decisions; laboratory viability must reject a seed that forces it without meaningful earlier counterplay.

### Example E — brittle but prepared recovery

History:

- reserve brittle;
- Beacon prepared;
- Ravellan attempts seizure.

Emergency Mobilisation can still hold Beacon → Costly Success.

The player's earlier preparation preserves a painful comeback route.

## Terminal debrief contract

After outcome resolution, terminal presentation has two clearly separated layers.

### What HQ believed at the time

Show the major HQ assessment at each decisive command window and the evidence legitimately available then.

### What was actually happening

Reveal after the campaign only:

- Ravellan opening posture;
- posture transitions;
- seizure preparation progression;
- major genuine/deceptive signals;
- why the terminal Ravellan behaviour followed from the executable policy;
- how the coalition final course interacted with the state actually built.

Do not expose numeric weights because none exist.

The debrief should support counterfactual understanding without claiming there was one correct strategy.

## Required terminal tests

At minimum prove:

- route availability predicates exactly;
- attempt-seizure physical outcome for every legal route and relevant reserve/preparation boundary;
- threshold challenge and abort preserve physical Beacon while still allowing political/costly outcomes;
- partner-access overrides/classification ordering;
- overreaction flag cases exactly;
- Operational Defeat > Political Defeat > Costly Success > Strategic Success classification precedence;
- all four outcome classes are reachable across authored histories;
- all four final course families are useful in at least one viable history;
- no final course dominates all others across the viable authored seed/history set;
- brittle reserve does not automatically remove Emergency Mobilisation;
- hidden prior Ravellan posture is not needed by player-facing route availability; only current legitimate state/terminal behaviour and public campaign history are used;
- V1 victory/end-state logic remains unchanged.

## Rejection conditions

Reject terminal implementation if it reduces to matching final route to hidden posture, introduces a scalar score, makes Emergency Mobilisation universally safe, makes Lattice mandatory for any success, makes partner consent cosmetic, or removes the costly recovery route before the final crisis.
