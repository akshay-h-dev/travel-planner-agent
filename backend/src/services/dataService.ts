/**
 * Data access service.
 *
 * Loads the local JSON datasets once at import time and exposes
 * strongly-typed query helpers. This layer abstracts the data
 * source so it can be swapped for a database or external API
 * later without touching any business logic.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  City,
  Homestay,
  Activity,
  Transport,
  Guide,
} from "../types/index.js";
import { logger } from "../utils/logger.js";

// ─── Dataset loading ────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data");

function loadJSON<T>(filename: string): T[] {
  try {
    const raw = readFileSync(path.join(DATA_DIR, filename), "utf-8");
    const data = JSON.parse(raw) as T[];
    logger.info(`Loaded ${data.length} records from ${filename}`);
    return data;
  } catch (err) {
    logger.error(`Failed to load dataset: ${filename}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

const cities: City[] = loadJSON<City>("cities.json");
const homestays: Homestay[] = loadJSON<Homestay>("homestays.json");
const activities: Activity[] = loadJSON<Activity>("activities.json");
const transport: Transport[] = loadJSON<Transport>("transport.json");
const guides: Guide[] = loadJSON<Guide>("guides.json");

// ─── Query helpers ──────────────────────────────────────────

/**
 * Sort items so that local operators appear first,
 * then by rating (descending), then by price (ascending).
 */
function localFirstSort<T extends { isLocal: boolean; rating?: number }>(
  items: T[],
  priceKey: keyof T,
): T[] {
  return [...items].sort((a, b) => {
    // Local first
    if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1;
    // Higher rating first
    const ratingA = (a as Record<string, unknown>).rating as number | undefined;
    const ratingB = (b as Record<string, unknown>).rating as number | undefined;
    if (ratingA != null && ratingB != null && ratingA !== ratingB) {
      return ratingB - ratingA;
    }
    // Lower price first
    const priceA = a[priceKey] as number;
    const priceB = b[priceKey] as number;
    return priceA - priceB;
  });
}

export const dataService = {
  // ── Cities ────────────────────────────────────────────
  getAllCities(): City[] {
    return cities;
  },

  getCityByName(name: string): City | undefined {
    return cities.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
  },

  // ── Homestays ─────────────────────────────────────────
  getHomestaysByCity(city: string): Homestay[] {
    const filtered = homestays.filter(
      (h) => h.city.toLowerCase() === city.toLowerCase(),
    );
    return localFirstSort(filtered, "pricePerNight");
  },

  getHomestaysByCityAndBudget(city: string, maxPrice: number): Homestay[] {
    const filtered = homestays.filter(
      (h) =>
        h.city.toLowerCase() === city.toLowerCase() &&
        h.pricePerNight <= maxPrice,
    );
    return localFirstSort(filtered, "pricePerNight");
  },

  // ── Activities ────────────────────────────────────────
  getActivitiesByCity(city: string): Activity[] {
    const filtered = activities.filter(
      (a) => a.city.toLowerCase() === city.toLowerCase(),
    );
    return localFirstSort(filtered, "price");
  },

  getActivitiesByCityAndPreferences(
    city: string,
    preferences: string[],
  ): Activity[] {
    const lowerPrefs = preferences.map((p) => p.toLowerCase());
    const filtered = activities.filter(
      (a) =>
        a.city.toLowerCase() === city.toLowerCase() &&
        lowerPrefs.some(
          (pref) =>
            a.category.toLowerCase().includes(pref) ||
            a.name.toLowerCase().includes(pref) ||
            a.description.toLowerCase().includes(pref),
        ),
    );
    return localFirstSort(filtered, "price");
  },

  getActivitiesByCityAndBudget(city: string, maxPrice: number): Activity[] {
    const filtered = activities.filter(
      (a) =>
        a.city.toLowerCase() === city.toLowerCase() &&
        a.price <= maxPrice,
    );
    return localFirstSort(filtered, "price");
  },

  // ── Transport ─────────────────────────────────────────
  getTransportByCity(city: string): Transport[] {
    const filtered = transport.filter(
      (t) => t.city.toLowerCase() === city.toLowerCase(),
    );
    return localFirstSort(filtered, "pricePerDay");
  },

  getTransportByCityAndBudget(city: string, maxPrice: number): Transport[] {
    const filtered = transport.filter(
      (t) =>
        t.city.toLowerCase() === city.toLowerCase() &&
        t.pricePerDay <= maxPrice,
    );
    return localFirstSort(filtered, "pricePerDay");
  },

  // ── Guides ────────────────────────────────────────────
  getGuidesByCity(city: string): Guide[] {
    const filtered = guides.filter(
      (g) => g.city.toLowerCase() === city.toLowerCase(),
    );
    return localFirstSort(filtered, "pricePerDay");
  },

  getGuidesByCityAndBudget(city: string, maxPrice: number): Guide[] {
    const filtered = guides.filter(
      (g) =>
        g.city.toLowerCase() === city.toLowerCase() &&
        g.pricePerDay <= maxPrice,
    );
    return localFirstSort(filtered, "pricePerDay");
  },

  // ── Statistics ────────────────────────────────────────
  getDatasetStats() {
    return {
      cities: cities.length,
      homestays: homestays.length,
      activities: activities.length,
      transport: transport.length,
      guides: guides.length,
    };
  },
};
