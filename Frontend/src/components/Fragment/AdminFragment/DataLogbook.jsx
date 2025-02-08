import React, { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

function DataLogbook({ logbooks, onApprove, onReject, onSelectUser }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = (userId, userName) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      onSelectUser(null);
    } else {
      setSelectedUserId(userId);
      onSelectUser({ id: userId, name: userName });
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) return;
    
    setLoading(true);
    try {
      await onReject(selectedLogbook.id, adminNotes);
      setIsRejectModalOpen(false);
      setSelectedLogbook(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error rejecting logbook:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reject Modal Component
  const RejectModal = () => {
    if (!isRejectModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reject Logbook</h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Feedback</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Masukkan catatan untuk mahasiswa..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </div>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-14 px-4 py-4 text-left text-sm font-semibold text-gray-600">Sel</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mahasiswa</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aktivitas</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Progress</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logbooks.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data logbook yang tersedia.
                </td>
              </tr>
            ) : (
              logbooks.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleSelect(record.mahasiswa_id, record.mahasiswa_nama)}
                      className={`w-4 h-4 rounded border ${
                        selectedUserId === record.mahasiswa_id
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      } flex items-center justify-center transition-colors`}
                    >
                      {selectedUserId === record.mahasiswa_id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {record.mahasiswa_nama.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{record.mahasiswa_nama}</div>
                        <div className="text-sm text-gray-500">{record.nim}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{record.tanggal}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-md">
                    <div className="line-clamp-2">{record.aktivitas}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record.progress || 0}%
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {record.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(record.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Setujui"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLogbook(record);
                              setIsRejectModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      <RejectModal />
    </div>
  );
}

export default DataLogbook;