import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Download, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  File,
  FileCheck,
  Loader2,
  AlertCircle 
} from "lucide-react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

// Reject Modal Component
const RejectModal = ({ isOpen, onClose, onSubmit, report }) => {
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit({ feedback, file });
      setFeedback("");
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error in reject submission:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Alasan Penolakan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <label className="text-gray-500 text-sm block mb-1">Mahasiswa</label>
                <span className="text-gray-900 font-medium">{report?.mahasiswa_nama}</span>
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">NIM</label>
                <span className="text-gray-900 font-medium">{report?.nim}</span>
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">Versi</label>
                <span className="text-gray-900 font-medium">{report?.versi}</span>
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">Tanggal Submit</label>
                <span className="text-gray-900 font-medium">
                  {format(new Date(report?.created_at), 'd MMMM yyyy', { locale: id })}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Feedback</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Tuliskan feedback untuk perbaikan laporan..."
              />
            </div>

            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">File Revisi (Opsional)</span>
              </label>
              <div className="mt-1">
                <label className="flex items-center px-4 py-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <span className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md">
                    Choose File
                  </span>
                  <span className="ml-3 text-sm text-gray-600">
                    {file ? file.name : 'No file chosen'}
                  </span>
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Format yang diizinkan: PDF, DOC, DOCX (Maks. 10MB)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Mengirim...
                  </div>
                ) : (
                  "Kirim Feedback"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main DataLaporan Component
function DataLaporan({ filters = {}, onSelectionChange }) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedItems);
    }
  }, [selectedItems]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: itemsPerPage,
        ...filters
      }).toString();

      const response = await axios.get(`http://localhost:3000/api/reports?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setReports(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(error.response?.data?.message || "Gagal memuat data laporan");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = reports.map(report => report.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios({
        url: `http://localhost:3000${url}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Download error:', error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Gagal mengunduh file. ' + (error.response?.data?.message || 'Silakan coba lagi.'),
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleApprove = async (reportId) => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Persetujuan',
        text: 'Apakah Anda yakin ingin menyetujui laporan ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Setujui',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280'
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `http://localhost:3000/api/reports/${reportId}/review`,
          {
            status: 'disetujui',
            feedback: 'Laporan disetujui'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Laporan telah disetujui',
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
          fetchReports();
        }
      }
    } catch (error) {
      console.error("Error approving report:", error);
      await Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || "Gagal menyetujui laporan",
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleReject = async (report) => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Penolakan',
        text: 'Apakah Anda yakin ingin menolak laporan ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280'
      });

      if (result.isConfirmed) {
        setSelectedReport(report);
        setIsRejectOpen(true);
      }
    } catch (error) {
      console.error("Error in rejection confirmation:", error);
      await Swal.fire({
        title: 'Gagal!',
        text: "Terjadi kesalahan saat memproses penolakan",
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleRejectSubmit = async (formData) => {
    try {
      const data = new FormData();
      data.append('status', 'perlu_revisi');
      data.append('feedback', formData.feedback);
      
      if (formData.file) {
        data.append('file_revisi', formData.file);
      }

      const response = await axios.post(
        `http://localhost:3000/api/reports/${selectedReport.id}/review`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setIsRejectOpen(false);
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Feedback telah berhasil dikirim',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        fetchReports();
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
      await Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || "Gagal mengirim feedback",
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const formatDate = (date) => {
    try {
      if (!date) return '-';
      return format(new Date(date), 'd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error('Date formatting error:', error);
      return date;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_review': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'perlu_revisi': 'bg-red-100 text-red-800 border border-red-200',
      'disetujui': 'bg-green-100 text-green-800 border border-green-200'
    };

    const statusText = {
      'pending_review': 'Menunggu Review',
      'perlu_revisi': 'Perlu Revisi',
      'disetujui': 'Disetujui'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.length === reports.length && reports.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mahasiswa</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal Submit</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Versi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Progress</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Dokumen</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Tidak ada data laporan
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(report.id)}
                      onChange={() => handleSelectItem(report.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {report.mahasiswa_nama?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{report.mahasiswa_nama}</div>
                        <div className="text-sm text-gray-500">{report.nim}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(report.created_at)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{report.versi}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {report.progress || 0}%
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {report.file_path && (
                        <button
                          onClick={() => handleDownload(report.file_path, `Laporan_${report.versi}.pdf`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                          title="Download Laporan"
                        >
                          <File size={18} />
                          <span className="text-sm">Laporan</span>
                        </button>
                      )}
                      {report.file_revisi_path && (
                        <button
                          onClick={() => handleDownload(report.file_revisi_path, `Revisi_${report.versi}.pdf`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                          title="Download File Revisi"
                        >
                          <FileCheck size={18} />
                          <span className="text-sm">Revisi</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {report.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleApprove(report.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Setujui"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(report)}
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

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, totalItems)} of{" "}
            {totalItems} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setPage(index + 1)}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  page === index + 1
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={handleRejectSubmit}
        report={selectedReport}
      />
    </div>
  );
}

export default DataLaporan;