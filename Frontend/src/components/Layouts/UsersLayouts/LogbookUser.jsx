import React, { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import Swal from "sweetalert2";
import ActivityModal from "../../Fragment/UserFragment/Activity";
import LogbookCard from "../../Fragment/UserFragment/LogbookCard";
import LogbookData from "../../Fragment/UserFragment/LogbookData";
import PageTitle from "../../Elements/Items/PageTitle";
import axiosInstance from "../../../../../Backend/utils/axios";

const LogbookUser = () => {
  const [logbooks, setLogbooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const fetchLogbooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/logbook");
      setLogbooks(response.data.success ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching logbooks:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLogbook = async (logbookData) => {
    try {
      if (!logbookData.tanggal || !logbookData.aktivitas || !logbookData.progress) {
        throw new Error("Mohon lengkapi semua field yang diperlukan");
      }

      const formData = new FormData();
      formData.append("tanggal", logbookData.tanggal);
      formData.append("aktivitas", logbookData.aktivitas);
      formData.append("progress", logbookData.progress);

      if (logbookData.file) {
        formData.append("file_dokumentasi", logbookData.file);
      }

      const response = await axiosInstance.post("/api/logbook", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setIsModalOpen(false);
        await fetchLogbooks();
        Swal.fire({
          title: 'Berhasil!',
          text: 'Logbook berhasil disimpan',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting logbook:", error);
      Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || error.message || "Terjadi kesalahan saat menyimpan logbook",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditLogbook = async (editedLogbook) => {
    try {
      const formData = new FormData();
      formData.append("tanggal", editedLogbook.tanggal);
      formData.append("aktivitas", editedLogbook.aktivitas);
      formData.append("progress", editedLogbook.progress);

      const response = await axiosInstance.put(
        `/api/logbook/${editedLogbook.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        await fetchLogbooks();
        Swal.fire({
          title: 'Berhasil!',
          text: 'Logbook berhasil diperbarui',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating logbook:", error);
      Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui logbook",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);

      const response = await axiosInstance.get("/api/logbook/export", {
        responseType: "blob",
      });

      // Handle error jika response bukan PDF
      const contentType = response.headers["content-type"];
      if (contentType === "application/json") {
        const reader = new FileReader();
        reader.onload = () => {
          const result = JSON.parse(reader.result);
          Swal.fire({
            title: 'Gagal!',
            text: result.message || "Terjadi kesalahan saat mengunduh logbook",
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        };
        reader.readAsText(response.data);
        return;
      }

      // Proses download PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `logbook_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message after download
      Swal.fire({
        title: 'Berhasil!',
        text: 'File logbook berhasil diunduh',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error("Error downloading logbook:", error);
      Swal.fire({
        title: 'Gagal!',
        text: "Terjadi kesalahan saat mengunduh logbook",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <PageTitle>Logbook Aktivitas</PageTitle>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg inline-flex items-center justify-center min-w-[180px] transition-colors"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-5 w-5" /> Tambah Aktivitas
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg inline-flex items-center justify-center min-w-[180px] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isDownloading}
            >
              <Download className="mr-2 h-5 w-5" />
              {isDownloading ? "Mengunduh..." : "Download Rekap"}
            </button>
          </div>
        </div>

        <LogbookCard logbooks={logbooks} />
        <LogbookData logbooks={logbooks} onEdit={handleEditLogbook} />

        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitLogbook}
        />
      </div>
    </div>
  );
};

export default LogbookUser;