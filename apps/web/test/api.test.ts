import test from "node:test";
import assert from "node:assert/strict";
import { createSession, listScenarios } from "../src/lib/api";

test("scenario discovery and creation use the registry endpoint and selected scenario id", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return {
      ok: true,
      json: async () => url === "/api/scenarios" ? { scenarios: [] } : { session: {}, memos: [], summary: {} },
    } as Response;
  }) as typeof fetch;

  try {
    await listScenarios();
    await createSession("short-warning-coalition");
    assert.equal(calls[0]?.url, "/api/scenarios");
    assert.equal(calls[1]?.url, "/api/sessions");
    assert.equal(calls[1]?.init?.method, "POST");
    assert.deepEqual(JSON.parse(String(calls[1]?.init?.body)), { scenarioId: "short-warning-coalition" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
