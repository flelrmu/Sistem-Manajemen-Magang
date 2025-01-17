import React from "react";
import { Edit2, Trash2 } from "lucide-react";

function DataIntership() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-left">Intership</th>
            <th className="p-4 text-left">NIM</th>
            <th className="p-4 text-left">Institusi</th>
            <th className="p-4 text-left">Periode Magang</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/api/placeholder/40/40"
                  alt="Student"
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="font-medium">Rehan Ramadhan</div>
                  <div className="text-gray-500 text-sm">
                    rehanramadhan@gmail.com
                  </div>
                </div>
              </div>
            </td>
            <td className="p-4">22111523090</td>
            <td className="p-4">Universitas Andalas</td>
            <td className="p-4">6 Jan 2025 - 20 Feb 2025</td>
            <td className="p-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Aktif
              </span>
            </td>
            <td className="p-4">
              <div className="flex space-x-4">
                <button className="text-blue-500 hover:bg-blue-50 p-1">
                  <Edit2 size={20} />
                </button>
                <button className="text-red-500 hover:bg-red-50 p-1">
                  <Trash2 size={20} />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="text-gray-600">Showing 1 to 10 of 20 entries</div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded text-gray-600">
            Previous
          </button>
          <button className="px-3 py-1 border rounded bg-gray-100">1</button>
          <button className="px-3 py-1 border rounded text-gray-600">2</button>
          <button className="px-3 py-1 border rounded text-gray-600">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataIntership;
