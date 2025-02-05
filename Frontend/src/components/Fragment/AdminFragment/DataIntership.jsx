import React, { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
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
        `http://api.simagang.tech/api/admin/mahasiswa`,
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
      console.error("Error details:", err.response || err);
      setError(err.response?.data?.message || "Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes from FilterInternship component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Effect for fetching data when filters or page changes
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchMahasiswaData();
    } else {
      setLoading(false);
    }
  }, [user, currentPage, filters]); // Re-fetch when filters change

  const deleteMahasiswa = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      await axios.delete(`http://api.simagang.tech/api/admin/mahasiswa/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMahasiswaData(
        mahasiswaData.filter((mahasiswa) => mahasiswa.id !== id)
      );
      alert("Data mahasiswa berhasil dihapus.");
    } catch (err) {
      console.error("Error deleting mahasiswa:", err.response || err);
      alert(err.response?.data?.message || "Gagal menghapus data mahasiswa.");
    }
  };

  const editMahasiswa = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMahasiswa(null);
  };

  if (loading) {
    return (
      <div>
        <FilterInternship onFilterChange={handleFilterChange} />
        <div className="p-4 text-center">
          <p>Loading data mahasiswa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <FilterInternship onFilterChange={handleFilterChange} />
        <div className="p-4 text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchMahasiswaData()}
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
    <div>
      <FilterInternship onFilterChange={handleFilterChange} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {mahasiswaData.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            Tidak ada data mahasiswa yang tersedia.
          </div>
        ) : (
          <>
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
                          src={
                            mahasiswa.photo_profile || "/api/placeholder/40/40"
                          }
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
                        <button
                          className="text-blue-500 hover:bg-blue-50 p-1"
                          onClick={() => editMahasiswa(mahasiswa)}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          className="text-red-500 hover:bg-red-50 p-1"
                          onClick={() => deleteMahasiswa(mahasiswa.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, mahasiswaData.length)} of{" "}
                {mahasiswaData.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`px-3 py-1 border rounded ${
                      currentPage === index + 1
                        ? "bg-gray-100"
                        : "text-gray-600"
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <EditMahasiswaModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mahasiswaData={selectedMahasiswa}
      />
    </div>
  );
}

export default DataInternship;
