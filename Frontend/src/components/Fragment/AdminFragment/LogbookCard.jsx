import React, { useEffect, useState } from "react";
import axios from 'axios';
import { BookOpen, CheckCircle, ClockIcon, XCircle } from "lucide-react";

function LogbookCard({ refreshTrigger = 0 }) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogbookStats();
  }, [refreshTrigger]);

  const fetchLogbookStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/logbook');
      if (response.data.success && response.data.data) {
        const logbooks = response.data.data;
        setStats({
          total: logbooks.length,
          approved: logbooks.filter(log => log.status === 'approved').length,
          pending: logbooks.filter(log => log.status === 'pending').length,
          rejected: logbooks.filter(log => log.status === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error fetching logbook stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconAndColor = (title) => {
    switch (title) {
      case "Total Logbook":
        return { 
          icon: <BookOpen className="h-6 w-6" />,
          color: "text-blue-600 bg-blue-100"
        };
      case "Approved":
        return { 
          icon: <CheckCircle className="h-6 w-6" />,
          color: "text-green-600 bg-green-100"
        };
      case "Pending":
        return { 
          icon: <ClockIcon className="h-6 w-6" />,
          color: "text-yellow-600 bg-yellow-100"
        };
      case "Rejected":
        return { 
          icon: <XCircle className="h-6 w-6" />,
          color: "text-red-600 bg-red-100"
        };
      default:
        return { 
          icon: <BookOpen className="h-6 w-6" />,
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
    { title: "Total Logbook", value: stats.total },
    { title: "Approved", value: stats.approved },
    { title: "Pending", value: stats.pending },
    { title: "Rejected", value: stats.rejected }
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
                  stat.title === "Approved" ? '#22c55e' :
                  stat.title === "Pending" ? '#eab308' :
                  stat.title === "Rejected" ? '#ef4444' :
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

export default LogbookCard;