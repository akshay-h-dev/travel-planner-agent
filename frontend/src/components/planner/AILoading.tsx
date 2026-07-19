import React, { useEffect, useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const AILoading: React.FC = () => {
  const { generationStep, generationLogs } = useTrip();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const totalSteps = 7;
  const progressPercentage = Math.round((generationStep / totalSteps) * 100);

  const currentMessage = generationLogs[generationLogs.length - 1] || "Initializing TripWay AI...";

  return (
    <div className="fixed inset-0 bg-[#F8FAFC]/90 dark:bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-card border border-slate-205 dark:border-slate-800 p-8 rounded-3xl shadow-premium text-center space-y-6 animate-in zoom-in-95 duration-300">
        
        {/* Animated Spin Compass */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping duration-1000"></div>
          <div className="absolute inset-2 bg-secondary/15 rounded-full animate-pulse duration-700"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 relative">
            <Compass className="h-8 w-8 animate-spin" />
            <Sparkles className="h-4 w-4 text-accent absolute top-2 right-2 animate-bounce" />
          </div>
        </div>

        {/* Messages and header */}
        <div className="space-y-2">
          <h2 className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Itinerary Plan Engine
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-sm flex items-center justify-center h-6 font-medium">
            {currentMessage}
            <span className="w-6 text-left">{dots}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Progress: {progressPercentage}%</span>
            <span>Step {Math.min(generationStep, totalSteps)} of {totalSteps}</span>
          </div>
        </div>

        {/* Rotating sub messages logs log list */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 text-left h-36 overflow-y-auto space-y-1.5 text-xs font-mono scroll-smooth">
          {generationLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2 text-slate-500 dark:text-slate-400">
              <span className="text-secondary select-none">✓</span>
              <span>{log}</span>
            </div>
          ))}
          {generationStep <= totalSteps && (
            <div className="flex gap-2 text-primary font-bold animate-pulse">
              <span>❯</span>
              <span>{currentMessage}...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
