import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldAlert, KeyRound, Loader2, X, User } from "lucide-react";
import api from "../services/api";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Check if session redirect message exists
  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg === "session_expired") {
      setInfoMessage("Your session has expired. Please log in again.");
    } else if (msg === "unauthorized") {
      setInfoMessage("Access Denied. You must log in to view the dashboard.");
    }
  }, [searchParams]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const response = await api.post("/api/auth/login", { username, password });
      localStorage.setItem("token", response.data.access_token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || "Authentication failed. Check credentials or connection.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl max-w-md w-full overflow-hidden">
        
        {/* Banner header */}
        <div className="gov-header gov-accent-border px-6 py-6 text-white text-center">
          <div className="bg-amber-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-wide">Admin Portal Login</h2>
          <p className="text-[10px] text-slate-300 font-medium mt-0.5 uppercase tracking-widest">
            Government Transport Department
          </p>
        </div>

        {/* Form area */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Notifications */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3.5 rounded-lg flex items-start space-x-2 text-red-700 dark:text-red-400 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-grow font-semibold">{error}</div>
              <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {infoMessage && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 p-3.5 rounded-lg flex items-start space-x-2 text-blue-700 dark:text-blue-400 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <div className="flex-grow font-medium">{infoMessage}</div>
              <button type="button" onClick={() => setInfoMessage(null)} className="text-blue-400 hover:text-blue-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-650 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </div>

          {/* Back link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
            >
              Back to Public Portal
            </button>
          </div>

        </form>

        {/* Security Warning Notice */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 leading-normal text-center">
          Warning: Unauthorised access attempts are logged and monitored. Default credentials are <b>admin / admin123</b>.
        </div>

      </div>

    </div>
  );
};

export default AdminLoginPage;
