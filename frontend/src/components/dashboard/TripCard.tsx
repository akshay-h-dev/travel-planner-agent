import React from "react";
import { Link } from "react-router-dom";
import { CalendarRange, Trash, Eye, Award } from "lucide-react";
import type { Itinerary } from "../../types";
import { useTrip } from "../../context/TripContext";
import { MOCK_CITIES } from "../../services/mockData";

interface TripCardProps {
  itinerary: Itinerary;
  isSaved?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ itinerary, isSaved = false }) => {
  const { deleteTrip, setCurrentItinerary } = useTrip();

  // Find image from mock cities
  const cityMeta = MOCK_CITIES.find(c => c.name.toLowerCase().includes(itinerary.city.toLowerCase()) || itinerary.city.toLowerCase().includes(c.id));
  const cardImage = cityMeta ? cityMeta.imageUrl : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="glass-card hover:bg-slate-50/20 dark:hover:bg-slate-800/10 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col group h-full">
      
      {/* City Banner Image */}
      <div className="h-40 w-full relative overflow-hidden bg-slate-105">
        <img
          src={cardImage}
          alt={itinerary.city}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
        
        {/* City Info */}
        <div className="absolute bottom-3 left-4 text-white">
          <span className="text-[9px] uppercase font-bold tracking-wider text-teal-300 block">AI GENERATED</span>
          <h3 className="font-heading font-extrabold text-base leading-none">
            {itinerary.city}
          </h3>
        </div>

        {/* Local indicator */}
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-teal-500/90 text-white font-medium text-[9px] shadow flex items-center gap-1 backdrop-blur-xs">
          <Award className="h-3 w-3" />
          {itinerary.localOperatorPercentage}% LOCAL
        </span>
      </div>

      {/* Card Content description */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
          <div>
            <span className="text-[10px] text-slate-400 block font-normal leading-none mb-0.5">Duration</span>
            <span className="flex items-center gap-1">
              <CalendarRange className="h-3.5 w-3.5 text-primary" />
              {itinerary.totalDays} Days
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-normal leading-none mb-0.5">Travelers</span>
            <span>{itinerary.travelers} Guest{itinerary.travelers > 1 ? "s" : ""}</span>
          </div>
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block font-normal leading-none mb-0.5">Budget Limit</span>
            <span className="text-slate-800 dark:text-white font-bold">₹{itinerary.budget}</span>
          </div>
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block font-normal leading-none mb-0.5">Total Spent</span>
            <span className={itinerary.totalCost > itinerary.budget ? "text-danger" : "text-primary dark:text-teal-400"}>
              ₹{itinerary.totalCost}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/results"
            onClick={() => setCurrentItinerary(itinerary)}
            className="flex items-center gap-1 text-[10px] font-bold text-primary dark:text-secondary hover:underline"
          >
            <Eye className="h-3.5 w-3.5" /> View Active Plan
          </Link>
          
          {isSaved && (
            <button
              onClick={() => deleteTrip(itinerary.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Delete Saved Trip"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
