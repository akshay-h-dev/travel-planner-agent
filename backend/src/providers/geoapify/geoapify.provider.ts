import { providerLogger as logger } from "../lib/logger.js";
import type {
  GetActivitiesParams,
  NormalizedActivity,
} from "../interfaces/travel-provider.interface.js";
import { normalizeGeoapifyPlace } from "../normalizers/activity.normalizer.js";

// ─── Geoapify Places API response shapes ─────────────────────────────────────

interface GeocodeResult {
  lat: number;
  lon: number;
  formatted?: string;
}

interface GeocodeResponse {
  results: GeocodeResult[];
}

interface GeoapifyPlaceFeature {
  properties: any;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
}

interface PlacesResponse {
  features: GeoapifyPlaceFeature[];
}

// ─── Category keyword → Geoapify categories mapping ─────────────────────────

const PREFERENCE_TO_CATEGORIES: Record<string, string> = {
  heritage: "tourism.sights,building.historic,heritage",
  history: "tourism.sights,building.historic,heritage",
  food: "catering.restaurant,catering.cafe",
  nature: "leisure.park,natural,leisure.garden",
  adventure: "activity.sport_club,entertainment.theme_park",
  shopping: "commercial.shopping_mall,commercial.marketplace",
  nightlife: "catering.pub,catering.bar,entertainment.nightclub",
  culture: "entertainment.culture,entertainment.museum,entertainment.theater",
  museums: "entertainment.museum",
  art: "entertainment.culture.art_gallery,entertainment.museum",
};

function buildCategoriesFilter(preferences: string[]): string {
  if (!preferences.length) {
    // Default: broad tourist interest categories
    return "tourism.sights,leisure.park,entertainment.museum,building.historic";
  }
  const categoriesSet = new Set<string>();
  for (const pref of preferences) {
    const cats = PREFERENCE_TO_CATEGORIES[pref.toLowerCase()];
    if (cats) {
      cats.split(",").forEach((c) => categoriesSet.add(c.trim()));
    } else {
      // Pass the raw preference through in case Geoapify recognizes it
      categoriesSet.add(pref.toLowerCase());
    }
  }
  return Array.from(categoriesSet).join(",");
}

export class GeoapifyProvider {
  private readonly baseUrl = "https://api.geoapify.com";

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error("GeoapifyProvider: apiKey is required");
  }

  /**
   * Fetch normalized activities for a city.
   */
  async getActivities(params: GetActivitiesParams): Promise<NormalizedActivity[]> {
    const { city, preferences = [], radiusKm = 15, limit = 20 } = params;

    logger.info("[Geoapify] Fetching activities", { city, preferences, radiusKm });

    try {
      // Step 1 — resolve city coordinates
      const coords = await this.getCityCoords(city);
      if (!coords) {
        logger.warn("[Geoapify] City not found in geocoding API", { city });
        return [];
      }

      // Step 2 — fetch places using the category filter & circle bias/filter
      const places = await this.fetchPlaces(
        coords.lat,
        coords.lon,
        radiusKm * 1000,
        preferences,
        limit
      );

      // Step 3 — normalize and return results
      return places.map((feature) => normalizeGeoapifyPlace(feature, city));
    } catch (e) {
      logger.error("[Geoapify] Failed to fetch/normalize activities", {
        error: e instanceof Error ? e.message : String(e),
      });
      return [];
    }
  }

  /** Geocode a city name to coordinates */
  private async getCityCoords(city: string): Promise<{ lat: number; lon: number } | null> {
    const url = `${this.baseUrl}/v1/geocode/search?text=${encodeURIComponent(
      city
    )}&apiKey=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding request failed with status ${res.status}`);
    }

    const data = (await res.json()) as GeocodeResponse;
    if (!data.results || data.results.length === 0) {
      return null;
    }

    const first = data.results[0];
    return { lat: first.lat, lon: first.lon };
  }

  /** Fetch places near coords */
  private async fetchPlaces(
    lat: number,
    lon: number,
    radiusMeters: number,
    preferences: string[],
    limit: number
  ): Promise<GeoapifyPlaceFeature[]> {
    const categories = buildCategoriesFilter(preferences);
    const filter = `circle:${lon},${lat},${radiusMeters}`;
    const bias = `proximity:${lon},${lat}`;

    const url = `${this.baseUrl}/v2/places?categories=${encodeURIComponent(
      categories
    )}&filter=${encodeURIComponent(filter)}&bias=${encodeURIComponent(
      bias
    )}&limit=${limit}&apiKey=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Places request failed with status ${res.status}`);
    }

    const data = (await res.json()) as PlacesResponse;
    return data.features || [];
  }
}
