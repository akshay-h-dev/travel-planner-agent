import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { TravelState } from "./state.js";
import { DayPlan, ProgressLog } from "./types.js";
import {
  getStays,
  getGuides,
  getTransport,
  getActivities,
  Activity,
} from "../data/dataService.js";

dotenv.config();

// Initialize the ChatOpenAI client pointing to Groq's API endpoint
// Use a secure environment variable for the API key to prevent hardcoding secrets.
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GROQ_API_KEY is not defined in the environment variables.");
}

const llm = new ChatOpenAI({
  apiKey: apiKey,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.1,
}).bind({
  response_format: { type: "json_object" },
});

/**
 * Helper to compute the target budget for a given day
 */
function getTargetBudgetForDay(state: TravelState): number {
  const currentDay = state.currentDay;
  const totalDays = state.totalDays;
  const totalBudget = state.totalBudget;

  // Calculate what has been spent on *other* days so far
  let spentOnOtherDays = 0;
  for (const dp of state.days) {
    if (dp.day !== currentDay) {
      spentOnOtherDays += dp.cost;
    }
  }

  const remainingBudget = totalBudget - spentOnOtherDays;
  const remainingDays = totalDays - currentDay + 1;

  return Math.max(0, remainingBudget / remainingDays);
}

/**
 * 1. planDayNode: Plans the day-wise itinerary for the current day.
 */
export async function planDayNode(state: TravelState): Promise<Partial<TravelState>> {
  const city = state.city;
  const day = state.currentDay;
  const preferences = state.preferences;
  
  const stays = getStays(city);
  const guides = getGuides(city);
  const transport = getTransport(city);
  const activities = getActivities(city);

  if (stays.length === 0) {
    const errorLog: ProgressLog = {
      step: "error",
      day,
      message: `No travel details found for destination city: ${city}`,
      timestamp: Date.now(),
    };
    return {
      status: "budget_exceeded_failure",
      progressLog: [errorLog],
    };
  }

  const targetBudget = getTargetBudgetForDay(state);

  const planLog: ProgressLog = {
    step: "plan_day",
    day,
    message: `Planning Day ${day} for ${city}. Target budget: $${targetBudget.toFixed(2)}. Preferences: [${preferences.join(", ")}]`,
    timestamp: Date.now(),
  };

  const systemPrompt = `You are TripWay's AI travel planner. Your task is to plan the itinerary for Day ${day} in ${city}.
Target budget for this day: $${targetBudget.toFixed(2)}.
User preferences: ${preferences.join(", ")}.

Your selection guidelines:
1. You must select exactly one stay from the available list.
2. You can optionally select one guide from the available list (or null if not needed).
3. You must select exactly one transport option from the available list.
4. You can select one or more activities from the available list.
5. CRITICAL: You must prefer verified local options (type: 'local') over aggregator/chain options (type: 'chain'). Only choose a chain option if no local option fits the user's budget.

Available stays:
${JSON.stringify(stays, null, 2)}

Available guides:
${JSON.stringify(guides, null, 2)}

Available transport:
${JSON.stringify(transport, null, 2)}

Available activities:
${JSON.stringify(activities, null, 2)}

You must return a valid JSON object matching the following structure:
{
  "stayId": "id_of_selected_stay",
  "guideId": "id_of_selected_guide_or_null",
  "transportId": "id_of_selected_transport",
  "activityIds": ["id_of_selected_activity_1", "id_of_selected_activity_2"],
  "note": "Reason for selection, explaining how it fits budget and preferences, and why local options were selected."
}`;

  try {
    const response = await llm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please plan Day ${day} of my trip.` },
    ]);

    const result = JSON.parse(response.content as string);

    // Resolve selections from DB (safeguard against hallucination)
    const defaultStay = stays[0];
    if (!defaultStay) {
      throw new Error("No stays available");
    }
    const selectedStay = stays.find((s) => s.id === result.stayId) || defaultStay;

    const selectedGuide = guides.find((g) => g.id === result.guideId) || null;

    const defaultTransport = transport[0];
    if (!defaultTransport) {
      throw new Error("No transport options available");
    }
    const selectedTransport = transport.find((t) => t.id === result.transportId) || defaultTransport;
    const selectedActivities: Activity[] = [];
    if (Array.isArray(result.activityIds)) {
      for (const id of result.activityIds) {
        const act = activities.find((a) => a.id === id);
        if (act) selectedActivities.push(act);
      }
    }

    // Compute costs
    const stayCost = selectedStay.costPerNight;
    const guideCost = selectedGuide ? selectedGuide.costPerDay : 0;
    const transCost = selectedTransport.costPerDay;
    const actCost = selectedActivities.reduce((sum, a) => sum + a.cost, 0);
    const totalDayCost = stayCost + guideCost + transCost + actCost;

    const dayPlan: DayPlan = {
      day,
      stay: selectedStay,
      guide: selectedGuide,
      transport: selectedTransport,
      activities: selectedActivities,
      cost: totalDayCost,
      replanned: false,
      note: result.note || "Day planned successfully.",
    };

    // Replace the plan for the current day if it exists, or append it
    const updatedDays = [...state.days];
    const dayIndex = updatedDays.findIndex((d) => d.day === day);
    if (dayIndex >= 0) {
      updatedDays[dayIndex] = dayPlan;
    } else {
      updatedDays.push(dayPlan);
    }

    return {
      days: updatedDays,
      status: "checking",
      progressLog: [
        planLog,
        {
          step: "plan_day",
          day,
          message: `Day ${day} planned. Selection: Stay: ${selectedStay.name}, Transport: ${selectedTransport.name}, Guide: ${selectedGuide ? selectedGuide.name : "None"}, Activities Count: ${selectedActivities.length}. Cost: $${totalDayCost}`,
          timestamp: Date.now(),
        },
      ],
    };
  } catch (error: any) {
    console.error("Error in planDayNode:", error);
    return {
      status: "budget_exceeded_failure",
      progressLog: [
        planLog,
        {
          step: "error",
          day,
          message: `Failed to plan Day ${day}: ${error.message || error}`,
          timestamp: Date.now(),
        },
      ],
    };
  }
}

/**
 * 2. checkBudgetNode: Calculates the cumulative cost and branches based on budget.
 */
export async function checkBudgetNode(state: TravelState): Promise<Partial<TravelState>> {
  if (state.status === "budget_exceeded_failure") {
    return { status: "budget_exceeded_failure" };
  }
  const currentDay = state.currentDay;
  
  // Always compute spentSoFar fresh from the array to avoid incremental math double-counting bugs
  let totalSpent = 0;
  for (const d of state.days) {
    totalSpent += d.cost;
  }

  const checkLog: ProgressLog = {
    step: "check_budget",
    day: currentDay,
    message: `Checking budget: spent $${totalSpent.toFixed(2)} of $${state.totalBudget.toFixed(2)} so far.`,
    timestamp: Date.now(),
  };

  const isOverBudget = totalSpent > state.totalBudget;
  const overBudgetBy = isOverBudget ? totalSpent - state.totalBudget : 0;

  if (isOverBudget) {
    return {
      spentSoFar: totalSpent,
      overBudgetBy,
      status: "replanning",
      progressLog: [
        checkLog,
        {
          step: "check_budget",
          day: currentDay,
          message: `Budget Exceeded by $${overBudgetBy.toFixed(2)}. Initiating replanning node...`,
          timestamp: Date.now(),
        },
      ],
    };
  } else {
    return {
      spentSoFar: totalSpent,
      overBudgetBy: 0,
      status: currentDay >= state.totalDays ? "success" : "planning",
      progressLog: [
        checkLog,
        {
          step: "check_budget",
          day: currentDay,
          message: `Budget Check Passed. Spending is within limits.`,
          timestamp: Date.now(),
        },
      ],
    };
  }
}

/**
 * 3. replanDayNode: Replans the current day's itinerary to fit within budget constraint.
 */
export async function replanDayNode(state: TravelState): Promise<Partial<TravelState>> {
  const day = state.currentDay;
  const city = state.city;
  const currentAttempts = state.replanAttempts[day] || 0;
  const newAttempts = currentAttempts + 1;

  const replanAttempts = { ...state.replanAttempts, [day]: newAttempts };

  // Fail gracefully if replanning loops too many times to prevent infinite billing/usage
  if (newAttempts > 3) {
    return {
      replanAttempts,
      status: "budget_exceeded_failure",
      progressLog: [
        {
          step: "replan_day",
          day,
          message: `Max replanning attempts (3) exceeded for Day ${day}. Cannot fit the remaining itinerary into the budget.`,
          timestamp: Date.now(),
        },
      ],
    };
  }

  const replanLog: ProgressLog = {
    step: "replan_day",
    day,
    message: `Replanning Day ${day} (Attempt ${newAttempts}/3). Need to reduce costs. Over budget by: $${state.overBudgetBy.toFixed(2)}`,
    timestamp: Date.now(),
  };

  const currentDayPlan = state.days.find((d) => d.day === day);
  if (!currentDayPlan) {
    return {
      status: "budget_exceeded_failure",
      progressLog: [
        {
          step: "error",
          day,
          message: `Internal Error: No day plan found for Day ${day} during replanning.`,
          timestamp: Date.now(),
        },
      ],
    };
  }

  const stays = getStays(city);
  const guides = getGuides(city);
  const transport = getTransport(city);
  const activities = getActivities(city);

  const systemPrompt = `You are TripWay's AI travel planner. You are in REPLANNING mode because the current itinerary is over budget by $${state.overBudgetBy.toFixed(2)}.
Your goal is to replan Day ${day} in ${city} to reduce costs.

Current Plan for Day ${day} (Total Cost: $${currentDayPlan.cost}):
- Stay: ${currentDayPlan.stay?.name} ($${currentDayPlan.stay?.costPerNight})
- Guide: ${currentDayPlan.guide?.name || "None"} ($${currentDayPlan.guide?.costPerDay || 0})
- Transport: ${currentDayPlan.transport?.name} ($${currentDayPlan.transport?.costPerDay})
- Activities: ${JSON.stringify(currentDayPlan.activities.map((a) => `${a.name} ($${a.cost})`))}

Replacement Guidelines:
1. Select a cheaper stay or transport option, or remove/swap activities, or remove the guide entirely.
2. CRITICAL local-first constraint: You must prefer verified local options (type: 'local') over chain options (type: 'chain'). Do NOT swap a local option for a more expensive chain option just to fit budget.
3. The new plan MUST cost significantly less than the current plan (aiming to reduce cost by at least $${state.overBudgetBy.toFixed(2)}).

Available stays:
${JSON.stringify(stays, null, 2)}

Available guides:
${JSON.stringify(guides, null, 2)}

Available transport:
${JSON.stringify(transport, null, 2)}

Available activities:
${JSON.stringify(activities, null, 2)}

You must return a valid JSON object matching the following structure:
{
  "stayId": "id_of_selected_stay",
  "guideId": "id_of_selected_guide_or_null",
  "transportId": "id_of_selected_transport",
  "activityIds": ["id_of_selected_activity_1", "id_of_selected_activity_2"],
  "note": "Explain how you reduced costs for this day and how it affects the user's experience while keeping the local-first rule."
}`;

  try {
    const response = await llm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please replan Day ${day} to reduce the cost.` },
    ]);

    const result = JSON.parse(response.content as string);

    // Resolve selections from DB (safeguard against hallucination)
    const defaultStay = stays[0];
    if (!defaultStay) {
      throw new Error("No stays available");
    }
    const selectedStay = stays.find((s) => s.id === result.stayId) || defaultStay;

    const selectedGuide = guides.find((g) => g.id === result.guideId) || null;

    const defaultTransport = transport[0];
    if (!defaultTransport) {
      throw new Error("No transport options available");
    }
    const selectedTransport = transport.find((t) => t.id === result.transportId) || defaultTransport;
    const selectedActivities: Activity[] = [];
    if (Array.isArray(result.activityIds)) {
      for (const id of result.activityIds) {
        const act = activities.find((a) => a.id === id);
        if (act) selectedActivities.push(act);
      }
    }

    // Compute costs
    const stayCost = selectedStay.costPerNight;
    const guideCost = selectedGuide ? selectedGuide.costPerDay : 0;
    const transCost = selectedTransport.costPerDay;
    const actCost = selectedActivities.reduce((sum, a) => sum + a.cost, 0);
    const totalDayCost = stayCost + guideCost + transCost + actCost;

    const dayPlan: DayPlan = {
      day,
      stay: selectedStay,
      guide: selectedGuide,
      transport: selectedTransport,
      activities: selectedActivities,
      cost: totalDayCost,
      replanned: true,
      note: result.note || "Day replanned to reduce cost.",
    };

    // Replace the plan for the current day
    const updatedDays = [...state.days];
    const dayIndex = updatedDays.findIndex((d) => d.day === day);
    if (dayIndex >= 0) {
      updatedDays[dayIndex] = dayPlan;
    }

    return {
      days: updatedDays,
      replanAttempts,
      status: "checking",
      progressLog: [
        replanLog,
        {
          step: "replan_day",
          day,
          message: `Day ${day} replanned. New Cost: $${totalDayCost} (Old Cost was $${currentDayPlan.cost}). Details: Stay: ${selectedStay.name}, Transport: ${selectedTransport.name}, Guide: ${selectedGuide ? selectedGuide.name : "None"}, Activities Count: ${selectedActivities.length}`,
          timestamp: Date.now(),
        },
      ],
    };
  } catch (error: any) {
    console.error("Error in replanDayNode:", error);
    return {
      status: "budget_exceeded_failure",
      progressLog: [
        replanLog,
        {
          step: "error",
          day,
          message: `Failed to replan Day ${day}: ${error.message || error}`,
          timestamp: Date.now(),
        },
      ],
    };
  }
}

/**
 * 4. advanceDayNode: Increments the currentDay counter.
 */
export async function advanceDayNode(state: TravelState): Promise<Partial<TravelState>> {
  const currentDay = state.currentDay;
  const nextDay = currentDay + 1;

  return {
    currentDay: nextDay,
    status: "planning",
    progressLog: [
      {
        step: "advance_day",
        day: currentDay,
        message: `Advancing from Day ${currentDay} to Day ${nextDay}.`,
        timestamp: Date.now(),
      },
    ],
  };
}

/**
 * 5. generateItineraryNode: Compiles final stats and finishes the itinerary.
 */
export async function generateItineraryNode(state: TravelState): Promise<Partial<TravelState>> {
  let localSpend = 0;
  let chainSpend = 0;

  for (const d of state.days) {
    if (d.stay) {
      if (d.stay.type === "local") localSpend += d.stay.costPerNight;
      else chainSpend += d.stay.costPerNight;
    }
    if (d.guide) {
      if (d.guide.type === "local") localSpend += d.guide.costPerDay;
      else chainSpend += d.guide.costPerDay;
    }
    if (d.transport) {
      if (d.transport.type === "local") localSpend += d.transport.costPerDay;
      else chainSpend += d.transport.costPerDay;
    }
    for (const act of d.activities) {
      if (act.type === "local") localSpend += act.cost;
      else chainSpend += act.cost;
    }
  }

  const totalSpent = localSpend + chainSpend;
  const localPercentage = totalSpent > 0 ? (localSpend / totalSpent) * 100 : 0;

  const isFailure = state.status === "budget_exceeded_failure";

  return {
    status: isFailure ? "budget_exceeded_failure" : "success",
    progressLog: [
      {
        step: "final",
        day: null,
        message: isFailure
          ? `Itinerary planning failed: Unable to fit within the budget of $${state.totalBudget.toFixed(2)}. Best attempt cost: $${totalSpent.toFixed(2)}.`
          : `Itinerary generated successfully! Total Cost: $${totalSpent.toFixed(2)}. Local spend contribution: $${localSpend.toFixed(2)} (${localPercentage.toFixed(1)}%). Chain/aggregator spend: $${chainSpend.toFixed(2)} (${(100 - localPercentage).toFixed(1)}%).`,
        timestamp: Date.now(),
      },
    ],
  };
}
