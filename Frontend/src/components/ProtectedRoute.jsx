import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Context/UserContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Tampilkan loading screen jika context masih memuat
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect ke login jika belum login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect berdasarkan role jika tidak diizinkan
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect admin ke dashboard admin
    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    // Redirect mahasiswa ke dashboard mahasiswa
    else if (user.role === "mahasiswa") {
      return <Navigate to="/dashboardUser" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;