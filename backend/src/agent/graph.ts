/**
 * LangGraph Workflow — Autonomous Travel Planning Agent
 *
 * Full 8-milestone graph:
 *
 *  START
 *    │
 *    ▼
 *  planDay ──────────────► checkBudget
 *    ▲                          │
 *    │              ┌───────────┼──────────────┐
 *    │           replan     advance         validate
 *    │              │          │                │
 *    │           (loop)     planDay         routeValidation
 *    │                                 ┌────┴────────────┐
 *    │                              autoFix         routeToUser
 *    │                                 │                 │
 *    │                            (re-validate)   needsUserInput
 *    │                                                   │
 *    │                               interpretFeedback ◄─┘ (if feedback present)
 *    │                                      │
 *    │                               applyFeedback
 *    │                                      │
 *    │                               (re-validate)
 *    │
 *    └──────────── generateItinerary ──► END
 */

import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { TravelStateAnnotation } from "./state.js";
import type { TravelState } from "./state.js";
import {
  planDayNode,
  checkBudgetNode,
  replanDayNode,
  advanceDayNode,
  validateItineraryNode,
  autonomousFixNode,
  interpretFeedbackNode,
  applyFeedbackNode,
  generateItineraryNode,
  humanBudgetApprovalNode,
} from "./nodes.js";

// ─── Routing functions ────────────────────────────────────────────────────────

/** After checkBudget: replan this day | advance to next | go validate */
function routeAfterBudgetCheck(
  state: TravelState,
): "replanDay" | "advanceDay" | "validateItinerary" | "generateItinerary" | "humanBudgetApproval" {
  if (state.status === "budget_exceeded_failure") return "generateItinerary";
  if (state.status === "needs_budget_approval") return "humanBudgetApproval";
  if (state.status === "replanning" || state.status === "strict_budget_replan") return "replanDay";
  if (state.status === "validating") return "validateItinerary";
  if (state.status === "planning") return "advanceDay";
  return "generateItinerary";
}

function routeAfterHumanApproval(state: TravelState): "checkBudget" | "replanDay" {
  // Always replan the day after human intervention to satisfy user expectations
  return "replanDay";
}

/** After validation: fix autonomously | finalize | ask user | apply pending feedback */
function routeAfterValidation(
  state: TravelState,
): "autonomousFixNode" | "interpretFeedbackNode" | "applyFeedbackNode" | "generateItinerary" {
  if (state.status === "budget_exceeded_failure") return "generateItinerary";
  if (state.status === "auto_fixing") return "autonomousFixNode";
  if (state.status === "needs_user_input") return "generateItinerary"; // surface to user
  if (state.status === "applying_feedback") return "applyFeedbackNode";
  if (state.status === "awaiting_feedback" && state.userFeedback) {
    return "interpretFeedbackNode";
  }
  // success or warnings-only: finalize
  return "generateItinerary";
}

/** After autonomousFixNode: always re-validate */
function routeAfterAutoFix(
  state: TravelState,
): "validateItinerary" | "generateItinerary" {
  if (state.status === "budget_exceeded_failure") return "generateItinerary";
  return "validateItinerary";
}

/** After applyFeedbackNode: always re-validate */
function routeAfterFeedback(
  state: TravelState,
): "validateItinerary" | "generateItinerary" {
  if (state.status === "budget_exceeded_failure") return "generateItinerary";
  return "validateItinerary";
}

// ─── Graph construction ───────────────────────────────────────────────────────

const workflow = new StateGraph(TravelStateAnnotation)
  // ── Nodes ────────────────────────────────────────────────────────────────
  .addNode("planDay",                 planDayNode)
  .addNode("checkBudget",             checkBudgetNode)
  .addNode("replanDay",               replanDayNode)
  .addNode("advanceDay",              advanceDayNode)
  .addNode("validateItinerary",       validateItineraryNode)
  .addNode("autonomousFixNode",       autonomousFixNode)
  .addNode("interpretFeedbackNode",   interpretFeedbackNode)
  .addNode("applyFeedbackNode",       applyFeedbackNode)
  .addNode("generateItinerary",       generateItineraryNode)
  .addNode("humanBudgetApproval",     humanBudgetApprovalNode)

  // ── Edges ─────────────────────────────────────────────────────────────────
  // Entry point
  .addEdge(START, "planDay")

  // planDay always feeds into budget check
  .addEdge("planDay", "checkBudget")

  // Budget check fans out to: replan / advance / validate / done
  .addConditionalEdges("checkBudget", routeAfterBudgetCheck, {
    replanDay:            "replanDay",
    advanceDay:           "advanceDay",
    validateItinerary:    "validateItinerary",
    generateItinerary:    "generateItinerary",
    humanBudgetApproval:  "humanBudgetApproval",
  })

  // After resuming, conditionally route: if strict mode, replan forcefully.
  // If approved (budget increased), go to checkBudget to re-evaluate the current plan.
  .addConditionalEdges("humanBudgetApproval", routeAfterHumanApproval, {
    checkBudget: "checkBudget",
    replanDay: "replanDay"
  })

  // Replan loops back to budget check
  .addEdge("replanDay", "checkBudget")

  // Advance day loops back to planDay
  .addEdge("advanceDay", "planDay")

  // Validation fans out to: auto-fix / feedback / done
  .addConditionalEdges("validateItinerary", routeAfterValidation, {
    autonomousFixNode:    "autonomousFixNode",
    interpretFeedbackNode: "interpretFeedbackNode",
    applyFeedbackNode:    "applyFeedbackNode",
    generateItinerary:    "generateItinerary",
  })

  // After auto-fix: always re-validate (circuit-breaker in autonomousFixNode)
  .addConditionalEdges("autonomousFixNode", routeAfterAutoFix, {
    validateItinerary: "validateItinerary",
    generateItinerary: "generateItinerary",
  })

  // Feedback pipeline: interpret → apply → re-validate
  .addEdge("interpretFeedbackNode", "applyFeedbackNode")
  .addConditionalEdges("applyFeedbackNode", routeAfterFeedback, {
    validateItinerary: "validateItinerary",
    generateItinerary: "generateItinerary",
  })

  // Final node → END
  .addEdge("generateItinerary", END);

// Compile with MemorySaver for per-request checkpointing.
// interruptBefore: ["humanBudgetApproval"] pauses the graph before that
// node runs so the frontend can display the budget approval modal.
export const compiledGraph = workflow.compile({
  checkpointer: new MemorySaver(),
  interruptBefore: ["humanBudgetApproval"],
});

// Re-export state types for consumers
export { TravelStateAnnotation } from "./state.js";
export type { TravelState } from "./state.js";
