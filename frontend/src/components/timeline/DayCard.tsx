import React from "react";
import { Home, Navigation, UserCheck, Trash } from "lucide-react";
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

  const handleRemoveGuide = () => {
    replaceGuide(dayPlan.day, null);
  };

  return (
    <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium relative transition-all duration-300">

      {/* Header Day */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm">
            D{dayPlan.day}
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white">
              Day {dayPlan.day} Schedule
            </h3>
            <p className="text-xs text-slate-400 font-medium">Itinerary Segment</p>
          </div>
        </div>

        {/* Cost Summary indicator */}
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Daily Outflow</span>
          <span className="font-heading font-extrabold text-sm text-primary dark:text-teal-400">
            {formatCurrency(dayPlan.dailyCost)}
          </span>
        </div>
      </div>

      {/* Main Grid: Activities & Operator cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column: Activities list */}
        <div className="lg:col-span-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
            Daily Activities
          </h4>

          <div className="space-y-3">
            {dayPlan.activities.map((act) => (
              <div key={act.id} className="relative">
                <span className="absolute top-1/2 -left-3.5 transform -translate-y-1/2 w-1.5 h-10 bg-slate-205 dark:bg-slate-700/80 rounded-r-md block"></span>
                <div className="text-[10px] font-bold text-primary dark:text-secondary uppercase select-none tracking-widest pl-1.5 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 dark:bg-secondary"></span>
                  {act.timeSlot}
                </div>
                <ActivityCard
                  activity={act}
                  travelers={travelers}
                  bookingStatus={currentItinerary?.bookingStatus?.[act.id]}
                  onConfirm={() => confirmBooking(act.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Stay, Guide, Transport operators */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-2">
            Local Resources
          </h4>

          {/* Stay widget */}
          {dayPlan.stay ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" /> Stay Location
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">
                    {dayPlan.stay.name}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {dayPlan.stay.isLocal && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-50 dark:bg-teal-900/30 text-secondary border border-teal-200/30">
                        LOCAL
                      </span>
                    )}
                    {currentItinerary?.bookingStatus?.[dayPlan.stay.id] === "confirmed" ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        CONFIRMED
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmBooking(dayPlan.stay!.id)}
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        BOOK
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 line-clamp-1">{dayPlan.stay.description}</p>
                <div className="flex justify-between items-center pt-1 text-[10px] font-bold">
                  <span className="text-slate-450">{formatCurrency(dayPlan.stay.pricePerNight)} / night</span>
                  <span className="text-accent text-[9px]">★ {dayPlan.stay.rating}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed dark:border-slate-850 p-4 text-center rounded-xl text-xs text-slate-450">
              No stay booked.
            </div>
          )}

          {/* Transport widget */}
          {dayPlan.transport ? (
            <div className="space-y-2">
              <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                <Navigation className="h-3.5 w-3.5" /> Transport Model
              </span>
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center gap-1">
                  <span className="font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">
                    {dayPlan.transport.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {dayPlan.transport.type}
                    </span>
                    {currentItinerary?.bookingStatus?.[dayPlan.transport.id] === "confirmed" ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        CONFIRMED
                      </span>
                    ) : (
                      <button
                        onClick={() => confirmBooking(dayPlan.transport!.id)}
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        BOOK
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">{dayPlan.transport.provider}</p>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {formatCurrency(dayPlan.transport.pricePerDay)} / day
                </div>
              </div>
            </div>
          ) : null}

          {/* Guide widget */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Personal Guide
              </span>
            </div>
            {dayPlan.guide ? (
              <div className="p-3 bg-white dark:bg-dark-card border border-slate-150 dark:border-slate-800 rounded-xl flex items-center gap-3">
                <img
                  src={dayPlan.guide.avatarUrl}
                  alt={dayPlan.guide.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                />
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-slate-800 dark:text-white line-clamp-1">
                      {dayPlan.guide.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-[#F59E0B]">★ {dayPlan.guide.rating}</span>
                      {currentItinerary?.bookingStatus?.[dayPlan.guide.id] === "confirmed" ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                          CONFIRMED
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmBooking(dayPlan.guide!.id)}
                          className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          BOOK
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-450 leading-none">
                    <span>{formatCurrency(dayPlan.guide.pricePerDay)} / day</span>
                    <button
                      onClick={handleRemoveGuide}
                      className="text-danger hover:underline hover:text-red-750"
                      title="Remove Guide"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center text-[11px] text-slate-400 font-medium">
                No guide scheduled yet.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};