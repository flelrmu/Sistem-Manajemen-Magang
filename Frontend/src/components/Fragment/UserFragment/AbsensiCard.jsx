import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import StatsCard from "../../Fragment/UserFragment/StatsCard";

function AbsensiCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        icon={<CheckCircle className="text-blue-500" size={24} />}
        title="Total Kehadiran"
        value="18/20"
        color="bg-blue-100"
      />
      <StatsCard
        icon={<CheckCircle className="text-green-500" size={24} />}
        title="Hadir Tepat Waktu"
        value="16"
        color="bg-green-100"
      />
      <StatsCard
        icon={<Clock className="text-orange-500" size={24} />}
        title="Izin"
        value="2"
        color="bg-orange-100"
      />
      <StatsCard
        icon={<XCircle className="text-red-500" size={24} />}
        title="Alpha"
        value="0"
        color="bg-red-100"
      />
    </div>
  );
}

export default AbsensiCard;
