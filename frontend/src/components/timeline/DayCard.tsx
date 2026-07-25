import React, { useState } from "react";
import {
  Home,
  Navigation,
  UserCheck,
  Trash,
  ChevronDown,
  ChevronUp,
  Star,
  Wallet,
  MapPin,
} from "lucide-react";
import type { DayPlan } from "../../types";
import { ActivityCard } from "./ActivityCard";
import { formatCurrency } from "../../utils/format";
import { useTrip } from "../../context/TripContext";

interface DayCardProps {
  dayPlan: DayPlan;
  travelers: number;
}

export const DayCard: React.FC<DayCardProps> = ({ dayPlan, travelers }) => {
  const { replaceGuide, currentItinerary, confirmBooking } = useTrip();
  const [logisticsOpen, setLogisticsOpen] = useState(false);

  const handleRemoveGuide = () => {
    replaceGuide(dayPlan.day, null);
  };

  const totalActivitiesCost = dayPlan.activities.reduce((s, a) => s + a.price * travelers, 0);

  return (
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-premium transition-all duration-300">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-xl shadow-sm">
            D{dayPlan.day}
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl md:text-2xl text-slate-800 dark:text-white">
              Day {dayPlan.day}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {dayPlan.activities.length} activities planned
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily cost chip */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-right">
            <span className="text-xs text-slate-500 block">Daily Cost</span>
            <span className="font-extrabold text-lg text-primary dark:text-teal-400">
              {formatCurrency(dayPlan.dailyCost)}
            </span>
          </div>

          {/* Replanned badge */}
          {dayPlan.replanned && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700">
              Replanned
            </span>
          )}
        </div>
      </div>

      {/* ── Activities — PRIMARY FOCUS (full width) ──────────────── */}
      <div className="px-6 py-5 space-y-5">

        {/* Section label */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            What to Do Today
          </h4>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {formatCurrency(totalActivitiesCost)} total for {travelers} traveler{travelers > 1 ? "s" : ""}
          </span>
        </div>

        {dayPlan.activities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-base">No activities planned for this day.</p>
            <p className="text-sm mt-1">Try regenerating the itinerary with your preferences.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayPlan.activities.map((act, idx) => {
              // Find matching time slot
              const slot = dayPlan.schedule?.find((s) => s.activityId === act.id);
              const timeLabel = slot?.time ?? ["09:00", "12:00", "15:00", "18:00"][idx] ?? "";

              return (
                <div key={act.id} className="relative">
                  {/* Time label pill */}
                  {timeLabel && (
                    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 px-3 py-1.5 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-primary dark:bg-secondary" />
                        {timeLabel}
                        {slot?.duration && (
                          <span className="text-slate-400 font-normal">· {slot.duration}</span>
                        )}
                      </span>
                      {slot?.note && (
                        <span className="text-xs text-slate-400 italic">{slot.note}</span>
                      )}
                    </div>
                  )}
                  <ActivityCard
                    activity={act}
                    travelers={travelers}
                    bookingStatus={currentItinerary?.bookingStatus?.[act.id]}
                    onConfirm={() => confirmBooking(act.id)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ── LLM Note ─────────────────────────────────────────── */}
        {dayPlan.note && (
          <div className="mt-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              💡 {dayPlan.note}
            </p>
          </div>
        )}
      </div>

      {/* ── Logistics Accordion ───────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setLogisticsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-400" />
            Logistics — Stay, Transport &amp; Guide
          </span>
          {logisticsOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {logisticsOpen && (
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-900/20">

            {/* Stay */}
            {dayPlan.stay ? (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Home className="h-3.5 w-3.5" />
                  Stay
                </div>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">
                  {dayPlan.stay.name}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">{dayPlan.stay.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(dayPlan.stay.pricePerNight)}<span className="text-xs font-normal text-slate-400">/night</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {dayPlan.stay.rating}
                  </span>
                </div>
                <div className="pt-1">
                  {currentItinerary?.bookingStatus?.[dayPlan.stay.id] === "confirmed" ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">Confirmed</span>
                  ) : (
                    <button
                      onClick={() => confirmBooking(dayPlan.stay!.id)}
                      className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center text-xs text-slate-400">
                No stay booked.
              </div>
            )}

            {/* Transport */}
            {dayPlan.transport ? (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Navigation className="h-3.5 w-3.5" />
                  Transport
                </div>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">
                  {dayPlan.transport.name}
                </p>
                <p className="text-xs text-slate-500">{dayPlan.transport.description ?? dayPlan.transport.provider}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(dayPlan.transport.pricePerDay)}<span className="text-xs font-normal text-slate-400">/day</span>
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                    {dayPlan.transport.type}
                  </span>
                </div>
                <div className="pt-1">
                  {currentItinerary?.bookingStatus?.[dayPlan.transport.id] === "confirmed" ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">Confirmed</span>
                  ) : (
                    <button
                      onClick={() => confirmBooking(dayPlan.transport!.id)}
                      className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center text-xs text-slate-400">
                No transport assigned.
              </div>
            )}

            {/* Guide */}
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5" />
                  Guide
                </span>
              </div>

              {dayPlan.guide ? (
                <>
                  <div className="flex items-center gap-2">
                    <img
                      src={dayPlan.guide.avatarUrl}
                      alt={dayPlan.guide.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/20"
                    />
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">
                        {dayPlan.guide.name}
                      </p>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {dayPlan.guide.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(dayPlan.guide.pricePerDay)}<span className="text-xs font-normal text-slate-400">/day</span>
                    </span>
                    {currentItinerary?.bookingStatus?.[dayPlan.guide.id] === "confirmed" ? (
                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">Confirmed</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => confirmBooking(dayPlan.guide!.id)}
                          className="text-xs font-bold bg-primary text-white px-2 py-1 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Book
                        </button>
                        <button
                          onClick={handleRemoveGuide}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove Guide"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-medium text-center py-4">
                  No guide scheduled.
                </p>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};