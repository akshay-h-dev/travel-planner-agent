import React from "react";
import { motion } from "framer-motion";
import type { DayPlan } from "../../types";
import { DayCard } from "./DayCard";
import { MapPin } from "lucide-react";

interface TimelineProps {
  days: DayPlan[];
  travelers: number;
}

export const Timeline: React.FC<TimelineProps> = ({ days, travelers }) => {
  if (days.length === 0) {
    return (
      <div className="text-center py-10 glass-card rounded-3xl text-slate-450 border border-dashed">
        No day plans found. Please generate an itinerary.
      </div>
    );
  }

  return (
    <div className="relative pl-0 sm:pl-8 space-y-12">
      {/* Timeline track rod */}
      <div className="absolute top-8 bottom-8 left-0 sm:left-4 w-[2px] bg-gradient-to-b from-primary via-secondary to-teal-100 dark:via-secondary dark:to-slate-800 hidden sm:block"></div>

      {days.map((dayPlan, index) => (
        <motion.div
          key={dayPlan.day}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative"
        >
          {/* Tracker bullet point */}
          <div className="absolute top-5 -left-12 w-8 h-8 rounded-full bg-white dark:bg-dark-card border-2 border-primary dark:border-secondary flex items-center justify-center text-primary dark:text-secondary shadow-md hidden sm:flex z-10 transition-colors duration-200">
            <span className="text-[10px] font-extrabold">{dayPlan.day}</span>
          </div>

          {/* Render actual card content */}
          <DayCard dayPlan={dayPlan} travelers={travelers} />
        </motion.div>
      ))}

      {/* Completion Marker */}
      <div className="relative pt-2 text-center text-xs text-slate-450 font-medium flex items-center justify-center gap-2">
        <MapPin className="h-4 w-4 text-secondary fill-secondary/20" />
        <span>End of Itinerary Plan • TripWay AI Optimized</span>
      </div>
    </div>
  );
};
