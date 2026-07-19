import React from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export const About: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      <Breadcrumb items={[{ name: "About sustainable mission" }]} />

      {/* Hero section */}
      <div className="space-y-4 text-center pb-6 border-b border-slate-105 dark:border-slate-800">
        <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold tracking-wider font-mono">
          THE TRIPWAY MANIFESTO
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-800 dark:text-white leading-tight">
          Sustainable, Budget-First Itineraries
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
          "The only AI trip planner that automatically replans your itinerary when your budget changes while routing more travel spending to local communities."
        </p>
      </div>

      {/* Problem vs Solution cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* The Problem */}
        <div className="glass-card rounded-2xl p-6 border border-slate-205 dark:border-slate-800 space-y-3 bg-red-500/[0.02] hover:border-red-500/20 transition-colors">
          <div className="h-9 w-9 bg-red-100 dark:bg-red-950/20 text-danger rounded-xl flex items-center justify-center font-bold">
            ⚠
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-805 dark:text-white">The Economic Leakage Problem</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Over 75% of travel expenditure on booking aggregators escapes back to overseas corporate hubs. Native guides, small rural homestays, and local taxi alliances get squeezed by heavy commission taxes, depleting local economies.
          </p>
        </div>

        {/* The Solution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-205 dark:border-slate-800 space-y-3 bg-teal-500/[0.02] hover:border-teal-550/20 transition-colors">
          <div className="h-9 w-9 bg-teal-100 dark:bg-teal-950/20 text-secondary rounded-xl flex items-center justify-center font-bold">
            ✓
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-805 dark:text-white">Our Local-First Platform</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            TripWay replaces brokers. We use an automated local mapping router matching native guides and stays. If budget triggers occur, the AI loops and replans transportation links to keep itineraries under target budget limits.
          </p>
        </div>

      </div>

      {/* Detailed narrative paragraph */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-dark-card/90">
        <h3 className="font-heading font-bold text-slate-800 dark:text-white text-sm">
          Why Local First?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          When you book a homestay with TripWay, your rent supports organic farms. Booking a tribal guide protects hiking trails, and purchasing cooperative electric bus tokens funds regional eco-initiatives.
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 rounded-2xl space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
          <div className="flex justify-between">
            <span>Direct operator payout share</span>
            <span className="text-secondary font-mono">100%</span>
          </div>
          <div className="flex justify-between">
            <span>Aggregator commission fees</span>
            <span className="text-danger font-mono">0%</span>
          </div>
          <div className="flex justify-between">
            <span>Eco-transport options ratio</span>
            <span className="text-primary dark:text-teal-400 font-mono">85% minimum</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link to="/planner" className="btn-primary inline-flex py-3 px-8 text-xs font-semibold rounded-xl">
          Launch TripWay Planner Wizard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  );
};
