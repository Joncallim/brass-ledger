import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act, createRef } from "react";
import { FieldManual } from "../src/components/FieldManual";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

test("FieldManual returns focus to its opener after Close or Escape", async () => {
  const container = document.createElement("div");
  const opener = document.createElement("button");
  opener.textContent = "Field manual";
  document.body.append(opener, container);
  const openerRef = createRef<HTMLElement>();
  openerRef.current = opener;
  const root = createRoot(container);
  let closes = 0;
  const renderManual = () => root.render(<FieldManual scenario={null} onClose={() => { closes += 1; }} returnFocusRef={openerRef} />);

  act(renderManual);
  assert.equal(document.activeElement?.textContent, "Close");
  act(() => (container.querySelector("button") as HTMLButtonElement).click());
  await flushMicrotasks();
  assert.equal(closes, 1);
  assert.equal(document.activeElement, opener);

  act(renderManual);
  act(() => window.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" })));
  await flushMicrotasks();
  assert.equal(closes, 2);
  assert.equal(document.activeElement, opener);
  act(() => root.unmount());
  container.remove();
  opener.remove();
});

test("FieldManual explains every recurring onboarding concept in player language", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(<FieldManual scenario={null} onClose={() => {}} />));

  const text = container.textContent ?? "";
  for (const term of [
    "Burden",
    "Uncertainty and confidence",
    "Staff relief and negotiation",
    "Programme phase",
    "Doctrine risk",
    "Campaign horizon and outcomes",
  ]) assert.match(text, new RegExp(term));
  assert.match(text, /What changes it:/);
  assert.match(text, /Do not assume:/);

  act(() => root.unmount());
  container.remove();
});
