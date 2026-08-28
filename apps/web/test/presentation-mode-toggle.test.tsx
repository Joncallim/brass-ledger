import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { PresentationModeToggle } from "../src/components/PresentationModeToggle";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const { createRoot } = await import("react-dom/client");

test("PresentationModeToggle exposes and changes presentation only through an accessible control", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  let mode: "standard" | "compact" = "standard";
  const render = () => root.render(<PresentationModeToggle mode={mode} onChange={(next) => { mode = next; render(); }} />);
  act(render);
  const button = container.querySelector("button") as HTMLButtonElement;
  assert.equal(button.textContent, "Compact view");
  assert.equal(button.getAttribute("aria-pressed"), "false");
  act(() => button.click());
  assert.equal(button.textContent, "Standard view");
  assert.equal(button.getAttribute("aria-pressed"), "true");
  act(() => root.unmount());
  container.remove();
});
