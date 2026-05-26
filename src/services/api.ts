import axios from "axios";

// Read backend API URL from environment variables, fallback to local FastAPI development port
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically inject JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session timeouts (401 responses)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect if token was invalid
      localStorage.removeItem("token");
      if (window.location.pathname.startsWith("/admin/dashboard")) {
        window.location.href = "/admin/login?message=session_expired";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
