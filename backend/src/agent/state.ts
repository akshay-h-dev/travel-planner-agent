import { Annotation } from "@langchain/langgraph";
import { DayPlan, ProgressLog } from "./types.js";

export const TravelStateAnnotation = Annotation.Root({
  city: Annotation<string>(),
  totalDays: Annotation<number>(),
  totalBudget: Annotation<number>(),
  preferences: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  currentDay: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 1,
  }),
  days: Annotation<DayPlan[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  spentSoFar: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 0,
  }),
  overBudgetBy: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 0,
  }),
  replanAttempts: Annotation<Record<number, number>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  progressLog: Annotation<ProgressLog[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),
  status: Annotation<
    "planning" | "checking" | "replanning" | "success" | "budget_exceeded_failure"
  >({
    reducer: (_x, y) => y,
    default: () => "planning",
  }),
});
export type TravelState = typeof TravelStateAnnotation.State;
