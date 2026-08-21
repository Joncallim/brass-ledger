import {
  optionalStaffModuleSchema,
  staffModuleDefinitionSchema,
  type DoctrineProfile,
  type StaffModuleDefinition,
} from "@brass-ledger/shared";

// Staff module registry (Doctrine 5, issue #59).
//
// Optional J6/J7/J8/J9/STRATCOM/MED/ENGINEER cells a faction fields on top of the
// mandatory S1-S5 contract. Every row is mechanical: the sim consumes these
// definitions generically (never module ids) and applies their requested deltas to a
// closed lane enum. Each row below transcribes the v2 module mechanics table exactly
// (lanes, deltas, signs, tags, summaries, and evidence anchors are binding).
//
// Evidence anchors: exact H2 headings from
// CELERY/doctrine-proof-register.md; each module cites a non-empty subset of its
// approved headings (approved sets are enforced by lint:content).
//   - J6: NATO AJP-3; UK PJHQ; France CPOIA; Japan Joint Staff
//   - J7: NATO AJP-3; Netherlands Staff Functions
//   - J8: NATO AJP-3; UK PJHQ; Netherlands Staff Functions; France CPOIA
//   - J9: NATO AJP-3; UK PJHQ; Netherlands Staff Functions
//   - STRATCOM: NATO AJP-3
//   - MED: NATO AJP-3; UK PJHQ; Japan Joint Staff
//   - ENGINEER: NATO AJP-3
//
// Effect array order is the mechanics table's left-to-right order and is preserved
// in readouts. `whenAnyTags: []` means the row is standing (always active); a
// non-empty list means ANY selected memo-option tag activates the row.

const nato = "CELERY/doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline";
const uk = "CELERY/doctrine-proof-register#UK PJHQ Staff Responsibilities";
const netherlands = "CELERY/doctrine-proof-register#Netherlands Staff Functions";
const france = "CELERY/doctrine-proof-register#France CPOIA J-Branches";
const japan = "CELERY/doctrine-proof-register#Japan Joint Staff Organization";

export const staffModuleDefinitions: readonly StaffModuleDefinition[] = [
  staffModuleDefinitionSchema.parse({
    id: "J6",
    label: "J6 — Communications and information systems",
    remit: "Integrate headquarters communications, information services, and contested-system dependencies.",
    primaryStaffFunctionRefs: ["S2", "S5"],
    evidenceRefs: [nato, uk],
    benefitEffects: [
      { lane: "doctrine.systemPressure", delta: -8.0, whenAnyTags: [], summary: "Integrated communications reduce contested-system pressure." },
    ],
    pressureEffects: [
      { lane: "staff.s2.deceptionRisk", delta: 1.5, whenAnyTags: [], summary: "Connected systems increase false-precision and deception exposure." },
      { lane: "resources.budgetAuthority", delta: -1.0, whenAnyTags: [], summary: "The information-system cell consumes budget authority." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "J7",
    label: "J7 — Joint training and assessment",
    remit: "Turn plans into rehearsed, assessed, and standardized joint practice.",
    primaryStaffFunctionRefs: ["S3", "S5"],
    evidenceRefs: [nato, netherlands],
    benefitEffects: [
      { lane: "staff.s5.strategicCoherence", delta: 1.5, whenAnyTags: ["simulation", "standardization", "training", "program", "modernization"], summary: "Joint rehearsal improves strategic coherence." },
      { lane: "doctrine.orderClarity", delta: 3.0, whenAnyTags: ["simulation", "standardization", "training", "program", "modernization"], summary: "Assessment and standardization improve order clarity." },
    ],
    pressureEffects: [
      { lane: "strategic.forceGeneration.trainingThroughput", delta: -0.5, whenAnyTags: ["simulation", "standardization", "training", "program", "modernization"], summary: "Rehearsal consumes current training throughput." },
      { lane: "resources.budgetAuthority", delta: -0.25, whenAnyTags: [], summary: "The training and assessment cell consumes budget authority." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "J8",
    label: "J8 — Finance",
    remit: "Make affordability, scrutiny, and budget authority explicit in headquarters choices.",
    primaryStaffFunctionRefs: ["S5"],
    evidenceRefs: [nato, uk, france],
    benefitEffects: [
      { lane: "strategic.domestic.cabinetCover", delta: 0.5, whenAnyTags: ["program", "modernization", "committee-heavy"], summary: "Disciplined costing protects cabinet cover for funded choices." },
    ],
    pressureEffects: [
      { lane: "resources.budgetAuthority", delta: -1.0, whenAnyTags: [], summary: "Finance makes the budget envelope an active constraint." },
      { lane: "strategic.domestic.committeeTolerance", delta: -0.5, whenAnyTags: ["program", "modernization", "committee-heavy"], summary: "Additional scrutiny consumes committee tolerance." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "J9",
    label: "J9 — Policy, legal, media, and civil affairs",
    remit: "Reconcile policy, legal, media, partner, and civil considerations before commitment.",
    primaryStaffFunctionRefs: ["S5"],
    evidenceRefs: [nato, uk, netherlands],
    benefitEffects: [
      { lane: "strategic.alliance.politicalAlignment", delta: 0.75, whenAnyTags: ["alliance", "public-commitment", "quiet"], summary: "Policy and partner reconciliation improve political alignment." },
    ],
    pressureEffects: [
      { lane: "strategic.domestic.mediaHeat", delta: 1.5, whenAnyTags: ["public-commitment", "committee-heavy"], summary: "Public and committee-facing choices raise media pressure." },
      { lane: "strategic.domestic.cabinetCover", delta: -0.5, whenAnyTags: ["public-commitment", "committee-heavy"], summary: "Caveat reconciliation spends cabinet cover." },
      { lane: "resources.budgetAuthority", delta: -0.5, whenAnyTags: [], summary: "The policy and civil-affairs cell consumes budget authority." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "STRATCOM",
    label: "STRATCOM — Strategic communications",
    remit: "Coordinate signaling so reassurance and deterrence remain credible under public visibility.",
    primaryStaffFunctionRefs: ["S3", "S5"],
    evidenceRefs: [nato],
    benefitEffects: [
      { lane: "strategic.alliance.reassurance", delta: 1.0, whenAnyTags: ["deterrence", "alliance", "public-commitment"], summary: "Coordinated signaling improves allied reassurance." },
    ],
    pressureEffects: [
      { lane: "strategic.escalation.incidentLadder", delta: 0.75, whenAnyTags: ["deterrence", "public-commitment"], summary: "Visible signaling raises the incident ladder." },
      { lane: "strategic.domestic.mediaHeat", delta: 1.0, whenAnyTags: ["deterrence", "public-commitment"], summary: "Visible signaling raises media pressure." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "MED",
    label: "MED — Medical planning",
    remit: "Protect recovery and reserve endurance while preserving medical-evacuation support.",
    primaryStaffFunctionRefs: ["S1", "S4"],
    evidenceRefs: [nato, uk, japan],
    benefitEffects: [
      { lane: "staff.s1.recoveryDebt", delta: -2.0, whenAnyTags: [], summary: "Medical planning reduces recovery debt." },
      { lane: "strategic.forceGeneration.reserveStrain", delta: -0.4, whenAnyTags: [], summary: "Medical depth reduces reserve strain." },
    ],
    pressureEffects: [
      { lane: "resources.budgetAuthority", delta: -0.75, whenAnyTags: [], summary: "Medical readiness consumes budget authority." },
      { lane: "strategic.sustainment.liftAvailability", delta: -0.25, whenAnyTags: [], summary: "Medical-evacuation reserve consumes lift availability." },
    ],
  }),
  staffModuleDefinitionSchema.parse({
    id: "ENGINEER",
    label: "ENGINEER — Engineering and infrastructure",
    remit: "Plan repair, infrastructure, depot, and movement capacity for operational reach.",
    primaryStaffFunctionRefs: ["S3", "S4"],
    evidenceRefs: [nato],
    benefitEffects: [
      { lane: "strategic.sustainment.depotBacklog", delta: -1.5, whenAnyTags: ["repair", "lift", "fuel"], summary: "Engineering work reduces depot backlog." },
      { lane: "strategic.sustainment.liftAvailability", delta: 0.75, whenAnyTags: ["repair", "lift", "fuel"], summary: "Engineering work improves lift availability." },
    ],
    pressureEffects: [
      { lane: "resources.budgetAuthority", delta: -1.0, whenAnyTags: ["repair", "lift", "fuel"], summary: "Engineering work consumes budget authority." },
      { lane: "strategic.forceGeneration.trainingThroughput", delta: -0.5, whenAnyTags: ["repair", "lift", "fuel"], summary: "Field works consume training throughput." },
    ],
  }),
];

// Resolve a profile's optionalStaffModules against the registry, returning
// definitions in profile order. Throws on an incomplete/duplicate registry, an
// unknown id, or a repeated profile id so a typo fails loudly in lint:content
// rather than silently shipping an inert or double-counted module.
export function resolveStaffModules(profile: DoctrineProfile): StaffModuleDefinition[] {
  const byId = new Map(staffModuleDefinitions.map((definition) => [definition.id, definition]));
  if (
    staffModuleDefinitions.length !== optionalStaffModuleSchema.options.length ||
    byId.size !== staffModuleDefinitions.length
  ) {
    throw new Error("staff module registry must contain exactly one definition per enum member");
  }
  const missingRegistryIds = optionalStaffModuleSchema.options.filter((id) => !byId.has(id));
  if (missingRegistryIds.length > 0) {
    throw new Error(`staff module registry is incomplete: ${missingRegistryIds.join(", ")}`);
  }
  if (new Set(profile.optionalStaffModules).size !== profile.optionalStaffModules.length) {
    throw new Error(`doctrine profile ${profile.id} repeats an optional staff module`);
  }
  return profile.optionalStaffModules.map((id) => {
    const definition = byId.get(id);
    if (!definition) throw new Error(`unknown staff module ${id}`);
    return definition;
  });
}
