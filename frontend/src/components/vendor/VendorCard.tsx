import React from "react";
import { ShieldCheck, MapPin, Plus } from "lucide-react";
import { useTrip } from "../../context/TripContext";

interface VendorCardProps {
  photo: string;
  name: string;
  rating: number;
  distance: string;
  price: string;
  category: string;
  isLocal: boolean;
  description: string;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  photo,
  name,
  rating,
  distance,
  price,
  category,
  isLocal,
  description
}) => {
  const { showToast } = useTrip();

  return (
    <div className="glass-card hover:bg-slate-50/20 dark:hover:bg-slate-800/10 rounded-2xl overflow-hidden transition-all duration-300 border border-slate-150 dark:border-slate-800 flex flex-col group h-full">
      
      {/* Category Card Header Image */}
      <div className="h-44 w-full relative overflow-hidden bg-slate-105">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
        />
        
        {isLocal && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-teal-500/90 text-white shadow-md backdrop-blur-xs flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            100% LOCAL-FIRST
          </span>
        )}

        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-medium text-[10px] tracking-wide">
          {category}
        </span>
      </div>

      {/* Main card description */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
            <span className="shrink-0 flex items-center gap-0.5 text-xs text-accent font-bold">
              ★ {rating}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <MapPin className="h-3 w-3" />
            <span>{distance} from city center</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action card bottom bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 text-[10px] block leading-none">Starting from</span>
            <span className="text-sm font-heading font-extrabold text-slate-800 dark:text-white">
              {price}
            </span>
          </div>

          <button
            onClick={() => showToast(`Successfully requested booking for ${name}!`, "success")}
            className="btn-primary py-1.5 px-3 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Book Now
          </button>
        </div>

      </div>

    </div>
  );
};
