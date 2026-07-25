import React from "react";
import { Star, Clock, Award, ArrowLeftRight, MapPin, Activity as ActivityIcon, Coffee, Camera } from "lucide-react";
import type { Activity } from "../../types";
import { formatCurrency } from "../../utils/format";

interface ActivityCardProps {
  activity: Activity;
  onSwap?: () => void;
  travelers: number;
  bookingStatus?: "pending" | "confirmed";
  onConfirm?: () => void;
}

const renderFormattedText = (text: string) => {
  if (!text) return null;
  // Handle newlines and **bold**
  return text.split('\n').map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Handle single * for italics or bold
        return <span key={i}>{part.replace(/\*/g, '')}</span>;
      })}
      {lineIndex < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food':
    case 'dining':
    case 'restaurant':
      return <Coffee className="w-5 h-5" />;
    case 'sightseeing':
    case 'attraction':
      return <Camera className="w-5 h-5" />;
    default:
      return <ActivityIcon className="w-5 h-5" />;
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSwap, travelers, bookingStatus, onConfirm }) => {
  return (
    <div className="glass-card hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-2xl p-5 md:p-6 transition-all duration-200 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-5 items-start relative group shadow-sm hover:shadow-md">
      
      {/* Visual Icon instead of Image */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-inner">
        {getCategoryIcon(activity.category)}
      </div>

      {/* Content description */}
      <div className="flex-1 space-y-3 w-full">
        <div className="flex flex-wrap items-center gap-2">
          {activity.isLocal && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold tracking-wide rounded-md bg-secondary/15 text-secondary border border-secondary/20">
              <Award className="h-3.5 w-3.5" />
              LOCAL OPERATOR
            </span>
          )}
          <span className="px-2.5 py-1 text-xs font-medium tracking-wide rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            {activity.category}
          </span>
        </div>

        <h4 className="font-heading font-bold text-lg md:text-xl text-slate-800 dark:text-white leading-tight">
          {activity.name}
        </h4>
        
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {renderFormattedText(activity.description)}
        </p>

        <div className="flex flex-wrap justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 gap-4">
          {/* Stats info */}
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-accent font-semibold bg-accent/10 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {activity.rating}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <Clock className="h-4 w-4" />
              {activity.duration}
            </span>
          </div>

          {/* Pricing indicator */}
          <div className="text-right">
            <span className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
                {formatCurrency(activity.price * travelers)}
              </span>
            <span className="text-xs text-slate-500 block">for {travelers} travelers</span>
          </div>
        </div>
      </div>

      {/* Hover actions swap activity */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {bookingStatus === "confirmed" ? (
          <span className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
            Confirmed
          </span>
        ) : (
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
          >
            Book
          </button>
        )}
        {onSwap && (
          <button
            onClick={onSwap}
            className="p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-800 text-primary"
            title="Swap Activity"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
};
