import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { soloScenario } from "@brass-ledger/content";
import {
  createInitialGameSession,
  gameSessionSchema,
  replayValidationSchema,
  sessionExportSchema,
  summarizeState,
  turnInputSchema,
  type GameSession,
  type ReplayValidation,
} from "@brass-ledger/shared";
import { deriveDecisionMemos, previewTurn, resolveTurn, validateReplaySession } from "@brass-ledger/sim";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const dataDir = path.resolve(process.cwd(), "../../data/saves");

function sessionPath(sessionId: string) {
  return path.join(dataDir, `${sessionId}.json`);
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
  const sessions = await Promise.all(
    files.map(async (fileName) => {
      const raw = await readFile(path.join(dataDir, fileName), "utf8");
      return gameSessionSchema.parse(JSON.parse(raw));
    }),
  );
  return sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function createSession() {
  return {
    ...createInitialGameSession(soloScenario),
    id: randomUUID(),
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

app.get("/", async () => ({
  ok: true,
  service: "brass-ledger-api",
  message: "This is the Brass Ledger API server. Open the web app separately to play.",
  routes: {
    health: "/api/health",
    scenario: "/api/scenario",
    sessions: "/api/sessions",
  },
}));

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
    await rm(sessionPath((request.params as { id: string }).id));
    return { ok: true };
  } catch {
    reply.code(404);
    return { error: "Session not found" };
  }
});

app.post("/api/sessions/:id/save", async (request, reply) => {
  try {
    const body = (request.body ?? {}) as { session?: unknown };
    const session = gameSessionSchema.parse(body.session);
    if (session.id !== (request.params as { id: string }).id) {
      reply.code(400);
      return { error: "Session id mismatch" };
    }
    const next = { ...session, updatedAt: new Date().toISOString() };
    await writeSession(next);
    return sessionPayload(next);
  } catch (error) {
    reply.code(400);
    return { error: error instanceof Error ? error.message : "Invalid session payload" };
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

app.post("/api/sessions/:id/resolve-turn", async (request, reply) => {
  try {
    const session = await readSession((request.params as { id: string }).id);
    const body = (request.body ?? {}) as { input?: unknown };
    const input = turnInputSchema.parse(body.input);
    const result = resolveTurn(soloScenario, session.state, input);
    const nextSession = gameSessionSchema.parse({
      ...session,
      state: result.nextState,
      turnInputs: [...session.turnInputs, input],
      history: [...session.history, result],
      updatedAt: new Date().toISOString(),
    });
    const validation: ReplayValidation = replayValidationSchema.parse(validateReplaySession(soloScenario, nextSession));
    await writeSession(nextSession);
    return {
      result,
      validation,
      ...sessionPayload(nextSession),
    };
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
    if (session.scenarioId !== soloScenario.id || session.contentVersion !== soloScenario.contentVersion) {
      reply.code(409);
      return { error: "Imported save is incompatible with the current scenario or content version." };
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

const port = Number(process.env.PORT ?? "4000");
app.listen({ port, host: "127.0.0.1" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
