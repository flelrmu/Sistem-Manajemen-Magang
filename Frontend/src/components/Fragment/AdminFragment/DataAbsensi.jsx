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

  // Fetch attendance data 
  const fetchAttendanceData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
  
      // Build params
      const params = {
        page,
        limit: itemsPerPage
      };
      
      if (filters.status !== "Semua Status") {
        params.status = filters.status;
      }
      
      // Add date filters
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
  
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
        // Format the data and ensure each record has all required fields
        const formattedData = response.data.data.map((record, index) => ({
          id: record.id || `temp-${index}`, // Fallback ID if none exists
          nama: record.mahasiswa_nama || '-',
          nim: record.nim || '-',
          tanggal: record.tanggal ? new Date(record.tanggal).toLocaleDateString("id-ID", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : '-',
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

      // Handle successful response
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
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Export error:", error);

      let errorMessage = "Gagal mengekspor data";

      if (error.response) {
        // Try to parse error response if it's a blob
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text();
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }

      alert(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setSelectedIds([]); // Clear selections when filters change
  };

  // Handle selection
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

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAttendanceData();
    }
  }, [user, currentPage, filters]);

  if (!user || user.role !== "admin") {
    return (
      <div className="p-4 text-center text-yellow-600 bg-yellow-50 rounded-lg">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        Anda harus login sebagai admin untuk melihat data ini.
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <FilterAbsensi onFilterChange={handleFilterChange} />
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-600">Loading data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <FilterAbsensi onFilterChange={handleFilterChange} />
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg mt-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="mb-2">Error: {error}</p>
          <button
            onClick={() => fetchAttendanceData()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterAbsensi onFilterChange={handleFilterChange} />
      
      {/* Header section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {selectedIds.length} data terpilih dari {attendanceData.length} total data
          </div>
          <button
            onClick={handleExport}
            disabled={selectedIds.length === 0 || exportLoading}
            className={`flex items-center px-4 py-2 rounded transition-colors ${
              selectedIds.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-white bg-green-600 hover:bg-green-700'
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

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 py-4 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === attendanceData.length && attendanceData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Nama</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">NIM</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Tanggal</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Waktu Masuk</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Waktu Keluar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Ketepatan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.uniqueKey} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => handleSelectRow(record.id)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.nama}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.nim}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.tanggal}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.waktu_masuk}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.waktu_keluar}</td>
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6">
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
              ))}
            </tbody>
          </table>
        </div>


        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 px-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, attendanceData.length)} of{" "}
            {attendanceData.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded-md ${
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
              className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataAbsensi;
