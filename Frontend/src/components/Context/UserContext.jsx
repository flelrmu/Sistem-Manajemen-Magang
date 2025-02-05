import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext(null);
const API_URL = "http://api.simagang.tech";

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
        const userData = response.data.data.profile || response.data.data;
        // Ensure photo_profile URL is correctly formatted
        if (userData.photo_profile) {
          const fileName = userData.photo_profile.split('/').pop();
          userData.photo_profile = `${API_URL}/uploads/profiles/${fileName}`;
        }
        
        // Preserve role information
        userData.role = user?.role || userData.role;
        
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return response.data;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error.response?.data || { message: "Profile refresh error" };
    }
  };

  const login = async (email, password) => {
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
  
      if (loginResponse.data.success) {
        const { token } = loginResponse.data;
        
        // Set token first
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
        // Immediately fetch complete profile data
        const endpoint = loginResponse.data.user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
        const profileResponse = await axios.get(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (profileResponse.data.success) {
          const completeUserData = {
            ...(profileResponse.data.data.profile || profileResponse.data.data),
            role: loginResponse.data.user.role
          };
  
          // Process photo_profile URL
          if (completeUserData.photo_profile) {
            const fileName = completeUserData.photo_profile.split('/').pop();
            completeUserData.photo_profile = `${API_URL}/uploads/profiles/${fileName}`;
          }
  
          // Update state first, then localStorage
          setUser(completeUserData);
          localStorage.setItem("user", JSON.stringify(completeUserData));
          return { success: true, user: completeUserData };
        }
      }
      
      throw new Error(loginResponse.data.message || "Login failed");
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: "Login error" };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const endpoint = user?.role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
      
      const response = await axios.put(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedUser = {
          ...(response.data.data.profile || response.data.data),
          role: user.role
        };

        if (updatedUser.photo_profile && !updatedUser.photo_profile.startsWith('http')) {
          updatedUser.photo_profile = `${API_URL}/uploads/profiles/${updatedUser.photo_profile}`;
        }

        // Update state first, then localStorage
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
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