import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import { createInitialGameSession, type ChiefConversationRecord, type ChiefPositionEntry, type ScenarioSummary } from "@brass-ledger/shared";
import { ChiefsPaperScreen } from "../src/screens/ChiefsPaperScreen";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

test("chief conversation is modal, focuses its close control, and returns focus to the exact invoking button", () => {
  const session = createInitialGameSession(soloScenario, "chief-conversation-a11y");
  const chief = soloScenario.chiefs[0]!;
  const [firstMemo, secondMemo] = soloScenario.memoTemplates;
  const firstOption = firstMemo!.options[0]!;
  const secondOption = secondMemo!.options[0]!;
  const evidence = {
    staffFunctionLabel: "Operations", metricLabel: "Supportable tempo", metricValue: 62,
    metricStatus: "healthy", burdenLevel: "light", burdenPoints: 1,
  };
  const positions = [
    {
      chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
      memoId: firstMemo!.id, optionId: firstOption.id, institutionalReason: "First issue.",
      agendaMemoryNote: "", adviceStyleNote: "", requiredCondition: "", confidenceNote: "", consequenceIfIgnored: "",
      staffReadoutEvidence: evidence,
    },
    {
      chiefId: chief.id, chiefName: chief.name, directorate: chief.directorate, position: "support",
      memoId: secondMemo!.id, optionId: secondOption.id, institutionalReason: "Second issue.",
      agendaMemoryNote: "", adviceStyleNote: "", requiredCondition: "", confidenceNote: "", consequenceIfIgnored: "",
      staffReadoutEvidence: evidence,
    },
  ] as unknown as ChiefPositionEntry[];
  const conversation = {
    id: "conversation-a11y",
    turn: session.state.turn,
    chiefId: chief.id,
    chiefName: chief.name,
    memoId: secondMemo!.id,
    memoTitle: secondMemo!.title,
    optionId: secondOption.id,
    optionLabel: secondOption.label,
    stage: "bargaining",
    status: "active",
    position: "support",
    institutionalReason: "Second issue.",
    transcript: [],
    choices: [
      { id: "reassure", label: "Reassure", summary: "Confirm the plan.", trustDelta: 1, nextStage: "completed" },
      { id: "defer", label: "Defer", summary: "Leave the issue open.", trustDelta: -1, nextStage: "completed" },
    ],
    trustBefore: 50,
    trustAfter: 50,
    totalTrustDelta: 0,
  } as unknown as ChiefConversationRecord;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<ChiefsPaperScreen
      chiefPositions={positions}
      chiefCoalitions={[]}
      advisorRoster={session.advisorRoster}
      session={session}
      scenario={{ ...soloScenario, spriteVisualLanguage } as unknown as ScenarioSummary}
      memos={[firstMemo!, secondMemo!]}
      conversationBusy={false}
      conversationError={null}
      activeConversation={conversation}
      onOpenConversation={() => {}}
      onRespond={() => {}}
      onProceed={() => {}}
      onBack={() => {}}
    />);
  });

  const discussButton = [...container.querySelectorAll("button")].find((button) => button.textContent === "Discuss")!;
  act(() => {
    discussButton.click();
  });

  const dialog = container.querySelector('[role="dialog"]')!;
  const closeButton = container.querySelector('button[aria-label="Close conversation"]')!;
  assert.equal(dialog.getAttribute("aria-modal"), "true");
  assert.equal(document.activeElement, closeButton, "the close button receives initial focus");

  const replyButtons = [...dialog.querySelectorAll("button")].filter((button) => button !== closeButton);
  const lastReply = replyButtons.at(-1)!;
  act(() => {
    lastReply.focus();
    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  });
  assert.equal(document.activeElement, closeButton, "Tab wraps from the final reply to the close button");
  act(() => {
    closeButton.focus();
    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
  });
  assert.equal(document.activeElement, lastReply, "Shift+Tab wraps from close to the final reply");

  act(() => {
    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  assert.equal(container.querySelector('[role="dialog"]'), null, "Escape closes the sheet");
  assert.equal(document.activeElement, discussButton, "focus returns to the exact Talk-to-chief button that opened the sheet");

  act(() => root.unmount());
  container.remove();
});
