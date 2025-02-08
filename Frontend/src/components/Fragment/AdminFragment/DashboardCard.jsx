import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";
import { Users, Calendar, ClockIcon, AlertTriangle } from "lucide-react";

function DashboardCard() {
  const [stats, setStats] = useState({
    totalInternship: 0,
    kehadiranHariIni: 0,
    pengajuanIzin: 0,
    logbookPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/absen/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.success) {
          const stats = response.data.data;
          setStats({
            totalInternship: stats.totalInternship,
            kehadiranHariIni: stats.kehadiranHariIni,
            pengajuanIzin: stats.izinHariIni,
            logbookPending: stats.logbookPending,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchStats();
      const interval = setInterval(fetchStats, 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getIconAndColor = (title) => {
    switch (title) {
      case "Total Internship Aktif":
        return { 
          icon: <Users className="h-6 w-6" />,
          color: "text-blue-600 bg-blue-100"
        };
      case "Kehadiran Hari Ini":
        return { 
          icon: <Calendar className="h-6 w-6" />,
          color: "text-green-600 bg-green-100"
        };
      case "Pengajuan Izin":
        return { 
          icon: <ClockIcon className="h-6 w-6" />,
          color: "text-yellow-600 bg-yellow-100"
        };
      case "Logbook Pending":
        return { 
          icon: <AlertTriangle className="h-6 w-6" />,
          color: "text-yellow-600 bg-yellow-100"
        };
      default:
        return { 
          icon: <Users className="h-6 w-6" />,
          color: "text-gray-600 bg-gray-100"
        };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Internship Aktif",
      value: stats.totalInternship
    },
    {
      title: "Kehadiran Hari Ini",
      value: stats.kehadiranHariIni
    },
    {
      title: "Pengajuan Izin",
      value: stats.pengajuanIzin
    },
    {
      title: "Logbook Pending",
      value: stats.logbookPending
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const { icon, color } = getIconAndColor(stat.title);
        return (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-300"
          >
            <div className="flex items-start">
              <div className={`${color} p-2 rounded-lg`}>
                {icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <div 
              className="absolute bottom-0 right-0 h-2 w-2/3 bg-gradient-to-r from-transparent" 
              style={{
                backgroundImage: `linear-gradient(to right, transparent, ${
                  stat.title === "Kehadiran Hari Ini" ? '#22c55e' :
                  stat.title === "Pengajuan Izin" || stat.title === "Logbook Pending" ? '#eab308' :
                  '#3b82f6'
                }1a)`
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default DashboardCard;