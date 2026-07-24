/**
 * Planner routes
 *
 *   POST /api/plan          — synchronous plan (returns JSON when done)
 *   POST /api/plan/stream   — SSE plan (streams ProgressLog events live, M8)
 *   POST /api/plan/feedback — submit free-text feedback, re-runs graph from validation
 */

import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { compiledGraph } from "../agent/graph.js";
import type { DayPlan as AgentDayPlan } from "../agent/types.js";
import { dataService } from "../services/dataService.js";
import { validateBody } from "../middleware/requestValidator.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  PlanRequestSchema,
  type PlanRequest,
  type Homestay,
  type Transport,
  type Guide,
} from "../types/index.js";
import type { NormalizedActivity } from "../providers/index.js";
import type { Activity } from "../types/index.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";

const router = Router();

const PLAN_TIMEOUT_MS = 180_000; // 3 min — validation + auto-fix need more time

// ─── Feedback request schema ──────────────────────────────────────────────────

const FeedbackRequestSchema = z.object({
  threadId: z.string().min(1, "threadId is required"),
  feedback: z.string().min(1, "Feedback cannot be empty").max(1000),
});

// ─── City resolver ────────────────────────────────────────────────────────────

function resolveCityName(cityInput: string): string {
  const trimmed = cityInput.trim();
  const byName = dataService.getCityByName(trimmed);
  if (byName) return byName.name;

  const slug = trimmed.toLowerCase().replace(/^city_/, "");
  const allCities = dataService.getAllCities();
  const bySlug = allCities.find(
    (c) =>
      c.id.toLowerCase() === `city_${slug}` ||
      c.id.toLowerCase() === slug ||
      c.name.toLowerCase() === slug,
  );
  if (bySlug) return bySlug.name;

  const byPartial = allCities.find(
    (c) =>
      trimmed.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(trimmed.toLowerCase()),
  );
  if (byPartial) return byPartial.name;

  throw new AppError(
    `Unknown city "${cityInput}". Please select a supported destination.`,
    400,
  );
}

// ─── Enrichment helpers ───────────────────────────────────────────────────────

function enrichHomestay(stay: Homestay) {
  return {
    ...stay,
    imageUrl:
      (stay as Homestay & { imageUrl?: string }).imageUrl ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  };
}

function enrichActivity(activity: Activity | NormalizedActivity) {
  return {
    ...activity,
    imageUrl:
      (activity as Activity & { imageUrl?: string }).imageUrl ||
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  };
}

function enrichTransport(transport: Transport) {
  return {
    ...transport,
    provider:
      (transport as Transport & { provider?: string }).provider ||
      (transport.isLocal ? "Local Operator" : "Aggregator"),
  };
}

function enrichGuide(guide: Guide) {
  return {
    ...guide,
    avatarUrl:
      (guide as Guide & { avatarUrl?: string }).avatarUrl ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    bio:
      (guide as Guide & { bio?: string }).bio ||
      `${guide.name} — local guide specializing in ${guide.specialties.join(", ")}.`,
  };
}

function mapAgentDayToFrontend(day: AgentDayPlan) {
  return {
    day: day.day,
    stay: day.stay ? enrichHomestay(day.stay) : null,
    activities: day.activities.map(enrichActivity),
    transport: day.transport ? enrichTransport(day.transport) : null,
    guide: day.guide ? enrichGuide(day.guide) : null,
    dailyCost: day.cost,
    replanned: day.replanned,
    note: day.note,
    schedule: day.schedule ?? [],
    flight: day.flight ?? null,
    flightCost: day.flightCost ?? 0,
  };
}

function computeLocalOperatorPercentage(days: AgentDayPlan[]): number {
  let localSpend = 0;
  let totalSpend = 0;
  for (const d of days) {
    if (d.stay) {
      totalSpend += d.stay.pricePerNight;
      if (d.stay.isLocal) localSpend += d.stay.pricePerNight;
    }
    if (d.guide) {
      totalSpend += d.guide.pricePerDay;
      if (d.guide.isLocal) localSpend += d.guide.pricePerDay;
    }
    if (d.transport) {
      totalSpend += d.transport.pricePerDay;
      if (d.transport.isLocal) localSpend += d.transport.pricePerDay;
    }
    for (const act of d.activities) {
      totalSpend += act.price;
      if (act.isLocal) localSpend += act.price;
    }
  }
  if (totalSpend === 0) return 0;
  return Math.min(100, Math.round((localSpend / totalSpend) * 100));
}

function buildInitialState(body: PlanRequest, cityName: string) {
  return {
    city: cityName,
    totalDays: body.days,
    totalBudget: body.budget,
    preferences: body.preferences,
    travelers: body.travelers,
    travelStyle: body.travelStyle,
    startPlace: body.startPlace,
    startDate: body.startDate,
    transitTypes: body.transitTypes,
    localTransitTypes: body.localTransitTypes ?? [],
    accommodationTypes: body.accommodationTypes ?? [],
    userOptions: body.options,
    currentDay: 1,
    days: [],
    spentSoFar: 0,
    overBudgetBy: 0,
    replanAttempts: {},
    validationResults: [],
    autoFixAttempts: 0,
    userFeedback: "",
    feedbackTargetDays: [],
    feedbackInstructions: "",
    agentDecisions: [],
    progressLog: [],
    status: "planning" as const,
  };
}

function mapToFrontendItinerary(
  body: PlanRequest,
  cityName: string,
  finalState: ReturnType<typeof compiledGraph.invoke> extends Promise<infer T> ? T : never,
) {
  const agentDays = finalState.days as AgentDayPlan[];
  const totalCost = agentDays.reduce((s, d) => s + d.cost, 0);

  return {
    id: uuidv4(),
    city: cityName,
    totalDays: body.days,
    days: agentDays.map(mapAgentDayToFrontend),
    totalCost,
    budget: body.budget,
    remainingBudget: Math.max(0, body.budget - totalCost),
    localOperatorPercentage: computeLocalOperatorPercentage(agentDays),
    preferences: body.preferences,
    travelers: body.travelers,
    travelStyle: body.travelStyle,
    startPlace: body.startPlace,
    startDate: body.startDate,
    transitTypes: body.transitTypes,
    localTransitTypes: body.localTransitTypes ?? [],
    accommodationTypes: body.accommodationTypes ?? [],
    // Milestone 4 — expose validation results
    validationResults: finalState.validationResults ?? [],
    // Milestone 7 — expose agent decisions (explainability)
    agentDecisions: finalState.agentDecisions ?? [],
    // Milestone 8 — full progress log
    progressLog: finalState.progressLog ?? [],
    // Planning meta
    status: finalState.status,
    needsUserInput: finalState.status === "needs_user_input",
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE 1 — POST /api/plan  (synchronous)
// ═══════════════════════════════════════════════════════════════════════════════

router.post("/plan", validateBody(PlanRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as PlanRequest;
    const cityName = resolveCityName(body.city);

    const stays = dataService.getHomestaysByCity(cityName);
    if (stays.length === 0) {
      throw new AppError(
        `No travel data available for ${cityName}. Please choose another destination.`,
        400,
      );
    }

    logger.info("Planning trip", {
      city: cityName,
      budget: body.budget,
      days: body.days,
      preferences: body.preferences,
    });

    const threadId = uuidv4();
    const config = { configurable: { thread_id: threadId } };

    const invokePromise = compiledGraph.invoke(
      buildInitialState(body, cityName),
      config,
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new AppError("Trip planning timed out. Please try again.", 504)),
        PLAN_TIMEOUT_MS,
      );
    });

    const finalState = await Promise.race([invokePromise, timeoutPromise]);

    if (finalState.status === "budget_exceeded_failure") {
      const lastLog = finalState.progressLog[finalState.progressLog.length - 1];
      res.status(422).json({
        success: false,
        error: {
          message:
            lastLog?.message ||
            `Unable to fit a ${body.days}-day trip to ${cityName} within ₹${body.budget}.`,
          statusCode: 422,
        },
      });
      return;
    }

    const itinerary = mapToFrontendItinerary(body, cityName, finalState);

    logger.info("Trip planned", {
      city: cityName,
      totalCost: itinerary.totalCost,
      status: finalState.status,
      decisions: finalState.agentDecisions?.length ?? 0,
    });

    res.status(200).json({
      success: true,
      data: { ...itinerary, threadId },
    });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE 2 — POST /api/plan/stream  (SSE, Milestone 8)
// ═══════════════════════════════════════════════════════════════════════════════

router.post("/plan/stream", validateBody(PlanRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as PlanRequest;
    const cityName = resolveCityName(body.city);

    const stays = dataService.getHomestaysByCity(cityName);
    if (stays.length === 0) {
      throw new AppError(`No travel data for ${cityName}.`, 400);
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    const threadId = uuidv4();
    const config = { configurable: { thread_id: threadId } };

    /** Send a structured SSE event. */
    function sendEvent(type: string, data: unknown) {
      if (res.writableEnded) return;
      res.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
    }

    sendEvent("start", { threadId, city: cityName, message: "Starting autonomous travel planner..." });

    let lastLogCount = 0;
    let lastDecisionCount = 0;

    try {
      const stream = await compiledGraph.stream(
        buildInitialState(body, cityName),
        { ...config, streamMode: "values" },
      );

      for await (const chunk of stream) {
        if (res.writableEnded) break;

        // Stream new ProgressLog entries as SSE log events
        const logs = chunk.progressLog ?? [];
        if (logs.length > lastLogCount) {
          for (let i = lastLogCount; i < logs.length; i++) {
            sendEvent("log", logs[i]);
          }
          lastLogCount = logs.length;
        }

        // Stream new AgentDecision entries as SSE decision events
        const decisions = chunk.agentDecisions ?? [];
        if (decisions.length > lastDecisionCount) {
          for (let i = lastDecisionCount; i < decisions.length; i++) {
            sendEvent("decision", decisions[i]);
          }
          lastDecisionCount = decisions.length;
        }

        // Stream status changes
        if (chunk.status) {
          sendEvent("status", { status: chunk.status });
        }

        // Stream validation results as they arrive
        if (
          chunk.validationResults &&
          chunk.validationResults.length > 0 &&
          chunk.status === "validating"
        ) {
          sendEvent("validation", { results: chunk.validationResults });
        }
      }

      // Retrieve the final state and send the complete itinerary
      const finalStateSnapshot = await compiledGraph.getState(config);
      const finalState = finalStateSnapshot.values as Awaited<ReturnType<typeof compiledGraph.invoke>>;

      if (finalState.status === "budget_exceeded_failure") {
        const lastLog = finalState.progressLog?.[finalState.progressLog.length - 1];
        sendEvent("error", {
          message: lastLog?.message || `Cannot fit trip within ₹${body.budget}.`,
        });
      } else {
        const itinerary = mapToFrontendItinerary(body, cityName, finalState);
        sendEvent("itinerary", { ...itinerary, threadId });
      }

      sendEvent("done", { threadId });
    } catch (streamErr: any) {
      sendEvent("error", { message: streamErr.message || "Planning failed." });
    }

    res.end();
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE 3 — POST /api/plan/feedback  (Milestone 6)
// ═══════════════════════════════════════════════════════════════════════════════

router.post(
  "/plan/feedback",
  validateBody(FeedbackRequestSchema),
  async (req, res, next) => {
    try {
      const { threadId, feedback } = req.body as z.infer<typeof FeedbackRequestSchema>;
      const config = { configurable: { thread_id: threadId } };

      // Resume the existing graph state for this thread
      const snapshot = await compiledGraph.getState(config);
      if (!snapshot.values || !(snapshot.values as any).city) {
        throw new AppError("Session not found. Please start a new planning session.", 404);
      }

      const currentState = snapshot.values as Awaited<ReturnType<typeof compiledGraph.invoke>>;

      logger.info("Applying user feedback", {
        threadId,
        city: currentState.city,
        feedback: feedback.slice(0, 80),
      });

      // Inject feedback and resume from "awaiting_feedback" → interpretFeedback → applyFeedback → validate
      const updateResult = await compiledGraph.invoke(
        {
          userFeedback: feedback,
          status: "awaiting_feedback" as const,
        },
        config,
      );

      if (!updateResult) {
        throw new AppError("Failed to apply feedback.", 500);
      }

      const agentDays = updateResult.days as AgentDayPlan[];
      const totalCost = agentDays.reduce((s, d) => s + d.cost, 0);

      const updatedItinerary = {
        city: updateResult.city,
        totalDays: updateResult.totalDays,
        days: agentDays.map(mapAgentDayToFrontend),
        totalCost,
        budget: updateResult.totalBudget,
        remainingBudget: Math.max(0, updateResult.totalBudget - totalCost),
        localOperatorPercentage: computeLocalOperatorPercentage(agentDays),
        validationResults: updateResult.validationResults ?? [],
        agentDecisions: updateResult.agentDecisions ?? [],
        progressLog: updateResult.progressLog ?? [],
        status: updateResult.status,
      };

      res.status(200).json({
        success: true,
        data: updatedItinerary,
      });
    } catch (err) {
      next(err);
    }
  },
);

export { router as plannerRouter };
