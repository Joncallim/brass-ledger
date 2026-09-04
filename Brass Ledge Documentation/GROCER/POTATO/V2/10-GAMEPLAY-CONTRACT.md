---
type: v2-gameplay-contract
status: active
---

# V2 Gameplay Contract

Backlink: [[README]]

# Authority

The deterministic simulation owns every state transition and derived gameplay rule.

Content authors bounded Kestrel issues, courses, evidence definitions, producer mappings, world manifestations, signals and consequence rules. Presentation renders strict player-safe projections and submits only player authority.

# Canonical command-cycle semantics

Conceptually, each cycle:

1. advance authorised external/world conditions;
2. resolve Ravellan from its persisted state + typed active adversary observations only;
3. resolve any due replay-verifiable consequence/capability transitions;
4. derive all HQ evidence occurrences due at the current pre-command information cut;
5. independently reduce intent assessment, tactical warning and public-case basis;
6. build agenda from legitimate HQ/public/commitment/capability state;
7. derive responsible-officer recommendation/reasons/dissent from standing direction and known state;
8. present the implicit-delegation command surface;
9. accept player interventions/defer/task/final-course authority;
10. validate and resolve the complete atomic command package;
11. resolve persisted consequence/capability/commitment/source-use effects;
12. project exact public coalition behaviour into Ravellan observations for next-cycle use;
13. derive belief-safe consequence beats;
14. persist/replay every authoritative mutation and reconstruct pure readouts on demand;
15. advance to the next cycle or terminal debrief.

The conceptual order does not require one ledger entry per sentence.

Every persisted authoritative mutation follows one of two patterns from [[30-ARCHITECTURE-CONTRACT]]:

- explicit replay-verifiable transition; or
- not persisted because it is a pure deterministic readout.

#99 owns `ravellan-decision`. #100 HQ intelligence is pure derived state and creates no evidence ledger entry/revision/version change.

# Information boundary

World truth, Ravellan state/observations, HQ-derived intelligence, campaign state and presentation use separate types.

- Ravellan policy reads only cycle + its posture/preparation + active authored adversary observations.
- HQ observation extractors read only the exact world/history facts each named producer is authorised to inspect.
- HQ evidence reducers never read arbitrary hidden state or narrative prose.
- Recommendation reads only the specific #100 products an issue is authorised to use plus standing direction and known campaign state.
- Normal player DTO contains only bounded HQ/public/current-crisis semantics.

Changing hidden truth alone while all legitimate evidence/public inputs remain fixed must not change normal staff/player output.

# Standing direction and recommendation

Opening standing direction remains:

- main effort;
- protected boundary;
- acceptable secondary risk;
- posture preference.

Recommendation precedence:

1. player-legal/recommendation-applicable set;
2. protected boundary;
3. main priority;
4. default style;
5. tolerated cost;
6. known commitment;
7. authored responsible-chief tie.

Chief worldview creates professional preference/concern/dissent but never pre-filters the commander’s direction.

No hidden score.

# Command semantics

For each ordinary issue:

- **Delegate** executes the authoritative staff recommendation;
- **Intervene** selects a different legal authored course and consumes personal attention where normal;
- **Defer** exists only where authored.

Issues begin locally delegated. The player mainly changes exceptions. The complete submitted command remains explicit and server/sim-authoritative.

The untouched all-Delegate package must be legal.

Exactly three Kestrel courses are commander-only `requiresIntervention = true`:

1. C2 `public-accusation`;
2. C4 `request-partner-liaison`;
3. C5 `use-attribution`.

They can never be staff recommendations or Delegate.

# Atomic package composition

One cycle command is one atomic player-authority mutation.

For C2/C5 interacting issues:

- validate the complete set;
- derive cross-issue semantics from the complete set;
- never let issue/array order change state;
- never silently repair another player choice.

Exact Kestrel composition is [[39-KESTREL-CROSS-SYSTEM-COMPOSITION]].

# Intelligence

One bounded claim:

`ravellan-intent`

HQ derives three independent products:

- intent assessment;
- tactical warning;
- public-case basis.

Evidence uses categorical indicator/diagnostic semantics, explicit contrary evidence, source/method limitations, role-specific currency and persistent supersession. It never becomes a confidence score.

Assessment, warning and public-case relevance may expire at different times. Stale reports remain historical.

Named collection changes exact evidence occurrences, not a generic intelligence stat.

Exact semantics/state space/catalog are [[23-HQ-BELIEF-AND-EVIDENCE]], [[23A-HQ-BELIEF-EXECUTION-ARCHITECTURE]], [[23B-HQ-BELIEF-STATE-SPACE-AUDIT]] and [[23C-HQ-BELIEF-EVIDENCE-CATALOG]].

# Lattice

If matured, Lattice automatically tasks one unused named target in C4 and another different target in C5 according to standing priority unless the player retargets.

Task Collection costs zero normal intervention.

No zero-cost no-task or same-target retask exists in Kestrel. C6 adds no normal world transition that could make such a retask informative.

# Adversary fairness

Ravellan pursues its authored objective from hidden state and the closed observation vocabulary in [[37A-COALITION-TO-RAVELLAN-SIGNAL-MATRIX]].

No player score, HQ belief, private order, oracle data, future input or rubber-banding.

Missing signal is unknown, not its opposite.

# Persistent consequences and recovery

Kestrel uses concrete records for Beacon exposure/preparation, reserve, partner consent/authority, promises/obligations, Lattice and irreversible attribution source use.

Before C6, serious deterioration retains authored costly counterplay. Recovery may worsen another dimension.

# Attribution

Current attribution availability is derived from:

- current corroborated #100 public-case basis; and
- persisted source-use disposition.

#100 does not persist a mutable none/tentative/credible mirror.

Using the source at C5/C6 persists the exact claim direction and supporting evidence basis, exposes/compromises the protected source and prevents later reuse. Holding it leaves the C6 opportunity to be re-derived from C6 information.

A coercion claim is not seizure warning. Claim direction never substitutes for physical route adequacy.

# Terminal crisis

The player sees only:

- seizure underway;
- threshold confrontation;
- pressure receding.

Final route legality/effects are [[27-KESTREL-TERMINAL-MATRIX]]. Known player-safe dominated routes are omitted.

C6 HQ intelligence is explicitly the last pre-manifestation picture. The R6 action/row never becomes evidence.

Final routes mutate authoritative post-route state before classification.

Terminal debrief separates:

- what HQ believed at the time, reconstructed exactly;
- what actually happened in hidden Ravellan history.

# Replay and compatibility

V2 replay reconstructs from canonical initial state + complete ordered authoritative player/system transitions and verifies state, revision, hashes/digests and deterministic re-execution.

Derived #100 intelligence is recomputed from trusted history/content identity rather than saved as another truth.

Missing, duplicated, forged, reordered or unlogged authoritative mutations invalidate replay.

Persisted-format changes increment the prototype version; no silent reinterpretation/migration.

V1 save/replay/client semantics remain isolated.

# Human-fun boundary

Machines may prove determinism, state-space closure, information fairness, recovery, elasticity and absence of obvious dominated traps.

They cannot prove ownership, tension, comprehension or desire to continue/replay.

#107 structural lab + 3-player formative smoke precede the main browser tranche. #110 remains human-only.
