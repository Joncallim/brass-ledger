import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { soloScenario, spriteVisualLanguage, staffModuleDefinitions } from "@brass-ledger/content";
import { resolveActiveStaffModules } from "@brass-ledger/sim";
import { buildAdvisorPortraitDataUri, buildChiefSpriteSpec, createInitialGameSession, relationshipLabel, type EventDefinition, type ScenarioSummary, type StaffModuleReadout } from "@brass-ledger/shared";
import type { PreviewPayload } from "../src/lib/types";
import { PreCommitScreen } from "../src/screens/PreCommitScreen/index.tsx";
import { EventList } from "../src/screens/AfterActionScreen/EventList.tsx";
import { ChiefsPaperScreen } from "../src/screens/ChiefsPaperScreen/index.tsx";
import { ChiefPortrait } from "../src/components/ChiefPortrait";
import { StaffModuleConsequences } from "../src/components/StaffModuleConsequences";
import { MemosScreen } from "../src/screens/MemosScreen/index.tsx";

const doctrineEvent = soloScenario.events.find((event) => event.doctrineTrigger)!;
const ordinaryEvent = soloScenario.events.find((event) => !event.doctrineTrigger)!;

function previewWith(predictedEvents: EventDefinition[]): PreviewPayload {
  return {
    decisionPreviews: [],
    acceptedRiskCandidates: [],
    predictedEvents,
    chiefCoalitions: [],
    projectedResult: {} as PreviewPayload["projectedResult"],
  };
}

function renderPrecommit(preview: PreviewPayload | null) {
  return renderToStaticMarkup(
    <PreCommitScreen
      preview={preview}
      selections={[]}
      acceptedRiskChoices={{}}
      staffNegotiations={[]}
      negotiationCandidates={[]}
      turnNumber={1}
      busy={false}
      error={null}
      onAcceptRisk={() => {}}
      onNegotiation={() => {}}
      onCommit={() => {}}
      onBack={() => {}}
    />,
  );
}

test("precommit renders only doctrine events in the doctrine-risk block", () => {
  const withBoth = renderPrecommit(previewWith([doctrineEvent, ordinaryEvent]));
  assert.match(withBoth, /Doctrine risks that may mature/);
  assert.ok(withBoth.includes(doctrineEvent.title), "doctrine event title shown in the doctrine-risk block");
  assert.ok(!withBoth.includes(ordinaryEvent.title), "ordinary shock events are not revealed in the doctrine-risk block");

  const ordinaryOnly = renderPrecommit(previewWith([ordinaryEvent]));
  assert.ok(!ordinaryOnly.includes("Doctrine risks that may mature"), "no doctrine-risk block without doctrine events");
});

test("EventList labels doctrine events as Doctrine consequence and stays neutral when empty", () => {
  const withDoctrine = renderToStaticMarkup(<EventList events={[doctrineEvent]} />);
  assert.match(withDoctrine, /Doctrine consequence: /);
  assert.ok(withDoctrine.includes(doctrineEvent.title));

  const withOrdinary = renderToStaticMarkup(<EventList events={[ordinaryEvent]} />);
  assert.ok(!withOrdinary.includes("Doctrine consequence"), "ordinary events keep the plain Event label");
  assert.ok(withOrdinary.includes(ordinaryEvent.title));

  const empty = renderToStaticMarkup(<EventList events={[]} />);
  assert.match(empty, /No events matured this month\./);
  assert.ok(!empty.includes("outside your control"), "empty copy is neutral, not 'outside your control'");
});

test("the scenario summary fixture carries doctrineLens", () => {
  assert.ok(soloScenario.doctrineLens);
  assert.ok(soloScenario.doctrineLens.burdenBias);
});

/** A REAL resolver-produced readout: J6 resolved against the shipped definitions
 * with no selected tags. This is what the server actually projects, so the render
 * contract is tested against production data, not a synthetic label. */
function realJ6Readout(): StaffModuleReadout {
  const definition = staffModuleDefinitions.find((entry) => entry.id === "J6")!;
  return resolveActiveStaffModules({
    definitions: [definition],
    selectedTags: new Set<string>(),
    staffMechanics: structuredClone(soloScenario.initialState.staffMechanics),
    strategic: structuredClone(soloScenario.initialState.strategic),
    resources: structuredClone(soloScenario.initialState.resources),
  }).readouts[0]!;
}

function renderMemos(preview: PreviewPayload | null, staffModules: ScenarioSummary["staffModules"] = soloScenario.staffModules) {
  return renderToStaticMarkup(
    <MemosScreen
      memos={[]}
      selections={[]}
      staffNegotiations={[]}
      staffModules={staffModules}
      preview={preview}
      previewLoading={false}
      previewError={null}
      canProceed={false}
      onSelect={() => {}}
      onProceed={() => {}}
      onBack={() => {}}
    />,
  );
}

test("optional module component is empty-safe and renders REAL resolver readouts without duplicating the id", () => {
  const empty = renderToStaticMarkup(<StaffModuleConsequences modules={[]} />);
  assert.equal(empty, "", "empty module arrays do not create a heading");

  const readout = realJ6Readout();
  const html = renderToStaticMarkup(<StaffModuleConsequences modules={[readout]} />);
  // Canonical labels already begin with the id ("J6 — Communications and
  // information systems"): rendering id + label produced "J6 — J6 — …". The
  // canonical label must appear EXACTLY once — includes() would still pass if it
  // were duplicated across separate elements (closing pass 2 P3).
  assert.equal(html.split(readout.label).length - 1, 1, "the canonical label appears exactly once");
  assert.ok(!html.includes("J6 — J6"), "the id prefix must not be duplicated");
  assert.ok(html.indexOf("Integrated communications reduce contested-system pressure.") < html.indexOf("Connected systems increase false-precision and deception exposure."), "benefits render before pressures");
  assert.ok(html.indexOf("Connected systems increase false-precision and deception exposure.") < html.indexOf("The information-system cell consumes budget authority."), "pressure rows keep declaration order");
  assert.match(html, /Optional staff cells/);
});

test("memos screen renders static staff module definitions before any preview, labeled as awaiting a selection", () => {
  const html = renderMemos(null);
  assert.ok(html.includes("J6 — Communications and information systems"), "static definition label is shown");
  assert.ok(html.includes("STRATCOM — Strategic communications"), "every configured module is listed");
  assert.match(html, /Awaiting a selection — effects and coordination load appear once you choose\./);
});

test("memos screen prefers projected readouts once a preview exists, and drops the awaiting label", () => {
  const readout = realJ6Readout();
  const preview = {
    decisionPreviews: [],
    acceptedRiskCandidates: [],
    predictedEvents: [],
    chiefCoalitions: [],
    projectedResult: { staffModules: [readout], staffFunctions: [] },
  } as unknown as PreviewPayload;
  const html = renderMemos(preview);
  assert.ok(html.includes("Integrated communications reduce contested-system pressure."), "projected readout summary is shown");
  assert.ok(!html.includes("Awaiting a selection"), "static awaiting label is gone once projections exist");
});

test("chiefs paper derives portrait props from chief id, session, and position evidence", () => {
  const session = createInitialGameSession(soloScenario, "web-sprite-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const positions = soloScenario.chiefs.slice(0, 2).map((chief) => ({
    chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
    memoId: "missing", optionId: "missing", institutionalReason: "reason", agendaMemoryNote: "", adviceStyleNote: "",
    staffReadoutEvidence: { staffFunctionLabel: "People", metricLabel: "trust", metricStatus: "healthy", metricValue: 80, burdenLevel: "light", burdenPoints: 0 },
  })) as any;
  const html = renderToStaticMarkup(<ChiefsPaperScreen
    chiefPositions={[positions[1], positions[0]]}
    chiefCoalitions={[]}
    advisorRoster={[...session.advisorRoster].reverse()}
    session={session}
    scenario={scenario}
    memos={[]}
    conversationBusy={false}
    conversationError={null}
    activeConversation={null}
    onOpenConversation={() => {}}
    onRespond={() => {}}
    onProceed={() => {}}
    onBack={() => {}}
  />);
  assert.match(html, /alt="[^\"]+ — [^\"]+"/);
  assert.match(html, /w-12 h-14/);
  assert.equal((html.match(/data:image\/svg\+xml/g) ?? []).length, 2);
});

test("compact chiefs paper keeps changed trust and staff evidence expanded", () => {
  const session = createInitialGameSession(soloScenario, "web-chief-pacing-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const chief = soloScenario.chiefs[0]!;
  const memo = soloScenario.memoTemplates[0]!;
  const option = memo.options[0]!;
  const priorPosition = {
    chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
    memoId: memo.id, optionId: option.id, institutionalReason: "Same course.", requiredCondition: "",
    confidenceNote: "", consequenceIfIgnored: "", agendaMemoryNote: "Prior note.", adviceStyleNote: "Prior voice.",
    staffReadoutEvidence: { staffFunctionLabel: "Operations", metricLabel: "Tempo", metricStatus: "healthy", metricValue: 70, burdenLevel: "light", burdenPoints: 1 },
  } as any;
  const currentPosition = {
    ...priorPosition,
    agendaMemoryNote: "New memory from last month.",
    staffReadoutEvidence: { ...priorPosition.staffReadoutEvidence, metricValue: 42, burdenLevel: "strained", burdenPoints: 4 },
  } as any;
  session.history = [{ chiefPositions: [priorPosition], nextState: { chiefTrust: { [chief.id]: 50 } } } as any];
  session.state.chiefTrust[chief.id] = 42;
  const html = renderToStaticMarkup(<ChiefsPaperScreen
    chiefPositions={[currentPosition]}
    chiefCoalitions={[]}
    advisorRoster={session.advisorRoster}
    session={session}
    scenario={scenario}
    memos={[memo]}
    compactPresentation
    conversationBusy={false}
    conversationError={null}
    activeConversation={null}
    onOpenConversation={() => {}}
    onRespond={() => {}}
    onProceed={() => {}}
    onBack={() => {}}
  />);
  assert.match(html, /Changed since last month: memory, staff evidence, trust\./);
  assert.match(html, /<details open=""/, "changed evidence remains expanded in Compact view");
  assert.doesNotMatch(html, /Stable support — expand staff evidence/);
});

test("chiefs paper preserves every selected issue for a chief instead of discarding later positions", () => {
  const session = createInitialGameSession(soloScenario, "web-chief-issues-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const chief = soloScenario.chiefs[0]!;
  const [firstMemo, secondMemo] = soloScenario.memoTemplates;
  const firstOption = firstMemo!.options[0]!;
  const secondOption = secondMemo!.options[0]!;
  const positions = [
    {
      chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
      memoId: firstMemo!.id, optionId: firstOption.id, institutionalReason: "first reason", agendaMemoryNote: "", adviceStyleNote: "",
      staffReadoutEvidence: { staffFunctionLabel: "People", metricLabel: "trust", metricStatus: "healthy", metricValue: 80, burdenLevel: "light", burdenPoints: 0 },
    },
    {
      chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "oppose",
      memoId: secondMemo!.id, optionId: secondOption.id, institutionalReason: "second reason", agendaMemoryNote: "", adviceStyleNote: "",
      staffReadoutEvidence: { staffFunctionLabel: "Operations", metricLabel: "readiness", metricStatus: "strained", metricValue: 35, burdenLevel: "strained", burdenPoints: 4 },
    },
  ] as any;
  const html = renderToStaticMarkup(<ChiefsPaperScreen
    chiefPositions={positions}
    chiefCoalitions={[]}
    advisorRoster={session.advisorRoster}
    session={session}
    scenario={scenario}
    memos={[firstMemo!, secondMemo!]}
    conversationBusy={false}
    conversationError={null}
    activeConversation={null}
    onOpenConversation={() => {}}
    onRespond={() => {}}
    onProceed={() => {}}
    onBack={() => {}}
  />);
  assert.match(html, /Other selected issues/);
  assert.ok(html.includes(secondMemo!.title), "the later memo-specific position remains visible");
  assert.ok(html.includes(secondOption.label), "the later selected option remains visible");
  assert.match(html, /Discuss/, "the player can explicitly choose the later issue as the conversation topic");
});

test("compact chiefs paper shows pacing for every selected issue, including later stable positions", () => {
  const session = createInitialGameSession(soloScenario, "web-chief-issue-pacing-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const chief = soloScenario.chiefs[0]!;
  const [firstMemo, secondMemo] = soloScenario.memoTemplates;
  const firstOption = firstMemo!.options[0]!;
  const secondOption = secondMemo!.options[0]!;
  const base = {
    chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
    institutionalReason: "Same course.", requiredCondition: "", confidenceNote: "", consequenceIfIgnored: "",
    agendaMemoryNote: "", adviceStyleNote: "",
    staffReadoutEvidence: { staffFunctionLabel: "Operations", metricLabel: "Tempo", metricStatus: "healthy", metricValue: 70, burdenLevel: "light", burdenPoints: 1 },
  } as any;
  const firstPosition = { ...base, memoId: firstMemo!.id, optionId: firstOption.id };
  const secondPosition = { ...base, memoId: secondMemo!.id, optionId: secondOption.id };
  session.history = [{ chiefPositions: [firstPosition, secondPosition], nextState: { chiefTrust: { [chief.id]: 50 } } } as any];
  session.state.chiefTrust[chief.id] = 50;
  const html = renderToStaticMarkup(<ChiefsPaperScreen
    chiefPositions={[{ ...firstPosition, agendaMemoryNote: "Changed memory." }, secondPosition]}
    chiefCoalitions={[]}
    advisorRoster={session.advisorRoster}
    session={session}
    scenario={scenario}
    memos={[firstMemo!, secondMemo!]}
    compactPresentation
    conversationBusy={false}
    conversationError={null}
    activeConversation={null}
    onOpenConversation={() => {}}
    onRespond={() => {}}
    onProceed={() => {}}
    onBack={() => {}}
  />);
  assert.match(html, /Stable since last month\./, "the later issue receives stable pacing too");
  assert.match(html, /aria-label="Chief position stable"/);
});

test("chiefs paper passes real session state into the sprite variant, not a neutral default", () => {
  const session = createInitialGameSession(soloScenario, "web-sprite-state-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const chief = soloScenario.chiefs[0];
  // Controlled strained-trust + overloaded state for the first chief.
  session.state.chiefTrust[chief.id] = 30;
  session.state.staffMechanics.s2.externalEstimateConfidence = 30;
  session.state.staffMechanics.s4.supportableTempo = 10;
  const positions = [{
    chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
    memoId: "missing", optionId: "missing", institutionalReason: "reason", agendaMemoryNote: "", adviceStyleNote: "",
    staffReadoutEvidence: { staffFunctionLabel: "People", metricLabel: "trust", metricStatus: "healthy", metricValue: 80, burdenLevel: "overloaded", burdenPoints: 8 },
  }] as any;
  const advisor = session.advisorRoster.find((entry) => entry.chiefId === chief.id)!;
  const expected = buildAdvisorPortraitDataUri(buildChiefSpriteSpec({
    chief, portrait: advisor.portrait, sessionSeed: session.id,
    variantState: {
      trustBand: relationshipLabel(session.state.chiefTrust[chief.id]),
      burdenLevel: "overloaded",
      campaignStatus: session.state.campaignStatus,
      s2ExternalEstimateConfidence: session.state.staffMechanics.s2.externalEstimateConfidence,
      s4SupportableTempo: session.state.staffMechanics.s4.supportableTempo,
    },
    visualLanguage: scenario.spriteVisualLanguage,
  }));
  const html = renderToStaticMarkup(<ChiefsPaperScreen
    chiefPositions={positions}
    chiefCoalitions={[]}
    advisorRoster={session.advisorRoster}
    session={session}
    scenario={scenario}
    memos={[]}
    conversationBusy={false}
    conversationError={null}
    activeConversation={null}
    onOpenConversation={() => {}}
    onRespond={() => {}}
    onProceed={() => {}}
    onBack={() => {}}
  />);
  assert.ok(html.includes(expected), "web derives the sprite from the same state the shared builder sees");
  // Sprite 4 (#82): the pixel renderer's crispEdges root replaces the old vector dark
  // overlay. The overloaded state must still differ byte-for-byte from the same chief's
  // neutral rendering (v2 §7.5 — equality plus overloaded-vs-neutral byte inequality).
  assert.ok(html.includes("shape-rendering%3D%22crispEdges%22"), "pixel renderer root is served in the data URI");
  assert.ok(!html.includes("fill%3D%22%23000000%22%20opacity%3D%220.22%22"), "the vector black overlay is gone");
  const neutral = buildAdvisorPortraitDataUri(buildChiefSpriteSpec({
    chief, portrait: advisor.portrait, sessionSeed: session.id,
    variantState: {
      trustBand: relationshipLabel(50),
      burdenLevel: "light",
      campaignStatus: session.state.campaignStatus,
      s2ExternalEstimateConfidence: session.state.staffMechanics.s2.externalEstimateConfidence,
      s4SupportableTempo: session.state.staffMechanics.s4.supportableTempo,
    },
    visualLanguage: scenario.spriteVisualLanguage,
  }));
  assert.notEqual(expected, neutral, "the overloaded state changes the pixel bytes");
});

test("ChiefPortrait renders exact integer pixel scaling with pixelated rendering", () => {
  const session = createInitialGameSession(soloScenario, "web-portrait-size-session");
  const scenario = { ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary;
  const chief = soloScenario.chiefs[0];
  const advisor = session.advisorRoster.find((entry) => entry.chiefId === chief.id)!;
  const sprite = buildChiefSpriteSpec({
    chief, portrait: advisor.portrait, sessionSeed: session.id,
    variantState: {
      trustBand: "steady", burdenLevel: "light", campaignStatus: "active",
      s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50,
    },
    visualLanguage: scenario.spriteVisualLanguage,
  });
  const sm = renderToStaticMarkup(<ChiefPortrait sprite={sprite} title="T" size="sm" />);
  const md = renderToStaticMarkup(<ChiefPortrait sprite={sprite} title="T" size="md" />);
  const lg = renderToStaticMarkup(<ChiefPortrait sprite={sprite} title="T" size="lg" />);
  assert.match(sm, /w-12 h-14/, "sm stays 48×56 (2×)");
  assert.match(md, /w-\[72px\] h-\[84px\]/, "md is exactly 72×84 (3×)");
  assert.match(lg, /w-24 h-28/, "lg stays 96×112 (4×)");
  for (const html of [sm, md, lg]) {
    assert.match(html, /image-rendering:pixelated/, "every size renders pixelated");
    assert.match(html, /data:image\/svg\+xml/, "the data URI is the delivery path");
    assert.match(html, /alt="[^"]+ — T"/, "alt contract is preserved");
  }
});
