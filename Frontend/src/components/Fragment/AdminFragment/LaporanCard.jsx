import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";
import { FileText, ClockIcon, CheckCircle, AlertTriangle } from "lucide-react";

function LaporanCard({ filters = {} }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_laporan: 0,
    disetujui: 0,
    pending_review: 0,
    perlu_revisi: 0,
    avg_progress: 0,
    first_submit: null,
    last_submit: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `http://localhost:3000/api/reports/stats?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success && response.data.summary) {
        setStats(response.data.summary);
      }
      setError("");
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Gagal memuat statistik laporan");
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (title) => {
    switch (title) {
      case "Total Laporan":
        return "text-blue-600";
      case "Disetujui":
        return "text-green-600";
      case "Pending Review":
        return "text-yellow-600";
      case "Perlu Revisi":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getIcon = (title) => {
    switch (title) {
      case "Total Laporan":
        return <FileText className="h-6 w-6" />;
      case "Disetujui":
        return <CheckCircle className="h-6 w-6" />;
      case "Pending Review":
        return <ClockIcon className="h-6 w-6" />;
      case "Perlu Revisi":
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Laporan", 
      value: stats.total_laporan
    },
    { 
      title: "Disetujui", 
      value: stats.disetujui
    },
    { 
      title: "Pending Review", 
      value: stats.pending_review
    },
    { 
      title: "Perlu Revisi", 
      value: stats.perlu_revisi
    }
  ];

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow hover:scale-105 duration-500 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className={getIconColor(stat.title)}>
                {getIcon(stat.title)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <div className="mt-1">
                  <p className="text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default LaporanCard;