import { providerLogger as logger } from "../lib/logger.js";
import type {
  GetFlightsParams,
  NormalizedFlight,
} from "../interfaces/travel-provider.interface.js";
import { normalizeAviationStackResponse } from "../normalizers/flight.normalizer.js";
import type { AviationStackFlightRaw } from "../normalizers/flight.normalizer.js";

// ─── IATA city-to-airport mapping ────────────────────────────────────────────

const CITY_TO_IATA: Record<string, string> = {
  // South India
  bangalore: "BLR",
  bengaluru: "BLR",
  chennai: "MAA",
  hyderabad: "HYD",
  kochi: "COK",
  cochin: "COK",
  thiruvananthapuram: "TRV",
  trivandrum: "TRV",
  // West India
  goa: "GOI",
  mumbai: "BOM",
  ahmedabad: "AMD",
  // North India
  delhi: "DEL",
  "new delhi": "DEL",
  jaipur: "JAI",
  amritsar: "ATQ",
  varanasi: "VNS",
  lucknow: "LKO",
  // East India
  kolkata: "CCU",
  bhubaneswar: "BBI",
  // North East India
  guwahati: "GAU",
  // Islands
  "port blair": "IXZ",
};

/** Resolve a city name or IATA code to an IATA airport code. */
function resolveIATA(cityOrCode: string): string {
  const trimmed = cityOrCode.trim();
  if (/^[A-Z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  return CITY_TO_IATA[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

export class AviationStackProvider {
  /**
   * @param apiKey   AviationStack API key (access_key).
   * @param baseUrl  API base URL — e.g. http://api.aviationstack.com/v1
   */
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = "http://api.aviationstack.com/v1"
  ) {
    if (!apiKey) {
      throw new Error("AviationStackProvider: apiKey is required");
    }
  }

  /**
   * Search for flights and return normalized results.
   */
  async getFlights(params: GetFlightsParams): Promise<NormalizedFlight[]> {
    const { origin, destination, departureDate } = params;

    const depIata = resolveIATA(origin);
    const arrIata = resolveIATA(destination);

    logger.info("[AviationStack] Fetching flights", {
      origin,
      resolvedOrigin: depIata,
      destination,
      resolvedDestination: arrIata,
      departureDate,
    });

    try {
      const url = new URL(`${this.baseUrl}/flights`);
      url.searchParams.append("access_key", this.apiKey);
      url.searchParams.append("dep_iata", depIata);
      url.searchParams.append("arr_iata", arrIata);
      url.searchParams.append("flight_date", departureDate);
      url.searchParams.append("limit", "20");

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`AviationStack request failed with status ${res.status}`);
      }

      const body = (await res.json()) as { data: AviationStackFlightRaw[] };
      const rawFlights = body.data ?? [];

      // Normalize flights using the normalized helper
      return normalizeAviationStackResponse(rawFlights);
    } catch (e) {
      logger.error("[AviationStack] Failed to fetch/normalize flights", {
        error: e instanceof Error ? e.message : String(e),
      });
      return [];
    }
  }
}
