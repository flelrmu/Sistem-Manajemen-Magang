import React from "react";

function StatusLaporan() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Status Laporan</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-600">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Deadline Pengumpulan:</span>
          <span className="text-gray-800">31 Jan 2024</span>
        </div>
      </div>
    </div>
  );
}

export default StatusLaporan;
