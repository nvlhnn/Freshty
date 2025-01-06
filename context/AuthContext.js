"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user state from cookies
    const savedUser = Cookies.get("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
    setLoading(false); // Data is initialized
  }, []);

  const login = (userData) => {
    // Save user to cookies
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", userData.token, { expires: 7 }); // Save token separately
    setUser(userData);
  };

  const logout = () => {
    // Clear user and token from cookies
  console.log("logout");
      
    Cookies.remove("user");
    Cookies.remove("token");
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while user data is being initialized
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
