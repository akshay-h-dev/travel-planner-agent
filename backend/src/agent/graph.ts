import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { TravelStateAnnotation, TravelState } from "./state.js";
import {
  planDayNode,
  checkBudgetNode,
  replanDayNode,
  advanceDayNode,
  generateItineraryNode,
} from "./nodes.js";

/**
 * Routing logic for the conditional edge after checkBudget.
 */
function routeFn(state: TravelState): "replan" | "next_day" | "done" {
  if (state.status === "budget_exceeded_failure") {
    // Stop immediately on failure
    return "done";
  }
  
  if (state.status === "replanning") {
    return "replan";
  }
  
  if (state.status === "success") {
    return "done";
  }
  
  if (state.status === "planning") {
    return "next_day";
  }
  
  return "done";
}

// Instantiate and configure the state graph
const workflow = new StateGraph(TravelStateAnnotation)
  .addNode("planDay", planDayNode)
  .addNode("checkBudget", checkBudgetNode)
  .addNode("replanDay", replanDayNode)
  .addNode("advanceDay", advanceDayNode)
  .addNode("generateItinerary", generateItineraryNode)
  
  // Set up standard entry points and linear transitions
  .addEdge(START, "planDay")
  .addEdge("planDay", "checkBudget")
  
  // Set up the conditional branching from the budget check
  .addConditionalEdges("checkBudget", routeFn, {
    replan: "replanDay",
    next_day: "advanceDay",
    done: "generateItinerary",
  })
  
  // Loop back from replanning node to check budget again
  .addEdge("replanDay", "checkBudget")
  
  // Loop back to planDay after advancing the day count
  .addEdge("advanceDay", "planDay")
  
  // End step from itinerary generation
  .addEdge("generateItinerary", END);

// Compile the graph with MemorySaver for checkpointing state
export const compiledGraph = workflow.compile({
  checkpointer: new MemorySaver(),
});
export { TravelStateAnnotation } from "./state.js";
