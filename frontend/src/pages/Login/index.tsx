import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Mail, Lock, LogIn, GitBranch, Globe } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Login: React.FC = () => {
  const { login, showToast } = useTrip();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all credentials.", "error");
      return;
    }
    
    // Simulate login
    login(email, "Akshay H");
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 flex max-w-lg mx-auto w-full items-center justify-center px-4 py-16">
      
      {/* Login Card wrapper */}
      <div className="glass-card w-full border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-premium bg-white dark:bg-dark-card space-y-6">
        
        {/* Banner details */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
            <span>TripWay</span>
          </Link>
          <h2 className="font-heading font-extrabold text-xl text-slate-800 dark:text-white">
            Welcome back to TripWay
          </h2>
          <p className="text-xs text-slate-500">
            Log in to manage community-supporting travel schedules.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@student.in"
              className="input-premium"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-450">
              <label className="flex items-center gap-1"><Lock className="h-3 w-3" /> Password</label>
              <a href="#" className="text-primary hover:underline text-[9px] lowercase font-normal">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-premium"
              required
            />
          </div>

          {/* Checkbox fields */}
          <div className="flex items-center justify-between py-1 text-[11px] font-semibold text-slate-450 select-none">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
              Keep me logged-in
            </label>
          </div>

          {/* Core Submit CTA */}
          <button
            type="submit"
            className="w-full btn-primary py-3 text-sm font-semibold rounded-2xl flex items-center justify-center gap-1 shadow-sm"
          >
            <LogIn className="h-4 w-4" /> Sign In securely
          </button>

        </form>

        {/* OR Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
        </div>

        {/* Social Oauth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { login("google@tripway.io", "Google User"); navigate("/dashboard"); }}
            className="btn-outline dark:text-white dark:border-slate-850 py-2 rounded-xl text-xs flex justify-center items-center gap-1 shadow-xs hover:bg-slate-50"
          >
            <Globe className="w-4 h-4 text-rose-500" /> Google
          </button>
          <button
            onClick={() => { login("github@tripway.io", "GitHub User"); navigate("/dashboard"); }}
            className="btn-outline dark:text-white dark:border-slate-850 py-2 rounded-xl text-xs flex justify-center items-center gap-1 shadow-xs hover:bg-slate-50"
          >
            <GitBranch className="w-4 h-4 text-black dark:text-white" /> GitHub
          </button>
        </div>

        {/* Link to Signup */}
        <p className="text-center text-[11px] font-semibold text-slate-500">
          New to TripWay?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Register here
          </Link>
        </p>

      </div>

    </div>
  );
};
