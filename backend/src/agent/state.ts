import { Annotation } from "@langchain/langgraph";
import type {
  DayPlan,
  ProgressLog,
  ValidationResult,
  AgentDecision,
} from "./types.js";

export interface UserPlanningOptions {
  prioritizeLocal: boolean;
  keepUnderBudget: boolean;
  ecoFriendly: boolean;
}

export const TravelStateAnnotation = Annotation.Root({
  // ── Trip inputs (from frontend) ─────────────────────────────────────────
  city: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "",
  }),
  totalDays: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 1,
  }),
  totalBudget: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 0,
  }),
  preferences: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  travelers: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 1,
  }),
  travelStyle: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "Budget",
  }),
  startPlace: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "",
  }),
  startDate: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "",
  }),
  transitTypes: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  /** Local transport mode preferences (auto-rickshaw, cab, bike-rental, etc.). */
  localTransitTypes: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  /** Accommodation type preferences (Homestay, Hotel, Hostel, etc.). */
  accommodationTypes: Annotation<string[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  userOptions: Annotation<UserPlanningOptions>({
    reducer: (_x, y) => y,
    default: () => ({
      prioritizeLocal: true,
      keepUnderBudget: true,
      ecoFriendly: false,
    }),
  }),

  // ── Planning bookkeeping ────────────────────────────────────────────────
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

  // ── Validation (Milestone 4) ────────────────────────────────────────────
  /**
   * Results written by validateItineraryNode.
   * Each entry corresponds to one validator run.
   * Replaced wholesale on each validation pass.
   */
  validationResults: Annotation<ValidationResult[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  /**
   * Number of autonomous fix attempts across the whole trip.
   * Circuit-breaker: agent stops trying after 5 fix cycles.
   */
  autoFixAttempts: Annotation<number>({
    reducer: (_x, y) => y,
    default: () => 0,
  }),

  // ── User feedback loop (Milestone 6) ───────────────────────────────────
  /**
   * Free-text feedback from the user after seeing the itinerary.
   * Empty string means no feedback pending.
   */
  userFeedback: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "",
  }),
  /**
   * Days that need to be re-planned based on parsed feedback.
   * interpretFeedbackNode writes this; applyFeedbackNode consumes it.
   */
  feedbackTargetDays: Annotation<number[]>({
    reducer: (_x, y) => y,
    default: () => [],
  }),
  /**
   * Machine-readable instructions derived from user feedback.
   * Used by applyFeedbackNode to drive the re-plan prompt.
   */
  feedbackInstructions: Annotation<string>({
    reducer: (_x, y) => y,
    default: () => "",
  }),

  // ── Explainability (Milestone 7) ────────────────────────────────────────
  /**
   * Ordered log of every autonomous decision the agent made.
   * Appended (never replaced) throughout the run.
   */
  agentDecisions: Annotation<AgentDecision[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),

  // ── Progress log (SSE streaming) ────────────────────────────────────────
  progressLog: Annotation<ProgressLog[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),

  // ── Workflow status ─────────────────────────────────────────────────────
  status: Annotation<
    | "planning"
    | "checking"
    | "replanning"
    | "validating"
    | "auto_fixing"
    | "awaiting_feedback"
    | "applying_feedback"
    | "success"
    | "budget_exceeded_failure"
    | "needs_user_input"
  >({
    reducer: (_x, y) => y,
    default: () => "planning",
  }),
});

export type TravelState = typeof TravelStateAnnotation.State;
