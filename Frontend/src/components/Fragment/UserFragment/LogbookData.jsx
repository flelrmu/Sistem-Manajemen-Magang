import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import axios from 'axios';
import ActivityModal from "./Activity";

function LogbookData({ logbooks }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  
  const handleEdit = (logbook) => {
    setSelectedLogbook(logbook);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/logbook/${selectedLogbook.id}`, formData);
      
      if (response.data.success) {
        setIsEditModalOpen(false);
        // Reload halaman untuk mendapatkan data terbaru
        window.location.reload();
        alert('Logbook berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating logbook:', error);
      alert(error.response?.data?.message || 'Gagal mengupdate logbook');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">Tanggal</th>
              <th className="text-left py-4 px-4">Aktivitas</th>
              <th className="text-left py-4 px-4">Progress</th>
              <th className="text-left py-4 px-4">Status</th>
              <th className="text-left py-4 px-4">Aksi</th>
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
                  {item.aktivitas}
                  {item.catatan_admin && (
                    <div className="text-sm text-red-600 mt-1">
                      Catatan Admin: {item.catatan_admin}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-center">{item.progress}%</div>
                  </div>
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
                  {item.status === 'rejected' && (
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit Logbook"
                    >
                      <Edit2 size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ActivityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={selectedLogbook}
        isEdit={true}
      />
    </div>
  );
}

export default LogbookData;