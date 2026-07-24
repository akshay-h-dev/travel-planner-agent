/**
 * Amadeus Provider
 *
 * Fetches real-time flight offers using the Amadeus for Developers API
 * (https://developers.amadeus.com) — specifically the
 * Flight Offers Search v2 endpoint.
 *
 * Authentication:
 *   Amadeus uses OAuth 2.0 client-credentials flow.
 *   1. POST /v1/security/oauth2/token  → short-lived Bearer token (30 min)
 *   2. GET  /v2/shopping/flight-offers  → flight search
 *
 * The provider caches the Bearer token in memory and refreshes it only
 * when it expires.  Flight results are NOT cached here — caching is the
 * responsibility of TravelDataProvider.
 *
 * City → IATA mapping:
 *   Amadeus requires IATA airport codes.  We maintain a small static map
 *   for Indian cities to keep the MVP self-contained.  The map can be
 *   extended or replaced with the Amadeus Airport & City Search API later.
 *
 * Free tier limits (test environment):
 *   - 2 000 calls / month
 *   - Sandbox data (prices are not real)
 *   - Production credentials require a separate application review.
 */

import { providerLogger as logger } from "../lib/logger.js";
import type {
  GetFlightsParams,
  NormalizedFlight,
} from "../interfaces/travel-provider.interface.js";
import {
  normalizeAmadeusResponse,
  type AmadeusOffer,
} from "../normalizers/flight.normalizer.js";

// ─── IATA city-to-airport mapping ────────────────────────────────────────────

/**
 * Maps common Indian city names (lowercase) to their primary IATA airport code.
 * Add entries here as more cities are supported.
 */
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
  // If it already looks like a 3-letter IATA code, return uppercase
  if (/^[A-Z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  return CITY_TO_IATA[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

// ─── Token cache ──────────────────────────────────────────────────────────────

interface AmadeusToken {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
  /** Absolute expiry as Unix ms timestamp (computed on receipt). */
  expiresAt: number;
}

// ─── Provider class ───────────────────────────────────────────────────────────

export class AmadeusProvider {
  private readonly tokenUrl: string;
  private readonly flightSearchUrl: string;
  private cachedToken: AmadeusToken | null = null;

  /**
   * @param apiKey     Amadeus API key (client_id).
   * @param apiSecret  Amadeus API secret (client_secret).
   * @param baseUrl    API base URL — use test URL for sandbox, prod URL for live.
   */
  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    baseUrl: string = "https://test.api.amadeus.com",
  ) {
    if (!apiKey || !apiSecret) {
      throw new Error("AmadeusProvider: apiKey and apiSecret are required");
    }
    this.tokenUrl = `${baseUrl}/v1/security/oauth2/token`;
    this.flightSearchUrl = `${baseUrl}/v2/shopping/flight-offers`;
  }

  // ── Public method ────────────────────────────────────────────────────────

  /**
   * Search for flight offers and return normalized results.
   * Returns an empty array (never throws) if the API is unavailable.
   */
  async getFlights(params: GetFlightsParams): Promise<NormalizedFlight[]> {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      currency = "INR",
      maxOffers = 5,
    } = params;

    const originCode = resolveIATA(origin);
    const destCode = resolveIATA(destination);

    logger.info("[Amadeus] Searching flights", {
      origin: originCode,
      destination: destCode,
      departureDate,
      adults,
    });

    try {
      const token = await this.getAccessToken();

      const query = new URLSearchParams({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate,
        adults: String(adults),
        currencyCode: currency,
        max: String(maxOffers),
        nonStop: "false",
      });

      if (returnDate) {
        query.set("returnDate", returnDate);
      }

      const url = `${this.flightSearchUrl}?${query.toString()}`;
      const body = await this.fetchJson<{ data: AmadeusOffer[] }>(url, token);

      if (!body || !body.data) {
        logger.warn("[Amadeus] Empty response from flight search", { originCode, destCode });
        return [];
      }

      const normalized = normalizeAmadeusResponse(body, adults);
      logger.info(`[Amadeus] Returning ${normalized.length} flight offers`, {
        origin: originCode,
        destination: destCode,
      });
      return normalized;
    } catch (err) {
      logger.error("[Amadeus] getFlights failed", {
        origin: originCode,
        destination: destCode,
        error: err instanceof Error ? err.message : String(err),
      });
      // Graceful degradation — caller can proceed without flight data
      return [];
    }
  }

  // ── Token management ─────────────────────────────────────────────────────

  /**
   * Return a valid Bearer token, refreshing if the cached one has expired.
   * Token is cached for its stated lifetime minus a 60-second safety margin.
   */
  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      logger.debug("[Amadeus] Reusing cached access token");
      return this.cachedToken.access_token;
    }

    logger.info("[Amadeus] Fetching new access token");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.apiKey,
      client_secret: this.apiSecret,
    });

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Amadeus token request failed (${res.status}): ${text}`);
    }

    const token = (await res.json()) as AmadeusToken;
    // Store token with an expiry timestamp, minus 60s safety buffer
    this.cachedToken = {
      ...token,
      expiresAt: Date.now() + (token.expires_in - 60) * 1_000,
    };

    logger.info("[Amadeus] Access token obtained", {
      expiresIn: token.expires_in,
    });
    return this.cachedToken.access_token;
  }

  // ── Generic fetcher ──────────────────────────────────────────────────────

  private async fetchJson<T>(url: string, bearerToken: string): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        logger.warn("[Amadeus] HTTP error on flight search", {
          status: res.status,
          body: text.slice(0, 200),
        });
        return null;
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
