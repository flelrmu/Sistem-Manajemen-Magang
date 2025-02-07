import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";
import FilterAbsensi from "./FilterAbsensi";
import { Download, Loader2, AlertCircle } from "lucide-react";

function DataAbsensi() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    tanggal: null,
    status: "Semua Status",
    search: "",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const { user } = useAuth();
  const itemsPerPage = 10;

  const fetchAttendanceData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: itemsPerPage,
        ...(filters.status !== "Semua Status" && { status: filters.status }),
        ...(filters.startDate && filters.endDate && {
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await axios.get(
        "http://localhost:3000/api/absen/riwayat",
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const formattedData = response.data.data.map((record, index) => ({
          id: record.id || `temp-${index}`,
          nama: record.mahasiswa_nama || '-',
          nim: record.nim || '-',
          tanggal: record.tanggal 
            ? new Date(record.tanggal).toLocaleDateString("id-ID", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) 
            : '-',
          waktu_masuk: record.waktu_masuk
            ? new Date(record.waktu_masuk).toLocaleTimeString("id-ID", {
                hour: '2-digit',
                minute: '2-digit'
              })
            : "-",
          waktu_keluar: record.waktu_keluar
            ? new Date(record.waktu_keluar).toLocaleTimeString("id-ID", {
                hour: '2-digit',
                minute: '2-digit'
              })
            : "-",
          status_kehadiran: record.status_kehadiran || '-',
          dalam_radius: record.dalam_radius || false,
          status_masuk: record.status_masuk || '-',
          uniqueKey: `${record.id || index}-${record.nim || 'nonim'}-${record.tanggal || 'nodate'}`
        }));

        setAttendanceData(formattedData);
        setTotalPages(Math.ceil((response.data.total || formattedData.length) / itemsPerPage));
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
        "http://localhost:3000/api/absen/export-admin",
        { selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      if (response.data instanceof Blob) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Absensi_Admin_${new Date().toISOString().split("T")[0]}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
      let errorMessage = "Gagal mengekspor data";
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
      }
      alert(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleSelectAll = (e) => {
    setSelectedIds(
      e.target.checked ? attendanceData.map((record) => record.id) : []
    );
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAttendanceData();
    }
  }, [user, currentPage, filters]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-yellow-500" />
          <p className="text-yellow-600">
            Anda harus login sebagai admin untuk melihat data ini.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <FilterAbsensi onFilterChange={handleFilterChange} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Memuat data absensi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <FilterAbsensi onFilterChange={handleFilterChange} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchAttendanceData()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <FilterAbsensi onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedIds.length} data terpilih dari {attendanceData.length} total data
            </div>
            <button
              onClick={handleExport}
              disabled={selectedIds.length === 0 || exportLoading}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedIds.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === attendanceData.length && attendanceData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">NIM</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Waktu Masuk</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Waktu Keluar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ketepatan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data absensi yang tersedia.
                  </td>
                </tr>
              ) : (
                attendanceData.map((record) => (
                  <tr key={record.uniqueKey} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => handleSelectRow(record.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {record.nama.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{record.nama}</div>
                          <div className="text-sm text-gray-500">{record.nim}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.nim}</td>
                    <td className="px-6 py-4 text-gray-600">{record.tanggal}</td>
                    <td className="px-6 py-4 text-gray-600">{record.waktu_masuk}</td>
                    <td className="px-6 py-4 text-gray-600">{record.waktu_keluar}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status_kehadiran === "hadir"
                            ? "bg-green-100 text-green-800"
                            : record.status_kehadiran === "izin"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status_kehadiran.charAt(0).toUpperCase() +
                          record.status_kehadiran.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status_masuk === "tepat_waktu"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status_masuk === "tepat_waktu" ? "Tepat Waktu" : "Telat"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.dalam_radius
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.dalam_radius ? "Dalam Radius" : "Luar Radius"}
                      </span>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, attendanceData.length)} of{" "}
              {attendanceData.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataAbsensi;