import React from "react";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTrip();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 space-y-3 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center justify-between p-4 rounded-xl border shadow-xl bg-white dark:bg-dark-card border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-success" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-primary" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-danger" />}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
