import React, { useEffect, useState } from "react";
import axios from 'axios';

function LogbookCard({ refreshTrigger = 0 }) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchLogbookStats();
  }, [refreshTrigger]);

  const fetchLogbookStats = async () => {
    try {
      const response = await axios.get('http://api.simagang.tech/api/logbook');
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
    }
  };

  const getColorClass = (title) => {
    switch (title) {
      case "Total Logbook": return "text-black";
      case "Approved": return "text-green-500";
      case "Pending": return "text-yellow-500";
      case "Rejected": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {[
        { title: "Total Logbook", value: stats.total },
        { title: "Approved", value: stats.approved },
        { title: "Pending", value: stats.pending },
        { title: "Rejected", value: stats.rejected },
      ].map((card, index) => (
        <div 
          key={index} 
          className="group bg-white p-6 rounded-lg shadow hover:scale-105 duration-500"
        >
          <h3 className="text-gray-600 mb-2 group-hover:text-red-500 duration-500">{card.title}</h3>
          <p className={`text-3xl font-bold ${getColorClass(card.title)}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default LogbookCard;