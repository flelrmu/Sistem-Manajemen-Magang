import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from 'axios';

const DashboardGrafik = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Get current date
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const response = await axios.get('http://localhost:3000/api/absen/statistics', {
          params: {
            startDate: lastWeek.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          }
        });

        if (response.data.success) {
          const formattedData = response.data.data.map(day => ({
            day: new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long' }),
            hadir: day.hadir || 0,
            izin: day.izin || 0,
            alpha: day.alpha || 0,
            total: (day.hadir || 0) + (day.izin || 0) + (day.alpha || 0)
          }));
          setAttendanceData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAttendanceData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Grafik Kehadiran Mingguan</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hadir" stroke="#10B981" name="Hadir" />
              <Line type="monotone" dataKey="izin" stroke="#F59E0B" name="Izin" />
              <Line type="monotone" dataKey="alpha" stroke="#EF4444" name="Alpha" />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#6366F1" 
                name="Total" 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Hadir</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Izin</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Alpha</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Total</span>
          </div>
        </div>
      </div>
      
      {/* Keep existing Status Logbook section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Status Logbook</h3>
        <div className="flex justify-center items-center h-64">
          <ResponsiveContainer width="80%" height="80%">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="75, 100"
                className="animate-dash-green"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeDasharray="15, 100"
                className="animate-dash-amber"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#EF4444"
                strokeWidth="3"
                strokeDasharray="10, 100"
                className="animate-dash-red"
              />
            </svg>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrafik;