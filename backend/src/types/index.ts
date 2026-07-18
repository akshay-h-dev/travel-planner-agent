/**
 * Domain types for TripWay.
 *
 * These types define the shape of all data flowing through the
 * application — from user input, through the LangGraph agent
 * state, to the final itinerary output.
 */

import { z } from "zod";

// ─── Request Validation ─────────────────────────────────────

/** Schema for the POST /api/plan request body. */
export const PlanRequestSchema = z.object({
  budget: z
    .number()
    .positive("Budget must be a positive number")
    .max(10_000_000, "Budget exceeds maximum allowed value"),
  city: z
    .string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name must not exceed 100 characters")
    .trim(),
  days: z
    .number()
    .int("Days must be a whole number")
    .min(1, "Minimum 1 day required")
    .max(30, "Maximum 30 days allowed"),
  preferences: z
    .array(z.string().trim().min(1))
    .min(1, "At least one preference is required")
    .max(10, "Maximum 10 preferences allowed"),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;

// ─── Data Layer Types ───────────────────────────────────────

export interface City {
  id: string;
  name: string;
  state: string;
  description: string;
  highlights: string[];
}

export interface Homestay {
  id: string;
  name: string;
  city: string;
  pricePerNight: number;
  rating: number;
  description: string;
  amenities: string[];
  isLocal: boolean;
  category: "budget" | "mid-range" | "premium";
}

export interface Activity {
  id: string;
  name: string;
  city: string;
  price: number;
  duration: string;
  rating: number;
  category: string;
  description: string;
  isLocal: boolean;
}

export interface Transport {
  id: string;
  name: string;
  city: string;
  pricePerDay: number;
  type: "auto-rickshaw" | "cab" | "bus" | "shared-shuttle" | "bike-rental";
  description: string;
  isLocal: boolean;
}

export interface Guide {
  id: string;
  name: string;
  city: string;
  pricePerDay: number;
  rating: number;
  specialties: string[];
  languages: string[];
  isLocal: boolean;
}

// ─── Itinerary Types ────────────────────────────────────────

export interface DayPlan {
  day: number;
  stay: Homestay | null;
  activities: Activity[];
  transport: Transport | null;
  guide: Guide | null;
  dailyCost: number;
}

export interface Itinerary {
  city: string;
  totalDays: number;
  days: DayPlan[];
  totalCost: number;
  remainingBudget: number;
  localOperatorPercentage: number;
}

// ─── Agent State ────────────────────────────────────────────

/**
 * The complete state object flowing through the LangGraph
 * StateGraph. Every node reads from and writes to this shape.
 */
export interface AgentState {
  /** User-supplied total budget (₹). */
  budget: number;
  /** Budget remaining after allocations so far. */
  remainingBudget: number;
  /** Total trip duration. */
  days: number;
  /** 1-indexed day currently being planned. */
  currentDay: number;
  /** Target destination city. */
  city: string;
  /** User-selected activity preferences. */
  preferences: string[];
  /** Accumulated day-wise plans. */
  itinerary: DayPlan[];
  /** Running total of all daily costs. */
  totalCost: number;
  /** Ordered log of agent actions for SSE streaming. */
  logs: string[];
  /** Current workflow status. */
  status: "planning" | "replanning" | "completed" | "failed";
  /** Number of re-plan attempts for the current day (circuit breaker). */
  replanAttempts: number;
  /** Maximum allowed re-plan attempts per day. */
  maxReplanAttempts: number;
}

// ─── SSE Event Types ────────────────────────────────────────

export interface SSEEvent {
  type: "log" | "day_complete" | "itinerary" | "error" | "done";
  data: unknown;
  timestamp: string;
}

// ─── API Response Types ─────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
