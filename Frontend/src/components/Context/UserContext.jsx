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
      const userData = JSON.parse(savedUser);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );
      if (response.data.success) {
        const { token, user } = response.data;
        // Perbaiki URL foto profil
        const userData = {
          ...user,
          photo_profile: user.photo_profile ? 
            `http://localhost:3000//uploads/profiles/${user.photo_profile}` : null
        };
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: "Login error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const endpoint = user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
      const response = await axios.put(`http://localhost:3000${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Update profile error" };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const endpoint = user.role === 'admin' ? '/api/admin/profile/password' : '/api/user/profile/password';
      const response = await axios.put(`http://localhost:3000${endpoint}`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Update password error" };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    updatePassword
  };

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