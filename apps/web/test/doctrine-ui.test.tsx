import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import { buildAdvisorPortraitDataUri, buildChiefSpriteSpec, createInitialGameSession, relationshipLabel, type EventDefinition, type ScenarioSummary } from "@brass-ledger/shared";
import type { PreviewPayload } from "../src/lib/types";
import { PreCommitScreen } from "../src/screens/PreCommitScreen/index.tsx";
import { EventList } from "../src/screens/AfterActionScreen/EventList.tsx";
import { ChiefsPaperScreen } from "../src/screens/ChiefsPaperScreen/index.tsx";
import { ChiefPortrait } from "../src/components/ChiefPortrait";

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
