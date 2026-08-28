import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";
import { ContextualTeaching } from "../src/components/ContextualTeaching";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = dom.window;
globals.document = dom.window.document;
Object.defineProperty(globals, "navigator", { value: dom.window.navigator, configurable: true });
globals.HTMLElement = dom.window.HTMLElement;
globals.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import("react-dom/client");

test("ContextualTeaching persists a dismissed concept and can suppress all guidance", async () => {
  window.localStorage.clear();
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = () => root.render(<ContextualTeaching concept="forecast" title="Forecast">Explanation</ContextualTeaching>);
  await act(async () => { render(); });
  assert.match(container.textContent ?? "", /First time here/);
  await act(async () => { (container.querySelector("button") as HTMLButtonElement).click(); });
  assert.equal(container.textContent, "");
  await act(async () => { render(); });
  assert.equal(container.textContent, "");
  await act(async () => { root.render(<ContextualTeaching concept="chief-terms" title="Chief terms">Explanation</ContextualTeaching>); });
  await act(async () => { (container.querySelectorAll("button")[1] as HTMLButtonElement).click(); });
  await act(async () => { root.render(<ContextualTeaching concept="accepted-risk" title="Accepted risk">Explanation</ContextualTeaching>); });
  assert.equal(container.textContent, "");
  await act(async () => { root.unmount(); });
  container.remove();
});
