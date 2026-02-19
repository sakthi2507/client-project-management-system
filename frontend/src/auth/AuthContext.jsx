// Create AuthContext using React Context API.
// Requirements:
// - Store user state and token in memory only (not persisted)
// - On page refresh, users are redirected to login for security
// - Provide login(token) and logout() methods
// - Wrap children with AuthProvider
// Use functional components and hooks.
import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any stored tokens on app load for security
    // Users must log in again after page refresh
    localStorage.removeItem("token");
    setLoading(false);
  }, []);

  const fetchUserData = async (authToken) => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // If token is invalid, clear it
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData = null) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      // Fetch user data if not provided
      fetchUserData(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
