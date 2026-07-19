import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 text-danger rounded-2xl flex items-center justify-center font-heading font-black text-xl animate-bounce">
        404
      </div>

      <div className="space-y-1">
        <h1 className="font-heading font-extrabold text-2xl text-slate-805 dark:text-white">
          Itinerary Hub Lost
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          The routing key you requested does not exist in our database mapping folders.
        </p>
      </div>

      <Link to="/" className="btn-primary py-2 px-5 text-xs font-semibold rounded-xl inline-flex items-center gap-1">
        <Compass className="h-4 w-4" /> Redirect Back Home
      </Link>
    </div>
  );
};
