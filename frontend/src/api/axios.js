// Create a centralized axios instance for API calls.
// - Base URL: http://127.0.0.1:8000
// - Automatically attach JWT token from localStorage to Authorization header
// - Export as default
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
