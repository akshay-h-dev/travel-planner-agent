import type { Homestay, Guide, Transport, Activity } from "../types/index.js";
import type { NormalizedActivity, NormalizedFlight } from "../providers/index.js";

// ─── Activity union ──────────────────────────────────────────────────────────
/** Any activity — from local JSON dataset or from the OpenTripMap API. */
export type AnyActivity = Activity | NormalizedActivity;

// ─── Day Plan ────────────────────────────────────────────────────────────────
/**
 * A single day in the planned itinerary.
 * Activities may come from the local JSON dataset or from OTM; both types
 * share the fields agents and routes use (id, name, price, rating, isLocal).
 */
export interface DayPlan {
  day: number;
  stay: Homestay | null;
  guide: Guide | null;
  transport: Transport | null;
  activities: AnyActivity[];
  /** Total cost of this day (stay + guide + transport + activities). */
  cost: number;
  /** True when this day was autonomously re-planned due to a constraint failure. */
  replanned: boolean;
  /** Human-readable note from the LLM explaining the day's selections. */
  note: string;
  /** Optional time-slotted schedule: array of {time, activity} pairs. */
  schedule?: TimeSlot[];
  /** Flight included on Day 1 if user selected flight transit. */
  flight?: NormalizedFlight | null;
  /** Flight cost already included in this day's `cost`. */
  flightCost?: number;
}

export interface TimeSlot {
  time: string;       // "09:00"
  activityId: string; // matches an entry in activities[]
  duration: string;   // "2 hours"
  note?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type ValidatorName =
  | "budget"
  | "preference"
  | "local_business"
  | "schedule"
  | "availability"
  | "experience_quality";

export interface ValidationIssue {
  /** Which day this issue applies to (null = trip-level). */
  day: number | null;
  /** Short machine-readable code for the type of issue. */
  code: string;
  /** Human-readable description shown to the user / streamed as SSE. */
  message: string;
  /** Severity — warnings don't block the itinerary, errors do. */
  severity: "error" | "warning";
  /** Whether the agent believes it can fix this autonomously. */
  autoFixable: boolean;
  /** Optional hint for the fix node. */
  fixHint?: string;
}

export interface ValidationResult {
  validator: ValidatorName;
  passed: boolean;
  issues: ValidationIssue[];
}

// ─── Agent Decisions (Milestone 7 — Explainability) ─────────────────────────

export interface AgentDecision {
  /** ISO timestamp of when the decision was made. */
  timestamp: number;
  /** Which day this decision applies to (null = trip-level). */
  day: number | null;
  /** Short machine-readable action type. */
  action:
    | "plan_day"
    | "replan_day"
    | "validate"
    | "auto_fix"
    | "skip_validator"
    | "interpret_feedback"
    | "apply_feedback"
    | "finalize";
  /** What the agent did and why — shown in the UI. */
  reasoning: string;
  /** Before/after cost delta when relevant (0 when not applicable). */
  costDelta: number;
}

// ─── Progress Log (for SSE streaming) ───────────────────────────────────────

export interface ProgressLog {
  step:
    | "plan_day"
    | "check_budget"
    | "replan_day"
    | "advance_day"
    | "validate"
    | "auto_fix"
    | "feedback"
    | "final"
    | "error";
  day: number | null;
  message: string;
  timestamp: number;
}

// ─── Legacy AgentState (kept for backwards-compat; real state is TravelState) ──

export interface AgentState {
  city: string;
  totalDays: number;
  totalBudget: number;
  preferences: string[];
  currentDay: number;
  days: DayPlan[];
  spentSoFar: number;
  overBudgetBy: number;
  replanAttempts: Record<number, number>;
  progressLog: ProgressLog[];
  status: "planning" | "checking" | "replanning" | "success" | "budget_exceeded_failure";
}
