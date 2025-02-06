import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";
import { Download, Loader2, AlertCircle } from "lucide-react";

function RiwayatAbsensi() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const { user } = useAuth();
  const itemsPerPage = 10;

  const fetchAttendanceData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "http://localhost:3000/api/absen/absensi",
        {
          params: {
            page,
            limit: itemsPerPage,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const formattedData = response.data.data.map((record) => ({
          id: record.id,
          tanggal: new Date(record.tanggal).toLocaleDateString("id-ID"),
          waktu_masuk: record.waktu_masuk
            ? new Date(record.waktu_masuk).toLocaleTimeString("id-ID")
            : "-",
          waktu_keluar: record.waktu_keluar
            ? new Date(record.waktu_keluar).toLocaleTimeString("id-ID")
            : "-",
          status_kehadiran: record.status_kehadiran || "-",
          status_masuk: record.status_masuk || "-",
          dalam_radius: record.dalam_radius || false,
        }));

        setAttendanceData(formattedData);
        const total = response.data.total || formattedData.length;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Gagal memuat data absensi");
      setAttendanceData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      alert("Pilih setidaknya satu data untuk diekspor");
      return;
    }

    setExportLoading(true);
    try {
      const response = await axios.post(
        "http://api.simagang.tech/api/absen/export-mahasiswa",
        { selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: 'blob',
        }
      );

   // Handle PDF response
   const blob = new Blob([response.data], { type: 'application/pdf' });
   const url = window.URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', `Absensi_${user.nim || 'Mahasiswa'}_${new Date().toISOString().split('T')[0]}.pdf`);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   window.URL.revokeObjectURL(url);
 } catch (error) {
   console.error('Export error:', error);
   alert('Gagal mengekspor data: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
 } finally {
   setExportLoading(false);
 }
};

const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedIds(attendanceData.map(record => record.id));
  } else {
    setSelectedIds([]);
    }
  };
  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-64 text-red-500">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Calculate pagination values
  const totalItems = attendanceData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Riwayat Absensi</h2>
        <button
          onClick={handleExport}
          disabled={selectedIds.length === 0 || exportLoading}
          className={`flex items-center px-4 py-2 rounded ${
            selectedIds.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {exportLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export PDF
        </button>
      </div>
      <div className="overflow-x-auto">
        {attendanceData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Tidak ada data absensi yang tersedia.
          </div>
        ) : (
          <div>
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="w-8 py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === attendanceData.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-4">Tanggal</th>
                  <th className="text-left py-4">Status</th>
                  <th className="text-left py-4">Waktu Masuk</th>
                  <th className="text-left py-4">Waktu Keluar</th>
                  <th className="text-left py-4">Ketepatan Waktu</th>
                  <th className="text-left py-4">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => handleSelectRow(record.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4">{record.tanggal}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.status_kehadiran === "hadir"
                            ? "bg-green-100 text-green-800"
                            : record.status_kehadiran === "izin"
                            ? "bg-yellow-100 text-[#F59E0B]"
                            : record.status_kehadiran === "alpha"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.status_kehadiran}
                      </span>
                    </td>
                    <td className="py-4">{record.waktu_masuk}</td>
                    <td className="py-4">{record.waktu_keluar}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.status_masuk === "tepat_waktu"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status_masuk === "tepat_waktu" ? "Tepat Waktu" : "Telat"}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.dalam_radius
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.dalam_radius ? "Dalam Radius" : "Luar Radius"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {endIndex} of {totalItems} entries
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === i + 1
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiwayatAbsensi;
