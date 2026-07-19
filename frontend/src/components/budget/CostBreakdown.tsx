import React from "react";
import type { Itinerary } from "../../types";

interface CostBreakdownProps {
  itinerary: Itinerary;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({ itinerary }) => {
  const { days, travelers } = itinerary;

  // Calculate actual costs
  let stayActual = 0;
  let transportActual = 0;
  let guideActual = 0;
  let actActual = 0;

  days.forEach((day) => {
    stayActual += day.stay ? day.stay.pricePerNight : 0;
    transportActual += day.transport ? day.transport.pricePerDay : 0;
    guideActual += day.guide ? day.guide.pricePerDay : 0;
    actActual += day.activities.reduce((acc, a) => acc + a.price, 0) * travelers;
  });

  const foodActual = 600 * travelers * days.length;
  const shoppingActual = 800 * travelers;

  // Let's create realistic estimated figures (e.g. what booking.com or corporate trip agencies would charge, normally 20% to 40% higher because of listing commissions and booking aggregators markup)
  const rows = [
    {
      category: "Accommodation",
      estimated: Math.round(stayActual * 1.35),
      actual: stayActual,
      status: "Stay saved",
    },
    {
      category: "Local Transport",
      estimated: Math.round(transportActual * 1.15),
      actual: transportActual,
      status: "Direct coop",
    },
    {
      category: "Guides & Hosts",
      estimated: Math.round(guideActual * 1.4),
      actual: guideActual,
      status: "Zero broker fee",
    },
    {
      category: "Activities & Tickets",
      estimated: Math.round(actActual * 1.25),
      actual: actActual,
      status: "Direct booking",
    },
    {
      category: "Food & Dinings",
      estimated: Math.round(foodActual * 1.1),
      actual: foodActual,
      status: "Local cafes",
    },
    {
      category: "Shopping & Souvenirs",
      estimated: Math.round(shoppingActual * 1.3),
      actual: shoppingActual,
      status: "Local crafts",
    },
  ];

  const totalEst = rows.reduce((acc, r) => acc + r.estimated, 0);
  const totalAct = stayActual + transportActual + guideActual + actActual + foodActual + shoppingActual;
  const difference = totalEst - totalAct;

  return (
    <div className="glass-card rounded-2xl border border-slate-150 dark:border-slate-850 p-6 space-y-4 overflow-hidden">
      
      <div className="flex justify-between items-center pb-2">
        <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white">
          Cost Allocation Matrix
        </h4>
        <span className="text-[10px] font-bold text-success bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-lg border border-green-200/30">
          Saved ₹{difference} vs Aggregators
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 pr-2">Category</th>
              <th className="pb-3 px-2">Aggregator (Est)</th>
              <th className="pb-3 px-2">TripWay local (Act)</th>
              <th className="pb-3 px-2">Difference</th>
              <th className="pb-3 pl-2 text-right">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
            {rows.map((row, idx) => {
              const diff = row.estimated - row.actual;
              return (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 font-semibold text-slate-805 dark:text-slate-200 pr-2">{row.category}</td>
                  <td className="py-3 px-2 text-slate-450 text-slate-400">₹{row.estimated}</td>
                  <td className="py-3 px-2 font-bold text-slate-800 dark:text-white">₹{row.actual}</td>
                  <td className="py-3 px-2 text-success font-semibold">
                    -₹{diff} ({Math.round((diff / row.estimated) * 100)}%)
                  </td>
                  <td className="py-3 pl-2 text-right font-medium text-[10px] text-teal-650 dark:text-teal-400">
                    {row.status}
                  </td>
                </tr>
              );
            })}
            <tr className="font-bold border-t border-slate-205 dark:border-slate-800 text-slate-800 dark:text-white bg-slate-50/50 dark:bg-slate-900/30">
              <td className="py-3.5 pr-2">Summary Totals</td>
              <td className="py-3.5 px-2 text-slate-500">₹{totalEst}</td>
              <td className="py-3.5 px-2 text-primary dark:text-secondary font-extrabold text-[13px]">₹{totalAct}</td>
              <td className="py-3.5 px-2 text-success">-₹{difference}</td>
              <td className="py-3.5 pl-2 text-right text-success text-[11px]">Local first</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
