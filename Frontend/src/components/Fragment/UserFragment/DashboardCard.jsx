import React from "react";

function DashboardCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Total Kehadiran</h3>
        <div className="text-xl font-bold mb-4">15/20 Hari</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Logbook Terisi</h3>
        <div className="text-xl font-bold mb-4">15/20 Hari</div>
        <div className="text-sm text-gray-500">Last updated: Today</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Status Laporan</h3>
        <div className="text-orange-500 font-medium mb-4">In Review</div>
        <div className="text-sm text-gray-500">Submitted 2 days ago</div>
      </div>
    </div>
  );
}

export default DashboardCard;
