import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import ActivityModal from "./Activity";

function LogbookData({ logbooks = [] }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  
  const handleEdit = (logbook) => {
    setSelectedLogbook(logbook);
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riwayat Logbook</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktivitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {logbooks.some(log => log.catatan_admin) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan Admin
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logbooks.map((record, index) => (
                <tr 
                  key={record.id || index} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(record.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    {record.aktivitas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">   
                      {record.progress}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                        ${record.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : record.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {record.status === "approved"
                        ? "Disetujui"
                        : record.status === "pending"
                        ? "Menunggu Review"
                        : "Ditolak"}
                    </span>
                  </td>
                  {logbooks.some(log => log.catatan_admin) && (
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {record.catatan_admin || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-4">
                      {record.status === "rejected" && (
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          title="Edit Logbook"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!logbooks || logbooks.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Belum ada logbook yang dikumpulkan
            </div>
          )}
        </div>
      </div>

      <ActivityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLogbook(null);
        }}
        initialData={selectedLogbook}
        isEdit={true}
      />
    </div>
  );
}

export default LogbookData;