import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser)); // Set user state from localStorage
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false); // Finish loading after checking localStorage
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        const userData = { ...user, photo_profile: user.photo_profile || null };

        localStorage.setItem("token", token); // Save token to localStorage
        localStorage.setItem("user", JSON.stringify(userData)); // Save user data

        setUser(userData); // Immediately update the state
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      throw error.response?.data || { message: "Login error" };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage
      if (!token) throw new Error("Token tidak ditemukan");

      // Send logout request with Authorization header
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear token and user from localStorage and axios headers
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);

      // Ensure state is cleared even if logout request fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const value = { user, login, logout, loading };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default UserContext;
