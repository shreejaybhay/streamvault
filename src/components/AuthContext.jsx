"use client";

import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/currentUser");
        setUser(response.data);
        setError(null); // Clear any previous errors
      } catch (error) {
        handleFetchError(error);
      }
    };
    fetchUserData();
  }, []);

  const logout = async () => {
    try {
      await axios.post("/api/logout");
      setUser(null);
      setError(null); // Clear any previous errors
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      handleLogoutError(error);
    }
  };

  const handleFetchError = (error) => {
    if (error.response) {
      // Server-side error
      console.error("Fetch user data error (server):", error.response.data.message);
      setError(error.response.data.message);
    } else if (error.request) {
      // No response received
      console.error("Fetch user data error (network):", error.request);
      setError("Network error. Please try again later.");
    } else {
      // Other errors
      console.error("Fetch user data error:", error.message);
      setError("An error occurred. Please try again.");
    }
  };

  const handleLogoutError = (error) => {
    if (error.response) {
      // Server-side error
      console.error("Logout error (server):", error.response.data.message);
      setError(error.response.data.message);
    } else if (error.request) {
      // No response received
      console.error("Logout error (network):", error.request);
      setError("Network error. Please try again later.");
    } else {
      // Other errors
      console.error("Logout error:", error.message);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, error }}>
      {children}
      {error && <div className="error-message">{error}</div>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
