import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/UserContext";
import FilterAbsensi from "./FilterAbsensi";

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

  const { user } = useAuth();
  const itemsPerPage = 10;

  const fetchAttendanceData = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "http://localhost:3000/api/absen/riwayat",
        {
          params: {
            page,
            limit: itemsPerPage,
            ...(filters.status !== "Semua Status" && {
              status: filters.status,
            }),
            ...(filters.tanggal && {
              tanggal: filters.tanggal.toISOString().split("T")[0],
            }),
            ...(filters.search && { search: filters.search }),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const formattedData = response.data.data.map((record) => ({
          id: record.id,
          nama: record.mahasiswa_nama,
          nim: record.nim,
          photo_profile: record.photo_profile,
          tanggal: new Date(record.tanggal).toLocaleDateString("id-ID"),
          waktu_masuk: record.waktu_masuk
            ? new Date(record.waktu_masuk).toLocaleTimeString("id-ID")
            : "-",
          waktu_keluar: record.waktu_keluar
            ? new Date(record.waktu_keluar).toLocaleTimeString("id-ID")
            : "-",
          status_kehadiran: record.status_kehadiran,
          dalam_radius: record.dalam_radius,
          latitude_scan: record.latitude_scan,
          longitude_scan: record.longitude_scan,
        }));

        setAttendanceData(formattedData);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data absensi");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAttendanceData();
    }
  }, [user, currentPage, filters]);

  if (loading) {
    return (
      <div>
        <FilterAbsensi onFilterChange={handleFilterChange} />
        <div className="p-4 text-center">
          <p>Loading data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <FilterAbsensi onFilterChange={handleFilterChange} />
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

  if (!user || user.role !== "admin") {
    return (
      <div className="p-4 text-center text-yellow-600">
        Anda harus login sebagai admin untuk melihat data ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterAbsensi onFilterChange={handleFilterChange} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {attendanceData.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            Tidak ada data absensi yang tersedia untuk filter yang dipilih.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left">Nama</th>
                <th className="p-4 text-left">Tanggal</th>
                {/* Only show these columns if there's at least one non-izin record */}
                {attendanceData.some(record => record.status_kehadiran === "hadir") && (
                  <>
                    <th className="p-4 text-left">Waktu Masuk</th>
                    <th className="p-4 text-left">Waktu Keluar</th>
                    <th className="p-4 text-left">Lokasi</th>
                  </>
                )}
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={record.id || index} className="border-t">
                  <td className="p-4">{record.nama}</td>
                  <td className="p-4">{record.tanggal}</td>
                  {/* Only show these cells if the status is "hadir" */}
                  {record.status_kehadiran === "hadir" && (
                    <>
                      <td className="p-4">{record.waktu_masuk}</td>
                      <td className="p-4">{record.waktu_keluar}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            record.dalam_radius
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          title={`Latitude: ${record.latitude_scan}, Longitude: ${record.longitude_scan}`}
                        >
                          {record.dalam_radius ? "Dalam Radius" : "Luar Radius"}
                        </span>
                      </td>
                    </>
                  )}
                  {/* Add empty cells for "izin" status to maintain table structure */}
                  {record.status_kehadiran === "izin" && attendanceData.some(r => r.status_kehadiran === "hadir") && (
                    <>
                      <td className="p-4">-</td>
                      <td className="p-4">-</td>
                      <td className="p-4">-</td>
                    </>
                  )}
                  <td className="p-4">
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
                      {record.status_kehadiran === "hadir" 
                        ? "Hadir" 
                        : record.status_kehadiran === "izin"
                        ? "Izin"
                        : record.status_kehadiran === "alpha"
                        ? "Alpha"
                        : record.status_kehadiran}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DataAbsensi;