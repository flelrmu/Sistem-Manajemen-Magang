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
        return "text-blue-600 bg-blue-100";
      case "Disetujui":
        return "text-green-600 bg-green-100";
      case "Pending Review":
        return "text-yellow-600 bg-yellow-100";
      case "Perlu Revisi":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-300"
          >
            <div className="flex items-start">
              <div className={`${getIconColor(stat.title)} p-2 rounded-lg`}>
                {getIcon(stat.title)}
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
                  stat.title === "Disetujui" ? '#22c55e' :
                  stat.title === "Pending Review" ? '#eab308' :
                  stat.title === "Perlu Revisi" ? '#ef4444' :
                  '#3b82f6'
                }1a)`
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default LaporanCard;