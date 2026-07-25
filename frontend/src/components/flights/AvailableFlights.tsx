import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Clock,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  ArrowRight,
  Wallet,
} from "lucide-react";
import type { Flight, DayPlan } from "../../types";

interface AvailableFlightsProps {
  /** The Day 1 plan — contains the selected flight + flightCost */
  day1?: DayPlan | null;
  origin?: string;
  destination?: string;
}

/** Format ISO-duration like "PT2H30M" → "2h 30m" */
function formatDuration(iso: string | undefined): string {
  if (!iso) return "—";
  const h = iso.match(/(\d+)H/)?.[1];
  const m = iso.match(/(\d+)M/)?.[1];
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return iso;
}

/** Format datetime string for display */
function formatTime(dt: string | undefined): string {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    // Return last 5 chars if it's already a time string like "14:30"
    return dt.length >= 5 ? dt.slice(-5) : dt;
  }
}

export const AvailableFlights: React.FC<AvailableFlightsProps> = ({
  day1,
  origin,
  destination,
}) => {
  const [expanded, setExpanded] = useState(true);

  const flight = day1?.flight as Flight | null | undefined;
  const flightCost = day1?.flightCost;

  // Nothing to show if no flight was planned
  if (!flight && !flightCost) return null;

  const segment = flight?.outboundSegments?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-premium"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-b border-slate-100 dark:border-slate-800"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Available Flight
            </h2>
            <p className="text-sm text-slate-500">
              {origin ?? flight?.origin ?? "Origin"} → {destination ?? flight?.destination ?? "Destination"}
              {flight?.departureDate ? ` · ${flight.departureDate}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {flightCost != null && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-bold shadow-sm">
              <Wallet className="w-4 h-4" />
              ₹{flightCost.toLocaleString("en-IN")}
            </span>
          )}
          <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="px-6 py-5"
        >
          {flight ? (
            <div className="space-y-4">
              {/* Main flight card */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-5 py-4 border border-slate-200 dark:border-slate-700">

                {/* Cheapest badge */}
                {flight.isCheapest && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-bold border border-green-200 dark:border-green-700">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Cheapest
                  </span>
                )}

                {/* Airline & Flight No */}
                <div className="flex-shrink-0 text-center sm:text-left">
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                    {segment?.airlineName ?? "Airline"}
                  </p>
                  <p className="text-sm text-slate-500 font-mono">
                    {segment?.flightNumber ?? "—"}
                  </p>
                </div>

                {/* Route & Time */}
                <div className="flex-1 flex items-center justify-center gap-4 text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white tabular-nums">
                      {formatTime(segment?.departureTime)}
                    </p>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {segment?.departureAirport ?? origin ?? "DEP"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-1 min-w-[80px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600 min-w-[24px]" />
                      <Plane className="w-4 h-4 rotate-90 text-primary" />
                      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-600 min-w-[24px]" />
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatDuration(flight.totalOutboundDuration)}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white tabular-nums">
                      {formatTime(segment?.arrivalTime)}
                    </p>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      {segment?.arrivalAirport ?? destination ?? "ARR"}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto">
                  <p className="text-2xl font-extrabold text-primary">
                    ₹{flight.totalPrice?.toLocaleString("en-IN") ?? "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    ₹{flight.pricePerPerson?.toLocaleString("en-IN")}/person
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{flight.currency ?? "INR"}</p>
                </div>
              </div>

              {/* Info note */}
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                This flight cost (₹{flightCost?.toLocaleString("en-IN")}) has already been factored into Day 1's budget.
              </p>
            </div>
          ) : (
            /* No flight found, but a cost was counted */
            <div className="text-center py-8 text-slate-500">
              <Plane className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">No live flight data available</p>
              <p className="text-sm mt-1">Flight cost of ₹{flightCost?.toLocaleString("en-IN")} is included in Day 1 total.</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AvailableFlights;
