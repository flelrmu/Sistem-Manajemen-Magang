import React from "react";

function DashboardCard() {
  const stats = [
    { title: "Total Internship Aktif", value: "24" },
    { title: "Kehadiran Hari Ini", value: "20" },
    { title: "Pengajuan Izin", value: "3" },
    { title: "Logbook Pending", value: "5" },
  ];

  const getColorClass = (title) => {
    switch (title) {
      case "Total Internship Aktif":
        return "text-black";
      case "Kehadiran Hari Ini":
        return "text-green-500";
      case "Pengajuan Izin":
        return "text-yellow-500";
      case "Logbook Pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ">
      {stats.map((stat, index) => (
        <div key={index} className="group bg-white p-6 rounded-lg shadow hover:scale-105 duration-500">
          <h3 className="text-gray-600 mb-2 group-hover:text-red-500">{stat.title}</h3>
          <p className={`text-3xl font-bold ${getColorClass(stat.title)}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCard;
