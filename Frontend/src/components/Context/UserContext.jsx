import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

const UserContext = createContext(null);
const API_URL = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (registerData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, registerData);

      if (response.data) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Registrasi berhasil. Silakan login menggunakan akun Anda.',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        return response.data;
      }
      throw new Error(response.data?.message || 'Registrasi gagal');
    } catch (err) {
      console.error('Registration error:', err);
      throw err.response?.data || { message: 'Terjadi kesalahan saat registrasi' };
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      if (response.data.success) {
        return response.data.admins;
      }
      throw new Error('Failed to fetch admin users');
    } catch (err) {
      console.error("Error fetching admin users:", err);
      throw err.response?.data || { message: 'Gagal memuat daftar admin' };
    }
  };
  // Add these changes to your AuthProvider component

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

        // Handle photo profile URL
        if (userData.photo_profile) {
          const fileName = userData.photo_profile.split('/').pop();
          userData.photo_profile = `${API_URL}/uploads/profiles/${fileName}`;
        }

        // Handle paraf image URL
        if (userData.paraf_image) {
          userData.paraf_image = `${API_URL}/uploads/paraf/${userData.paraf_image.split('/').pop()}`;
        }

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

  const updateParaf = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const response = await axios.put(`${API_URL}/api/admin/paraf`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedUser = { ...user };
        if (response.data.data.paraf_url) {
          updatedUser.paraf_image = `${API_URL}/uploads/paraf/${response.data.data.paraf_url.split('/').pop()}`;
        }

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data;
      }

      throw new Error(response.data.message || "Update failed");
    } catch (error) {
      console.error('Error updating paraf:', error);
      throw error.response?.data || { message: "Update paraf error" };
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
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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

          if (completeUserData.photo_profile) {
            const fileName = completeUserData.photo_profile.split('/').pop();
            completeUserData.photo_profile = `${API_URL}/uploads/profiles/${fileName}`;
          }

          if (completeUserData.paraf_image) {
            const fileName = completeUserData.paraf_image.split('/').pop();
            completeUserData.paraf_image = `${API_URL}/uploads/paraf/${fileName}`;
          }

          setUser(completeUserData);
          localStorage.setItem("user", JSON.stringify(completeUserData));
          await refreshProfile();
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

      const endpoint = user?.role === 'admin' ? '/api/admin/profile/password' : '/api/user/profile/password';

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await refreshProfile();
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 && !error.config.url.includes('/profile/password')) {
          logout();
        }
        return Promise.reject(error);
      }
    );
  
    return () => axios.interceptors.response.eject(interceptor);
  }, []);


  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    updatePassword,
    refreshProfile,
    register,
    fetchAdminUsers,
    updateParaf
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