/**
 * Agent Nodes — Autonomous Travel Planning Agent
 *
 * Milestones implemented:
 *   M2  planDayNode               — LLM plans each day with time-slotted schedule
 *   M2  checkBudgetNode           — computes cumulative cost, routes to replan or next day
 *   M2  replanDayNode             — LLM reduces cost for the current day (budget-driven)
 *   M2  advanceDayNode            — increments currentDay, loops back to planDayNode
 *   M3  provider integration      — OTM activities + Amadeus flights injected into prompts
 *   M4  validateItineraryNode     — runs 6 validators, writes ValidationResult[]
 *   M5  autonomousFixNode         — LLM resolves fixable issues without user intervention
 *   M6  interpretFeedbackNode     — parses free-text user feedback into instructions + targets
 *   M6  applyFeedbackNode         — re-plans only the affected days
 *   M7  agentDecisions            — every node appends a human-readable AgentDecision
 *   M8  generateItineraryNode     — computes final stats, produces the finished itinerary
 */

import { ChatOpenAI } from "@langchain/openai";
import { TravelState } from "./state.js";
import type {
  DayPlan,
  ProgressLog,
  AnyActivity,
  ValidationResult,
  ValidationIssue,
  AgentDecision,
  TimeSlot,
} from "./types.js";
import { dataService } from "../services/dataService.js";
import { travelDataProvider } from "../providers/index.js";
import type { NormalizedActivity, NormalizedFlight } from "../providers/index.js";
import type { Activity, Transport } from "../types/index.js";
import { env } from "../config/env.js";

// ─── LLM client ──────────────────────────────────────────────────────────────

const llm = new ChatOpenAI({
  apiKey: env.GROQ_API_KEY,
  configuration: { baseURL: "https://api.groq.com/openai/v1" },
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.2,
}).bind({ response_format: { type: "json_object" } });

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Budget target for the current day based on remaining budget and days left. */
function getTargetBudgetForDay(state: TravelState): number {
  let spentOnOtherDays = 0;
  for (const dp of state.days) {
    if (dp.day !== state.currentDay) spentOnOtherDays += dp.cost;
  }
  const remaining = state.totalBudget - spentOnOtherDays;
  const daysLeft = state.totalDays - state.currentDay + 1;
  return Math.max(0, remaining / daysLeft);
}

function filterTransportByPreference(
  transport: Transport[],
  localTransitTypes: string[],
): Transport[] {
  if (!localTransitTypes.length) return transport;
  const filtered = transport.filter((t) => localTransitTypes.includes(t.type));
  return filtered.length > 0 ? filtered : transport;
}

/** Merge OTM activities with local dataset — OTM entries lead. */
function mergeActivities(
  local: Activity[],
  otm: NormalizedActivity[],
): AnyActivity[] {
  if (otm.length === 0) return local;
  const otmNames = new Set(otm.map((a) => a.name.toLowerCase()));
  return [...otm, ...local.filter((a) => !otmNames.has(a.name.toLowerCase()))];
}

/** User context block injected into every LLM prompt. */
function buildUserContextBlock(state: TravelState): string {
  const opts = state.userOptions;
  const longDistanceTransit =
    state.transitTypes.length > 0 ? state.transitTypes.join(", ") : "any";
  const localTransit =
    state.localTransitTypes?.length > 0
      ? state.localTransitTypes.join(", ")
      : "any available";
  const accommodationPref =
    state.accommodationTypes?.length > 0
      ? state.accommodationTypes.join(", ")
      : "any";

  return `User trip context:
- Departure: ${state.startPlace || "not specified"}
- Destination: ${state.city}
- Start date: ${state.startDate || "flexible"}
- Duration: ${state.totalDays} day(s)
- Total budget: ₹${state.totalBudget.toFixed(0)}
- Travelers: ${state.travelers}
- Travel style: ${state.travelStyle}
- Activity interests: ${state.preferences.join(", ")}
- Long-distance transit: ${longDistanceTransit}
- Local transport preferences: ${localTransit}
- Accommodation preferences: ${accommodationPref}
- Prioritize local operators: ${opts?.prioritizeLocal ?? true}
- Stay under budget: ${opts?.keepUnderBudget ?? true}
- Eco-friendly: ${opts?.ecoFriendly ?? false}`;
}

/** Helper: create a ProgressLog entry. */
function log(
  step: ProgressLog["step"],
  day: number | null,
  message: string,
): ProgressLog {
  return { step, day, message, timestamp: Date.now() };
}

/** Helper: create an AgentDecision entry. */
function decision(
  action: AgentDecision["action"],
  day: number | null,
  reasoning: string,
  costDelta = 0,
): AgentDecision {
  return { timestamp: Date.now(), day, action, reasoning, costDelta };
}

// ─── Flight context builder ───────────────────────────────────────────────────

async function buildFlightContext(
  state: TravelState,
  isFirstDay: boolean,
): Promise<{ text: string; flight: NormalizedFlight | null; flightCost: number }> {
  if (!isFirstDay || !(state.transitTypes ?? []).includes("flight")) {
    return { text: "", flight: null, flightCost: 0 };
  }

  const flights = await travelDataProvider.getFlights({
    origin: state.startPlace,
    destination: state.city,
    departureDate: state.startDate,
    adults: state.travelers ?? 1,
    currency: "INR",
    maxOffers: 3,
  });

  if (flights.length === 0) {
    return {
      text: "\nFlight search: no results for this route/date — plan ground transport only.",
      flight: null,
      flightCost: 0,
    };
  }

  const cheapest = flights.find((f) => f.isCheapest) ?? flights[0] ?? null;
  if (!cheapest) {
    return { text: "", flight: null, flightCost: 0 };
  }
  const flightCost = cheapest.totalPrice;

  let text = `\nAvailable flights (${state.startPlace} → ${state.city}) on ${state.startDate}:\n`;
  text += flights.slice(0, 3).map((f, i) => {
    const s = f.outboundSegments[0];
    return `  ${i + 1}. ${s?.airlineName ?? "?"} ${s?.flightNumber} ` +
      `₹${f.pricePerPerson}/person | ${s?.departureTime} → ${s?.arrivalTime} ` +
      `| ${f.totalOutboundDuration}${f.isCheapest ? " [CHEAPEST]" : ""}`;
  }).join("\n");

  text += `\n\nIMPORTANT: Cheapest flight costs ₹${flightCost} total (${state.travelers} traveler(s)). ` +
    `This MUST be deducted from Day 1 budget BEFORE allocating accommodation and activities.`;

  return { text, flight: cheapest, flightCost };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 1 — planDayNode  (M2 + M3 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function planDayNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const { city, currentDay: day, preferences } = state;
  const isFirstDay = day === 1;

  // ── Data fetching ──────────────────────────────────────────────────────────
  const stays = dataService.getHomestaysByCity(city);
  const guides = dataService.getGuidesByCity(city);
  const transport = filterTransportByPreference(
    dataService.getTransportByCity(city),
    state.localTransitTypes ?? [],
  );

  const otmActivities = await travelDataProvider.getActivities({
    city,
    preferences,
    radiusKm: 15,
    limit: 20,
  });
  const allLocal = dataService.getActivitiesByCity(city);
  const prefLocal =
    preferences.length > 0
      ? dataService.getActivitiesByCityAndPreferences(city, preferences)
      : [];
  const localPool =
    prefLocal.length > 0
      ? [...prefLocal, ...allLocal.filter((a) => !prefLocal.some((p) => p.id === a.id))]
      : allLocal;
  const activities = mergeActivities(localPool, otmActivities);

  const { text: flightText, flight, flightCost } =
    await buildFlightContext(state, isFirstDay);

  if (stays.length === 0) {
    return {
      status: "budget_exceeded_failure",
      progressLog: [log("error", day, `No travel data for city: ${city}`)],
      agentDecisions: [
        decision("plan_day", day, `No data found for ${city} — cannot plan.`),
      ],
    };
  }

  const targetBudget = getTargetBudgetForDay(state) - (isFirstDay ? flightCost : 0);

  const prompt = `You are TripWay's autonomous AI travel planner.
Plan Day ${day} in ${city}. Target budget for today (excluding flight): ₹${targetBudget.toFixed(0)}.

${buildUserContextBlock(state)}
${flightText}

SELECTION RULES:
1. Select exactly one stay (prefer local, isLocal: true). If user specified accommodation preferences, match the category when possible.
2. Optionally select one guide (null if budget is tight).
3. Select exactly one local transport option that matches user's local transport preferences.
4. Select 1–3 activities that match the user's interests: ${state.preferences.join(", ")}.
5. NEVER exceed the target budget of ₹${targetBudget.toFixed(0)}.
6. If budget < ₹3000: omit guide. If < ₹2000: ≤1 cheap activity. If < ₹1600: no activities.
7. Assign each activity a time slot (morning/afternoon/evening) to produce a daily schedule.
8. Prefer activities with isLocal: true.

Available stays:
${JSON.stringify(stays, null, 2)}

Available guides:
${JSON.stringify(guides, null, 2)}

Available transport:
${JSON.stringify(transport, null, 2)}

Available activities (OTM-sourced first — preferred):
${JSON.stringify(activities, null, 2)}

Return ONLY valid JSON:
{
  "stayId": "string",
  "stayCost": number,
  "guideId": "string or null",
  "guideCost": number,
  "transportId": "string",
  "transportCost": number,
  "activityIds": ["string", ...],
  "activitiesCost": number,
  "schedule": [{"time":"09:00","activityId":"string","duration":"2 hours","note":"optional"}],
  "totalComputedCost": number,
  "note": "Brief reason for selections, mentioning local preferences and budget fit."
}`;

  try {
    const response = await llm.invoke([
      { role: "system", content: prompt },
      { role: "user", content: `Plan Day ${day} of my trip to ${city}.` },
    ]);

    const result = JSON.parse(response.content as string);

    const selectedStay = stays.find((s) => s.id === result.stayId) ?? stays[0];
    if (!selectedStay) throw new Error("No stays available");

    const selectedGuide = guides.find((g) => g.id === result.guideId) ?? null;

    const selectedTransport =
      transport.find((t) => t.id === result.transportId) ?? transport[0];
    if (!selectedTransport) throw new Error("No transport available");

    const selectedActivities: AnyActivity[] = [];
    if (Array.isArray(result.activityIds)) {
      for (const id of result.activityIds) {
        const act = activities.find((a) => a.id === id);
        if (act) selectedActivities.push(act);
      }
    }

    const schedule: TimeSlot[] = Array.isArray(result.schedule)
      ? result.schedule.map((s: TimeSlot) => ({
          time: s.time ?? "09:00",
          activityId: s.activityId,
          duration: s.duration ?? "2 hours",
          note: s.note,
        }))
      : [];

    const dayCost =
      selectedStay.pricePerNight +
      (selectedGuide?.pricePerDay ?? 0) +
      selectedTransport.pricePerDay +
      selectedActivities.reduce((s, a) => s + a.price, 0) +
      (isFirstDay ? flightCost : 0);

    const dayPlan: DayPlan = {
      day,
      stay: selectedStay,
      guide: selectedGuide,
      transport: selectedTransport,
      activities: selectedActivities,
      cost: dayCost,
      replanned: false,
      note: result.note ?? "Day planned.",
      schedule,
      flight: isFirstDay ? flight : undefined,
      flightCost: isFirstDay ? flightCost : undefined,
    };

    const updatedDays = [...state.days];
    const idx = updatedDays.findIndex((d) => d.day === day);
    if (idx >= 0) updatedDays[idx] = dayPlan;
    else updatedDays.push(dayPlan);

    const actSource = otmActivities.length > 0
      ? `${otmActivities.length} from OTM + ${localPool.length} local`
      : `${localPool.length} local`;

    return {
      days: updatedDays,
      status: "checking",
      progressLog: [
        log("plan_day", day,
          `Planning Day ${day}: ₹${targetBudget.toFixed(0)} budget. ` +
          `Pool: ${activities.length} activities (${actSource}).`),
        log("plan_day", day,
          `Day ${day} planned. Stay: ${selectedStay.name}, ` +
          `Transport: ${selectedTransport.name}, ` +
          `Guide: ${selectedGuide?.name ?? "none"}, ` +
          `Activities: ${selectedActivities.length}, Cost: ₹${dayCost.toFixed(0)}`),
      ],
      agentDecisions: [
        decision(
          "plan_day", day,
          `Selected ${selectedStay.name} (₹${selectedStay.pricePerNight}/night, local=${selectedStay.isLocal}), ` +
          `${selectedTransport.name} transport, ` +
          `${selectedActivities.length} activities matching [${preferences.join(", ")}]. ` +
          `Total: ₹${dayCost.toFixed(0)}. ${result.note ?? ""}`,
        ),
      ],
    };
  } catch (err: any) {
    return {
      status: "budget_exceeded_failure",
      progressLog: [
        log("plan_day", day, `Planning started for Day ${day}.`),
        log("error", day, `Failed to plan Day ${day}: ${err.message}`),
      ],
      agentDecisions: [
        decision("plan_day", day, `LLM error on Day ${day}: ${err.message}`),
      ],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 2 — checkBudgetNode  (M2 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function checkBudgetNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  if (state.status === "budget_exceeded_failure") {
    return { status: "budget_exceeded_failure" };
  }

  const day = state.currentDay;
  const totalSpent = state.days.reduce((s, d) => s + d.cost, 0);
  const isOver = totalSpent > state.totalBudget;
  const overBy = isOver ? totalSpent - state.totalBudget : 0;

  if (isOver) {
    return {
      spentSoFar: totalSpent,
      overBudgetBy: overBy,
      status: "replanning",
      progressLog: [
        log("check_budget", day,
          `Budget check: spent ₹${totalSpent.toFixed(0)} of ₹${state.totalBudget.toFixed(0)}. ` +
          `Over by ₹${overBy.toFixed(0)} — triggering replan.`),
      ],
      agentDecisions: [
        decision(
          "replan_day", day,
          `Over budget by ₹${overBy.toFixed(0)}. Autonomously replanning Day ${day} to reduce cost.`,
          -overBy,
        ),
      ],
    };
  }

  const nextStatus = day >= state.totalDays ? "validating" : "planning";

  return {
    spentSoFar: totalSpent,
    overBudgetBy: 0,
    status: nextStatus,
    progressLog: [
      log("check_budget", day,
        `Budget check passed. Spent ₹${totalSpent.toFixed(0)} of ₹${state.totalBudget.toFixed(0)}.` +
        (nextStatus === "validating"
          ? " All days planned — moving to validation."
          : ` Advancing to Day ${day + 1}.`)),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 3 — replanDayNode  (M2 + M5 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function replanDayNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const day = state.currentDay;
  const city = state.city;
  const attempts = (state.replanAttempts[day] ?? 0) + 1;
  const replanAttempts = { ...state.replanAttempts, [day]: attempts };

  if (attempts > 3) {
    return {
      replanAttempts,
      status: "budget_exceeded_failure",
      progressLog: [
        log("replan_day", day,
          `Max replan attempts (3) reached for Day ${day}. Cannot fit within budget.`),
      ],
      agentDecisions: [
        decision(
          "replan_day", day,
          `Autonomous replanning exhausted after 3 attempts. Budget constraint cannot be satisfied for Day ${day}.`,
        ),
      ],
    };
  }

  const currentPlan = state.days.find((d) => d.day === day);
  if (!currentPlan) {
    return {
      status: "budget_exceeded_failure",
      progressLog: [log("error", day, `No plan found for Day ${day} during replan.`)],
    };
  }

  const stays = dataService.getHomestaysByCity(city);
  const guides = dataService.getGuidesByCity(city);
  const transport = filterTransportByPreference(
    dataService.getTransportByCity(city),
    state.localTransitTypes ?? [],
  );
  const otmActs = await travelDataProvider.getActivities({
    city,
    preferences: state.preferences,
    radiusKm: 15,
    limit: 20,
  });
  const activities = mergeActivities(dataService.getActivitiesByCity(city), otmActs);

  const reduceBy = state.overBudgetBy;

  const prompt = `You are TripWay's autonomous travel planner in REPLAN mode.
Day ${day} in ${city} is over budget by ₹${reduceBy.toFixed(0)} (attempt ${attempts}/3).

${buildUserContextBlock(state)}

Current Day ${day} plan (₹${currentPlan.cost.toFixed(0)}):
- Stay: ${currentPlan.stay?.name} (₹${currentPlan.stay?.pricePerNight})
- Guide: ${currentPlan.guide?.name ?? "None"} (₹${currentPlan.guide?.pricePerDay ?? 0})
- Transport: ${currentPlan.transport?.name} (₹${currentPlan.transport?.pricePerDay})
- Activities: ${currentPlan.activities.map((a) => `${a.name} ₹${a.price}`).join(", ")}

REPLAN RULES:
1. Reduce total cost by at least ₹${reduceBy.toFixed(0)}.
2. Always prefer local options (isLocal: true). Never swap local for expensive chain.
3. Remove the guide first. Then swap expensive activities for cheaper ones. Then downgrade stay.
4. Return updated schedule matching new activityIds.

Available stays:
${JSON.stringify(stays, null, 2)}

Available guides:
${JSON.stringify(guides, null, 2)}

Available transport:
${JSON.stringify(transport, null, 2)}

Available activities:
${JSON.stringify(activities, null, 2)}

Return ONLY valid JSON:
{
  "stayId": "string",
  "stayCost": number,
  "guideId": "string or null",
  "guideCost": number,
  "transportId": "string",
  "transportCost": number,
  "activityIds": ["string"],
  "activitiesCost": number,
  "schedule": [{"time":"09:00","activityId":"string","duration":"2 hours"}],
  "totalComputedCost": number,
  "note": "Explain what was changed and why."
}`;

  try {
    const response = await llm.invoke([
      { role: "system", content: prompt },
      { role: "user", content: `Replan Day ${day} to fit within budget.` },
    ]);
    const result = JSON.parse(response.content as string);

    const selectedStay = stays.find((s) => s.id === result.stayId) ?? stays[0];
    if (!selectedStay) throw new Error("No stays available");
    const selectedGuide = guides.find((g) => g.id === result.guideId) ?? null;
    const selectedTransport =
      transport.find((t) => t.id === result.transportId) ?? transport[0];
    if (!selectedTransport) throw new Error("No transport");
    const selectedActivities: AnyActivity[] = [];
    if (Array.isArray(result.activityIds)) {
      for (const id of result.activityIds) {
        const a = activities.find((x) => x.id === id);
        if (a) selectedActivities.push(a);
      }
    }
    const schedule: TimeSlot[] = Array.isArray(result.schedule)
      ? result.schedule
      : [];

    const oldCost = currentPlan.cost;
    const newCost =
      selectedStay.pricePerNight +
      (selectedGuide?.pricePerDay ?? 0) +
      selectedTransport.pricePerDay +
      selectedActivities.reduce((s, a) => s + a.price, 0) +
      (currentPlan.flightCost ?? 0);

    const dayPlan: DayPlan = {
      day,
      stay: selectedStay,
      guide: selectedGuide,
      transport: selectedTransport,
      activities: selectedActivities,
      cost: newCost,
      replanned: true,
      note: result.note ?? "Day replanned to reduce cost.",
      schedule,
      flight: currentPlan.flight,
      flightCost: currentPlan.flightCost,
    };

    const updatedDays = [...state.days];
    const idx = updatedDays.findIndex((d) => d.day === day);
    if (idx >= 0) updatedDays[idx] = dayPlan;

    return {
      days: updatedDays,
      replanAttempts,
      status: "checking",
      progressLog: [
        log("replan_day", day,
          `Replanned Day ${day} (attempt ${attempts}/3). ` +
          `Cost: ₹${oldCost.toFixed(0)} → ₹${newCost.toFixed(0)}. ` +
          `Stay: ${selectedStay.name}, Activities: ${selectedActivities.length}`),
      ],
      agentDecisions: [
        decision(
          "replan_day", day,
          `Reduced Day ${day} cost by ₹${(oldCost - newCost).toFixed(0)}. ${result.note ?? ""}`,
          newCost - oldCost,
        ),
      ],
    };
  } catch (err: any) {
    return {
      replanAttempts,
      status: "budget_exceeded_failure",
      progressLog: [log("error", day, `Replan Day ${day} failed: ${err.message}`)],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 4 — advanceDayNode  (M2)
// ═══════════════════════════════════════════════════════════════════════════════

export async function advanceDayNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const next = state.currentDay + 1;
  return {
    currentDay: next,
    status: "planning",
    progressLog: [
      log("advance_day", state.currentDay,
        `Day ${state.currentDay} complete. Advancing to Day ${next}.`),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 5 — validateItineraryNode  (M4 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

/** Run all 6 validators. Pure functions — no LLM call needed. */
export async function validateItineraryNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const results: ValidationResult[] = [
    validateBudget(state),
    validatePreferences(state),
    validateLocalBusiness(state),
    validateSchedule(state),
    validateAvailability(state),
    validateExperienceQuality(state),
  ];

  const allPassed = results.every((r) => r.passed);
  const hasBlockingError = results
    .flatMap((r) => r.issues)
    .some((i) => i.severity === "error");

  const autoFixableIssues = results
    .flatMap((r) => r.issues)
    .filter((i) => i.autoFixable);

  const failedNames = results
    .filter((r) => !r.passed)
    .map((r) => r.validator);

  let statusMsg = "";
  let nextStatus: TravelState["status"] = "success";

  if (allPassed) {
    statusMsg = "All 6 validators passed. Itinerary is ready.";
    nextStatus = state.userFeedback ? "applying_feedback" : "success";
  } else if (autoFixableIssues.length > 0 && state.autoFixAttempts < 5) {
    statusMsg = `${failedNames.join(", ")} failed — ${autoFixableIssues.length} auto-fixable issue(s). Starting autonomous fix.`;
    nextStatus = "auto_fixing";
  } else if (hasBlockingError) {
    statusMsg = `Validation failed on [${failedNames.join(", ")}]. Cannot auto-fix. Requesting user input.`;
    nextStatus = "needs_user_input";
  } else {
    // Only warnings remain — acceptable to finalize
    statusMsg = `Validation warnings on [${failedNames.join(", ")}] — proceeding with recommendations.`;
    nextStatus = state.userFeedback ? "applying_feedback" : "success";
  }

  return {
    validationResults: results,
    status: nextStatus,
    progressLog: [
      log("validate", null,
        `Running 6 constraint validators: ${results.map((r) => `${r.validator}=${r.passed ? "✓" : "✗"}`).join(", ")}`),
      log("validate", null, statusMsg),
    ],
    agentDecisions: [
      decision(
        "validate", null,
        statusMsg +
          (autoFixableIssues.length > 0
            ? ` Auto-fix issues: ${autoFixableIssues.map((i) => i.code).join(", ")}.`
            : ""),
      ),
    ],
  };
}

// ─── Validator implementations ────────────────────────────────────────────────

function validateBudget(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];
  const total = state.days.reduce((s, d) => s + d.cost, 0);
  const remaining = state.totalBudget - total;
  const pct = (total / state.totalBudget) * 100;

  if (total > state.totalBudget) {
    issues.push({
      day: null,
      code: "OVER_BUDGET",
      message: `Total trip cost ₹${total.toFixed(0)} exceeds budget ₹${state.totalBudget.toFixed(0)} by ₹${(total - state.totalBudget).toFixed(0)}.`,
      severity: "error",
      autoFixable: true,
      fixHint: "Identify the most expensive day and reduce its activities or downgrade stay.",
    });
  } else if (pct > 90) {
    issues.push({
      day: null,
      code: "BUDGET_TIGHT",
      message: `Using ${pct.toFixed(0)}% of budget (₹${remaining.toFixed(0)} remaining). Consider removing one activity for a buffer.`,
      severity: "warning",
      autoFixable: false,
    });
  }

  // Check for days with highly unequal spending
  const avgPerDay = total / state.totalDays;
  for (const d of state.days) {
    if (d.cost > avgPerDay * 1.8) {
      issues.push({
        day: d.day,
        code: "UNEQUAL_SPENDING",
        message: `Day ${d.day} costs ₹${d.cost.toFixed(0)}, which is ${((d.cost / avgPerDay - 1) * 100).toFixed(0)}% above average. Consider balancing.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Reduce activities on Day ${d.day} to balance the daily budget distribution.`,
      });
    }
  }

  return { validator: "budget", passed: issues.every((i) => i.severity !== "error"), issues };
}

function validatePreferences(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];
  const prefs = state.preferences.map((p) => p.toLowerCase());

  for (const d of state.days) {
    const actCategories = d.activities.map((a) => a.category.toLowerCase());
    const matched = prefs.some((pref) =>
      actCategories.some((cat) => cat.includes(pref) || pref.includes(cat)),
    );

    if (d.activities.length > 0 && !matched) {
      issues.push({
        day: d.day,
        code: "PREFERENCE_MISMATCH",
        message: `Day ${d.day} activities [${d.activities.map((a) => a.name).join(", ")}] do not match interests [${state.preferences.join(", ")}].`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Replace Day ${d.day} activities with ones matching: ${state.preferences.join(", ")}.`,
      });
    }
  }

  if (state.preferences.length === 0) {
    issues.push({
      day: null,
      code: "NO_PREFERENCES",
      message: "No activity preferences specified — cannot validate preference alignment.",
      severity: "warning",
      autoFixable: false,
    });
  }

  return {
    validator: "preference",
    passed: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

function validateLocalBusiness(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const d of state.days) {
    const chainActivities = d.activities.filter((a) => !a.isLocal);
    if (chainActivities.length > 0 && state.userOptions?.prioritizeLocal) {
      issues.push({
        day: d.day,
        code: "NON_LOCAL_ACTIVITY",
        message: `Day ${d.day} includes ${chainActivities.length} non-local activity(ies): ${chainActivities.map((a) => a.name).join(", ")}.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Replace non-local activities on Day ${d.day} with isLocal: true alternatives.`,
      });
    }
    if (d.stay && !d.stay.isLocal && state.userOptions?.prioritizeLocal) {
      issues.push({
        day: d.day,
        code: "NON_LOCAL_STAY",
        message: `Day ${d.day} stay "${d.stay.name}" is not a local operator.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Replace stay on Day ${d.day} with a local homestay.`,
      });
    }
  }

  const totalActivities = state.days.flatMap((d) => d.activities).length;
  const localActivities = state.days
    .flatMap((d) => d.activities)
    .filter((a) => a.isLocal).length;

  const localPct = totalActivities > 0 ? (localActivities / totalActivities) * 100 : 100;
  if (state.userOptions?.prioritizeLocal && localPct < 50) {
    issues.push({
      day: null,
      code: "LOW_LOCAL_PERCENTAGE",
      message: `Only ${localPct.toFixed(0)}% of activities are from local operators. Target is >50%.`,
      severity: "warning",
      autoFixable: true,
      fixHint: "Replace chain-operated activities with local alternatives.",
    });
  }

  return { validator: "local_business", passed: issues.every((i) => i.severity !== "error"), issues };
}

function validateSchedule(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const d of state.days) {
    // Check activity overload — more than 4 activities in a day is impractical
    if (d.activities.length > 4) {
      issues.push({
        day: d.day,
        code: "DAY_OVERLOADED",
        message: `Day ${d.day} has ${d.activities.length} activities — may be too many to complete comfortably.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Remove ${d.activities.length - 3} activity(ies) from Day ${d.day}.`,
      });
    }

    // Check for empty days (no activities and no guide)
    if (d.activities.length === 0 && !d.guide) {
      issues.push({
        day: d.day,
        code: "EMPTY_DAY",
        message: `Day ${d.day} has no activities and no guide — the traveler has nothing planned.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Add at least one free or low-cost activity to Day ${d.day}.`,
      });
    }
  }

  return { validator: "schedule", passed: issues.every((i) => i.severity !== "error"), issues };
}

function validateAvailability(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Flight availability check
  if (
    state.transitTypes?.includes("flight") &&
    state.days.length > 0 &&
    !state.days[0]!.flight
  ) {
    issues.push({
      day: 1,
      code: "NO_FLIGHT_FOUND",
      message: `User selected flight transit but no flight was found for ${state.startPlace} → ${state.city} on ${state.startDate}.`,
      severity: "warning",
      autoFixable: false,
    });
  }

  // Missing stays
  for (const d of state.days) {
    if (!d.stay) {
      issues.push({
        day: d.day,
        code: "NO_STAY",
        message: `Day ${d.day} has no accommodation assigned.`,
        severity: "error",
        autoFixable: true,
        fixHint: `Assign a stay to Day ${d.day}.`,
      });
    }
    if (!d.transport) {
      issues.push({
        day: d.day,
        code: "NO_TRANSPORT",
        message: `Day ${d.day} has no transport assigned.`,
        severity: "error",
        autoFixable: true,
        fixHint: `Assign a transport option to Day ${d.day}.`,
      });
    }
  }

  return { validator: "availability", passed: issues.every((i) => i.severity !== "error"), issues };
}

function validateExperienceQuality(state: TravelState): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Repetitive activities — same category appearing on 3+ consecutive days
  for (let i = 2; i < state.days.length; i++) {
    const d0 = state.days[i - 2]!;
    const d1 = state.days[i - 1]!;
    const d2 = state.days[i]!;

    const cats0 = d0.activities.map((a) => a.category);
    const cats1 = d1.activities.map((a) => a.category);
    const cats2 = d2.activities.map((a) => a.category);

    const repeated = cats0.filter(
      (c) => cats1.includes(c) && cats2.includes(c),
    );
    if (repeated.length > 0) {
      issues.push({
        day: d2.day,
        code: "REPETITIVE_ACTIVITIES",
        message: `Category "${repeated[0]}" appears on 3 consecutive days (${d0.day}, ${d1.day}, ${d2.day}). Consider adding variety.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Replace one activity on Day ${d2.day} with a different category.`,
      });
    }
  }

  // Check activity rating quality
  for (const d of state.days) {
    const lowRated = d.activities.filter((a) => a.rating > 0 && a.rating < 3.0);
    if (lowRated.length > 0) {
      issues.push({
        day: d.day,
        code: "LOW_RATED_ACTIVITY",
        message: `Day ${d.day} includes low-rated activity(ies): ${lowRated.map((a) => `${a.name} (${a.rating}★)`).join(", ")}.`,
        severity: "warning",
        autoFixable: true,
        fixHint: `Replace low-rated activities on Day ${d.day} with higher-rated alternatives.`,
      });
    }
  }

  return {
    validator: "experience_quality",
    passed: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 6 — autonomousFixNode  (M5 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function autonomousFixNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const newAttempts = state.autoFixAttempts + 1;

  // Collect all auto-fixable issues
  const fixable = state.validationResults
    .flatMap((r) => r.issues)
    .filter((i) => i.autoFixable && i.severity !== "error" ? true : i.autoFixable);

  if (fixable.length === 0 || newAttempts > 5) {
    return {
      autoFixAttempts: newAttempts,
      status: "validating",
      progressLog: [
        log("auto_fix", null,
          newAttempts > 5
            ? "Max auto-fix attempts (5) reached. Proceeding with best available itinerary."
            : "No fixable issues found. Re-running validation."),
      ],
    };
  }

  // Group issues by day
  const issuesByDay = new Map<number | null, ValidationIssue[]>();
  for (const issue of fixable) {
    const key = issue.day;
    if (!issuesByDay.has(key)) issuesByDay.set(key, []);
    issuesByDay.get(key)!.push(issue);
  }

  const updatedDays = [...state.days];
  const decisions: AgentDecision[] = [];
  const logs: ProgressLog[] = [
    log("auto_fix", null,
      `Autonomous fix attempt ${newAttempts}/5. Fixing ${fixable.length} issue(s) on ${issuesByDay.size} day(s).`),
  ];

  // Fix each affected day
  for (const [dayKey, issues] of issuesByDay) {
    if (dayKey === null) continue; // trip-level issues handled elsewhere

    const currentPlan = updatedDays.find((d) => d.day === dayKey);
    if (!currentPlan) continue;

    const issueDescriptions = issues.map((i) => `[${i.code}] ${i.message}`).join("\n");
    const fixHints = issues
      .map((i) => i.fixHint)
      .filter(Boolean)
      .join(". ");

    const activities = mergeActivities(
      dataService.getActivitiesByCity(state.city),
      await travelDataProvider.getActivities({
        city: state.city,
        preferences: state.preferences,
        radiusKm: 15,
        limit: 20,
      }),
    );
    const stays = dataService.getHomestaysByCity(state.city);
    const guides = dataService.getGuidesByCity(state.city);
    const transport = filterTransportByPreference(
      dataService.getTransportByCity(state.city),
      state.localTransitTypes ?? [],
    );

    const targetBudget = getTargetBudgetForDay({
      ...state,
      currentDay: dayKey,
    } as TravelState);

    const prompt = `You are TripWay's autonomous fix agent.
The following validation issues were detected for Day ${dayKey}:

${issueDescriptions}

Fix hints:
${fixHints}

${buildUserContextBlock(state)}

Current Day ${dayKey} plan:
- Stay: ${currentPlan.stay?.name ?? "none"} (₹${currentPlan.stay?.pricePerNight ?? 0})
- Guide: ${currentPlan.guide?.name ?? "none"} (₹${currentPlan.guide?.pricePerDay ?? 0})
- Transport: ${currentPlan.transport?.name ?? "none"}
- Activities: ${currentPlan.activities.map((a) => `${a.name} (${a.category})`).join(", ")}
- Day total: ₹${currentPlan.cost.toFixed(0)}

Budget target for this day: ₹${targetBudget.toFixed(0)}

Available options:
Stays: ${JSON.stringify(stays.slice(0, 5), null, 2)}
Activities: ${JSON.stringify(activities.slice(0, 15), null, 2)}
Transport: ${JSON.stringify(transport.slice(0, 4), null, 2)}

Return ONLY valid JSON:
{
  "stayId": "string",
  "guideId": "string or null",
  "transportId": "string",
  "activityIds": ["string"],
  "schedule": [{"time":"09:00","activityId":"string","duration":"2 hours"}],
  "totalComputedCost": number,
  "reasoning": "Explain each fix made and why it resolves the issue."
}`;

    try {
      const response = await llm.invoke([
        { role: "system", content: prompt },
        { role: "user", content: `Fix the issues on Day ${dayKey}.` },
      ]);
      const fix = JSON.parse(response.content as string);

      const newStay = stays.find((s) => s.id === fix.stayId) ?? currentPlan.stay;
      const newGuide = guides.find((g) => g.id === fix.guideId) ?? null;
      const newTransport =
        transport.find((t) => t.id === fix.transportId) ?? currentPlan.transport;
      const newActivities: AnyActivity[] = [];
      if (Array.isArray(fix.activityIds)) {
        for (const id of fix.activityIds) {
          const a = activities.find((x) => x.id === id);
          if (a) newActivities.push(a);
        }
      }
      const newSchedule: TimeSlot[] = Array.isArray(fix.schedule) ? fix.schedule : [];

      const oldCost = currentPlan.cost;
      const newCost =
        (newStay?.pricePerNight ?? 0) +
        (newGuide?.pricePerDay ?? 0) +
        (newTransport?.pricePerDay ?? 0) +
        newActivities.reduce((s, a) => s + a.price, 0) +
        (currentPlan.flightCost ?? 0);

      const fixedPlan: DayPlan = {
        ...currentPlan,
        stay: newStay ?? currentPlan.stay,
        guide: newGuide,
        transport: newTransport ?? currentPlan.transport,
        activities: newActivities.length > 0 ? newActivities : currentPlan.activities,
        cost: newCost,
        replanned: true,
        note: fix.reasoning ?? "Autonomously fixed by constraint validator.",
        schedule: newSchedule.length > 0 ? newSchedule : currentPlan.schedule,
      };

      const idx = updatedDays.findIndex((d) => d.day === dayKey);
      if (idx >= 0) updatedDays[idx] = fixedPlan;

      logs.push(log("auto_fix", dayKey,
        `Fixed Day ${dayKey}: cost ₹${oldCost.toFixed(0)} → ₹${newCost.toFixed(0)}. ${fix.reasoning ?? ""}`));

      decisions.push(
        decision(
          "auto_fix", dayKey,
          `Auto-fixed issues [${issues.map((i) => i.code).join(", ")}] on Day ${dayKey}. ${fix.reasoning ?? ""}`,
          newCost - oldCost,
        ),
      );
    } catch (err: any) {
      logs.push(log("auto_fix", dayKey, `Fix attempt failed for Day ${dayKey}: ${err.message}`));
    }
  }

  return {
    days: updatedDays,
    autoFixAttempts: newAttempts,
    status: "validating",  // re-run validators after fix
    progressLog: logs,
    agentDecisions: decisions,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 7 — interpretFeedbackNode  (M6 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function interpretFeedbackNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const feedback = state.userFeedback.trim();
  if (!feedback) {
    return {
      status: "success",
      progressLog: [log("feedback", null, "No user feedback — finalizing itinerary.")],
    };
  }

  const itinerarySummary = state.days
    .map(
      (d) =>
        `Day ${d.day}: Stay=${d.stay?.name ?? "?"}, ` +
        `Activities=[${d.activities.map((a) => `${a.name}(${a.category})`).join(", ")}], ` +
        `Cost=₹${d.cost.toFixed(0)}`,
    )
    .join("\n");

  const prompt = `You are TripWay's feedback interpreter.

The user has reviewed their ${state.totalDays}-day trip itinerary to ${state.city} and left the following feedback:

"${feedback}"

Current itinerary:
${itinerarySummary}

Your task:
1. Identify which day(s) need to be changed based on the feedback.
2. Produce specific, actionable instructions for the re-planning node.

Return ONLY valid JSON:
{
  "targetDays": [1, 3],
  "instructions": "Concise instructions for re-planner: what to add, remove, or change. Be specific about categories, costs, and local preference.",
  "reasoning": "Why these days were selected and what the user seems to want."
}`;

  try {
    const response = await llm.invoke([
      { role: "system", content: prompt },
      { role: "user", content: feedback },
    ]);
    const result = JSON.parse(response.content as string);

    const targetDays: number[] = Array.isArray(result.targetDays)
      ? result.targetDays.filter((d: unknown) => typeof d === "number")
      : state.days.map((d) => d.day); // fallback: all days

    return {
      feedbackTargetDays: targetDays,
      feedbackInstructions: result.instructions ?? feedback,
      status: "applying_feedback",
      progressLog: [
        log("feedback", null,
          `Feedback interpreted. Affected days: [${targetDays.join(", ")}]. ` +
          `Instructions: "${result.instructions ?? feedback}"`),
      ],
      agentDecisions: [
        decision(
          "interpret_feedback", null,
          `User feedback: "${feedback}". Identified ${targetDays.length} day(s) to update. ${result.reasoning ?? ""}`,
        ),
      ],
    };
  } catch (err: any) {
    return {
      feedbackTargetDays: state.days.map((d) => d.day),
      feedbackInstructions: feedback,
      status: "applying_feedback",
      progressLog: [
        log("feedback", null,
          `Feedback parsing failed (${err.message}). Using raw feedback as instructions for all days.`),
      ],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 8 — applyFeedbackNode  (M6 + M7)
// ═══════════════════════════════════════════════════════════════════════════════

export async function applyFeedbackNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  const { feedbackTargetDays, feedbackInstructions, city } = state;

  if (!feedbackTargetDays.length) {
    return {
      userFeedback: "",
      feedbackTargetDays: [],
      feedbackInstructions: "",
      status: "validating",
      progressLog: [log("feedback", null, "No target days for feedback application.")],
    };
  }

  const updatedDays = [...state.days];
  const logs: ProgressLog[] = [
    log("feedback", null,
      `Applying feedback to Day(s) [${feedbackTargetDays.join(", ")}]: "${feedbackInstructions}"`),
  ];
  const decisions: AgentDecision[] = [];

  const activities = mergeActivities(
    dataService.getActivitiesByCity(city),
    await travelDataProvider.getActivities({
      city,
      preferences: state.preferences,
      radiusKm: 15,
      limit: 20,
    }),
  );
  const stays = dataService.getHomestaysByCity(city);
  const guides = dataService.getGuidesByCity(city);
  const transport = filterTransportByPreference(
    dataService.getTransportByCity(city),
    state.localTransitTypes ?? [],
  );

  for (const dayNum of feedbackTargetDays) {
    const currentPlan = updatedDays.find((d) => d.day === dayNum);
    if (!currentPlan) continue;

    const targetBudget = getTargetBudgetForDay({
      ...state,
      currentDay: dayNum,
    } as TravelState);

    const prompt = `You are TripWay's travel planner applying user feedback.

User feedback: "${state.userFeedback}"
Specific instructions for Day ${dayNum}: "${feedbackInstructions}"

${buildUserContextBlock(state)}

Current Day ${dayNum} plan:
- Stay: ${currentPlan.stay?.name ?? "none"} (₹${currentPlan.stay?.pricePerNight ?? 0})
- Guide: ${currentPlan.guide?.name ?? "none"}
- Activities: ${currentPlan.activities.map((a) => `${a.name}(${a.category})`).join(", ")}
- Cost: ₹${currentPlan.cost.toFixed(0)}
- Budget target: ₹${targetBudget.toFixed(0)}

Apply the user's instructions. Preserve elements not mentioned in the feedback.

Available stays:
${JSON.stringify(stays.slice(0, 5), null, 2)}
Available activities:
${JSON.stringify(activities.slice(0, 15), null, 2)}
Available transport:
${JSON.stringify(transport.slice(0, 4), null, 2)}

Return ONLY valid JSON:
{
  "stayId": "string",
  "guideId": "string or null",
  "transportId": "string",
  "activityIds": ["string"],
  "schedule": [{"time":"09:00","activityId":"string","duration":"2 hours"}],
  "totalComputedCost": number,
  "note": "Explain what was changed to satisfy the feedback."
}`;

    try {
      const response = await llm.invoke([
        { role: "system", content: prompt },
        { role: "user", content: `Apply feedback to Day ${dayNum}.` },
      ]);
      const result = JSON.parse(response.content as string);

      const newStay = stays.find((s) => s.id === result.stayId) ?? currentPlan.stay;
      const newGuide = guides.find((g) => g.id === result.guideId) ?? null;
      const newTransport =
        transport.find((t) => t.id === result.transportId) ?? currentPlan.transport;
      const newActivities: AnyActivity[] = [];
      if (Array.isArray(result.activityIds)) {
        for (const id of result.activityIds) {
          const a = activities.find((x) => x.id === id);
          if (a) newActivities.push(a);
        }
      }
      const newSchedule: TimeSlot[] = Array.isArray(result.schedule) ? result.schedule : [];

      const oldCost = currentPlan.cost;
      const newCost =
        (newStay?.pricePerNight ?? 0) +
        (newGuide?.pricePerDay ?? 0) +
        (newTransport?.pricePerDay ?? 0) +
        newActivities.reduce((s, a) => s + a.price, 0) +
        (currentPlan.flightCost ?? 0);

      const idx = updatedDays.findIndex((d) => d.day === dayNum);
      if (idx >= 0) {
        updatedDays[idx] = {
          ...currentPlan,
          stay: newStay ?? currentPlan.stay,
          guide: newGuide,
          transport: newTransport ?? currentPlan.transport,
          activities: newActivities.length > 0 ? newActivities : currentPlan.activities,
          cost: newCost,
          replanned: true,
          note: result.note ?? "Updated based on user feedback.",
          schedule: newSchedule.length > 0 ? newSchedule : currentPlan.schedule,
        };
      }

      logs.push(log("feedback", dayNum,
        `Day ${dayNum} updated. Cost ₹${oldCost.toFixed(0)} → ₹${newCost.toFixed(0)}. ${result.note ?? ""}`));

      decisions.push(
        decision(
          "apply_feedback", dayNum,
          `Applied user feedback to Day ${dayNum}: "${feedbackInstructions}". ${result.note ?? ""}`,
          newCost - oldCost,
        ),
      );
    } catch (err: any) {
      logs.push(log("error", dayNum,
        `Failed to apply feedback to Day ${dayNum}: ${err.message}`));
    }
  }

  return {
    days: updatedDays,
    userFeedback: "",           // clear after applying
    feedbackTargetDays: [],
    feedbackInstructions: "",
    status: "validating",       // re-validate after feedback
    progressLog: logs,
    agentDecisions: decisions,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE 9 — generateItineraryNode  (M7 + M8)
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateItineraryNode(
  state: TravelState,
): Promise<Partial<TravelState>> {
  let localSpend = 0;
  let chainSpend = 0;

  for (const d of state.days) {
    const stayAmt = d.stay?.pricePerNight ?? 0;
    if (d.stay?.isLocal) localSpend += stayAmt;
    else chainSpend += stayAmt;

    const guideAmt = d.guide?.pricePerDay ?? 0;
    if (d.guide?.isLocal) localSpend += guideAmt;
    else chainSpend += guideAmt;

    const transAmt = d.transport?.pricePerDay ?? 0;
    if (d.transport?.isLocal) localSpend += transAmt;
    else chainSpend += transAmt;

    for (const act of d.activities) {
      if (act.isLocal) localSpend += act.price;
      else chainSpend += act.price;
    }
  }

  const totalSpent = localSpend + chainSpend;
  const localPct = totalSpent > 0 ? (localSpend / totalSpent) * 100 : 0;
  const isFailure = state.status === "budget_exceeded_failure";

  const validationSummary =
    state.validationResults.length > 0
      ? state.validationResults
          .map((r) => `${r.validator}: ${r.passed ? "✓" : `✗ (${r.issues.length} issue(s))`}`)
          .join(" | ")
      : "not run";

  const decisionCount = state.agentDecisions.length;

  return {
    status: isFailure ? "budget_exceeded_failure" : "success",
    progressLog: [
      log("final", null,
        isFailure
          ? `Planning failed: Cannot fit trip within ₹${state.totalBudget.toFixed(0)}. Best attempt: ₹${totalSpent.toFixed(0)}.`
          : `Itinerary complete! ₹${totalSpent.toFixed(0)} / ₹${state.totalBudget.toFixed(0)} ` +
            `(${((totalSpent / state.totalBudget) * 100).toFixed(0)}% used). ` +
            `Local spend: ${localPct.toFixed(0)}%. ` +
            `Validation: ${validationSummary}. ` +
            `Agent made ${decisionCount} autonomous decision(s).`),
    ],
    agentDecisions: [
      decision(
        "finalize", null,
        `Trip finalized. Total: ₹${totalSpent.toFixed(0)}, local: ${localPct.toFixed(0)}%, ` +
        `autonomous decisions: ${decisionCount}. Validation: ${validationSummary}.`,
      ),
    ],
  };
}
