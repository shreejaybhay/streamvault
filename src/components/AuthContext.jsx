"use client";

import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get("/api/currentUser");
      setUser(response.data);
      setError(null);
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setUser(null);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const loginUser = (userData, token) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    setUser(userData);
    setError(null);
  };

  const logout = async () => {
    try {
      setLoading(true); // Set loading when logout starts
      await axios.post("/api/logout");
      // Clear localStorage token on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setUser(null);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, error, logout, loading, fetchUserData, loginUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
