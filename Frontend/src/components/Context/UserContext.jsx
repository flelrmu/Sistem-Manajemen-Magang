import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext(null);
const API_URL = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const endpoint = user?.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userData = response.data.data.profile;
        // Fix photo_profile URL
        if (userData.photo_profile) {
          // Remove any potential double URL
          const fileName = userData.photo_profile.split('/').pop();
          userData.photo_profile = `${API_URL}/uploads/profiles/${fileName}`;
        }
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return response.data;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error.response?.data || { message: "Profile refresh error" };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      refreshProfile(); // Refresh profile data on initial load
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
      );
      if (response.data.success) {
        const { token, user } = response.data;
        const userData = {
          ...user,
          photo_profile: user.photo_profile ? 
            `${API_URL}/uploads/profiles/${user.photo_profile}` : null
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
      const response = await axios.put(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        await refreshProfile(); // Refresh the entire profile after update
        return response.data;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data || { message: "Update profile error" };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const endpoint = user.role === 'admin' ? '/api/admin/profile/password' : '/api/user/profile/password';
      const response = await axios.put(`${API_URL}${endpoint}`, passwordData);
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
    updatePassword,
    refreshProfile
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