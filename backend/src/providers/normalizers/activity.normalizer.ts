/**
 * Activity Normalizer — Geoapify → NormalizedActivity
 *
 * This module converts the Geoapify Place feature shape into the common
 * NormalizedActivity interface.
 *
 * Admission cost estimation:
 *   Geoapify does not carry ticket prices. We derive a rough INR estimate from
 *   the categories tag using a predefined mapping.
 */

import type { NormalizedActivity } from "../interfaces/travel-provider.interface.js";

// ─── Raw Geoapify shapes ────────────────────────────────────────────────────

export interface GeoapifyPlace {
  properties: {
    place_id: string;
    name?: string;
    categories?: string[];
    formatted?: string;
    opening_hours?: string;
    description?: string;
    wiki_and_media?: {
      image?: string;
      wikipedia_extract?: string;
    };
  };
  geometry?: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
}

// ─── Category → cost mapping (INR) ──────────────────────────────────────────

const CATEGORY_COST_MAP: Array<{ keyword: string; cost: number; label: string }> = [
  { keyword: "museum", cost: 300, label: "museum" },
  { keyword: "historic", cost: 100, label: "heritage" },
  { keyword: "monument", cost: 100, label: "heritage" },
  { keyword: "archaeological", cost: 150, label: "heritage" },
  { keyword: "temple", cost: 50, label: "heritage" },
  { keyword: "church", cost: 50, label: "heritage" },
  { keyword: "mosque", cost: 50, label: "heritage" },
  { keyword: "natural", cost: 0, label: "nature" },
  { keyword: "beach", cost: 0, label: "nature" },
  { keyword: "park", cost: 50, label: "nature" },
  { keyword: "waterfall", cost: 50, label: "nature" },
  { keyword: "viewpoint", cost: 0, label: "nature" },
  { keyword: "sport", cost: 500, label: "adventure" },
  { keyword: "amusement", cost: 600, label: "entertainment" },
  { keyword: "food", cost: 400, label: "food" },
  { keyword: "catering", cost: 400, label: "food" },
  { keyword: "restaurant", cost: 400, label: "food" },
  { keyword: "shopping", cost: 0, label: "shopping" },
  { keyword: "mall", cost: 0, label: "shopping" },
  { keyword: "market", cost: 0, label: "shopping" },
  { keyword: "cultural", cost: 100, label: "culture" },
  { keyword: "culture", cost: 100, label: "culture" },
  { keyword: "art", cost: 200, label: "culture" },
  { keyword: "theatre", cost: 300, label: "entertainment" },
];

/** Derive a primary category label from categories array. */
function deriveCategory(categories: string[]): string {
  const joined = categories.join(",").toLowerCase();
  for (const entry of CATEGORY_COST_MAP) {
    if (joined.includes(entry.keyword)) return entry.label;
  }
  return "sightseeing";
}

/** Derive an estimated INR admission cost from categories array. */
function deriveEstimatedCost(categories: string[]): number {
  const joined = categories.join(",").toLowerCase();
  for (const entry of CATEGORY_COST_MAP) {
    if (joined.includes(entry.keyword)) return entry.cost;
  }
  return 100; // generic sightseeing default
}

/** Derive a deterministic rating (3.5 - 4.8) from place name or ID. */
function getDeterministicRating(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = 3.5 + (Math.abs(hash) % 14) / 10;
  return Number(rating.toFixed(1));
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

// ─── Public normalizer function ──────────────────────────────────────────────

/**
 * Convert a raw Geoapify place feature into a NormalizedActivity.
 */
export function normalizeGeoapifyPlace(
  feature: GeoapifyPlace,
  city: string
): NormalizedActivity {
  const props = feature.properties || {};
  const categories = props.categories ?? [];
  const category = deriveCategory(categories);
  const name = props.name || props.formatted || "Unnamed Attraction";

  const description =
    props.description ||
    props.wiki_and_media?.wikipedia_extract?.slice(0, 200) ||
    `A popular ${category} attraction in ${city}.`;

  return {
    id: `geoapify_${props.place_id}`,
    name,
    city,
    price: deriveEstimatedCost(categories),
    duration: estimateDuration(category),
    rating: getDeterministicRating(name),
    category,
    description,
    isLocal: true, // Community-contributed OpenStreetMap data source
    source: "geoapify",
    coordinates: feature.geometry?.coordinates
      ? { lat: feature.geometry.coordinates[1], lon: feature.geometry.coordinates[0] }
      : undefined,
    openingHours: props.opening_hours,
    imageUrl: props.wiki_and_media?.image,
  };
}
