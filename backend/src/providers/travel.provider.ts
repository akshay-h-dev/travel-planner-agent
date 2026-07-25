/**
 * TravelDataProvider — single entry point for all external travel data.
 *
 * This facade is the ONLY class the LangGraph agent and route handlers may
 * import from the providers folder. It:
 *
 *   1. Delegates activity requests to GeoapifyProvider.
 *   2. Delegates flight requests to AviationStackProvider.
 *   3. Wraps every call with the shared in-memory cache so identical queries
 *      within the same planning session never hit the external API twice.
 *   4. Provides graceful fallback — if an external API call returns empty or
 *      fails, callers receive an empty array rather than an exception.
 *
 * Instantiation:
 *   The module exports a singleton `travelDataProvider` that is created once
 *   when the module is first imported.  API keys are read from env at that
 *   point, so `env.ts` must have loaded the .env file first (which it does
 *   because env.ts runs dotenv.config() at import time).
 *
 * Feature flags:
 *   If an API key is missing the corresponding provider is disabled and its
 *   methods always return [].  This lets the system run in "local-only" mode
 *   without crashing when keys are not yet configured.
 */

import { providerEnv as env } from "./lib/env.js";
import { providerLogger as logger } from "./lib/logger.js";
import { sharedCache, CacheProvider } from "./cache/cache.provider.js";
import { GeoapifyProvider } from "./geoapify/geoapify.provider.js";
import { AviationStackProvider } from "./aviationstack/aviationstack.provider.js";
import type {
  ITravelDataProvider,
  GetActivitiesParams,
  GetFlightsParams,
  NormalizedActivity,
  NormalizedFlight,
  FlightSegment,
} from "./interfaces/travel-provider.interface.js";

// Re-export public types so callers only need one import path
export type {
  ITravelDataProvider,
  NormalizedActivity,
  NormalizedFlight,
  FlightSegment,
  GetActivitiesParams,
  GetFlightsParams,
} from "./interfaces/travel-provider.interface.js";

class TravelDataProvider implements ITravelDataProvider {
  private readonly geoapify: GeoapifyProvider | null;
  private readonly aviationstack: AviationStackProvider | null;
  private readonly cache: CacheProvider;

  constructor() {
    this.cache = sharedCache;

    // ── Geoapify ─────────────────────────────────────────────────────────
    if (env.GEOAPIFY_API_KEY) {
      try {
        this.geoapify = new GeoapifyProvider(env.GEOAPIFY_API_KEY);
        logger.info("[TravelDataProvider] Geoapify provider enabled");
      } catch (e) {
        logger.warn("[TravelDataProvider] Failed to initialize Geoapify", {
          error: e instanceof Error ? e.message : String(e),
        });
        this.geoapify = null;
      }
    } else {
      logger.info(
        "[TravelDataProvider] GEOAPIFY_API_KEY not set — Geoapify provider disabled",
      );
      this.geoapify = null;
    }

    // ── AviationStack ─────────────────────────────────────────────────────
    if (env.AVIATIONSTACK_API_KEY) {
      try {
        this.aviationstack = new AviationStackProvider(
          env.AVIATIONSTACK_API_KEY,
          env.AVIATIONSTACK_BASE_URL
        );
        logger.info("[TravelDataProvider] AviationStack provider enabled");
      } catch (e) {
        logger.warn("[TravelDataProvider] Failed to initialize AviationStack", {
          error: e instanceof Error ? e.message : String(e),
        });
        this.aviationstack = null;
      }
    } else {
      logger.info(
        "[TravelDataProvider] AVIATIONSTACK_API_KEY not set — AviationStack provider disabled",
      );
      this.aviationstack = null;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Return normalized tourist activities for a city.
   *
   * Cache strategy: results are stored by (city, sorted-preferences) key.
   * Cache miss → call Geoapify → store result → return.
   * If Geoapify is disabled or returns nothing, returns [] so the caller can fall
   * back to the local JSON dataset.
   */
  async getActivities(params: GetActivitiesParams): Promise<NormalizedActivity[]> {
    if (!this.geoapify) return [];

    const cacheKey = CacheProvider.activitiesKey(
      params.city,
      params.preferences,
    );

    const cached = this.cache.get<NormalizedActivity[]>(cacheKey);
    if (cached) {
      logger.info(`[TravelDataProvider] Activities cache HIT for "${params.city}"`);
      return cached;
    }

    logger.info(`[TravelDataProvider] Activities cache MISS — calling Geoapify for "${params.city}"`);
    const results = await this.geoapify.getActivities(params);

    if (results.length > 0) {
      this.cache.set(cacheKey, results);
    }

    return results;
  }

  /**
   * Return normalized flight offers between two cities.
   *
   * Should only be called when the user has selected "flight" as a transit
   * type. The caller (planDayNode) is responsible for this guard.
   *
   * Cache strategy: results are stored by (origin, destination, date, adults) key.
   */
  async getFlights(params: GetFlightsParams): Promise<NormalizedFlight[]> {
    if (!this.aviationstack) return [];

    const cacheKey = CacheProvider.flightsKey(
      params.origin,
      params.destination,
      params.departureDate,
      params.adults ?? 1,
    );

    const cached = this.cache.get<NormalizedFlight[]>(cacheKey);
    if (cached) {
      logger.info(`[TravelDataProvider] Flights cache HIT for "${params.origin}→${params.destination}"`);
      return cached;
    }

    logger.info(
      `[TravelDataProvider] Flights cache MISS — calling AviationStack for "${params.origin}→${params.destination}"`,
    );
    const results = await this.aviationstack.getFlights(params);

    if (results.length > 0) {
      this.cache.set(cacheKey, results);
    }

    return results;
  }

  // ── Diagnostics ───────────────────────────────────────────────────────────

  /** Returns which providers are currently active. */
  get status(): { geoapify: boolean; aviationstack: boolean; cacheSize: number } {
    return {
      geoapify: this.geoapify !== null,
      aviationstack: this.aviationstack !== null,
      cacheSize: this.cache.size,
    };
  }
}

/**
 * Module-level singleton.
 * Import this everywhere instead of instantiating TravelDataProvider directly.
 */
export const travelDataProvider = new TravelDataProvider();
