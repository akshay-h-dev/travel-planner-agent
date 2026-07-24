/**
 * OpenTripMap Provider
 *
 * Fetches tourist attractions and places of interest using the
 * OpenTripMap API (https://opentripmap.io).
 *
 * API flow:
 *   1. /en/places/geoname?name={city}  → get city centre lat/lon
 *   2. /en/places/radius?lat=…&lon=…   → get list of nearby places (xids)
 *   3. /en/places/xid/{xid}            → get details for each place
 *      (step 3 is batched with Promise.allSettled and limited to avoid
 *       rate-limit errors on the free tier)
 *
 * Free tier limits (as of 2024):
 *   - 5 000 requests / day
 *   - No rate-limit header; best practice is ~2–3 req/s
 *
 * The provider does NOT call the cache itself — caching is handled by
 * TravelDataProvider so the cache strategy can be changed without
 * touching this class.
 */

import { providerLogger as logger } from "../lib/logger.js";
import type {
  GetActivitiesParams,
  NormalizedActivity,
} from "../interfaces/travel-provider.interface.js";
import {
  normalizeOTMListFeature,
  normalizeOTMDetailFeature,
  type OTMListFeature,
  type OTMDetailFeature,
} from "../normalizers/activity.normalizer.js";

// ─── OTM API response shapes ─────────────────────────────────────────────────

interface GeonameResponse {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  status?: string;
}

interface RadiusResponse {
  features: Array<{
    properties: OTMListFeature;
  }>;
}

// ─── Category keyword → OTM "kinds" mapping ──────────────────────────────────

/**
 * Maps user preference keywords to OTM category strings.
 * OTM accepts a comma-separated "kinds" filter on the radius endpoint.
 */
const PREFERENCE_TO_KINDS: Record<string, string> = {
  heritage: "historic,monuments,archaeological",
  history: "historic,monuments,archaeology",
  food: "foods,restaurants,cafes",
  nature: "natural,parks,beaches,waterfalls,gardens",
  adventure: "sport,outdoor_activities,amusements",
  shopping: "markets,malls",
  nightlife: "nightclubs,bars",
  culture: "cultural,theatres_and_entertainments,art_galleries",
  museums: "museums",
  art: "art_galleries,museums",
};

function buildKindsFilter(preferences: string[]): string {
  if (!preferences.length) {
    // Default: broad tourist interest categories
    return "interesting_places,historic,natural,cultural,museums,sport";
  }
  const kindsSet = new Set<string>();
  for (const pref of preferences) {
    const kinds = PREFERENCE_TO_KINDS[pref.toLowerCase()];
    if (kinds) {
      kinds.split(",").forEach((k) => kindsSet.add(k.trim()));
    } else {
      // Pass the raw preference through — OTM may recognise it
      kindsSet.add(pref.toLowerCase());
    }
  }
  return Array.from(kindsSet).join(",");
}

// ─── Provider class ──────────────────────────────────────────────────────────

export class OpenTripMapProvider {
  private readonly baseUrl = "https://api.opentripmap.com/0.1";

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error("OpenTripMapProvider: apiKey is required");
  }

  // ── Public method ────────────────────────────────────────────────────────

  /**
   * Fetch normalized activities for a city.
   * Returns an empty array (never throws) if the API is unavailable.
   */
  async getActivities(params: GetActivitiesParams): Promise<NormalizedActivity[]> {
    const { city, preferences = [], radiusKm = 15, limit = 20 } = params;

    logger.info("[OTM] Fetching activities", { city, preferences, radiusKm });

    try {
      // Step 1 — resolve city coordinates
      const coords = await this.getCityCoords(city);
      if (!coords) {
        logger.warn("[OTM] City not found in geoname API", { city });
        return [];
      }

      // Step 2 — fetch list of nearby attractions
      const listFeatures = await this.fetchRadius(
        coords.lat,
        coords.lon,
        radiusKm * 1_000, // metres
        buildKindsFilter(preferences),
        limit,
      );

      if (listFeatures.length === 0) {
        logger.info("[OTM] No attractions found", { city });
        return [];
      }

      logger.info(`[OTM] Found ${listFeatures.length} attractions, fetching details`, { city });

      // Step 3 — enrich top N with detail calls (cap at 10 to protect free quota)
      const detailLimit = Math.min(listFeatures.length, 10);
      const detailResults = await this.fetchDetailsBatch(
        listFeatures.slice(0, detailLimit).map((f) => f.xid),
        city,
      );

      // Merge: detailed entries first, then shallow entries for the remainder
      const detailedXids = new Set(detailResults.map((a) => a.id.replace("otm_", "")));
      const shallowRemainder = listFeatures
        .slice(detailLimit)
        .map((f) => normalizeOTMListFeature(f, city));

      const combined = [...detailResults, ...shallowRemainder].filter(
        (a, idx, arr) => arr.findIndex((x) => x.id === a.id) === idx, // dedupe
      );

      logger.info(`[OTM] Returning ${combined.length} normalized activities`, { city });
      return combined;
    } catch (err) {
      logger.error("[OTM] getActivities failed", {
        city,
        error: err instanceof Error ? err.message : String(err),
      });
      // Graceful degradation — caller falls back to local dataset
      return [];
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  /** Resolve a city name to lat/lon via the /geoname endpoint. */
  private async getCityCoords(
    city: string,
  ): Promise<{ lat: number; lon: number } | null> {
    const url = `${this.baseUrl}/en/places/geoname?name=${encodeURIComponent(city)}&apikey=${this.apiKey}`;
    const res = await this.fetchJson<GeonameResponse>(url);
    if (!res || res.status === "NOT_FOUND") return null;
    return { lat: res.lat, lon: res.lon };
  }

  /** Fetch attractions within a radius; returns the raw list features. */
  private async fetchRadius(
    lat: number,
    lon: number,
    radiusMetres: number,
    kinds: string,
    limit: number,
  ): Promise<OTMListFeature[]> {
    const params = new URLSearchParams({
      radius: String(radiusMetres),
      lon: String(lon),
      lat: String(lat),
      kinds,
      limit: String(limit),
      format: "json",
      apikey: this.apiKey,
    });

    const url = `${this.baseUrl}/en/places/radius?${params.toString()}`;
    const data = await this.fetchJson<OTMListFeature[]>(url);
    if (!Array.isArray(data)) return [];

    // Filter out unnamed or clearly irrelevant results
    return data.filter((f) => f.name && f.name.trim().length > 1);
  }

  /**
   * Fetch detail records for a batch of xids.
   * Uses Promise.allSettled so a single 404 does not abort the batch.
   * Adds a small delay between calls to avoid rate-limit errors.
   */
  private async fetchDetailsBatch(
    xids: string[],
    city: string,
  ): Promise<NormalizedActivity[]> {
    const results: NormalizedActivity[] = [];

    for (const xid of xids) {
      try {
        const url = `${this.baseUrl}/en/places/xid/${xid}?apikey=${this.apiKey}`;
        const detail = await this.fetchJson<OTMDetailFeature>(url);
        if (detail && detail.xid) {
          results.push(normalizeOTMDetailFeature(detail, city));
        }
      } catch {
        // Skip individual failures silently
      }
      // Small throttle — 200 ms between detail calls to stay within free tier
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
  }

  /** Generic JSON fetcher with timeout. */
  private async fetchJson<T>(url: string): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        logger.warn("[OTM] HTTP error", { status: res.status, url });
        return null;
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
