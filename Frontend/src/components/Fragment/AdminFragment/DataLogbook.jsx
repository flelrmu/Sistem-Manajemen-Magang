import React, { useState } from "react";
import { Check, X } from "lucide-react";

function DataLogbook({ logbooks, onApprove, onReject, onSelectUser }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSelect = (userId, userName) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      onSelectUser(null);
    } else {
      setSelectedUserId(userId);
      onSelectUser({ id: userId, name: userName }); // Send both ID and name
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      return;
    }
    await onReject(selectedLogbook.id, adminNotes);
    setIsRejectModalOpen(false);
    setSelectedLogbook(null);
    setAdminNotes("");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4 w-20">Select</th>
            <th className="text-left p-4">Mahasiswa</th>
            <th className="text-left p-4">Tanggal</th>
            <th className="text-left p-4">Aktivitas</th>
            <th className="text-left p-4">Progress</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {logbooks.map((record) => (
            <tr key={record.id} className="border-t hover:bg-gray-50">
              <td className="p-4">
                <button
                  onClick={() => handleSelect(record.mahasiswa_id, record.mahasiswa_nama)}
                  className={`w-6 h-6 rounded border ${
                    selectedUserId === record.mahasiswa_id
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  } flex items-center justify-center`}
                >
                  {selectedUserId === record.mahasiswa_id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-medium">{record.mahasiswa_nama}</div>
                    <div className="text-gray-500 text-sm">{record.nim}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">{record.tanggal}</td>
              <td className="p-4 max-w-md">{record.aktivitas}</td>
              <td className="p-4">{record.progress}%</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  record.status === 'approved' ? 'bg-green-100 text-green-800' :
                  record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  {record.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => onApprove(record.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedLogbook(record);
                          setIsRejectModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Reject Logbook</h3>
              <div className="space-y-4">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Masukkan catatan untuk mahasiswa..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataLogbook;