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

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const role = currentUser?.role;

      const endpoint = role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
      
      const response = await axios.put(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Preserve the role in the updated user data
        const updatedUser = {
          ...response.data.data,
          role: currentUser.role
        };

        if (updatedUser.photo_profile && !updatedUser.photo_profile.startsWith('http')) {
          updatedUser.photo_profile = `${API_URL}/uploads/profiles/${updatedUser.photo_profile}`;
        }

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return response.data;
      }
      
      throw new Error(response.data.message || "Update failed");
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data || { message: "Update profile error" };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const role = user?.role;
      const endpoint = role === 'admin' ? '/api/admin/profile/password' : '/api/user/profile/password';
      
      const response = await axios.put(`${API_URL}${endpoint}`, passwordData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Update password error" };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Process photo_profile URL if it exists
        const processedUser = {
          ...userData,
          photo_profile: userData.photo_profile ? 
            `${API_URL}/uploads/profiles/${userData.photo_profile}` : null
        };
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(processedUser));
        
        // Set default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        setUser(processedUser);
        return response.data;
      }
      
      throw new Error(response.data.message || "Login failed");
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: "Login error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Parse and set initial user state
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Refresh profile in background
          await refreshProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout(); // Clear invalid auth state
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up axios response interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

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