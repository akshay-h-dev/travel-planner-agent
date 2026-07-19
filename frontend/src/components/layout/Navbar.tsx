import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Moon, Sun, Menu, X, User, LogOut, Briefcase } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Navbar: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useTrip();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Planner", path: "/planner" },
    { name: "Local Hub", path: "/vendors" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <nav className="glass-navbar border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <Compass className="h-6 w-6 text-primary animate-spin-slow" />
              <span>TripWay</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-primary dark:text-secondary font-semibold"
                    : "text-slate-600 dark:text-slate-350 hover:text-primary dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-650 dark:text-slate-350 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Briefcase className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <hr className="border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-950/20 text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-650 dark:text-slate-350 hover:text-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-xs font-semibold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-350"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-600 dark:text-slate-350"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card-premium border-x-0 border-b border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${
                  isActive(link.path)
                    ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-secondary font-bold"
                    : "text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-dark dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-105 dark:border-slate-800 flex items-center justify-around gap-4 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2 border rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center btn-primary py-2 text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
