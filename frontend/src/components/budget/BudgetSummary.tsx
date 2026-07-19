import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertCircle, Award } from "lucide-react";
import type { Itinerary } from "../../types";

interface BudgetSummaryProps {
  itinerary: Itinerary;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ itinerary }) => {
  const { budget, days, travelers } = itinerary;

  // 1. Calculate category costs across all days
  let accommodation = 0;
  let transport = 0;
  let activities = 0;
  let guide = 0;
  
  days.forEach((dayPlan) => {
    accommodation += dayPlan.stay ? dayPlan.stay.pricePerNight : 0;
    transport += dayPlan.transport ? dayPlan.transport.pricePerDay : 0;
    guide += dayPlan.guide ? dayPlan.guide.pricePerDay : 0;
    activities += dayPlan.activities.reduce((acc, act) => acc + act.price, 0) * travelers;
  });

  // Food allocation (est 600 per traveler per day)
  const food = 600 * travelers * days.length;
  // Shopping / Leisure (est 800 flat rate per traveler)
  const shopping = 800 * travelers;
  // Emergency buffer (est 10% of total budget)


  const aggregateTotal = accommodation + transport + guide + activities + food + shopping;
  
  // Recharts Chart Data
  const chartData = [
    { name: "Stay", value: accommodation, color: "#2563EB" },
    { name: "Transport", value: transport, color: "#14B8A6" },
    { name: "Activities", value: activities, color: "#F59E0B" },
    { name: "Local Guide", value: guide, color: "#8B5CF6" },
    { name: "Food", value: food, color: "#EF4444" },
    { name: "Leisure", value: shopping, color: "#EC4899" },
  ].filter(d => d.value > 0);

  const percentSpent = Math.min(100, Math.round((aggregateTotal / budget) * 100));

  const stats = [
    { label: "Total Budget", val: `₹${budget}`, status: "Limit set", color: "text-slate-800 dark:text-white" },
    { label: "AI Total Cost", val: `₹${aggregateTotal}`, status: `${percentSpent}% allocated`, color: aggregateTotal > budget ? "text-danger" : "text-primary dark:text-secondary" },
    { label: "Remaining", val: `₹${Math.max(0, budget - aggregateTotal)}`, status: "Left to spend", color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((st, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-4 border border-slate-150 dark:border-slate-850 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{st.label}</span>
            <div className={`text-lg font-heading font-extrabold ${st.color}`}>{st.val}</div>
            <span className="text-[10px] text-slate-400 block font-medium">{st.status}</span>
          </div>
        ))}
      </div>

      {/* Progress alert details */}
      <div className="glass-card rounded-2xl border border-slate-150 dark:border-slate-850 p-6 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-550 dark:text-slate-400">
          <span>Budget Burn Rate</span>
          <span>{percentSpent}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 100
                ? "bg-danger"
                : percentSpent > 85
                ? "bg-accent"
                : "bg-success"
            }`}
            style={{ width: `${percentSpent}%` }}
          ></div>
        </div>

        {percentSpent > 100 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex gap-2 text-danger">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
            <p className="text-[11px] leading-tight font-medium">
              Your current itinerary exceeds the set budget by ₹{aggregateTotal - budget}. Click the <b>Replanning</b> trigger or swap expensive activities to balance it.
            </p>
          </div>
        )}
      </div>

      {/* Recharts allocation Pie Chart */}
      <div className="glass-card rounded-2xl border border-slate-150 dark:border-slate-850 p-6 flex flex-col md:flex-row items-center gap-6">
        
        {/* Pie representation */}
        <div className="w-full md:w-1/2 h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none">LOCAL-FIRST</span>
            <span className="text-sm font-heading font-extrabold text-secondary">{itinerary.localOperatorPercentage}%</span>
          </div>
        </div>

        {/* Legend listing */}
        <div className="w-full md:w-1/2 space-y-2 dark:text-slate-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-2">
            Spending Breakdowns
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-550">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name}: <b>₹{item.value}</b></span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 py-0 text-[10px] font-bold text-teal-650 bg-teal-500/10 p-2.5 rounded-xl border border-teal-500/20">
            <Award className="h-3.5 w-3.5 text-secondary shrink-0" />
            <p className="leading-tight">
              TripWay automatically routed {itinerary.localOperatorPercentage}% of these expenditures to traditional small cooperatives.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
