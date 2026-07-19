import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Mail, Send, MessageCircle, GitBranch, Heart } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Footer: React.FC = () => {
  const { showToast } = useTrip();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast("Subscribed successfully! Welcome to TripWay.", "success");
    setEmail("");
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-heading font-extrabold text-xl tracking-tight text-white mb-4">
              <Compass className="h-6 w-6 text-secondary animate-pulse" />
              <span>TripWay</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              The only AI-powered itinerary engine that automatically adjusts based on budget updates while directing travel spending back to regional homestays, small vendors, and local guides.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary transition-colors hover:text-white" aria-label="Twitter">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary transition-colors hover:text-white" aria-label="Instagram">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary transition-colors hover:text-white" aria-label="GitHub">
                <GitBranch className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/planner" className="hover:text-white transition-colors">AI Itinerary Planner</Link>
              </li>
              <li>
                <Link to="/vendors" className="hover:text-white transition-colors">Local Guides & Stays</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Your Dashboard</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Sustainability Mission</Link>
              </li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">Trust & Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">How it Works</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Frequently Asked Questions (FAQ)</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy & Terms</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-wide">Join the Movement</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get secret offbeat updates, budget backpacking secrets, and local recommendations.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm placeholder:text-slate-500"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 p-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors text-white"
                  aria-label="Subscribe"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TripWay Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 sm:mt-0">
            Made with <Heart className="h-3.5 w-3.5 text-danger fill-danger" /> by Akshay H for travel communities worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
