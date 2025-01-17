import React from "react";

function AktifitasTerbaru() {
  const activities = [
    {
      type: "Logbook Baru",
      description: "Ahmad Rifqi mengajukan logbook baru",
      bgColor: "bg-blue-100",
    },
    {
      type: "Absensi Masuk",
      description: "Ahmad Rifqi melakukan absensi masuk",
      bgColor: "bg-green-100",
    },
    {
      type: "Pengajuan Izin",
      description: "Ahmad Rifqi mengajukan logbook baru",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Aktifitas Terbaru</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`w-10 h-10 ${activity.bgColor} rounded-full`}></div>
            <div>
              <h4 className="text-sm font-medium">{activity.type}</h4>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AktifitasTerbaru;
