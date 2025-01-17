import React from "react";
import { ArrowUpDown } from "lucide-react";

function LogbookData() {
  const logbookData = [
    {
      tanggal: "13 Jan 2024",
      aktivitas:
        "Implementasi fitur login dan autentikasi menggunakan JWT Token Progress: 100%",
      dokumentasi: "View",
      status: "Approved",
      paraf: "Paraf",
    },
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">Tanggal</th>
              <th className="text-left py-4 px-4">Aktivitas</th>
              <th className="text-left py-4 px-4">Dokumentasi</th>
              <th className="text-left py-4 px-4">Status</th>
              <th className="text-left py-4 px-4">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {logbookData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-4 px-4">{item.tanggal}</td>
                <td className="py-4 px-4 max-w-md">{item.aktivitas}</td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:underline flex items-center">
                    <ArrowUpDown className="mr-1 h-4 w-4" />
                    {item.dokumentasi}
                  </button>
                </td>
                <td className="py-4 px-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button className="text-gray-600 hover:text-gray-800 flex items-center">
                    <ArrowUpDown className="mr-1 h-4 w-4" />
                    {item.paraf}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">Showing 1 to 10 of 20 entries</p>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border rounded text-gray-600">
            Previous
          </button>
          <button className="px-4 py-2 border rounded bg-gray-50">1</button>
          <button className="px-4 py-2 border rounded">2</button>
          <button className="px-4 py-2 border rounded text-gray-600">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogbookData;
