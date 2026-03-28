# Brass Ledger — Exact Algorithm for Dynamic Dual Tech Trees

## 1. Definitions
For each tech node `n` at turn `t`:
- `I_n(t)` internal maturity level in `[0, 5]`
- `E_n(t)` external industry maturity in `[0, 5]`
- `P_n(t)` progress points in `[0, 100]` toward next maturity level
- `C_n(t)` confidence in external estimate in `[0, 100]`
- `V_n(t)` visibility state in `{RUMORED, ESTIMATED, KNOWN}`
- `D_n` decay rate per turn
- `G_n(t)` geopolitical feasibility multiplier in `[0, 1.25]`
- `S_n(t)` supply feasibility multiplier in `[0, 1.25]`
- `R_n(t)` resource investment allocated this turn
- `B_n(t)` bottleneck penalty in `[0, 0.75]`
- `Shock_n(t)` exogenous shock term in `[-30, +30]`

Dependencies:
- `DepsI(n)` internal prerequisite nodes
- `DepsE(n)` external prerequisite nodes

## 2. Turn Resolution Order
1. Update geopolitical state.
2. Update external industry nodes.
3. Update fog-of-war confidence/visibility.
4. Resolve internal tech progress/unlocks.
5. Apply decay and maintenance effects.
6. Emit explainable deltas for UI/logging.

## 3. External Industry Node Update (ground truth)
For each external node `n`:

### 3.1 Effective Investment
`R_eff = BaseBudget_n + PolicySubsidy_n + ProcurementDemandPull_n + AllianceTransfer_n - SanctionPressure_n - SupplyDisruption_n`

### 3.2 Dynamic Growth Term
`Growth = alpha_n * sigmoid(R_eff / Scale_n) * WorkforceFactor_n * SupplierHealth_n * G_n(t)`

where `sigmoid(x) = 1 / (1 + e^(-x))`.

### 3.3 Shock and Volatility
`DeltaE_raw = Growth + Shock_n(t)`

Clamp with volatility limits:
`DeltaE = clamp(DeltaE_raw, -MaxDown_n, +MaxUp_n)`

### 3.4 External Maturity and Progress
Accumulate on `P_ext_n`:
`P_ext_n(t+1) = P_ext_n(t) + DeltaE * 20 - DecayPenalty_n`

If `P_ext_n(t+1) >= 100` and `E_n(t) < 5`:
- `E_n(t+1) = E_n(t) + 1`
- `P_ext_n(t+1) -= 100`

If `P_ext_n(t+1) < 0` and `E_n(t) > 0`:
- `E_n(t+1) = E_n(t) - 1`
- `P_ext_n(t+1) += 100`

Else keep level unchanged.

## 4. Fog-of-War Estimation Update
Player-visible estimate `Ehat_n(t)` is updated separately from ground truth `E_n(t)`.

### 4.1 Confidence Update
`C_n(t+1) = clamp(C_n(t) + IntelOps_n + PassiveCollection_n - Noise_n - TimeDecay_n, 0, 100)`

### 4.2 Visibility State
- `KNOWN` if `C >= 80`
- `ESTIMATED` if `40 <= C < 80`
- `RUMORED` if `C < 40`

### 4.3 Estimation Error
`ErrorStd = BaseError_n * (1 - C_n/100)`
`Ehat_n(t+1) = clamp(E_n(t+1) + Normal(0, ErrorStd), 0, 5)`

Store `LastVerifiedTurn_n` whenever `V_n == KNOWN`.

## 5. Internal Node Progress and Unlocking
For each internal node `n`:

### 5.1 Prerequisite Satisfaction
Internal prereq score:
`ReqI = min_{k in DepsI(n)} (I_k / ReqLevel_k)` (capped `[0,1]`)

External feasibility score (using estimated or known values):
`ReqE = min_{j in DepsE(n)} (Evis_j / ReqLevel_j)` where `Evis_j = Ehat_j` unless known.

Combined gate:
`Gate = min(ReqI, ReqE) * G_n(t) * S_n(t)`

If `Gate < GateThreshold_n`, node is locked this turn and only maintenance can be applied.

### 5.2 Progress Gain
`BaseGain = beta_n * sqrt(R_n(t)) * StaffCompetence_n * Coordination_n`

`Penalty = B_n(t) + PoliticalInterference_n + BureaucraticFriction_n`

`DeltaP = BaseGain * Gate * (1 - Penalty)`

`P_n(t+1) = P_n(t) + DeltaP - D_n`

### 5.3 Level Transition
If `P_n(t+1) >= 100` and `I_n(t) < 5`:
- `I_n(t+1) = I_n(t) + 1`
- `P_n(t+1) -= 100`

If `P_n(t+1) < 0` and `I_n(t) > 0`:
- `I_n(t+1) = I_n(t) - 1`
- `P_n(t+1) += 100`

Else level unchanged.

## 6. Co-Evolution Feedback Rules
### 6.1 Demand Pull
Repeated procurement in domain `d` increases matching external nodes:
`ProcurementDemandPull_n += k1 * RollingAvgOrders_d(3 turns)`

### 6.2 Overconcentration Penalty
If spend concentration > threshold:
`SupplierHealth_otherDomains -= k2 * OverconcentrationAmount`

### 6.3 Geopolitical Contagion
Regional instability factor `Z(t)` modifies sensitive nodes:
`G_n(t) = BaseGeo_n * (1 - Sensitivity_n * Z(t))`

### 6.4 Alliance Transfer
Formal partnerships add:
`AllianceTransfer_n = k3 * PartnerCapability_n * TreatyStrength`

## 7. Anti-Snowball and Safety Constraints
1. Diminishing returns on investment:
   `R_eff` passed through sigmoid.
2. Catch-up boost for lagging trees:
   if `I_n <= 1` then `beta_n *= 1.1` (bounded).
3. Hard floor for strategic essentials:
   essential nodes cannot decay below level 1 without prolonged crisis.
4. Dominant-strategy detector:
   telemetry flags repeated action sequences with excessive winrate.

## 8. Explainability Output (per node/turn)
Emit tuple:
- `delta_level`, `delta_progress`
- top 3 positive contributors
- top 3 blockers
- confidence and visibility changes
- whether lock condition prevented advancement

This tuple powers the “Why did this change?” UI panel.

## 9. Pseudocode
```text
for each turn t:
  updateGeopolitics(t)

  for n in ExternalNodes:
    R_eff = calcExternalInvestment(n, t)
    Growth = alpha[n] * sigmoid(R_eff/scale[n]) * workforce(n,t) * supplierHealth(n,t) * geoMult(n,t)
    DeltaE = clamp(Growth + shock(n,t), -maxDown[n], maxUp[n])
    updateExternalProgressAndLevel(n, DeltaE)

  for n in ExternalNodes:
    C[n] = clamp(C[n] + intelOps(n,t) + passiveIntel(n,t) - noise(n,t) - timeDecay(n,t), 0, 100)
    V[n] = visibilityFromConfidence(C[n])
    Ehat[n] = estimateWithError(E_true[n], C[n])

  for n in InternalNodes:
    Gate = calcGateFromInternalAndExternalPrereqs(n, I, Ehat/E_true, t)
    if Gate < gateThreshold[n]:
      applyMaintenanceOnly(n)
      continue

    BaseGain = beta[n] * sqrt(investment(n,t)) * staffCompetence(n,t) * coordination(n,t)
    Penalty = bottleneck(n,t) + politicalInterference(n,t) + friction(n,t)
    DeltaP = BaseGain * Gate * (1 - Penalty)
    updateInternalProgressAndLevel(n, DeltaP - decay[n])

  emitExplainabilityLogs(t)
```

## 10. Recommended Defaults (MVP)
- Levels: 0–5
- Progress per level: 100 points
- Gate threshold: 0.55
- Confidence decay: 4/turn without intel actions
- Max external level swing: ±1 level per 2 turns equivalent
- Shock frequency: 20% of turns, bounded magnitude

These defaults keep volatility meaningful without making planning feel random.
