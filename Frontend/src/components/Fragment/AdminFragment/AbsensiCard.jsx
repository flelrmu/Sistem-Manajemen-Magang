import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/UserContext';

function AbsensiCard() {
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    hadir: 0,
    izin: 0,
    alpha: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total mahasiswa
        const mahasiswaResponse = await axios.get('http://api.simagang.tech/api/admin/mahasiswa', {
          params: { status: 'aktif' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Get attendance data
        const attendanceResponse = await axios.get('http://api.simagang.tech/api/absen/riwayat', {
          params: {
            tanggal: today
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (attendanceResponse.data.success) {
          const attendanceData = attendanceResponse.data.data;
          setStats({
            totalMahasiswa: mahasiswaResponse.data.total || 0,
            hadir: attendanceData.filter(record => record.status_kehadiran === 'hadir').length,
            izin: attendanceData.filter(record => record.status_kehadiran === 'izin').length,
            alpha: attendanceData.filter(record => record.status_kehadiran === 'alpha').length
          });
        } else {
          setStats(prev => ({
            ...prev,
            totalMahasiswa: mahasiswaResponse.data.total || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
      const interval = setInterval(fetchStats, 300000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getColorClass = (title) => {
    switch (title) {
      case "Total Intership":
        return "text-black";
      case "Hadir":
        return "text-green-500";
      case "Izin":
        return "text-yellow-500";
      case "Alpha":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const statsData = [
    { title: "Total Intership", value: stats.totalMahasiswa },
    { title: "Hadir", value: stats.hadir },
    { title: "Izin", value: stats.izin },
    { title: "Alpha", value: stats.alpha }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="group bg-white p-6 rounded-lg shadow hover:scale-105 duration-500">
          <h3 className="text-gray-600 mb-2 group-hover:text-red-500 duration-500">{stat.title}</h3>
          <p className={`text-3xl font-bold ${getColorClass(stat.title)}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AbsensiCard;