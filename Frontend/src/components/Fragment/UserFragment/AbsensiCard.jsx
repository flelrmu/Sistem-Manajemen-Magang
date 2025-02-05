import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import axios from "axios";
import StatsCard from "../../Fragment/UserFragment/StatsCard";

function AbsensiCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://api.simagang.tech/api/absen/attendance-stats"
        );
        setStats(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data kehadiran");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Memuat data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon={<Calendar className="text-purple-500" size={24} />}
          title="Total Kehadiran"
          value={`${stats.total_attendance}/${stats.total_days}`}
          color="bg-purple-100"
        />
        <StatsCard
          icon={<CheckCircle className="text-green-500" size={24} />}
          title="Hadir Tepat Waktu"
          value={stats.hadir_tepat}
          color="bg-green-100"
        />
        <StatsCard
          icon={<Clock className="text-orange-500" size={24} />}
          title="Izin"
          value={stats.izin}
          color="bg-orange-100"
        />
        <StatsCard
          icon={<XCircle className="text-red-500" size={24} />}
          title="Alpha"
          value={stats.alpha}
          color="bg-red-100"
        />
      </div>
    </div>
  );
}

export default AbsensiCard;
