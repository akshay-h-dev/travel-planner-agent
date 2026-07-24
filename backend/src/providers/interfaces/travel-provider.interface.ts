/**
 * Travel Data Provider — shared interfaces.
 *
 * Defines the common internal models that all providers must produce after
 * normalizing their raw API responses, and the single ITravelDataProvider
 * contract that the LangGraph agent depends on.
 *
 * The LangGraph agent NEVER imports a concrete provider — it only depends on
 * ITravelDataProvider and the models defined here.
 */

// ─── Internal Activity Model ────────────────────────────────────────────────

/**
 * Normalized tourist attraction / activity returned by any provider.
 * Mirrors the existing local Activity shape so nodes.ts can treat both
 * JSON-dataset activities and API-sourced activities identically.
 */
export interface NormalizedActivity {
  /** Globally unique id (provider-prefixed, e.g. "otm_12345"). */
  id: string;
  name: string;
  /** Destination city the activity belongs to. */
  city: string;
  /** Estimated admission / participation cost in INR (0 = free). */
  price: number;
  /** Human-readable duration estimate, e.g. "2–3 hours". */
  duration: string;
  /** 0–5 star rating (0 when unavailable). */
  rating: number;
  /** Primary category, e.g. "museum", "nature", "adventure". */
  category: string;
  /** Short description of the attraction. */
  description: string;
  /** True when operated by a verified local business. */
  isLocal: boolean;
  /** Source of this record — useful for debugging. */
  source: "opentripmap" | "local_dataset";
  /** Optional geo-coordinates. */
  coordinates?: { lat: number; lon: number };
  /** Optional opening hours string returned by the API. */
  openingHours?: string;
  /** Optional image URL. */
  imageUrl?: string;
}

// ─── Internal Flight Model ───────────────────────────────────────────────────

/** A single flight segment within an offer. */
export interface FlightSegment {
  /** IATA departure airport code, e.g. "BLR". */
  departureAirport: string;
  /** IATA arrival airport code, e.g. "GOI". */
  arrivalAirport: string;
  /** ISO-8601 departure datetime string. */
  departureTime: string;
  /** ISO-8601 arrival datetime string. */
  arrivalTime: string;
  /** ISO duration string, e.g. "PT1H10M". */
  duration: string;
  /** IATA airline code, e.g. "6E". */
  carrierCode: string;
  /** Human-readable airline name (enriched during normalization). */
  airlineName: string;
  /** Flight number, e.g. "6E-421". */
  flightNumber: string;
}

/**
 * Normalized flight offer returned by any provider.
 * An offer may contain multiple segments (connecting flights).
 */
export interface NormalizedFlight {
  /** Globally unique offer id (provider-prefixed, e.g. "amadeus_1"). */
  id: string;
  /** Total price for ALL travelers in INR. */
  totalPrice: number;
  /** Price per single traveler in INR. */
  pricePerPerson: number;
  /** Currency string, e.g. "INR". */
  currency: string;
  /** Number of seats available at this price. */
  availableSeats: number;
  /** Outbound segments (departure city → destination). */
  outboundSegments: FlightSegment[];
  /** Return segments (destination → departure city). Empty for one-way. */
  returnSegments: FlightSegment[];
  /** Total outbound travel duration (ISO 8601). */
  totalOutboundDuration: string;
  /** True when this is the cheapest offer in the result set. */
  isCheapest: boolean;
  /** Source of this record. */
  source: "amadeus";
}

// ─── Query Parameter Types ───────────────────────────────────────────────────

export interface GetActivitiesParams {
  /** Destination city name, e.g. "Goa". */
  city: string;
  /** User preference keywords, e.g. ["heritage", "nature"]. */
  preferences?: string[];
  /** Optional max radius in km around city centre (default 10). */
  radiusKm?: number;
  /** Max number of results to return (default 20). */
  limit?: number;
}

export interface GetFlightsParams {
  /** IATA code or city name of departure, e.g. "BLR" or "Bangalore". */
  origin: string;
  /** IATA code or city name of destination, e.g. "GOI" or "Goa". */
  destination: string;
  /** ISO-8601 departure date, e.g. "2025-02-01". */
  departureDate: string;
  /** Optional ISO-8601 return date for round-trip search. */
  returnDate?: string;
  /** Number of adult passengers (default 1). */
  adults?: number;
  /** Currency code for pricing (default "INR"). */
  currency?: string;
  /** Max offers to return (default 5). */
  maxOffers?: number;
}

// ─── Provider Contract ───────────────────────────────────────────────────────

/**
 * The single interface the LangGraph agent depends on.
 * Both the real implementation and any test stub must satisfy this contract.
 */
export interface ITravelDataProvider {
  /**
   * Return normalized tourist activities / attractions for a city.
   * Results are cached by city + preference key.
   */
  getActivities(params: GetActivitiesParams): Promise<NormalizedActivity[]>;

  /**
   * Return normalized flight offers between two cities.
   * Should only be called when the user has selected "flight" as a transit type.
   * Results are cached by origin + destination + date.
   */
  getFlights(params: GetFlightsParams): Promise<NormalizedFlight[]>;
}
