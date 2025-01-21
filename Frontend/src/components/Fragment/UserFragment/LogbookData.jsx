import React from "react";
import { ArrowUpDown } from "lucide-react";

function LogbookData({ logbooks }) {
  console.log('Logbooks di komponen:', logbooks); 
  
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
            {logbooks?.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="py-4 px-4">
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="py-4 px-4 max-w-md">
                  {item.aktivitas} Progress: {item.progress}%
                </td>
                <td className="py-4 px-4">
                  {item.file_dokumentasi && (
                    <button className="text-blue-600 hover:underline flex items-center">
                      <ArrowUpDown className="mr-1 h-4 w-4" />
                      View
                    </button>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {item.paraf_admin ? (
                    <button className="text-gray-600 hover:text-gray-800 flex items-center">
                      <ArrowUpDown className="mr-1 h-4 w-4" />
                      Paraf
                    </button>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {logbooks?.length ? '1' : '0'} to {logbooks?.length} of {logbooks?.length} entries
        </p>
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