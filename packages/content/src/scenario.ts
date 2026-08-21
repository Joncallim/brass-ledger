import {
  applyDoctrineGenes,
  composeDoctrineLens,
  defaultDoctrineMechanicsState,
  doctrineProfileSchema,
  scenarioDefinitionSchema,
} from "@brass-ledger/shared";
import { resolveDoctrineGenes } from "./doctrine-genes";
import { resolveStaffModules } from "./staff-module-definitions";

// The scenario's doctrine identity: a fictional coalition-composite staff culture
// assembled from CELERY gene-bank genes (Doctrine 2, issue #56). The genes are content
// data in ./doctrine-genes.ts; the applied baseline below is what the engine sees.
// Guardrail: this is a fictional composite, not a clone of any real country's staff.
const doctrineProfile = doctrineProfileSchema.parse({
  id: "jhq-coalition-composite",
  label: "Allied joint headquarters — coalition-composite staff culture",
  evidenceRefs: [
    "CELERY/faction-doctrine-gene-bank#Gene: Coalition-Native Staff",
    "CELERY/faction-doctrine-gene-bank#Gene: Adaptive Cell Staff",
    "CELERY/faction-doctrine-gene-bank#Gene: Sustainment-First Operational Reach",
  ],
  geneIds: [
    "coalition-native-staff",
    "adaptive-cell-staff",
    "sustainment-first-operational-reach",
  ],
  // Doctrine 5 (issue #59): the coalition-composite fields four optional staff cells.
  // The order is the presentation/readout order and is binding (lint + shared
  // refinement tie scenario.staffModules to this exactly).
  optionalStaffModules: ["J6", "J8", "J9", "STRATCOM"],
});

export const soloScenario = scenarioDefinitionSchema.parse({
  id: "brass-ledger-jhq",
  title: "Brass Ledger",
  description:
    "You run a joint headquarters trying to rebuild a credible defense during a slow-burning crisis. Warning about the adversary's intentions is never quite clean, the reserve force is already strained, and sustainment cannot support everything you would like to do at once. Every month you weigh deterrence, force generation, alliance politics, and how much political cover you can afford to spend, and you live with what each choice costs the next month.",
  contentVersion: "0.11.0",
  maxTurns: 12,
  chiefs: [
    { id: "warden", name: "Maj. Gen. Ruth Warden", genderPresentation: "female", directorate: "people", title: "Chief of People", doctrineBias: "preserve deployable experience before chasing visible tempo", temperament: "plainspoken and protective", competence: 0.78, riskTolerance: 0.34, preferredTags: ["retention", "reserve", "recovery", "training"], concernTags: ["escalatory", "tempo-spike"] },
    { id: "halden", name: "Dr. Elias Halden", genderPresentation: "male", directorate: "intelligence", title: "Chief of Intelligence", doctrineBias: "confidence before commitment", temperament: "clinical and skeptical", competence: 0.9, riskTolerance: 0.28, preferredTags: ["collection", "warning", "counter-deception", "industrial-watch"], concernTags: ["escalatory", "public-commitment"] },
    { id: "briggs", name: "Lt. Gen. Mara Briggs", genderPresentation: "female", directorate: "operations", title: "Chief of Operations", doctrineBias: "readiness must be visible enough to deter", temperament: "impatient and direct", competence: 0.84, riskTolerance: 0.66, preferredTags: ["deterrence", "exercise", "forward-posture", "fires"], concernTags: ["slow-burn", "committee-heavy"] },
    { id: "okafor", name: "Lt. Gen. Tunde Okafor", genderPresentation: "male", directorate: "sustainment", title: "Chief of Sustainment", doctrineBias: "keep the force supportable before making it busy", temperament: "methodical and constraint-driven", competence: 0.86, riskTolerance: 0.31, preferredTags: ["repair", "munitions", "lift", "fuel"], concernTags: ["tempo-spike", "escalatory"] },
    { id: "sato", name: "Gen. Mina Sato", genderPresentation: "female", directorate: "plans", title: "Chief of Plans", doctrineBias: "shape the theater before it hardens against you", temperament: "strategic and political", competence: 0.82, riskTolerance: 0.48, preferredTags: ["alliance", "modernization", "program", "public-commitment"], concernTags: ["ad-hoc", "hollow"] },
    { id: "navarro", name: "Lt. Gen. Elena Navarro", genderPresentation: "female", directorate: "training", title: "Chief of Training", doctrineBias: "repetition before prestige", temperament: "exacting and unsentimental", competence: 0.85, riskTolerance: 0.38, preferredTags: ["training", "recovery", "simulation", "standardization"], concernTags: ["tempo-spike", "hollow"] },
  ],
  staffCapacities: [
    { directorate: "people", capacity: 3, strainedAt: 3, overloadedAt: 5 },
    { directorate: "intelligence", capacity: 3, strainedAt: 3, overloadedAt: 5 },
    { directorate: "operations", capacity: 4, strainedAt: 4, overloadedAt: 6 },
    { directorate: "sustainment", capacity: 4, strainedAt: 4, overloadedAt: 6 },
    { directorate: "plans", capacity: 3, strainedAt: 3, overloadedAt: 5 },
    { directorate: "training", capacity: 3, strainedAt: 3, overloadedAt: 5 },
  ],
  staffFunctions: [
    { id: "S1", label: "Personnel", shortLabel: "S1", directorates: ["people"], doctrineNote: "Protects how many brigades you can field, whether retention holds, and how much recovery debt the force is quietly building up.", metricLabels: ["Deployable units", "Reserve strain", "Personnel shortfalls"] },
    { id: "S2", label: "Intelligence", shortLabel: "S2", directorates: ["intelligence"], doctrineNote: "Keeps your warning picture honest even when collection has gaps and the adversary is trying to deceive you.", metricLabels: ["Confidence", "Warning reliability", "Deception pressure"] },
    { id: "S3", label: "Operations", shortLabel: "S3", directorates: ["operations", "training"], doctrineNote: "Turns the posture and training guidance you choose into readiness the force can actually execute, not just claim.", metricLabels: ["Deployable units", "Training throughput", "Incident ladder"] },
    { id: "S4", label: "Logistics", shortLabel: "S4", directorates: ["sustainment"], doctrineNote: "Keeps depot backlog, munitions, fuel, and lift from falling behind what you have promised the rest of the headquarters.", metricLabels: ["Depot backlog", "Munitions", "Lift availability"] },
    { id: "S5", label: "Plans", shortLabel: "S5", directorates: ["plans"], doctrineNote: "Keeps alliance commitments, domestic politics, and modernization choices sequenced into one coherent campaign instead of pulling against each other.", metricLabels: ["Cabinet cover", "Alliance alignment", "Committee tolerance"] },
  ],
  capabilityPrograms: [
    { id: "fires-network", label: "Joint Fires Network", summary: "Long-range targeting and fires integration across the theater force.", absorbingDirectorate: "operations", payoff: "Creates a credible operational deterrent once integrated and trained.", fragility: "Moves fastest on paper; stalls if training and sustainment do not keep up.", preferredTags: ["fires", "deterrence", "simulation"] },
    { id: "counter-deception-grid", label: "Counter-Deception Grid", summary: "Collection, validation, and red-team measures that improve warning reliability.", absorbingDirectorate: "intelligence", payoff: "Improves warning time and protects commander confidence.", fragility: "Looks effective early, but collapses if the brief is overclaimed.", preferredTags: ["counter-deception", "collection", "warning"] },
    { id: "sustainment-ledger", label: "Sustainment Ledger", summary: "Repair, stock, and movement transparency across depots and lift nodes.", absorbingDirectorate: "sustainment", payoff: "Reduces backlog and makes tempo more supportable.", fragility: "Slow to field and easy to oversell while depots remain overloaded.", preferredTags: ["repair", "lift", "fuel", "program"] },
    { id: "reserve-rebuild", label: "Reserve Rebuild", summary: "Retention, reserve predictability, and training recovery for the manpower base.", absorbingDirectorate: "people", payoff: "Raises deployable strength without burning the force out.", fragility: "Politically easier to announce than to sustain.", preferredTags: ["retention", "reserve", "training", "recovery"] },
  ],
  externalConstraints: [
    { id: "shipping-market", label: "Commercial Shipping Market", summary: "Available hulls and charter prices for sustainment movement." },
    { id: "electronics-chain", label: "Trusted Electronics Chain", summary: "Secure electronics supply for sensors, depot tooling, and targeting systems." },
    { id: "propellant-market", label: "Propellant Market", summary: "Availability of propellant and precursor inputs for munitions output." },
  ],
  memoTemplates: [
    {
      id: "posture",
      category: "Operational Posture",
      title: "Posture for the northern frontage",
      issue: "Probe tempo along the frontage is climbing while the force is still rebuilding readiness from the last stretch of strain. You need to set a posture for the next month, and every option balances the same three things differently: how much deterrence it buys, how much reserve strain it costs, and how much political exposure it creates. There is no posture that maximizes all three at once.",
      whyNow: "Adversary probing remains calibrated below open conflict, but warning time is not long enough to hide indecision.",
      sponsorDirectorate: "operations",
      objectorDirectorate: "people",
      assumptions: ["Adversary probes will continue below the threshold of open conflict.", "The reserve base can absorb one more month of visible pressure if handled carefully."],
      knownUnknowns: ["How much of the current warning picture is deception rather than real preparation.", "How quickly allied reassurance would offset the domestic cost of higher visibility."],
      optional: false,
      options: [
        { id: "measured-deterrence", label: "Measured deterrence posture", summary: "Raise visibility selectively — rehearsed readiness moves, not a general surge — so the posture reads as deliberate rather than reactive.", tradeoffs: ["Improves deterrence without the full political cost of a surge.", "May still leave operations wanting more visible mass."], burden: [{ directorate: "operations", points: 2 }, { directorate: "training", points: 1 }, { directorate: "people", points: 1 }], tags: ["deterrence", "training", "recovery"], linkedActionIds: [], assumptions: ["Warning time will remain above 36 hours."], stateDelta: { forceGeneration: { deployableUnits: 0.7, trainingThroughput: 4, reserveStrain: 3 }, domestic: { cabinetCover: -2, mediaHeat: 2 }, alliance: { reassurance: 2, politicalAlignment: 1 }, escalation: { probeTempo: 1, incidentLadder: 2 } }, programPushes: [{ programId: "reserve-rebuild", points: 9 }], constraintShifts: [] },
        { id: "quiet-recovery", label: "Quiet recovery posture", summary: "Keep visible activity inside training and recovery lanes for the month, giving the reserve base room to recover instead of feeding more tempo into it.", tradeoffs: ["Protects the force and domestic cover.", "Risks looking passive if probes continue to rise."], burden: [{ directorate: "people", points: 2 }, { directorate: "training", points: 2 }, { directorate: "operations", points: 1 }], tags: ["recovery", "retention", "training", "slow-burn"], linkedActionIds: [], assumptions: [], stateDelta: { forceGeneration: { deployableUnits: 0.4, reserveStrain: -4, trainingThroughput: 5, personnelShortfalls: -3 }, domestic: { cabinetCover: 2, mediaHeat: -1, publicPatience: 3 }, alliance: { reassurance: -1 }, escalation: { probeTempo: 1, incidentLadder: -1 } }, programPushes: [{ programId: "reserve-rebuild", points: 12 }], constraintShifts: [] },
        { id: "surge-exercises", label: "Visible exercise surge", summary: "Push high-profile exercises and forward rehearsal now, trading reserve strain and sustainment stress for the fastest visible show of resolve available.", tradeoffs: ["Quickest visible deterrent effect.", "Highest reserve strain and sustainment stress."], burden: [{ directorate: "operations", points: 3 }, { directorate: "training", points: 2 }, { directorate: "sustainment", points: 2 }, { directorate: "people", points: 2 }], tags: ["exercise", "deterrence", "tempo-spike", "escalatory", "hollow"], linkedActionIds: [], assumptions: [], stateDelta: { forceGeneration: { deployableUnits: 1.1, reserveStrain: 7, trainingThroughput: 2, personnelShortfalls: 2 }, domestic: { cabinetCover: -5, mediaHeat: 5, publicPatience: -2 }, alliance: { reassurance: 3, partnerParticipation: 2 }, escalation: { probeTempo: 2, incidentLadder: 5, crisisSensitivity: 3 } }, programPushes: [{ programId: "fires-network", points: 6 }], constraintShifts: [] },
        { id: "tempo-hold", label: "Deliberate tempo hold", summary: "Call a structured pause: stand down visible exercises for the month and let the force recover instead of asking it to carry more.", tradeoffs: ["Only posture choice with no training burden; best path for S1 recovery and domestic patience.", "Risks looking passive if adversary probes continue to rise."], burden: [{ directorate: "people", points: 1 }, { directorate: "operations", points: 1 }], tags: ["recovery", "retention", "slow-burn"], linkedActionIds: [], assumptions: [], stateDelta: { forceGeneration: { deployableUnits: -0.2, reserveStrain: -5, trainingThroughput: 2, personnelShortfalls: -2 }, domestic: { publicPatience: 3, cabinetCover: 2, mediaHeat: -2 }, alliance: { reassurance: -2 }, escalation: { incidentLadder: -2, probeTempo: -1 } }, programPushes: [{ programId: "reserve-rebuild", points: 10 }], constraintShifts: [] },
      ],
    },
    {
      id: "intelligence-focus",
      category: "Intelligence Focus",
      title: "Collection and warning emphasis",
      issue: "The current intelligence picture is usable, but patchy — parts of it are confirmed, parts are still estimated, and analyst bandwidth is not enough to chase everything at once. The headquarters has to decide where that scarce bandwidth goes this month: toward faster warning of a posture shift, toward reading the adversary's industrial base, or toward hardening the brief itself against deliberate deception.",
      whyNow: "The room is making decisions off a brief that remains partly estimated rather than confirmed.",
      sponsorDirectorate: "intelligence",
      objectorDirectorate: "operations",
      assumptions: ["Collection capacity can only sustain one main effort without degrading confidence elsewhere."],
      knownUnknowns: ["Which parts of the current industrial picture are deliberate deception."],
      optional: false,
      options: [
        { id: "warning-net", label: "Frontier warning net", summary: "Shift collection and analysis toward warning reliability, buying shorter alert cycles at the cost of less attention on the adversary's industrial base.", tradeoffs: ["Improves confidence in sudden posture shifts.", "Leaves less bandwidth for industrial exploitation."], burden: [{ directorate: "intelligence", points: 3 }, { directorate: "operations", points: 1 }], tags: ["warning", "collection"], linkedActionIds: [], assumptions: [], stateDelta: { intelligence: { confidence: 5, warningReliability: 8, collectionCoverage: 2 }, escalation: { warningTime: 8, crisisSensitivity: -1 } }, programPushes: [{ programId: "counter-deception-grid", points: 8 }], constraintShifts: [] },
        { id: "industrial-watch", label: "Industrial watch", summary: "Point collection at components, lift markets, and munitions inputs so program planning is grounded in what is actually available, not what is assumed.", tradeoffs: ["Better planning and sustainment realism.", "Less immediate payoff in tactical warning."], burden: [{ directorate: "intelligence", points: 2 }, { directorate: "plans", points: 1 }, { directorate: "sustainment", points: 1 }], tags: ["industrial-watch", "program", "collection"], linkedActionIds: [], assumptions: [], stateDelta: { intelligence: { confidence: 3, collectionCoverage: 5 }, sustainment: { munitionsSufficiency: 2, liftAvailability: 2 } }, programPushes: [{ programId: "sustainment-ledger", points: 8 }, { programId: "fires-network", points: 4 }], constraintShifts: [{ constraintId: "shipping-market", delta: -4 }, { constraintId: "electronics-chain", delta: -3 }] },
        { id: "deception-hunt", label: "Counter-deception hunt", summary: "Put analysts into a sharper red-team and validation cycle so the brief is harder for the adversary to quietly manipulate.", tradeoffs: ["Reduces the risk of acting on a false picture.", "Consumes elite analysts and slows routine throughput."], burden: [{ directorate: "intelligence", points: 4 }, { directorate: "plans", points: 1 }], tags: ["counter-deception", "warning"], linkedActionIds: [], assumptions: [], stateDelta: { intelligence: { confidence: 7, deceptionPressure: -8, warningReliability: 4 }, domestic: { cabinetCover: 1 } }, programPushes: [{ programId: "counter-deception-grid", points: 12 }], constraintShifts: [] },
      ],
    },
    {
      id: "sustainment-focus",
      category: "Sustainment Priority",
      title: "What sustainment must protect first",
      issue: "The force can promise more tempo than sustainment can actually carry. Depot backlog, munitions stock, and lift capacity are all under some strain, and this month's effort can only clear one of those lanes properly — whichever you prioritize, the other two stay exactly where they are.",
      whyNow: "The current sustainment picture is not yet strong enough to support every line of effort at once.",
      sponsorDirectorate: "sustainment",
      objectorDirectorate: "operations",
      assumptions: ["Sustainment friction this month will become next month’s readiness truth."],
      knownUnknowns: ["Whether commercial movement and depot throughput will tighten at the same time."],
      optional: false,
      options: [
        { id: "repair-first", label: "Repair and depot recovery", summary: "Put this month's effort into depot flow, spare parts, and maintenance recovery — the slow, unglamorous work that makes next month's readiness real.", tradeoffs: ["Best choice for sustained readiness recovery.", "Lower immediate payoff in visible theater tempo."], burden: [{ directorate: "sustainment", points: 3 }, { directorate: "operations", points: 1 }], tags: ["repair", "recovery"], linkedActionIds: [], assumptions: [], stateDelta: { sustainment: { depotBacklog: -10, fuelSufficiency: 2 }, forceGeneration: { deployableUnits: 0.5 }, domestic: { cabinetCover: 1 } }, programPushes: [{ programId: "sustainment-ledger", points: 12 }], constraintShifts: [] },
        { id: "munitions-hedge", label: "Munitions hedge", summary: "Build a hedge in propellant and ammunition stock now, before a possible deterioration in the theater makes that stock much harder to secure.", tradeoffs: ["Improves deterrent depth.", "Looks abstract if readiness remains visibly flat."], burden: [{ directorate: "sustainment", points: 2 }, { directorate: "plans", points: 1 }], tags: ["munitions", "fires", "program"], linkedActionIds: [], assumptions: [], stateDelta: { sustainment: { munitionsSufficiency: 8 }, escalation: { incidentLadder: -1 }, domestic: { mediaHeat: 1 } }, programPushes: [{ programId: "fires-network", points: 9 }], constraintShifts: [{ constraintId: "propellant-market", delta: -6 }] },
        { id: "lift-assurance", label: "Lift assurance package", summary: "Lock in movement guarantees and fuel routing now, so options you might want later in the campaign are still physically possible to execute.", tradeoffs: ["Strengthens flexibility under surprise.", "Provides less immediately visible readiness effect."], burden: [{ directorate: "sustainment", points: 3 }, { directorate: "plans", points: 1 }], tags: ["lift", "fuel", "program"], linkedActionIds: [], assumptions: [], stateDelta: { sustainment: { liftAvailability: 8, fuelSufficiency: 6 }, alliance: { reassurance: 1 } }, programPushes: [{ programId: "sustainment-ledger", points: 8 }], constraintShifts: [{ constraintId: "shipping-market", delta: -8 }] },
      ],
    },
    {
      id: "alliance-frame",
      category: "Alliance and Political Frame",
      title: "How to frame the month to partners and cabinet",
      issue: "Alliance reassurance and domestic cover are both thin enough right now that the headquarters cannot afford to communicate loosely. What you tell partners and what you tell cabinet do not have to say the same thing, but they do have to survive being compared.",
      whyNow: "Partners want steadier reassurance while cabinet tolerance is starting to narrow.",
      sponsorDirectorate: "plans",
      objectorDirectorate: "intelligence",
      assumptions: ["Public alignment and partner alignment will not always move together."],
      knownUnknowns: ["Whether partner governments will match reassuring language with actual participation."],
      optional: false,
      options: [
        { id: "quiet-reassurance", label: "Quiet reassurance", summary: "Work private partner channels and keep public language restrained, steadying the coalition without giving domestic critics anything new to seize on.", tradeoffs: ["Safest for cabinet cover.", "Less visible reassurance to operations-minded partners."], burden: [{ directorate: "plans", points: 2 }, { directorate: "intelligence", points: 1 }], tags: ["alliance", "quiet"], linkedActionIds: [], assumptions: [], stateDelta: { alliance: { reassurance: 5, politicalAlignment: 3 }, domestic: { cabinetCover: 2, mediaHeat: -2, publicPatience: 1 }, escalation: { incidentLadder: -1 } }, programPushes: [], constraintShifts: [] },
        { id: "public-assurance-tour", label: "Public assurance tour", summary: "Lean into public alliance signaling — visible statements, visible backing — to show resolve quickly, and accept the domestic scrutiny that comes with saying it out loud.", tradeoffs: ["Raises visible reassurance quickly.", "Exposes the headquarters to domestic criticism if readiness does not keep pace."], burden: [{ directorate: "plans", points: 3 }, { directorate: "operations", points: 1 }], tags: ["alliance", "public-commitment", "deterrence", "ad-hoc"], linkedActionIds: [], assumptions: [], stateDelta: { alliance: { reassurance: 8, politicalAlignment: 5, partnerParticipation: 2 }, domestic: { cabinetCover: -2, mediaHeat: 4 }, escalation: { probeTempo: 1, incidentLadder: 2 } }, programPushes: [], constraintShifts: [] },
        { id: "modernization-case", label: "Modernization case to cabinet and allies", summary: "Spend political capital making the case to cabinet and allies that paying for force design and programs now prevents a much worse bill later.", tradeoffs: ["Accelerates long-run capability programs.", "Turns scrutiny onto every gap in the current force."], burden: [{ directorate: "plans", points: 3 }, { directorate: "sustainment", points: 1 }, { directorate: "intelligence", points: 1 }], tags: ["modernization", "program", "committee-heavy", "public-commitment"], linkedActionIds: [], assumptions: [], stateDelta: { alliance: { politicalAlignment: 4, reassurance: 3 }, domestic: { cabinetCover: -3, committeeTolerance: -2, mediaHeat: 5 } }, programPushes: [{ programId: "fires-network", points: 6 }, { programId: "sustainment-ledger", points: 6 }], constraintShifts: [] },
      ],
    },
    {
      id: "force-development",
      category: "Force Development",
      title: "Which capability line gets the month’s extra attention",
      issue: "The headquarters can push one capability program forward with real intent this month — enough attention and resourcing to actually move it — but not every program at once. Whichever line you skip keeps drifting at its current pace.",
      whyNow: "The modernization debate is starting to outpace the force’s ability to absorb new ideas cleanly.",
      sponsorDirectorate: "plans",
      objectorDirectorate: "training",
      assumptions: ["Program progress that outruns integration and training creates false confidence rather than usable advantage."],
      knownUnknowns: ["Which capability line will matter most if the theater deteriorates earlier than expected."],
      optional: true,
      options: [
        { id: "fires-prototype", label: "Accelerate the fires prototype", summary: "Push the joint fires network forward hard this month, betting on a real future deterrent edge if training and sustainment can keep pace with it.", tradeoffs: ["Potentially the biggest upside in deterrence.", "Most exposed to training and sustainment absorption problems."], burden: [{ directorate: "plans", points: 1 }, { directorate: "operations", points: 2 }, { directorate: "training", points: 2 }, { directorate: "sustainment", points: 1 }], tags: ["fires", "modernization", "simulation"], linkedActionIds: [], assumptions: [], stateDelta: { forceGeneration: { trainingThroughput: -1 }, domestic: { cabinetCover: -1, mediaHeat: 2 }, escalation: { incidentLadder: 1 } }, programPushes: [{ programId: "fires-network", points: 14 }], constraintShifts: [{ constraintId: "electronics-chain", delta: 3 }, { constraintId: "propellant-market", delta: 2 }] },
        { id: "deception-grid", label: "Expand the counter-deception grid", summary: "Spend the month hardening the intelligence brief against deception rather than advertising a new kinetic capability.", tradeoffs: ["Best for clearer decision-making under fog.", "Least visible payoff to the public and some allies."], burden: [{ directorate: "intelligence", points: 2 }, { directorate: "plans", points: 1 }, { directorate: "training", points: 1 }], tags: ["counter-deception", "program", "warning"], linkedActionIds: [], assumptions: [], stateDelta: { intelligence: { confidence: 4, deceptionPressure: -6, warningReliability: 3 }, domestic: { cabinetCover: 1 } }, programPushes: [{ programId: "counter-deception-grid", points: 14 }], constraintShifts: [] },
        { id: "training-reset", label: "Training discipline reset", summary: "Spend the month converting hard-won lessons into standardization, instructor depth, and field practice the force can actually repeat.", tradeoffs: ["Most reliable path to usable medium-term readiness.", "Least dramatic headline in the short term."], burden: [{ directorate: "training", points: 3 }, { directorate: "people", points: 1 }, { directorate: "operations", points: 1 }], tags: ["training", "standardization", "recovery"], linkedActionIds: [], assumptions: [], stateDelta: { forceGeneration: { trainingThroughput: 6, deployableUnits: 0.4, reserveStrain: -2 }, domestic: { publicPatience: 2 } }, programPushes: [{ programId: "reserve-rebuild", points: 8 }, { programId: "fires-network", points: 6 }], constraintShifts: [] },
      ],
    },
  ],
  events: [
    // ── Existing ──────────────────────────────────────────────────────────────
    { id: "shipping-jam", title: "Shipping jam", summary: "Congestion at regional ports tightens commercial lift capacity and stretches your movement timelines for the rest of the month.", minTurn: 2, maxTurn: 6, triggerTags: ["lift", "public-commitment"], requiredFlags: [], excludedFlags: [], setsFlags: ["shipping_jam"], clearsFlags: [], stateDelta: { sustainment: { liftAvailability: -7, depotBacklog: 4 }, escalation: { incidentLadder: 1 } }, constraintShifts: [{ constraintId: "shipping-market", delta: 12 }] },
    // Fix: original had triggerTags: ["tempo-spike", "reserve"] but "reserve" is not an option tag; changed to single tag.
    { id: "reserve-backlash", title: "Reserve backlash", summary: "Employers and local officials start pushing back publicly against how the reserve burden has been managed, and the complaints are landing in the press.", minTurn: 2, maxTurn: 8, triggerTags: ["tempo-spike"], requiredFlags: [], excludedFlags: [], setsFlags: ["reserve_backlash"], clearsFlags: [], stateDelta: { forceGeneration: { reserveStrain: 7, personnelShortfalls: 3 }, domestic: { cabinetCover: -4, mediaHeat: 4, publicPatience: -3 } }, constraintShifts: [] },
    { id: "partner-relief", title: "Partner relief", summary: "A partner quietly expands its participation after being reassured through the right channel, without any public announcement.", minTurn: 2, maxTurn: 8, triggerTags: ["alliance", "quiet"], requiredFlags: [], excludedFlags: [], setsFlags: ["partner_relief"], clearsFlags: [], stateDelta: { alliance: { reassurance: 5, politicalAlignment: 4, partnerParticipation: 2 } }, constraintShifts: [] },
    { id: "scrutiny-cycle", title: "Scrutiny cycle", summary: "Cabinet committees start asking pointed questions about whether modernization promises are outrunning what the force can actually field today.", minTurn: 3, maxTurn: 9, triggerTags: ["modernization", "public-commitment"], requiredFlags: [], excludedFlags: [], setsFlags: ["scrutiny_cycle"], clearsFlags: [], stateDelta: { domestic: { committeeTolerance: -5, mediaHeat: 5, cabinetCover: -3 } }, constraintShifts: [] },
    { id: "deception-slip", title: "Deception slip", summary: "A brief the headquarters treated as solid turns out to have been built on indicators the adversary had quietly manipulated.", minTurn: 3, maxTurn: 10, triggerTags: ["escalatory"], requiredFlags: [], excludedFlags: ["counter_deception_mature"], setsFlags: ["deception_exposed"], clearsFlags: [], stateDelta: { intelligence: { confidence: -8, deceptionPressure: 7, warningReliability: -5 }, escalation: { warningTime: -6, incidentLadder: 3 } }, constraintShifts: [] },
    { id: "training-payoff", title: "Training payoff", summary: "Repeated drills finally start showing up as cleaner execution in the field, not just better slides in the briefing room.", minTurn: 4, maxTurn: 10, triggerTags: ["training", "standardization"], requiredFlags: [], excludedFlags: [], setsFlags: ["training_payoff"], clearsFlags: [], stateDelta: { forceGeneration: { deployableUnits: 0.8, trainingThroughput: 3, reserveStrain: -2 }, domestic: { publicPatience: 2 } }, constraintShifts: [] },
    // ── Alliance arc ──────────────────────────────────────────────────────────
    { id: "partner-defection", title: "Partner defection", summary: "A partner quietly scales back its participation after repeated concerns from earlier months were never properly addressed.", minTurn: 3, maxTurn: 9, triggerTags: ["hollow"], requiredFlags: [], excludedFlags: ["partner_relief"], setsFlags: ["partner_defected"], clearsFlags: [], stateDelta: { alliance: { reassurance: -6, politicalAlignment: -5, partnerParticipation: -3 }, domestic: { cabinetCover: -2 } }, constraintShifts: [] },
    { id: "allied-intel-break", title: "Allied intelligence break", summary: "A partner shares a genuine early-warning collection break, the payoff of sustained quiet cooperation rather than a single ask.", minTurn: 4, maxTurn: 10, triggerTags: ["alliance", "quiet"], requiredFlags: ["partner_relief"], excludedFlags: [], setsFlags: ["allied_intel_break"], clearsFlags: [], stateDelta: { intelligence: { confidence: 6, warningReliability: 5, collectionCoverage: 3 }, escalation: { warningTime: 5 } }, constraintShifts: [] },
    { id: "coalition-fracture", title: "Coalition fracture", summary: "Partners publicly break with the headquarters' posture, and the fracture damages alliance cohesion and domestic standing at the same time.", minTurn: 5, maxTurn: 11, triggerTags: ["escalatory"], requiredFlags: ["partner_defected"], excludedFlags: [], setsFlags: ["coalition_fractured"], clearsFlags: [], stateDelta: { alliance: { politicalAlignment: -7, partnerParticipation: -4, partnerPublicSupport: -5 }, domestic: { cabinetCover: -3, mediaHeat: 4 } }, constraintShifts: [] },
    // ── Intelligence arc ──────────────────────────────────────────────────────
    { id: "warning-vindicated", title: "Warning vindicated", summary: "The warning net earns its keep: it delivers early notice of adversary repositioning, validating the collection investment that built it.", minTurn: 4, maxTurn: 9, triggerTags: ["warning", "collection"], requiredFlags: [], excludedFlags: ["deception_exposed"], setsFlags: ["warning_vindicated"], clearsFlags: [], stateDelta: { intelligence: { confidence: 5, warningReliability: 6 }, escalation: { warningTime: 7, crisisSensitivity: -2 } }, constraintShifts: [] },
    { id: "collection-gap", title: "Collection gap exposed", summary: "Media reports expose a real gap in collection coverage, and the timing — a politically sensitive moment — makes it worse.", minTurn: 3, maxTurn: 8, triggerTags: ["committee-heavy"], requiredFlags: [], excludedFlags: [], setsFlags: ["collection_gap"], clearsFlags: [], stateDelta: { intelligence: { confidence: -5, warningReliability: -4 }, domestic: { cabinetCover: -3, mediaHeat: 4 } }, constraintShifts: [] },
    { id: "adversary-deception-surge", title: "Adversary deception surge", summary: "The adversary redoubles deliberate deception efforts after detecting Allied industrial collection activity aimed at its supply chains.", minTurn: 4, maxTurn: 10, triggerTags: ["industrial-watch"], requiredFlags: [], excludedFlags: ["counter_deception_mature"], setsFlags: ["deception_surge"], clearsFlags: [], stateDelta: { intelligence: { deceptionPressure: 8, confidence: -4 }, escalation: { warningTime: -3 } }, constraintShifts: [{ constraintId: "electronics-chain", delta: 5 }] },
    // ── Domestic arc ──────────────────────────────────────────────────────────
    { id: "cabinet-crisis", title: "Cabinet crisis", summary: "A domestic confidence vote forces the headquarters to show visible restraint for a while, narrowing which operational options are politically available.", minTurn: 5, maxTurn: 11, triggerTags: ["hollow"], requiredFlags: ["scrutiny_cycle"], excludedFlags: [], setsFlags: ["cabinet_crisis"], clearsFlags: [], stateDelta: { domestic: { cabinetCover: -8, committeeTolerance: -5, mediaHeat: 6 }, resources: { politicalCapital: -4 } }, constraintShifts: [] },
    { id: "media-endorsement", title: "Media endorsement", summary: "A favorable editorial cycle gives the headquarters real political breathing room to make difficult recovery decisions without immediate backlash.", minTurn: 3, maxTurn: 9, triggerTags: ["quiet", "recovery"], requiredFlags: [], excludedFlags: ["reserve_backlash"], setsFlags: ["media_endorsement"], clearsFlags: [], stateDelta: { domestic: { publicPatience: 5, cabinetCover: 3, mediaHeat: -3 } }, constraintShifts: [] },
    { id: "budget-squeeze", title: "Budget squeeze", summary: "A mid-year budget revision tightens the authority available for both capability programs and sustainment spending.", minTurn: 2, maxTurn: 7, triggerTags: ["committee-heavy"], requiredFlags: [], excludedFlags: [], setsFlags: ["budget_squeezed"], clearsFlags: [], stateDelta: { resources: { budgetAuthority: -6 }, domestic: { committeeTolerance: -3 } }, constraintShifts: [] },
    { id: "public-patience-recovery", title: "Public patience recovery", summary: "Steady, undramatic operational discipline gradually rebuilds public tolerance for the headquarters staying active month after month.", minTurn: 4, maxTurn: 10, triggerTags: ["slow-burn"], requiredFlags: [], excludedFlags: ["reserve_backlash"], setsFlags: ["patience_recovered"], clearsFlags: [], stateDelta: { domestic: { publicPatience: 6, committeeTolerance: 4, mediaHeat: -2 } }, constraintShifts: [] },
    // ── Sustainment arc ───────────────────────────────────────────────────────
    { id: "electronics-shortage", title: "Electronics shortage", summary: "A global supply chain tightens electronics availability, and both precision guidance systems and depot tooling depend on that same supply.", minTurn: 2, maxTurn: 7, triggerTags: ["fires", "modernization"], requiredFlags: [], excludedFlags: [], setsFlags: ["electronics_disrupted"], clearsFlags: [], stateDelta: { sustainment: { depotBacklog: 5, munitionsSufficiency: -4 } }, constraintShifts: [{ constraintId: "electronics-chain", delta: 14 }] },
    { id: "depot-breakthrough", title: "Depot breakthrough", summary: "A logistics process improvement pays off faster than expected, cutting backlog and freeing real throughput for readiness.", minTurn: 4, maxTurn: 10, triggerTags: ["repair", "standardization"], requiredFlags: [], excludedFlags: ["shipping_jam"], setsFlags: ["depot_breakthrough"], clearsFlags: [], stateDelta: { sustainment: { depotBacklog: -10, fuelSufficiency: 4, liftAvailability: 3 } }, constraintShifts: [] },
    { id: "fuel-route-disruption", title: "Fuel route disruption", summary: "A dispute at a commercial hub cuts off a key fuel routing option, stretching movement margins across the theater.", minTurn: 3, maxTurn: 8, triggerTags: ["lift"], requiredFlags: [], excludedFlags: [], setsFlags: ["fuel_disrupted"], clearsFlags: [], stateDelta: { sustainment: { fuelSufficiency: -7, liftAvailability: -4 } }, constraintShifts: [{ constraintId: "shipping-market", delta: 8 }] },
    { id: "munitions-windfall", title: "Munitions windfall", summary: "Favorable market conditions let the munitions stockpile build faster than expected, easing pressure on propellant supply.", minTurn: 3, maxTurn: 9, triggerTags: ["munitions"], requiredFlags: [], excludedFlags: ["shipping_jam"], setsFlags: ["munitions_windfall"], clearsFlags: [], stateDelta: { sustainment: { munitionsSufficiency: 8 } }, constraintShifts: [{ constraintId: "propellant-market", delta: -8 }] },
    // ── Personnel arc ─────────────────────────────────────────────────────────
    { id: "retention-crisis", title: "Retention crisis", summary: "Experienced NCOs start leaving in a wave, accelerated by sustained reserve strain and a run of choices that looked active but were not.", minTurn: 4, maxTurn: 10, triggerTags: ["tempo-spike", "hollow"], requiredFlags: ["reserve_backlash"], excludedFlags: [], setsFlags: ["retention_crisis"], clearsFlags: [], stateDelta: { forceGeneration: { reserveStrain: 8, personnelShortfalls: 6, deployableUnits: -0.5 }, domestic: { publicPatience: -3 } }, constraintShifts: [] },
    { id: "experience-dividend", title: "Experience dividend", summary: "Sustained, disciplined training finally produces a measurable dividend: sharper leaders and faster execution across the force.", minTurn: 5, maxTurn: 11, triggerTags: ["training", "recovery"], requiredFlags: ["training_payoff"], excludedFlags: [], setsFlags: ["experience_dividend"], clearsFlags: [], stateDelta: { forceGeneration: { deployableUnits: 0.6, trainingThroughput: 5, reserveStrain: -3 }, domestic: { publicPatience: 2 } }, constraintShifts: [] },
    // ── Escalation arc ────────────────────────────────────────────────────────
    { id: "adversary-probe-surge", title: "Adversary probe surge", summary: "The adversary sharply increases probe tempo, reading recent visible Allied activity as provocation rather than routine posture.", minTurn: 3, maxTurn: 9, triggerTags: ["escalatory"], requiredFlags: [], excludedFlags: ["probe_surge"], setsFlags: ["probe_surge"], clearsFlags: [], stateDelta: { escalation: { probeTempo: 8, incidentLadder: 5, warningTime: -4 }, domestic: { cabinetCover: -3, mediaHeat: 4 } }, constraintShifts: [] },
    { id: "crisis-deescalation", title: "Crisis deescalation", summary: "Careful back-channel diplomacy defuses a recent flashpoint quietly, before it has a chance to escalate any further.", minTurn: 4, maxTurn: 11, triggerTags: ["quiet", "alliance"], requiredFlags: [], excludedFlags: ["probe_surge"], setsFlags: ["crisis_deescalated"], clearsFlags: [], stateDelta: { escalation: { probeTempo: -5, incidentLadder: -4, crisisSensitivity: -3 }, alliance: { reassurance: 3 } }, constraintShifts: [] },
    { id: "threshold-incident", title: "Threshold incident", summary: "An adversary probe finally crosses a threshold everyone recognized as real, forcing a public response the headquarters can no longer avoid.", minTurn: 6, maxTurn: 11, triggerTags: ["escalatory"], requiredFlags: ["probe_surge", "deception_exposed"], excludedFlags: [], setsFlags: ["threshold_breached"], clearsFlags: [], stateDelta: { escalation: { crisisSensitivity: 9, incidentLadder: 7, warningTime: -6 }, domestic: { cabinetCover: -5, mediaHeat: 7 } }, constraintShifts: [] },
    { id: "deterrence-signal", title: "Deterrence signal", summary: "A combined-arms demonstration lands exactly as intended: it communicates real capability without tipping into escalation.", minTurn: 4, maxTurn: 10, triggerTags: ["deterrence", "exercise"], requiredFlags: [], excludedFlags: ["probe_surge"], setsFlags: ["deterrence_signaled"], clearsFlags: [], stateDelta: { escalation: { incidentLadder: -4, probeTempo: -2 }, alliance: { reassurance: 3, politicalAlignment: 2 } }, constraintShifts: [] },
    // ── Alliance arc (continued) ───────────────────────────────────────────────
    { id: "airlift-extension", title: "Airlift extension agreement", summary: "Sustained alliance investment finally pays off in a partner airlift extension, opening up better movement options across the theater.", minTurn: 4, maxTurn: 10, triggerTags: ["alliance", "program"], requiredFlags: ["partner_relief"], excludedFlags: ["coalition_fractured"], setsFlags: ["airlift_extended"], clearsFlags: [], stateDelta: { sustainment: { liftAvailability: 6 }, alliance: { partnerParticipation: 2, reassurance: 3 } }, constraintShifts: [{ constraintId: "shipping-market", delta: -6 }] },
    { id: "alliance-signaling-backfire", title: "Alliance signaling backfire", summary: "Public deterrence commitments draw exactly the adversary attention they were meant to avoid, and probe tempo rises in response.", minTurn: 3, maxTurn: 9, triggerTags: ["public-commitment", "deterrence"], requiredFlags: [], excludedFlags: ["deterrence_signaled"], setsFlags: ["signaling_backfire"], clearsFlags: [], stateDelta: { escalation: { probeTempo: 5, incidentLadder: 3, crisisSensitivity: 2 }, domestic: { mediaHeat: 3 } }, constraintShifts: [] },
    // ── Intelligence arc (continued) ──────────────────────────────────────────
    { id: "industrial-espionage-probe", title: "Industrial espionage probe", summary: "An adversary intelligence operation attempts to penetrate defense industry supply chains after Allied collection activity drew unwanted attention.", minTurn: 3, maxTurn: 9, triggerTags: ["industrial-watch", "collection"], requiredFlags: [], excludedFlags: ["counter_deception_mature"], setsFlags: ["industrial_probe"], clearsFlags: [], stateDelta: { intelligence: { deceptionPressure: 6, confidence: -3 }, sustainment: { depotBacklog: 3 } }, constraintShifts: [{ constraintId: "electronics-chain", delta: 6 }] },
    { id: "fires-integration-window", title: "Fires integration window", summary: "A realistic exercise window opens for fires integration, and the simulation investment pays off in measurable operational learning.", minTurn: 3, maxTurn: 9, triggerTags: ["fires", "simulation"], requiredFlags: [], excludedFlags: ["electronics_disrupted"], setsFlags: ["fires_demonstrated"], clearsFlags: [], stateDelta: { forceGeneration: { trainingThroughput: 4 }, escalation: { incidentLadder: -3 }, alliance: { reassurance: 2 } }, constraintShifts: [] },
    // ── Personnel arc (continued) ─────────────────────────────────────────────
    { id: "reserve-recall-success", title: "Reserve recall success", summary: "An unplanned partial mobilisation completes well ahead of schedule, the direct payoff of disciplined recovery investment in earlier months.", minTurn: 4, maxTurn: 10, triggerTags: ["recovery", "retention"], requiredFlags: [], excludedFlags: ["reserve_backlash", "retention_crisis"], setsFlags: ["reserve_reconstituted"], clearsFlags: [], stateDelta: { forceGeneration: { deployableUnits: 0.7, reserveStrain: -4, personnelShortfalls: -3 } }, constraintShifts: [] },
    // ── Domestic arc (continued) ──────────────────────────────────────────────
    { id: "media-scrutiny-gap", title: "Media scrutiny gap", summary: "Press coverage exposes the gap between public deterrence rhetoric and the readiness actually available, forcing a quiet correction behind the scenes.", minTurn: 4, maxTurn: 10, triggerTags: ["deterrence", "public-commitment"], requiredFlags: ["scrutiny_cycle"], excludedFlags: ["cabinet_crisis"], setsFlags: ["media_scrutiny"], clearsFlags: [], stateDelta: { domestic: { cabinetCover: -4, mediaHeat: 6, publicPatience: -2 }, alliance: { politicalAlignment: -2 } }, constraintShifts: [] },
    {
      id: "doctrine-coalition-caveat-exposure", title: "Partner caveats become an exposure",
      summary: "A visible commitment reaches the staff faster than policy, legal, media, and partner caveats can be reconciled; partners hedge and the cabinet absorbs the contradiction.",
      minTurn: 2, maxTurn: 11, triggerTags: ["public-commitment"], requiredFlags: [], excludedFlags: [],
      setsFlags: ["doctrine_coalition_caveat_exposed"], clearsFlags: [],
      stateDelta: { alliance: { politicalAlignment: -4, partnerPublicSupport: -3 }, domestic: { cabinetCover: -3, mediaHeat: 4 } }, constraintShifts: [],
      doctrineTrigger: { sourceGeneId: "coalition-native-staff", sourceGeneLabel: "Coalition-Native Staff", patternId: "deception", vulnerability: "More policy, legal, media, and partner caveat constraints on every commitment", evidenceRefs: ["CELERY/doctrine-proof-register#NATO AJP-3 Staff Directorate Baseline", "CELERY/doctrine-proof-register#UK PJHQ Staff Responsibilities"], conditions: [{ variable: "signatureControl", comparison: "lte", threshold: 35 }], sustainedTurns: 2 },
      causalContext: { betLabel: "Repeated visible coalition commitments before caveats were reconciled", maturedRiskLabel: "Signature control stayed at or below 35 for two commitment turns", staffFunctionRefs: ["S2", "S5"] },
    },
    {
      id: "doctrine-adaptive-cell-sprawl", title: "Competing cells neglect the line",
      summary: "Temporary cells proliferate across the headquarters until no lane owns the handoff; training and readiness pay for a main effort that never became clear.",
      minTurn: 2, maxTurn: 11, triggerTags: ["program", "modernization"], requiredFlags: [], excludedFlags: [],
      setsFlags: ["doctrine_adaptive_cells_sprawled"], clearsFlags: [],
      stateDelta: { forceGeneration: { trainingThroughput: -4 }, resources: { readiness: -3 } }, constraintShifts: [],
      doctrineTrigger: { sourceGeneId: "adaptive-cell-staff", sourceGeneLabel: "Adaptive Cell Staff", patternId: "main-effort", vulnerability: "Coordination cost rises when too many temporary cells compete for attention", evidenceRefs: ["CELERY/doctrine-proof-register#Netherlands No Pure Staff Structure", "CELERY/doctrine-proof-register#Netherlands Chief Of Staff Role"], conditions: [{ variable: "mainEffortFocus", comparison: "lte", threshold: 30 }], sustainedTurns: 2 },
      causalContext: { betLabel: "Repeated multi-lane modernization through temporary cross-functional cells", maturedRiskLabel: "Main-effort focus stayed at or below 30 for two cell-building turns", staffFunctionRefs: ["S1", "S3", "S5"] },
    },
    {
      id: "doctrine-sustainment-patience-gap", title: "The patience gap becomes policy blowback",
      summary: "The headquarters keeps waiting for a fully supportable posture while the public and cabinet demand visible action; political room contracts around an otherwise sound sustainment plan.",
      minTurn: 3, maxTurn: 11, triggerTags: ["slow-burn"], requiredFlags: [], excludedFlags: [],
      setsFlags: ["doctrine_sustainment_patience_blowback"], clearsFlags: [],
      // Round-2 calibration (F3b): the counterweight must be OBSERVED in the
      // score/win/objective formulas, which read deployableUnits, politicalAlignment,
      // cabinetCover, incidentLadder, reserveStrain. Political blowback from the
      // patience gap: partner alignment erodes (politicalAlignment -18), cabinet
      // cover contracts (cabinetCover -10), the public pressure forces visible
      // demonstrations that burn the reserve base and raise escalation risk
      // (reserveStrain +16, incidentLadder +28 — enough to flip the escalation
      // objective in the weakest replicates), and readiness-building loses
      // momentum while the HQ defends its posture (deployableUnits -1.5). Flavor
      // lanes trimmed (publicPatience -8, mediaHeat +5, politicalCapital -4).
      // Measured (N=240): sustainment-delay drops from 100/100% to ~95/82% —
      // observed cost below the score ceiling, no dominance, control cohort
      // stays viable (no deployableUnits collapse).
      stateDelta: { alliance: { politicalAlignment: -18 }, domestic: { cabinetCover: -10, publicPatience: -8, mediaHeat: 5 }, resources: { politicalCapital: -4 }, forceGeneration: { reserveStrain: 16, deployableUnits: -1.5 }, escalation: { incidentLadder: 28 } }, constraintShifts: [],
      doctrineTrigger: { sourceGeneId: "sustainment-first-operational-reach", sourceGeneLabel: "Sustainment-First Operational Reach", patternId: "tempo", vulnerability: "Slower visible posture; political frustration when the public wants immediate action", evidenceRefs: ["CELERY/doctrine-proof-register#US Army ADP 4-0 Sustainment", "CELERY/doctrine-proof-register#Sustainment Warfighting Function Elements"], conditions: [{ variable: "relativeTempo", comparison: "lte", threshold: 30 }], sustainedTurns: 3 },
      causalContext: { betLabel: "Repeated slow-burn sequencing until supportability was earned", maturedRiskLabel: "Relative tempo stayed at or below 30 for three slow-burn turns", staffFunctionRefs: ["S4", "S5"] },
    },
  ],
  initialState: {
    turn: 1,
    maxTurns: 12,
    seed: 20260330,
    campaignStatus: "active",
    campaignScore: 0,
    campaignOutcome: null,
    // Doctrine baseline biased away from neutral by the scenario's doctrine profile.
    // Computed once at definition time via applyDoctrineGenes; the serialized state
    // carries this opening position, so replay never re-applies genes (issue #56).
    doctrineMechanics: applyDoctrineGenes(
      defaultDoctrineMechanicsState,
      resolveDoctrineGenes(doctrineProfile),
    ),
    doctrineMaturity: {},
    strategic: {
      forceGeneration: { deployableUnits: 5.2, reserveStrain: 46, trainingThroughput: 51, personnelShortfalls: 41 },
      intelligence: { collectionCoverage: 54, confidence: 52, warningReliability: 49, deceptionPressure: 43 },
      sustainment: { depotBacklog: 58, munitionsSufficiency: 49, fuelSufficiency: 53, liftAvailability: 47 },
      alliance: { reassurance: 48, politicalAlignment: 50, partnerParticipation: 44, partnerPublicSupport: 46 },
      domestic: { cabinetCover: 51, committeeTolerance: 54, mediaHeat: 39, publicPatience: 56 },
      escalation: { probeTempo: 43, warningTime: 38, incidentLadder: 34, crisisSensitivity: 48 },
    },
    staffMechanics: {
      s1: { recoveryDebt: 42, reservePredictability: 51 },
      s2: { externalEstimateConfidence: 46, visibility: "ESTIMATED", deceptionRisk: 44 },
      s3: { visiblePosture: 48, executablePosture: 50 },
      s4: { stockpileDepth: 47, liftBurn: 41 },
      s5: { strategicCoherence: 52, doctrineAlignment: 50 },
    },
    resources: {
      budgetAuthority: 61,
      readiness: 53,
      politicalCapital: 56,
      allianceCohesion: 50,
      publicLegitimacy: 52,
      escalationPressure: 43,
    },
    forceGeneration: {
      deployableUnits: 5.2,
      reserveStrain: 46,
      trainingThroughput: 51,
      personnelShortfalls: 41,
    },
    intel: {
      collectionCoverage: 54,
      confidence: 52,
      warningReliability: 49,
      deceptionPressure: 43,
    },
    sustainment: {
      depotBacklog: 58,
      munitionsSufficiency: 49,
      fuelSufficiency: 53,
      liftAvailability: 47,
    },
    alliance: {
      reassurance: 48,
      politicalAlignment: 50,
      partnerParticipation: 44,
      partnerPublicSupport: 46,
    },
    domestic: {
      cabinetCover: 51,
      committeeTolerance: 54,
      mediaHeat: 39,
      publicPatience: 56,
    },
    escalation: {
      probeTempo: 43,
      warningTime: 38,
      incidentLadder: 34,
      crisisSensitivity: 48,
    },
    capabilityPrograms: [
      { id: "fires-network", phase: "concept", progress: 26, blockers: ["training absorption", "munitions depth"] },
      { id: "counter-deception-grid", phase: "funded", progress: 22, blockers: ["analyst bandwidth"] },
      { id: "sustainment-ledger", phase: "concept", progress: 34, blockers: ["trusted electronics", "depot burden"] },
      { id: "reserve-rebuild", phase: "funded", progress: 28, blockers: ["public patience", "training seats"] },
    ],
    externalConstraints: [
      { id: "shipping-market", severity: 56, trend: "steady" },
      { id: "electronics-chain", severity: 52, trend: "steady" },
      { id: "propellant-market", severity: 49, trend: "steady" },
    ],
    chiefTrust: { warden: 58, halden: 59, briggs: 57, okafor: 60, sato: 55, navarro: 58 },
    advisorTrust: {},
    activeEventIds: [],
    eventHistory: [],
    eventFlags: {},
    internalTech: [
      { id: "fires-network",          level: 0, progress: 45 },
      { id: "counter-deception-grid", level: 0, progress: 28 },
      { id: "sustainment-ledger",     level: 0, progress: 52 },
      { id: "reserve-rebuild",        level: 0, progress: 28 },
    ],
    externalTech: [
      { id: "shipping-market",   level: 1, progress: 44, estimate: { estimatedLevel: 1, confidence: 48, visibility: "ESTIMATED", lastVerifiedTurn: null } },
      { id: "electronics-chain", level: 1, progress: 48, estimate: { estimatedLevel: 1, confidence: 52, visibility: "ESTIMATED", lastVerifiedTurn: null } },
      { id: "propellant-market", level: 1, progress: 51, estimate: { estimatedLevel: 1, confidence: 45, visibility: "ESTIMATED", lastVerifiedTurn: null } },
    ],
    briefing: {
      theater: "Northern Frontier",
      monthLabel: "Month 1",
      situationSummary: "Adversary probes along the northern frontage have been climbing for weeks, testing how the headquarters reads and responds. The reserve base is already feeling the strain of the current tempo, and sustainment — depots, fuel, lift, munitions — is not yet strong enough to carry every attractive course of action you might want to take this month. Every option in front of you this month has to be weighed against what the force and the political room can actually absorb.",
      riskPosture: "The force can absorb one sharp move this month, not three.",
      commandersIntent: "Recover credible readiness without spending political cover faster than the theater can justify. Deterrence has to be real, not just visible — a posture the adversary would actually have to respect — and it has to be built at a pace the force, the reserve base, and the cabinet can all sustain past this month.",
      operationalPicture: "Adversary probes are steady, the force is still rebuilding, and sustainment remains the binding constraint on how much the room can ask for at once.",
      decisionFocus: "Protect readiness without exhausting political cover or overcommitting support capacity.",
      openQuestions: ["Is the warning picture clean enough to support a more visible posture?", "Which sustainment weakness becomes the first real bottleneck if tempo rises?", "Can allies be reassured without provoking a domestic backlash?"],
      campaignObjectives: [
        { id: "readiness", label: "Reach 7 or more deployable brigades", metric: "deployableUnits", target: 7, direction: "gte", note: "A posture only deters if the force behind it can actually deploy — looking active is not the same as being usable." },
        { id: "alliance", label: "Keep alliance political alignment at 56 or more", metric: "politicalAlignment", target: 56, direction: "gte", note: "Partners are watching for consistency. If reassurance drifts while you are still rebuilding, the coalition starts hedging on its own." },
        { id: "politics", label: "Keep cabinet cover at 32 or more", metric: "cabinetCover", target: 32, direction: "gte", note: "Cabinet cover is what lets you spend political capital on hard choices. Once it collapses, the theater plan stops being implementable, whatever the force can still do." },
        { id: "escalation", label: "Keep the incident ladder at 58 or lower", metric: "incidentLadder", target: 58, direction: "lte", note: "Every visible move carries some escalation risk. The force has to rebuild a credible posture without stumbling into a crisis spiral it did not choose." },
      ],
      budgetHeadline: "1.6B USD",
      readinessHeadline: "5 brigades deployable",
      geopoliticalSummary: "Pressure is rising, but the picture still favors a controlled recovery if the headquarters keeps its line of effort tight.",
    },
  },
  // Doctrine 3 (issue #57): the composed advice/burden lens, computed once here from the
  // profile's genes (mirroring the initialState.doctrineMechanics pattern above). The
  // engine consumes only this lens; replay re-runs resolveTurn against the scenario, so
  // the lens is always in scope. lint:content enforces the invariant that this equals
  // composeDoctrineLens(resolveDoctrineGenes(doctrineProfile)).
  doctrineLens: composeDoctrineLens(resolveDoctrineGenes(doctrineProfile)),
  doctrineProfile,
  // Doctrine 5 (issue #59): resolved optional staff module definitions in profile
  // order, computed once at scenario-definition time like the doctrine lens. The
  // engine consumes only these serialized definitions (never the content registry).
  staffModules: resolveStaffModules(doctrineProfile),
});
