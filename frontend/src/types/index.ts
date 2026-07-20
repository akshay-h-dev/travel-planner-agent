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

export interface DayPlan {
  day: number;
  stay: Homestay | null;
  activities: Activity[];
  transport: Transport | null;
  guide: Guide | null;
  dailyCost: number;
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
