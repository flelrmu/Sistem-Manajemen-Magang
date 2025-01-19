import React, { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../Context/UserContext";
import axios from "axios";

function DataIntership() {
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();

  console.log("Current user:", user); // Debug log

  useEffect(() => {
    const fetchMahasiswaData = async () => {
      try {
        console.log("Fetching data with token:", localStorage.getItem("token")); // Debug log

        const response = await axios.get(
          `http://localhost:3000/api/admin/mahasiswa`,
          {
            params: {
              page: currentPage,
              limit: itemsPerPage,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("API Response:", response.data); // Debug log

        if (response.data.success) {
          setMahasiswaData(response.data.mahasiswa);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        }
      } catch (err) {
        console.error("Error details:", err.response || err); // Enhanced error logging
        setError(err.response?.data?.message || "Gagal memuat data mahasiswa");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a user and they're an admin
    if (user && user.role === "admin") {
      console.log("Initiating fetch for admin:", user.admin_id); // Debug log
      fetchMahasiswaData();
    } else {
      console.log("No valid admin user found"); // Debug log
      setLoading(false);
    }
  }, [user, currentPage]);

  // Add debug render information
  console.log("Component state:", {
    loading,
    error,
    dataLength: mahasiswaData.length,
    currentPage,
    totalPages,
  });

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading data mahasiswa...</p>{" "}
        {/* More descriptive loading message */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Coba Lagi
        </button>
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

  if (mahasiswaData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        Tidak ada data mahasiswa yang tersedia.
      </div>
    );
  }

  // Rest of the component code remains the same...
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 text-left">Nama</th>
            <th className="p-4 text-left">NIM</th>
            <th className="p-4 text-left">Institusi</th>
            <th className="p-4 text-left">Periode Magang</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mahasiswaData.map((mahasiswa) => (
            <tr key={mahasiswa.id} className="border-t">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={mahasiswa.photo_profile || "/api/placeholder/40/40"}
                    alt={mahasiswa.nama}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{mahasiswa.nama}</div>
                    <div className="text-gray-500 text-sm">
                      {mahasiswa.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">{mahasiswa.nim}</td>
              <td className="p-4">{mahasiswa.institusi}</td>
              <td className="p-4">
                {new Date(mahasiswa.tanggal_mulai).toLocaleDateString()} -{" "}
                {new Date(mahasiswa.tanggal_selesai).toLocaleDateString()}
              </td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    mahasiswa.status === "aktif"
                      ? "bg-green-100 text-green-800"
                      : mahasiswa.status === "selesai"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {mahasiswa.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex space-x-4">
                  <button className="text-blue-500 hover:bg-blue-50 p-1">
                    <Edit2 size={20} />
                  </button>
                  <button className="text-red-500 hover:bg-red-50 p-1">
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {mahasiswaData.length > 0 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, mahasiswaData.length)} of{" "}
            {mahasiswaData.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded text-gray-600"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1 ? "bg-gray-100" : "text-gray-600"
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded text-gray-600"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataIntership;
