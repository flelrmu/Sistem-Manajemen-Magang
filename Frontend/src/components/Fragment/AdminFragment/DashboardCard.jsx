import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";

function DashboardCard() {
  const [stats, setStats] = useState({
    totalInternship: 0,
    kehadiranHariIni: 0,
    pengajuanIzin: 0,
    logbookPending: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://157.245.206.178:3000/api/absen/dashboard/stats",
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
      }
    };

    if (user?.role === "admin") {
      fetchStats();
      // Refresh setiap 5 menit
      const interval = setInterval(fetchStats, 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const statsData = [
    {
      title: "Total Internship Aktif",
      value: stats.totalInternship,
      color: "text-black",
    },
    {
      title: "Kehadiran Hari Ini",
      value: stats.kehadiranHariIni,
      color: "text-green-500",
    },
    {
      title: "Pengajuan Izin",
      value: stats.pengajuanIzin,
      color: "text-yellow-500",
    },
    {
      title: "Logbook Pending",
      value: stats.logbookPending,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="group bg-white p-6 rounded-lg shadow hover:scale-105 duration-500"
        >
          <h3 className="text-gray-600 mb-2 group-hover:text-red-500 duration-500">
            {stat.title}
          </h3>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCard;
