import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import Fastify, { type FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { soloScenario } from "@brass-ledger/content";
import {
  buildChiefPositions,
  continueChiefConversation,
  createInitialGameSession,
  gameSessionSchema,
  getConversationRecordForTurn,
  replayValidationSchema,
  relationshipDeltaLabel,
  sessionExportSchema,
  startChiefConversation,
  summarizeState,
  turnInputSchema,
  type GameSession,
  type ReplayValidation,
} from "@brass-ledger/shared";
import { deriveDecisionMemos, previewTurn, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

const app = Fastify({ logger: true });

const allowedCorsOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "http://127.0.0.1:5173,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

await app.register(cors, {
  origin(origin, callback) {
    if (!origin || allowedCorsOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS"), false);
  },
});

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

function resolveExistingPath(candidates: string[]) {
  for (const candidate of candidates) {
    const resolved = path.resolve(moduleDir, candidate);
    if (existsSync(resolved)) {
      return resolved;
    }
  }
  return path.resolve(moduleDir, candidates[0]);
}

const dataDir = resolveExistingPath(["../../../../data/saves", "../../../data/saves"]);
const webDistDir = resolveExistingPath(["../../../web/dist", "../../web/dist"]);
const webIndexPath = path.join(webDistDir, "index.html");
const sessionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sessionLocks = new Map<string, Promise<unknown>>();

function assertSessionId(sessionId: string) {
  if (!sessionIdPattern.test(sessionId)) {
    throw new Error("Invalid session id");
  }
}

async function withSessionLock<T>(sessionId: string, operation: () => Promise<T>) {
  assertSessionId(sessionId);
  const previous = sessionLocks.get(sessionId) ?? Promise.resolve();
  let release: () => void = () => {};
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = previous.then(() => current, () => current);
  sessionLocks.set(sessionId, tail);

  try {
    await previous.catch(() => undefined);
    return await operation();
  } finally {
    release();
    if (sessionLocks.get(sessionId) === tail) {
      sessionLocks.delete(sessionId);
    }
  }
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js" || ext === ".mjs") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".woff") return "font/woff";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

function isPathInside(parentDir: string, candidatePath: string) {
  const relative = path.relative(parentDir, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function sendStaticFile(reply: FastifyReply, filePath: string) {
  const body = await readFile(filePath);
  reply.header("content-type", contentTypeFor(filePath));
  if (path.basename(filePath) === "index.html") {
    reply.header("cache-control", "no-cache");
  }
  return reply.send(body);
}

async function serveClientShell(reply: FastifyReply) {
  try {
    return await sendStaticFile(reply, webIndexPath);
  } catch {
    reply.type("text/html; charset=utf-8");
    return reply.send(
      `<!doctype html><html><head><meta charset="utf-8"/><title>Brass Ledger</title></head><body><main style="font-family:system-ui;padding:2rem;max-width:48rem;margin:0 auto"><h1>Brass Ledger</h1><p>The packaged web client is not built yet.</p><p>Run <code>npm run build</code> and then start the server again.</p></main></body></html>`,
    );
  }
}

function sessionPath(sessionId: string) {
  assertSessionId(sessionId);
  return path.join(dataDir, `${sessionId}.json`);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function assertReplayableSession(session: GameSession) {
  if (session.turnInputs.length !== session.history.length) {
    throw new Error("Session turn input and history lengths must match.");
  }
  const validation = replayValidationSchema.parse(validateReplaySession(soloScenario, session));
  if (!validation.ok) {
    throw new Error(`Session replay validation failed: ${validation.failureKind}`);
  }
  return validation;
}

function assertCanonicalImport(session: GameSession) {
  if (session.scenarioId !== soloScenario.id || session.contentVersion !== soloScenario.contentVersion) {
    throw new Error("Imported save is incompatible with the current scenario or content version.");
  }
  if (session.saveFormatVersion !== "5") {
    throw new Error("Imported save format is not supported.");
  }
  if (stableJson(session.initialState) !== stableJson(soloScenario.initialState)) {
    throw new Error("Imported save does not start from the canonical scenario initial state.");
  }
  assertReplayableSession(session);
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
}

async function writeSession(session: GameSession) {
  await ensureStore();
  const destination = sessionPath(session.id);
  const tempPath = `${destination}.tmp`;
  await writeFile(tempPath, JSON.stringify(session, null, 2), "utf8");
  await rename(tempPath, destination);
}

async function readSession(sessionId: string) {
  const raw = await readFile(sessionPath(sessionId), "utf8");
  return gameSessionSchema.parse(JSON.parse(raw));
}

async function listSessions() {
  await ensureStore();
  const files = (await readdir(dataDir)).filter((entry) => entry.endsWith(".json"));
  const sessions = (
    await Promise.all(
      files.map(async (fileName) => {
        try {
          const raw = await readFile(path.join(dataDir, fileName), "utf8");
          return gameSessionSchema.parse(JSON.parse(raw));
        } catch (error) {
          app.log.warn(
            {
              fileName,
              error: error instanceof Error ? error.message : "Unknown session parse failure",
            },
            "Skipping incompatible or invalid save file",
          );
          return null;
        }
      }),
    )
  ).filter((session): session is GameSession => session !== null);
  return sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function createSession() {
  const sessionId = randomUUID();
  return {
    ...createInitialGameSession(soloScenario, sessionId),
    id: sessionId,
  };
}

function summarizeSession(session: GameSession) {
  return {
    id: session.id,
    scenarioId: session.scenarioId,
    contentVersion: session.contentVersion,
    saveFormatVersion: session.saveFormatVersion,
    updatedAt: session.updatedAt,
    turn: session.state.turn,
    maxTurns: session.state.maxTurns,
    microCampaignLength: session.state.microCampaignLength,
    campaignStatus: session.state.campaignStatus,
    campaignScore: session.state.campaignScore,
    campaignOutcome: session.state.campaignOutcome,
    replayCount: session.history.length,
    summary: session.state.campaignOutcome ?? summarizeState(session.state),
  };
}

function sessionPayload(session: GameSession) {
  return {
    session,
    summary: summarizeSession(session),
    memos: deriveDecisionMemos(soloScenario, session.state),
  };
}

app.get("/", async (_request, reply) => serveClientShell(reply));

app.get("/api/health", async () => ({ ok: true }));

app.get("/api/scenario", async () => ({
  scenario: {
    id: soloScenario.id,
    title: soloScenario.title,
    description: soloScenario.description,
    contentVersion: soloScenario.contentVersion,
    maxTurns: soloScenario.maxTurns,
    chiefs: soloScenario.chiefs,
    decisionMemos: soloScenario.memoTemplates,
    capabilityPrograms: soloScenario.capabilityPrograms,
    externalConstraints: soloScenario.externalConstraints,
  },
}));

app.get("/api/sessions", async () => {
  const sessions = await listSessions();
  return { sessions: sessions.map(summarizeSession) };
});

app.post("/api/sessions", async () => {
  const session = createSession();
  await writeSession(session);
  return sessionPayload(session);
});

app.get("/api/sessions/:id", async (request, reply) => {
  try {
    const session = await readSession((request.params as { id: string }).id);
    return sessionPayload(session);
  } catch {
    reply.code(404);
    return { error: "Session not found" };
  }
});

app.delete("/api/sessions/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    await withSessionLock(id, async () => {
      await rm(sessionPath(id));
    });
    return { ok: true };
  } catch {
    reply.code(404);
    return { error: "Session not found" };
  }
});

app.post("/api/sessions/:id/save", async (request, reply) => {
  try {
    assertSessionId((request.params as { id: string }).id);
    reply.code(410);
    return { error: "Whole-session client saves are disabled. Use authoritative mutation endpoints instead." };
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Invalid session id" };
  }
});

app.post("/api/sessions/:id/preview-turn", async (request, reply) => {
  try {
    const session = await readSession((request.params as { id: string }).id);
    const body = (request.body ?? {}) as { input?: unknown };
    const input = turnInputSchema.parse(body.input);
    const preview = previewTurn(soloScenario, session.state, input);
    return {
      ...preview,
      chiefPositions: preview.projectedResult.chiefPositions,
      chiefsPaper: preview.projectedResult.chiefsPaper ?? preview.projectedResult.advisoryPaper,
      commandersEstimate: {
        title: preview.projectedResult.monthlyEstimate.chiefsPaperTitle,
        summary: preview.projectedResult.monthlyEstimate.commandersEstimate,
        recommendedFocus: preview.projectedResult.monthlyEstimate.chiefsPaperSummary,
        riskNote: preview.projectedResult.monthlyEstimate.uncertainty,
      },
      directorateBurden: preview.projectedResult.directorateBurden,
      memos: preview.projectedResult.memos,
    };
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Failed to preview turn" };
  }
});

app.post("/api/sessions/:id/chiefs/:chiefId/conversation/open", async (request, reply) => {
  try {
    const { id, chiefId } = request.params as { id: string; chiefId: string };
    const body = (request.body ?? {}) as { memoId?: string; optionId?: string };
    if (!body.memoId || !body.optionId) {
      reply.code(400);
      return { error: "memoId and optionId are required." };
    }

    return await withSessionLock(id, async () => {
      const session = await readSession(id);
      const chief = soloScenario.chiefs.find((entry) => entry.id === chiefId);
      if (!chief) {
        reply.code(404);
        return { error: "Chief not found" };
      }

      const memos = deriveDecisionMemos(soloScenario, session.state);
      const memo = memos.find((entry) => entry.id === body.memoId);
      const option = memo?.options.find((entry) => entry.id === body.optionId);
      if (!memo || !option) {
        reply.code(400);
        return { error: "The selected memo option is no longer valid." };
      }

      const existing = getConversationRecordForTurn(session.state, chiefId);
      if (existing && existing.memoId === memo.id && existing.optionId === option.id) {
        return {
          ...sessionPayload(session),
          conversation: existing,
        };
      }

      const position = buildChiefPositions(soloScenario.chiefs, session.state, memo, option).find((entry) => entry.chiefId === chiefId);
      if (!position) {
        reply.code(400);
        return { error: "Could not derive a chief position for this packet." };
      }

      const conversation = startChiefConversation(chief, memo, option, position, session.state);
      const updatedSession = gameSessionSchema.parse({
        ...session,
        state: {
          ...session.state,
          conversationHistory: [
            ...session.state.conversationHistory.filter((entry) => !(entry.turn === session.state.turn && entry.chiefId === chiefId)),
            conversation,
          ],
        },
        updatedAt: new Date().toISOString(),
      });

      await writeSession(updatedSession);
      return {
        ...sessionPayload(updatedSession),
        conversation,
      };
    });
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Failed to open chief conversation" };
  }
});

app.post("/api/sessions/:id/chiefs/:chiefId/respond", async (request, reply) => {
  try {
    const { id, chiefId } = request.params as { id: string; chiefId: string };
    const body = (request.body ?? {}) as { responseId?: string };
    if (!body.responseId) {
      reply.code(400);
      return { error: "responseId is required." };
    }
    const responseId = body.responseId;

    return await withSessionLock(id, async () => {
      const session = await readSession(id);
      const chief = soloScenario.chiefs.find((entry) => entry.id === chiefId);
      if (!chief) {
        reply.code(404);
        return { error: "Chief not found" };
      }

      const conversation = getConversationRecordForTurn(session.state, chiefId);
      if (!conversation) {
        reply.code(404);
        return { error: "No open conversation exists for this chief this month." };
      }
      if (conversation.status === "completed") {
        reply.code(409);
        return { error: "This chief conversation has already concluded.", conversation };
      }

      const memos = deriveDecisionMemos(soloScenario, session.state);
      const memo = memos.find((entry) => entry.id === conversation.memoId);
      const option = memo?.options.find((entry) => entry.id === conversation.optionId);
      if (!memo || !option) {
        reply.code(400);
        return { error: "The selected memo option is no longer valid." };
      }

      const nextConversation = continueChiefConversation(conversation, chief, memo, option, session.state, responseId);

      const updatedSession = gameSessionSchema.parse({
        ...session,
        state: {
          ...session.state,
          chiefTrust: {
            ...session.state.chiefTrust,
            [chiefId]: nextConversation.trustAfter,
          },
          conversationHistory: session.state.conversationHistory.map((entry) =>
            entry.turn === session.state.turn && entry.chiefId === chiefId ? nextConversation : entry,
          ),
        },
        updatedAt: new Date().toISOString(),
      });

      await writeSession(updatedSession);
      const selectedResponse = conversation.choices.find((entry) => entry.id === responseId);
      return {
        ...sessionPayload(updatedSession),
        conversation: nextConversation,
        response: selectedResponse
          ? {
              ...selectedResponse,
              trustAfter: nextConversation.trustAfter,
              relationshipEffect: relationshipDeltaLabel(selectedResponse.trustDelta),
            }
          : null,
      };
    });
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Failed to update chief relationship" };
  }
});

app.post("/api/sessions/:id/resolve-turn", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { input?: unknown };
    const input = turnInputSchema.parse(body.input);
    return await withSessionLock(id, async () => {
      const session = await readSession(id);
      const result = resolveTurn(soloScenario, session.state, input);
      const nextSession = gameSessionSchema.parse({
        ...session,
        state: result.nextState,
        turnInputs: [...session.turnInputs, input],
        history: [...session.history, result],
        updatedAt: new Date().toISOString(),
      });
      const validation: ReplayValidation = assertReplayableSession(nextSession);
      await writeSession(nextSession);
      return {
        result,
        validation,
        ...sessionPayload(nextSession),
      };
    });
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Failed to resolve turn" };
  }
});

app.get("/api/sessions/:id/export", async (request, reply) => {
  try {
    const session = await readSession((request.params as { id: string }).id);
    return sessionExportSchema.parse({
      exportedAt: new Date().toISOString(),
      session,
    });
  } catch {
    reply.code(404);
    return { error: "Session not found" };
  }
});

app.post("/api/sessions/import", async (request, reply) => {
  try {
    const body = (request.body ?? {}) as { exportData?: unknown };
    const parsed = sessionExportSchema.parse(body.exportData);
    const session = parsed.session;
    try {
      assertCanonicalImport(session);
    } catch (error) {
      reply.code(409);
      return { error: error instanceof Error ? error.message : "Imported save failed validation." };
    }
    const importedSession = {
      ...session,
      id: randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    await writeSession(importedSession);
    return sessionPayload(importedSession);
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Invalid import payload" };
  }
});

app.get("/api/sessions/:id/replay", async (request, reply) => {
  try {
    const session = await readSession((request.params as { id: string }).id);
    return {
      session,
      validation: replayValidationSchema.parse(validateReplaySession(soloScenario, session)),
    };
  } catch {
    reply.code(404);
    return { error: "Session not found" };
  }
});

app.get("/*", async (request, reply) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  if (pathname.startsWith("/api/")) {
    return reply.callNotFound();
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(webDistDir, relativePath);
  if (!isPathInside(webDistDir, filePath)) {
    reply.code(400);
    return { error: "Invalid asset path" };
  }

  try {
    if (path.extname(relativePath)) {
      return await sendStaticFile(reply, filePath);
    }
    return await serveClientShell(reply);
  } catch {
    reply.code(404);
    return { error: "Asset not found" };
  }
});

const port = Number(process.env.PORT ?? "4000");
app.listen({ port, host: "127.0.0.1" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
