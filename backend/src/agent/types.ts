import { Stay, Guide, Transport, Activity } from "../data/dataService.js";

export interface DayPlan {
  day: number;
  stay: Stay | null;
  guide: Guide | null;
  transport: Transport | null;
  activities: Activity[];
  cost: number;
  replanned: boolean;
  note: string;
}

export interface ProgressLog {
  step: "plan_day" | "check_budget" | "replan_day" | "advance_day" | "final" | "error";
  day: number | null;
  message: string;
  timestamp: number;
}

export interface AgentState {
  city: string;
  totalDays: number;
  totalBudget: number;
  preferences: string[];
  currentDay: number;
  days: DayPlan[];
  spentSoFar: number;
  overBudgetBy: number;
  replanAttempts: Record<number, number>; // maps day to count of attempts
  progressLog: ProgressLog[];
  status: "planning" | "checking" | "replanning" | "success" | "budget_exceeded_failure";
}
