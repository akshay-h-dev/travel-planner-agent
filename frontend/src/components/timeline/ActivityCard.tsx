import React from "react";
import { Star, Clock, Award, ArrowLeftRight } from "lucide-react";
import type { Activity } from "../../types";
import { formatCurrency } from "../../utils/format";

interface ActivityCardProps {
  activity: Activity;
  onSwap?: () => void;
  travelers: number;
  bookingStatus?: "pending" | "confirmed";
  onConfirm?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSwap, travelers, bookingStatus, onConfirm }) => {
  return (
    <div className="glass-card hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-2xl p-4 transition-all duration-200 border border-slate-100 dark:border-slate-800 flex gap-4 items-start relative group">
      
      {/* Image or Category representation */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-105 border dark:border-slate-850">
        <img
          src={activity.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80"}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
        />
      </div>

      {/* Content description */}
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {activity.isLocal && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md bg-secondary/15 text-secondary border border-secondary/20">
              <Award className="h-3 w-3" />
              LOCAL OPERATOR
            </span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {activity.category}
          </span>
        </div>

        <h4 className="font-heading font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">
          {activity.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
          {activity.description}
        </p>

        <div className="flex justify-between items-center pt-2">
          {/* Stats info */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-0.5 text-accent font-semibold">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {activity.rating}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {activity.duration}
            </span>
          </div>

          {/* Pricing indicator */}
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(activity.price * travelers)}
              </span>
            <span className="text-[9px] text-slate-400 block">for {travelers} travelers</span>
          </div>
        </div>
      </div>

      {/* Hover actions swap activity */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {bookingStatus === "confirmed" ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-lg border border-green-200 dark:border-green-800">
            Confirmed
          </span>
        ) : (
          <button
            onClick={onConfirm}
            className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            Book
          </button>
        )}
        {onSwap && (
          <button
            onClick={onSwap}
            className="p-1.5 rounded-lg bg-white dark:bg-dark-card border border-slate-205 dark:border-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800 text-primary"
            title="Swap Activity"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
