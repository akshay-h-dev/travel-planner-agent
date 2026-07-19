import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Mail, Lock, User, Phone, CheckCircle, GitBranch, Globe } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Signup: React.FC = () => {
  const { signup, showToast } = useTrip();
  const navigate = useNavigate();

  // state fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast("Please enter all mandatory fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    signup({ name, email, phone });
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 min-h-[85vh] grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full items-stretch">
      
      {/* LEFT COLUMN: Illustration info blocks (col-span-5) */}
      <div className="hidden lg:block lg:col-span-5 bg-slate-900 text-white p-12 relative overflow-hidden flex flex-col justify-between">
        
        {/* Absolute visual mesh backgrounds */}
        <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary/10 z-0"></div>

        <div className="relative z-10 space-y-6">
          <Link to="/" className="flex items-center gap-1.5 font-heading font-extrabold text-xl tracking-tight text-white mb-8">
            <Compass className="h-6 w-6 text-secondary animate-pulse" />
            <span>TripWay</span>
          </Link>

          <h2 className="font-heading font-extrabold text-3xl leading-snug">
            Save Money. Support Host Communities.
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed font-medium">
            Join thousands of student backpackers and conscious travelers building local-first, dynamic travel plans.
          </p>
        </div>

        {/* bullet achievements */}
        <div className="relative z-10 space-y-4 pt-12 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-secondary shrink-0" />
            <span>Direct payments to audited homestays & guides.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-secondary shrink-0" />
            <span>AI automatically overrides costs under budget cap.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-secondary shrink-0" />
            <span>Carbon-reducing public transit & hiking options.</span>
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-slate-500 font-mono">
          TripWay Sustainable Tourism Index © 2026.
        </p>

      </div>

      {/* RIGHT COLUMN: Signup registration card (col-span-7) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 bg-[#F8FAFC]/40 dark:bg-dark-card/5">
        
        <div className="glass-card w-full max-w-md border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-8 bg-white dark:bg-dark-card shadow-lg space-y-6">
          
          <div className="space-y-1.5">
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest font-mono block lg:hidden">TRIPWAY REGISTER</span>
            <h2 className="font-heading font-extrabold text-xl text-slate-850 dark:text-white">
              Create an Explorer Account
            </h2>
            <p className="text-xs text-slate-450 leading-normal">
              Register details to track itineraries and saved trips.
            </p>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Akshay H"
                className="input-premium py-2 text-xs"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="akshay@gmail.com"
                className="input-premium py-2 text-xs"
                required
              />
            </div>

            {/* Contact phone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 99988 87776"
                className="input-premium py-2 text-xs"
              />
            </div>

            {/* Grid passwords */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium py-2 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Confirm密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium py-2 text-xs"
                  required
                />
              </div>

            </div>

            {/* Checkbox agreements */}
            <label className="flex items-start gap-2 text-[10px] font-semibold text-slate-450 leading-tight pt-1 selection:bg-none cursor-pointer">
              <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-secondary focus:ring-secondary" required />
              <span>I accept the TripWay Sustainable Traveler Charter & direct-payment booking terms.</span>
            </label>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full btn-secondary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-sm mt-3"
            >
              Configure my Account
            </button>

          </form>

          {/* Social login buttons */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or register via</span>
            <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { signup({ name: "Google Register", email: "greg@g.com" }); navigate("/dashboard"); }}
              className="btn-outline dark:text-white dark:border-slate-850 py-2 rounded-xl text-[10px] flex justify-center items-center gap-0.5 hover:bg-slate-50"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500" /> Google
            </button>
            <button
              onClick={() => { signup({ name: "GitHub Register", email: "ghreg@gh.com" }); navigate("/dashboard"); }}
              className="btn-outline dark:text-white dark:border-slate-850 py-2 rounded-xl text-[10px] flex justify-center items-center gap-0.5 hover:bg-slate-50"
            >
              <GitBranch className="w-3.5 h-3.5 text-black dark:text-white" /> GitHub
            </button>
          </div>

          <p className="text-center text-[11px] font-semibold text-slate-500">
            Already have an Account?{" "}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};
