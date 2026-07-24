import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compiledGraph } from "./agent/graph.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function runTest(budgetValue: number) {
  console.log("\n==================================================");
  console.log(`🚀 RUNNING TEST WITH BUDGET: ₹${budgetValue}`);
  console.log("==================================================");

  const config = { configurable: { thread_id: `thread_budget_${budgetValue}` } };

  const initialState = {
    // Core trip parameters
    city: "Goa",
    totalDays: 3,
    totalBudget: budgetValue,
    preferences: ["heritage", "food", "nature"],
    // Dynamic user inputs (mirrors what the frontend sends)
    travelers: 2,
    travelStyle: "Budget",
    startPlace: "Bangalore",
    startDate: "2025-02-01",
    transitTypes: ["bus"],
    userOptions: {
      prioritizeLocal: true,
      keepUnderBudget: true,
      ecoFriendly: false,
    },
    // Agent bookkeeping (initial values)
    currentDay: 1,
    days: [],
    spentSoFar: 0,
    overBudgetBy: 0,
    replanAttempts: {},
    progressLog: [],
    status: "planning" as const,
  };

  try {
    const stream = await compiledGraph.stream(initialState, {
      ...config,
      streamMode: "values",
    });

    let lastLoggedLength = 0;

    for await (const chunk of stream) {
      const logs = chunk.progressLog || [];
      // Print new logs as they are added to the state
      if (logs.length > lastLoggedLength) {
        for (let i = lastLoggedLength; i < logs.length; i++) {
          const log = logs[i];
          const time = new Date(log.timestamp).toLocaleTimeString();
          console.log(`[${time}] [${log.step.toUpperCase()}] ${log.message}`);
        }
        lastLoggedLength = logs.length;
      }
    }

    // Retrieve the final state to inspect the result
    const finalState = await compiledGraph.getState(config);
    const data = finalState.values;

    console.log("\n--------------------------------------------------");
    console.log(`🏁 EXECUTION RESULT: ${data.status.toUpperCase()}`);
    console.log(`💰 FINAL TOTAL SPENT: ₹${data.spentSoFar.toFixed(2)} / ₹${data.totalBudget.toFixed(2)}`);
    console.log("--------------------------------------------------");

    if (data.status === "success" && data.days && data.days.length > 0) {
      console.log("\n🗺️ DETAILED ITINERARY:");
      for (const d of data.days) {
        console.log(`\n📅 Day ${d.day} (Cost: ₹${d.cost.toFixed(2)}) [Replanned: ${d.replanned}]`);
        console.log(`  🏠 Stay:      ${d.stay?.name} (₹${d.stay?.pricePerNight}/night) [local: ${d.stay?.isLocal}]`);
        console.log(`  🚴 Transport: ${d.transport?.name} (₹${d.transport?.pricePerDay}/day) [local: ${d.transport?.isLocal}]`);
        if (d.guide) {
          console.log(`  🧑 Guide:     ${d.guide.name} (₹${d.guide.pricePerDay}/day) [local: ${d.guide.isLocal}]`);
        } else {
          console.log("  🧑 Guide:     None");
        }
        console.log("  🎪 Activities:");
        for (const act of d.activities) {
          console.log(`    - ${act.name} (₹${act.price}) [local: ${act.isLocal}]`);
        }
        console.log(`  📝 Note:      ${d.note}`);
      }
    } else {
      console.log("❌ Trip planning could not be completed successfully within budget parameters.");
    }
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

async function startTests() {
  // 1. High budget test (should succeed with premium selections without replanning)
  await runTest(15000);

  // 2. Moderate budget test (should trigger replanning and succeed after adjusting)
  await runTest(6000);

  // 3. Impossibly low budget test (should hit the replanning limit and fail gracefully)
  await runTest(1200);
}

startTests();
