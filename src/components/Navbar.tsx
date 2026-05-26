import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Maximize2, LogOut, ShieldAlert, Award, FileText, User } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="gov-header gov-accent-border text-slate-100 shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Designation */}
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600 p-2 rounded-lg text-slate-900 font-bold hidden sm:flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <Link to="/" className="font-semibold text-sm sm:text-base tracking-wide flex items-center space-x-2">
              <span className="text-white hover:text-amber-400 transition-colors">Transit Permit Portal</span>
            </Link>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
              Designation: <span className="text-amber-500 font-bold">TEMPORARY PERMIT</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Options */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
          <Link
            to="/"
            className={`hover:text-white transition-colors ${
              location.pathname === "/" ? "text-amber-400" : ""
            }`}
          >
            Apply Permit
          </Link>
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            className={`hover:text-white transition-colors ${
              location.pathname.startsWith("/admin") ? "text-amber-400" : ""
            }`}
          >
            {isAuthenticated ? "Admin Dashboard" : "Admin Login"}
          </Link>
        </nav>

        {/* Right Side: Tools, Dark Mode, Avatar */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none hidden sm:block"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-800 focus:outline-none transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-500 flex items-center justify-center text-slate-200">
                <User className="w-4 h-4" />
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-slate-800 dark:text-slate-100">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isAuthenticated ? "Administrator Mode" : "Public User"}
                </div>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Admin Access</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
