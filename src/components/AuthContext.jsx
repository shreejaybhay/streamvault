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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/currentUser");
        setUser(response.data);
        setError(null);
      } catch (error) {
        setUser(null);
        setError(error);
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };
    fetchUserData();
  }, []);

  const logout = async () => {
    try {
      setLoading(true); // Set loading when logout starts
      await axios.post("/api/logout");
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, error, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
