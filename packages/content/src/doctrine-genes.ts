import { doctrineGeneSchema, type DoctrineGene, type DoctrineProfile } from "@brass-ledger/shared";

// Doctrine gene registry (Doctrine 2, issue #56).
//
// Genes are content data derived from the CELERY faction doctrine gene bank
// (Brass Ledge Documentation/GROCER/CELERY/faction-doctrine-gene-bank.md). The engine
// never hard-codes genes: a scenario's DoctrineProfile references these by id, and the
// applied baseline is computed once at scenario-definition time via applyDoctrineGenes.
//
// Mapping convention (gene bank "POTATO variables" → engine variables):
// The gene bank predates Doctrine 1 and uses its own frame vocabulary
// (e.g. interoperabilityBias, processFlexibility). Each gene below translates that
// intent onto the actual DoctrineMechanicsState keys, with at least one counterweight
// per benefit (negative modifier, or a positive modifier on a doctrineRiskKeys key).
//
// Remaining gene-bank entries (Commander-Compressed Planning, Expeditionary Operational
// HQ, C4-Resilient Territorial Staff, Whole-Of-State Mobilizer, System-Pressure Operator,
// Maneuverist Tempo Culture, Policy-Legal Integrated Command) are intentionally not yet
// ported: Doctrine 2 only needs the genes a scenario actually uses.

export const doctrineGenes: readonly DoctrineGene[] = [
  doctrineGeneSchema.parse({
    id: "coalition-native-staff",
    label: "Coalition-Native Staff",
    evidenceRefs: [
      "CELERY/doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline",
      "CELERY/doctrine-proof-register#UK PJHQ Staff Responsibilities",
    ],
    strengths: [
      "Lower liaison friction between national and multinational staff lanes",
      "Clearer shared staff language and stronger coalition reassurance",
    ],
    vulnerabilities: [
      "More policy, legal, media, and partner caveat constraints on every commitment",
    ],
    variableModifiers: {
      campaignAimClarity: 6,
      staffSynchronization: 7,
      commanderIntentClarity: 4,
      systemPressure: 8, // counterweight: caveat and legal/policy load
    },
    staffAdviceStyle: {
      S5: "Frames every option in alliance terms first and warns when a commitment outruns what partners have actually signed up to.",
      S3: "Treats multinational coordination as the default and reads partner caveats as constraints, not noise.",
      S2: "Trusts partner-derived collection only when the partner's own confidence is high enough to cite it.",
    },
  }),
  doctrineGeneSchema.parse({
    id: "adaptive-cell-staff",
    label: "Adaptive Cell Staff",
    evidenceRefs: [
      "CELERY/doctrine-proof-register#Netherlands No Pure Staff Structure",
      "CELERY/doctrine-proof-register#Netherlands Chief Of Staff Role",
    ],
    strengths: [
      "Faster response to complex multi-lane problems",
      "Fewer vertical stovepipe failures",
    ],
    vulnerabilities: [
      "Coordination cost rises when too many temporary cells compete for attention",
    ],
    variableModifiers: {
      staffSynchronization: 5,
      orderClarity: 4,
      uncommittedCapacity: -5, // counterweight: cells consume coordination capacity
    },
    staffAdviceStyle: {
      S1: "Asks whether a new cell is worth its coordination cost before approving headcount moves.",
      S3: "Prefers temporary cross-functional cells over pure stovepipe routing for multi-lane problems.",
    },
  }),
  doctrineGeneSchema.parse({
    id: "sustainment-first-operational-reach",
    label: "Sustainment-First Operational Reach",
    evidenceRefs: [
      "CELERY/doctrine-proof-register#US Army ADP 4-0 Sustainment",
      "CELERY/doctrine-proof-register#Sustainment Warfighting Function Elements",
    ],
    strengths: [
      "Fewer false readiness states",
      "Better crisis endurance and longer-campaign robustness",
    ],
    vulnerabilities: [
      "Slower visible posture; political frustration when the public wants immediate action",
    ],
    variableModifiers: {
      operationalReach: 6,
      supportableTempo: -5, // counterweight: doctrine insists tempo be earned, not claimed
      relativeTempo: -3, // counterweight: slower visible posture
      systemPressure: 3, // counterweight: political frustration pressure
    },
    staffAdviceStyle: {
      S4: "Holds an effective veto over tempo promises and frames every plan as a supportability question first.",
      S3: "Accepts sustainment-driven sequencing and argues for it publicly instead of hiding the constraint.",
      S1: "Credits readiness only when the force can actually be sustained, not when it merely looks ready.",
    },
  }),
];

// Resolve a profile's geneIds against the registry. Throws on unknown ids so a typo
// fails loudly in lint:content rather than silently producing a neutral baseline.
export function resolveDoctrineGenes(profile: DoctrineProfile): DoctrineGene[] {
  const byId = new Map(doctrineGenes.map((gene) => [gene.id, gene]));
  const missing = profile.geneIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new Error(
      `Doctrine profile ${profile.id} references unknown gene id(s): ${missing.join(", ")}. ` +
        `Available genes: ${[...byId.keys()].join(", ")}.`,
    );
  }
  return profile.geneIds.map((id) => byId.get(id)!);
}
