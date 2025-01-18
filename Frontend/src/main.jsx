import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./components/Context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./Pages/Auth/login";
import RegisterPage from "./Pages/Auth/register";
import ScanQRCodePage from "./Pages/Auth/scan";
import DashboardPage from "./Pages/Admin/dashboard";
import InternshipPage from "./Pages/Admin/internship";
import AbsensiPage from "./Pages/Admin/absensi";
import LogbookPage from "./Pages/Admin/logbook";
import LaporanPage from "./Pages/Admin/laporan";
import DashboardUserPage from "./Pages/Users/dashboardUser";
import AbsensiUserPage from "./Pages/Users/absensiUser";
import LogbookUserPage from "./Pages/Users/logbookUser";
import LaporanUserPage from "./Pages/Users/laporanUser";
import ProfilePage from "./Pages/Admin/profile";
import ProfilePageUser from "./Pages/Users/profileUser";

// const Route = createBrowserRouter([
//   {
//     path: "/",
//     element: <LoginPage />,
//   },
//   {
//     path: "/login",
//     element: <LoginPage />,
//   },
//   {
//     path: "/register",
//     element: <RegisterPage />,
//   },
//   {
//     path: "/scan",
//     element: <ScanQRCodePage />,
//   },
//   {
//     path: "/dashboard",
//     element: <DashboardPage />,
//   },
//   {
//     path: "/internship",
//     element: <InternshipPage />,
//   },
//   {
//     path: "/absensi",
//     element: <AbsensiPage />,
//   },
//   {
//     path: "/logbook",
//     element: <LogbookPage />,
//   },
//   {
//     path: "/laporan",
//     element: <LaporanPage />,
//   },
//   {
//     path: "/dashboardUser",
//     element: <DashboardUserPage />,
//   },
//   {
//     path: "/absensiUser",
//     element: <AbsensiUserPage />,
//   },
//   {
//     path: "/logbookUser",
//     element: <LogbookUserPage />,
//   },
//   {
//     path: "/laporanUser",
//     element: <LaporanUserPage />,
//   },
//   {
//     path: "/profile",
//     element: <ProfilePage />,
//   },
//   {
//     path: "/profileUser",
//     element: <ProfilePageUser />,
//   },
// ]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Admin Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InternshipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/absensi"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AbsensiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logbook"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LogbookPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/laporan"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LaporanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          

          {/* Protected Mahasiswa Route */}
          <Route
            path="/dashboardUser"
            element={
              <ProtectedRoute allowedRoles={["mahasiswa"]}>
                <DashboardUserPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
