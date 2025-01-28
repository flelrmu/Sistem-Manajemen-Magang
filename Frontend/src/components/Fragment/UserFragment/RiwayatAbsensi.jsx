import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";

function RiwayatAbsensi() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const itemsPerPage = 10;

  const fetchAttendanceData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
  
      // Tambahkan console.log untuk debugging
      console.log("Fetching data with params:", {
        page,
        limit: itemsPerPage,
      });
  
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
  
      // Log response untuk debugging
      console.log("API Response:", response.data);
  
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
          latitude_scan: record.latitude_scan || null,
          longitude_scan: record.longitude_scan || null,
        }));
  
        // Log formatted data untuk debugging
        console.log("Formatted Data:", formattedData);
  
        setAttendanceData(formattedData);
        const total = response.data.total || formattedData.length;
        setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
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
  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage]);

  // Calculate pagination values
  const totalItems = attendanceData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const renderPaginationButtons = () => {
    if (totalPages <= 0) return null;

    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 border rounded ${
            currentPage === i ? "bg-gray-50" : "hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-4 text-center">
          <p>Loading data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-4 text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchAttendanceData()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Riwayat Absensi</h2>
      <div className="overflow-x-auto">
        {attendanceData.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Tidak ada data absensi yang tersedia.
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">Tanggal</th>
                <th className="text-left py-4">Status</th>
                <th className="text-left py-4">Waktu Masuk</th>
                <th className="text-left py-4">Waktu Keluar</th>
                <th className="text-left py-4">Ketepatan Waktu</th>
                <th className="text-left py-4">Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={record.id || index} className="border-b">
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.dalam_radius
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.dalam_radius ? "Dalam Radius" : "Luar Radius"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalItems > 0 && (
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

            {renderPaginationButtons()}

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
      )}
    </div>
  );
}

export default RiwayatAbsensi;