/**
 * Domain types for TripWay.
 * Match Node.js + TypeScript travel planner agent backend schema.
 */

export interface City {
  id: string;
  name: string;
  state: string;
  description: string;
  highlights: string[];
  imageUrl: string;
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
  imageUrl: string;
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
  imageUrl: string;
  timeSlot?: "morning" | "afternoon" | "evening";
}

export interface Transport {
  id: string;
  name: string;
  city: string;
  pricePerDay: number;
  type: "auto-rickshaw" | "cab" | "bus" | "shared-shuttle" | "bike-rental";
  description: string;
  isLocal: boolean;
  provider: string;
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
  avatarUrl: string;
  bio: string;
}

export interface TimeSlot {
  time: string;       // "09:00"
  activityId: string;
  duration: string;   // "2 hours"
  note?: string;
}

export interface FlightSegment {
  flightNumber: string;
  airlineName: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
}

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  totalPrice: number;
  pricePerPerson: number;
  currency: string;
  outboundSegments: FlightSegment[];
  totalOutboundDuration: string;
  isCheapest: boolean;
}

export interface ValidationIssue {
  day: number | null;
  code: string;
  message: string;
  severity: "error" | "warning";
  autoFixable: boolean;
  fixHint?: string;
}

export interface ValidationResult {
  validator: string;
  passed: boolean;
  issues: ValidationIssue[];
}

export interface AgentDecision {
  timestamp: number;
  day: number | null;
  action: string;
  reasoning: string;
  costDelta: number;
}

export interface ProgressLog {
  step: string;
  day: number | null;
  message: string;
  timestamp: number;
}

export interface DayPlan {
  day: number;
  stay: Homestay | null;
  activities: Activity[];
  transport: Transport | null;
  guide: Guide | null;
  dailyCost: number;
  /** True when this day was autonomously re-planned due to budget overflow. */
  replanned?: boolean;
  /** LLM note explaining selections or changes made. */
  note?: string;
  /** Time-slotted schedule for the day. */
  schedule?: TimeSlot[];
  /** Flight details if user selected flight transit (Day 1 only). */
  flight?: Flight | null;
  /** Flight cost already included in dailyCost (Day 1 only). */
  flightCost?: number;
}

export interface Itinerary {
  id: string;
  city: string;
  totalDays: number;
  days: DayPlan[];
  totalCost: number;
  budget: number;
  remainingBudget: number;
  localOperatorPercentage: number;
  preferences: string[];
  travelers: number;
  travelStyle: string;
  startPlace?: string;
  startDate?: string;
  transitTypes?: string[];
  bookingStatus?: Record<string, "pending" | "confirmed">;
  // Agent output fields
  threadId?: string;
  status?: string;
  needsUserInput?: boolean;
  validationResults?: ValidationResult[];
  agentDecisions?: AgentDecision[];
  progressLog?: ProgressLog[];
}

export interface AgentState {
  budget: number;
  remainingBudget: number;
  days: number;
  currentDay: number;
  city: string;
  preferences: string[];
  itinerary: DayPlan[];
  totalCost: number;
  logs: string[];
  status: "planning" | "replanning" | "completed" | "failed";
  replanAttempts: number;
  maxReplanAttempts: number;
  travelers: number;
}
