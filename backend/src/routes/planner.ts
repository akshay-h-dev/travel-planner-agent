/**
 * Planner route — POST /api/plan
 *
 * Accepts user trip parameters, invokes the LangGraph agent,
 * and maps the result to the frontend Itinerary shape.
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
  type Activity,
  type Transport,
  type Guide,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

const router = Router();

const PLAN_TIMEOUT_MS = 120_000;

/** Resolve a frontend city slug (e.g. "goa") to the canonical city name ("Goa"). */
function resolveCityName(cityInput: string): string {
  const trimmed = cityInput.trim();

  // Direct name match (case-insensitive)
  const byName = dataService.getCityByName(trimmed);
  if (byName) return byName.name;

  // Match against city id patterns like "city_goa" or bare slug "goa"
  const slug = trimmed.toLowerCase().replace(/^city_/, "");
  const allCities = dataService.getAllCities();
  const bySlug = allCities.find(
    (c) =>
      c.id.toLowerCase() === `city_${slug}` ||
      c.id.toLowerCase() === slug ||
      c.name.toLowerCase() === slug,
  );
  if (bySlug) return bySlug.name;

  throw new AppError(
    `Unknown city "${cityInput}". Please select a supported destination.`,
    400,
  );
}

/** Enrich backend entities with frontend-required display fields. */
function enrichHomestay(stay: Homestay) {
  return {
    ...stay,
    imageUrl:
      (stay as Homestay & { imageUrl?: string }).imageUrl ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  };
}

function enrichActivity(activity: Activity) {
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

function mapToFrontendItinerary(
  city: string,
  budget: number,
  days: number,
  preferences: string[],
  travelers: number,
  travelStyle: string,
  agentDays: AgentDayPlan[],
) {
  const totalCost = agentDays.reduce((sum, d) => sum + d.cost, 0);

  return {
    id: uuidv4(),
    city,
    totalDays: days,
    days: agentDays.map(mapAgentDayToFrontend),
    totalCost,
    budget,
    remainingBudget: Math.max(0, budget - totalCost),
    localOperatorPercentage: computeLocalOperatorPercentage(agentDays),
    preferences,
    travelers,
    travelStyle,
  };
}

router.post("/plan", validateBody(PlanRequestSchema), async (req, res, next) => {
  try {
    const body = req.body as PlanRequest;
    const cityName = resolveCityName(body.city);

    // Ensure the city has dataset coverage before invoking the LLM
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
      travelers: body.travelers,
      travelStyle: body.travelStyle,
    });

    const threadId = uuidv4();
    const config = { configurable: { thread_id: threadId } };

    const invokePromise = compiledGraph.invoke(
      {
        city: cityName,
        totalDays: body.days,
        totalBudget: body.budget,
        preferences: body.preferences,
        currentDay: 1,
        days: [],
        spentSoFar: 0,
        overBudgetBy: 0,
        replanAttempts: {},
        progressLog: [],
        status: "planning" as const,
      },
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
            `Unable to fit a ${body.days}-day trip to ${cityName} within ₹${body.budget}. Try increasing your budget.`,
          statusCode: 422,
        },
      });
      return;
    }

    const itinerary = mapToFrontendItinerary(
      cityName,
      body.budget,
      body.days,
      body.preferences,
      body.travelers,
      body.travelStyle,
      finalState.days,
    );

    logger.info("Trip planned successfully", {
      city: cityName,
      totalCost: itinerary.totalCost,
      days: itinerary.totalDays,
    });

    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (err) {
    next(err);
  }
});

export { router as plannerRouter };
