/**
 * Activity Normalizer — OpenTripMap → NormalizedActivity
 *
 * OpenTripMap returns two API shapes:
 *   1. /geoname + /radius  → lightweight FeatureCollection (list call)
 *   2. /xid/{id}           → detailed Feature (detail call)
 *
 * This module converts both shapes into the common NormalizedActivity
 * interface so the rest of the application never touches raw OTM JSON.
 *
 * Admission cost estimation:
 *   OTM does not carry ticket prices. We derive a rough INR estimate from
 *   the "kinds" (category) tag using the table below. This is sufficient
 *   for the MVP — the agent uses these as a planning signal, not a booking
 *   commitment.
 */

import type { NormalizedActivity } from "../interfaces/travel-provider.interface.js";

// ─── Raw OTM shapes ─────────────────────────────────────────────────────────

/** Minimal shape returned by the /radius list endpoint. */
export interface OTMListFeature {
  xid: string;
  name: string;
  rate?: number;       // popularity score 0–3
  dist?: number;       // distance in metres
  kinds?: string;      // comma-separated category tags
  point?: { lon: number; lat: number };
}

/** Extended shape returned by the /xid/:xid detail endpoint. */
export interface OTMDetailFeature {
  xid: string;
  name: string;
  rate?: number;
  kinds?: string;
  image?: string;
  wikipedia_extracts?: { text?: string; html?: string };
  preview?: { source?: string };
  address?: {
    city?: string;
    road?: string;
    state?: string;
  };
  point?: { lon: number; lat: number };
  opening_hours?: string;
}

// ─── Category → cost mapping (INR) ──────────────────────────────────────────

/**
 * Maps OTM "kinds" tag fragments to an estimated admission price in INR.
 * Tags are checked in order; the first match wins. "0" means free.
 */
const CATEGORY_COST_MAP: Array<{ keyword: string; cost: number; label: string }> = [
  { keyword: "museums", cost: 300, label: "museum" },
  { keyword: "historic", cost: 100, label: "heritage" },
  { keyword: "monuments", cost: 100, label: "heritage" },
  { keyword: "archaeological", cost: 150, label: "heritage" },
  { keyword: "temples", cost: 50, label: "heritage" },
  { keyword: "churches", cost: 50, label: "heritage" },
  { keyword: "mosques", cost: 50, label: "heritage" },
  { keyword: "natural", cost: 0, label: "nature" },
  { keyword: "beaches", cost: 0, label: "nature" },
  { keyword: "parks", cost: 50, label: "nature" },
  { keyword: "waterfalls", cost: 50, label: "nature" },
  { keyword: "viewpoints", cost: 0, label: "nature" },
  { keyword: "sport", cost: 500, label: "adventure" },
  { keyword: "amusement", cost: 600, label: "entertainment" },
  { keyword: "food", cost: 400, label: "food" },
  { keyword: "shopping", cost: 0, label: "shopping" },
  { keyword: "cultural", cost: 100, label: "culture" },
  { keyword: "art", cost: 200, label: "culture" },
  { keyword: "theatre", cost: 300, label: "entertainment" },
];

/** Derive a primary category label from a comma-separated "kinds" string. */
function deriveCategory(kinds: string): string {
  const lower = kinds.toLowerCase();
  for (const entry of CATEGORY_COST_MAP) {
    if (lower.includes(entry.keyword)) return entry.label;
  }
  return "sightseeing";
}

/** Derive an estimated INR admission cost from a "kinds" string. */
function deriveEstimatedCost(kinds: string): number {
  const lower = kinds.toLowerCase();
  for (const entry of CATEGORY_COST_MAP) {
    if (lower.includes(entry.keyword)) return entry.cost;
  }
  return 100; // generic sightseeing default
}

/** Convert an OTM popularity "rate" (0–3) to a 0–5 star rating. */
function rateToStars(rate?: number): number {
  if (rate == null) return 0;
  // OTM rate: 0=unknown, 1=low, 2=medium, 3=high
  const map: Record<number, number> = { 0: 0, 1: 3.0, 2: 3.8, 3: 4.5 };
  return map[Math.min(rate, 3)] ?? 0;
}

/** Estimate visit duration from the category label. */
function estimateDuration(category: string): string {
  const durations: Record<string, string> = {
    museum: "2–3 hours",
    heritage: "1–2 hours",
    nature: "2–4 hours",
    adventure: "3–5 hours",
    food: "1–2 hours",
    shopping: "1–3 hours",
    culture: "1–2 hours",
    entertainment: "2–3 hours",
    sightseeing: "1–2 hours",
  };
  return durations[category] ?? "1–2 hours";
}

// ─── Public normalizer functions ─────────────────────────────────────────────

/**
 * Convert a raw OTM list feature into a NormalizedActivity.
 * Used when we only have shallow data from the /radius endpoint.
 */
export function normalizeOTMListFeature(
  feature: OTMListFeature,
  city: string,
): NormalizedActivity {
  const kinds = feature.kinds ?? "sightseeing";
  const category = deriveCategory(kinds);

  return {
    id: `otm_${feature.xid}`,
    name: feature.name || "Unnamed Attraction",
    city,
    price: deriveEstimatedCost(kinds),
    duration: estimateDuration(category),
    rating: rateToStars(feature.rate),
    category,
    description: `Tourist attraction in ${city}.`,
    isLocal: true, // OTM sources are community-contributed local places
    source: "opentripmap",
    coordinates: feature.point
      ? { lat: feature.point.lat, lon: feature.point.lon }
      : undefined,
  };
}

/**
 * Convert a detailed OTM feature (from /xid/:xid) into a NormalizedActivity.
 * Preferred over the list normalizer when richer data is available.
 */
export function normalizeOTMDetailFeature(
  feature: OTMDetailFeature,
  city: string,
): NormalizedActivity {
  const kinds = feature.kinds ?? "sightseeing";
  const category = deriveCategory(kinds);

  const description =
    feature.wikipedia_extracts?.text?.slice(0, 200) ||
    `A popular ${category} attraction in ${city}.`;

  return {
    id: `otm_${feature.xid}`,
    name: feature.name || "Unnamed Attraction",
    city,
    price: deriveEstimatedCost(kinds),
    duration: estimateDuration(category),
    rating: rateToStars(feature.rate),
    category,
    description,
    isLocal: true,
    source: "opentripmap",
    coordinates: feature.point
      ? { lat: feature.point.lat, lon: feature.point.lon }
      : undefined,
    openingHours: feature.opening_hours,
    imageUrl:
      feature.preview?.source ||
      feature.image ||
      undefined,
  };
}
