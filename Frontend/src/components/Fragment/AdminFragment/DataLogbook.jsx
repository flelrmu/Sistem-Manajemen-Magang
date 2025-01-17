import React from "react";
import { Eye, X, Check } from "lucide-react";

function DataLogbook() {
  const attendanceData = [
    {
      name: "Rehan Ramadhan",
      date: "13 Jan 2024",
      activity: "bekerja bersama pembimbing lapangan menyelsaikan project",
      status: "Hadir",
    },
  ];
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">Mahasiswa</th>
            <th className="text-left p-4">Tanggal</th>
            <th className="text-left p-4">Aktivitas</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record, index) => (
            <tr key={index} className="border-t">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-gray-500 text-sm">{record.date}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">{record.date}</td>
              <td className="p-4">{record.activity}</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {record.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check size={20} />
                  </button>
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">Showing 1 to 10 of 20 entries</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-4 py-2 border rounded bg-gray-50">1</button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataLogbook;
