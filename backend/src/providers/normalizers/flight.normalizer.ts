/**
 * Flight Normalizer — Amadeus Flight Offers Search v2 → NormalizedFlight
 *
 * Amadeus returns a complex nested JSON structure. This module flattens it
 * into the lean NormalizedFlight + FlightSegment interfaces so the rest of
 * the application never touches raw Amadeus JSON.
 *
 * Key transformations:
 *  - Currency conversion: Amadeus always returns in the currency requested.
 *    We request INR so no conversion is needed. If the API returns a different
 *    currency as a fallback, we tag the price with the actual currency and
 *    skip conversion (the agent prompt will mention the currency).
 *  - Airline name enrichment: Amadeus provides carrier codes (e.g. "6E").
 *    We maintain a small static lookup table for common Indian carriers.
 *    Unknown codes fall back to the code itself.
 *  - Duration: Amadeus uses ISO 8601 duration strings (e.g. "PT1H10M").
 *    We keep these as-is; the LLM can parse them naturally.
 */

import type {
  NormalizedFlight,
  FlightSegment,
} from "../interfaces/travel-provider.interface.js";

// ─── Raw Amadeus shapes (v2 Flight Offers Search) ────────────────────────────

export interface AmadeusPrice {
  currency: string;
  total: string;        // total for all travelers
  base: string;         // base fare
  grandTotal?: string;
}

export interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
  aircraft?: { code: string };
  numberOfStops?: number;
}

export interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  price: { total: string; currency: string };
}

export interface AmadeusOffer {
  id: string;
  price: AmadeusPrice;
  itineraries: AmadeusItinerary[];
  travelerPricings?: AmadeusTravelerPricing[];
  numberOfBookableSeats?: number;
  lastTicketingDate?: string;
}

// ─── Airline name lookup ─────────────────────────────────────────────────────

/**
 * Static lookup for common IATA carrier codes.
 * Extend this table as more airlines become relevant.
 */
const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo",
  "SG": "SpiceJet",
  "AI": "Air India",
  "UK": "Vistara",
  "G8": "Go First",
  "IX": "Air India Express",
  "QP": "Akasa Air",
  "EK": "Emirates",
  "QR": "Qatar Airways",
  "SQ": "Singapore Airlines",
  "TG": "Thai Airways",
  "BA": "British Airways",
  "LH": "Lufthansa",
};

function resolveAirlineName(code: string): string {
  return AIRLINE_NAMES[code.toUpperCase()] ?? code;
}

// ─── Segment normalizer ───────────────────────────────────────────────────────

function normalizeSegment(raw: AmadeusSegment): FlightSegment {
  return {
    departureAirport: raw.departure.iataCode,
    arrivalAirport: raw.arrival.iataCode,
    departureTime: raw.departure.at,
    arrivalTime: raw.arrival.at,
    duration: raw.duration,
    carrierCode: raw.carrierCode,
    airlineName: resolveAirlineName(raw.carrierCode),
    flightNumber: `${raw.carrierCode}-${raw.number}`,
  };
}

// ─── Offer normalizer ─────────────────────────────────────────────────────────

/**
 * Normalize a single Amadeus flight offer.
 *
 * @param offer      Raw Amadeus offer object.
 * @param index      Position in the result array (used to flag cheapest).
 * @param isCheapest True when this offer is the cheapest in the set.
 * @param adults     Number of adult travelers (used to compute pricePerPerson).
 */
export function normalizeAmadeusOffer(
  offer: AmadeusOffer,
  index: number,
  isCheapest: boolean,
  adults: number,
): NormalizedFlight {
  const totalPrice = parseFloat(offer.price.grandTotal ?? offer.price.total);
  const pricePerPerson = adults > 0 ? totalPrice / adults : totalPrice;

  const outboundItinerary = offer.itineraries[0];
  const returnItinerary = offer.itineraries[1]; // undefined for one-way

  return {
    id: `amadeus_${offer.id ?? index}`,
    totalPrice: Math.round(totalPrice),
    pricePerPerson: Math.round(pricePerPerson),
    currency: offer.price.currency,
    availableSeats: offer.numberOfBookableSeats ?? 9,
    outboundSegments: outboundItinerary
      ? outboundItinerary.segments.map(normalizeSegment)
      : [],
    returnSegments: returnItinerary
      ? returnItinerary.segments.map(normalizeSegment)
      : [],
    totalOutboundDuration: outboundItinerary?.duration ?? "PT0H",
    isCheapest,
    source: "amadeus",
  };
}

/**
 * Normalize an entire Amadeus Flight Offers Search response body.
 *
 * @param body   The parsed JSON body from the Amadeus API.
 * @param adults Number of adult travelers for per-person price calculation.
 * @returns Array of NormalizedFlight objects, cheapest first.
 */
export function normalizeAmadeusResponse(
  body: { data: AmadeusOffer[] },
  adults: number,
): NormalizedFlight[] {
  if (!Array.isArray(body.data) || body.data.length === 0) return [];

  // Amadeus already sorts by price ascending, but we verify and mark cheapest.
  const sorted = [...body.data].sort(
    (a, b) =>
      parseFloat(a.price.grandTotal ?? a.price.total) -
      parseFloat(b.price.grandTotal ?? b.price.total),
  );

  return sorted.map((offer, idx) =>
    normalizeAmadeusOffer(offer, idx, idx === 0, adults),
  );
}
