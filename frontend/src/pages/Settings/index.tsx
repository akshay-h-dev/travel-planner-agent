import React, { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Moon, Sun } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Settings: React.FC = () => {
  const { theme, toggleTheme, showToast } = useTrip();

  // local configuration variables
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  
  // notification variables
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyReplan, setNotifyReplan] = useState(true);
  const [notifyGuides, setNotifyGuides] = useState(false);

  const handleSaveSettings = () => {
    showToast("Application settings updated successfully!", "success");
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ name: "Settings panel" }]} />
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-805 dark:text-white pt-1">
          System Preferences
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">Manage currency settlement codes, notifications, and client dark themes.</p>
      </div>

      <div className="glass-card rounded-3xl border border-slate-205 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-dark-card space-y-6">
        
        {/* Theme Settings row */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interface Mode
            </h3>
            <p className="text-[10px] text-slate-450 pt-0.5">Toggle dark and light view modes.</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4.5 w-4.5 text-secondary" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4.5 w-4.5 text-primary" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Currency & localization */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          <div className="space-y-1.5">
            <h4 className="font-heading font-bold text-xs text-slate-800 dark:text-white leading-none">Settlement Currency</h4>
            <span className="text-[9px] text-slate-400 block pb-1">Primary payment code representation.</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-premium py-2 text-xs"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-heading font-bold text-xs text-slate-800 dark:text-white leading-none">Language Code</h4>
            <span className="text-[9px] text-slate-405 block pb-1">Translate native itineraries text names.</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-premium py-2 text-xs"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi / हिन्दी</option>
              <option value="Konkani">Konkani / कोंकणी</option>
              <option value="Malayalam">Malayalam / മലയാളം</option>
            </select>
          </div>

        </div>

        {/* Notifications checkbox lists */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Notification Triggers
          </h3>
          
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>Email digest copy after AI itinerary completions</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notifyReplan}
              onChange={(e) => setNotifyReplan(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>Immediate trigger notification if local operator rates spike</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none font-medium text-slate-400">
            <input
              type="checkbox"
              checked={notifyGuides}
              onChange={(e) => setNotifyGuides(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>SMS guide status reminders (operator verified guides only)</span>
          </label>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveSettings}
          className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl"
        >
          Save Configuration Changes
        </button>

      </div>

    </div>
  );
};
