import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../Context/UserContext";
import axios from "axios";
import FilterInternship from "./FilterIntership";
import EditMahasiswaModal from "./EditMahasiswaModal";

function DataInternship() {
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "Semua Status",
    institusi: "Semua Institusi",
    periode: null,
    search: "",
  });
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 10;

  const { user } = useAuth();

  const fetchMahasiswaData = async (page = currentPage) => {
    try {
      const queryParams = {
        page,
        limit: itemsPerPage,
        ...(filters.status !== "Semua Status" && { status: filters.status }),
        ...(filters.institusi !== "Semua Institusi" && {
          institusi: filters.institusi,
        }),
        ...(filters.periode && {
          periode: filters.periode.toISOString().split("T")[0],
        }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await axios.get(
        `http://localhost:3000/api/admin/mahasiswa`,
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMahasiswaData(response.data.mahasiswa);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data mahasiswa");
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
      fetchMahasiswaData();
    } else {
      setLoading(false);
    }
  }, [user, currentPage, filters]);

  const deleteMahasiswa = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/admin/mahasiswa/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMahasiswaData((prev) => prev.filter((m) => m.id !== id));
      alert("Data mahasiswa berhasil dihapus.");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data mahasiswa.");
    }
  };

  const editMahasiswa = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full">
        <FilterInternship onFilterChange={handleFilterChange} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Memuat data mahasiswa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <FilterInternship onFilterChange={handleFilterChange} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchMahasiswaData()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="w-full space-y-4">
      <FilterInternship onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  NIM
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Institusi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Periode Magang
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mahasiswaData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Tidak ada data mahasiswa yang tersedia.
                  </td>
                </tr>
              ) : (
                mahasiswaData.map((mahasiswa) => (
                  <tr
                    key={mahasiswa.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {mahasiswa.photo_profile ? (
                            <img
                              src={mahasiswa.photo_profile}
                              alt={mahasiswa.nama}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-medium">
                              {mahasiswa.nama.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {mahasiswa.nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            {mahasiswa.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{mahasiswa.nim}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {mahasiswa.institusi}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(mahasiswa.tanggal_mulai).toLocaleDateString()} -{" "}
                      {new Date(mahasiswa.tanggal_selesai).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          mahasiswa.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : mahasiswa.status === "selesai"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {mahasiswa.status.charAt(0).toUpperCase() +
                          mahasiswa.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editMahasiswa(mahasiswa)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteMahasiswa(mahasiswa.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, mahasiswaData.length)} of{" "}
              {mahasiswaData.length} entries
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

      <EditMahasiswaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMahasiswa(null);
        }}
        mahasiswaData={selectedMahasiswa}
      />
    </div>
  );
}

export default DataInternship;