import React, { useState, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
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

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const fetchLogbooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axiosInstance.get('/api/logbook');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setLogbooks(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch logbooks');
      }
    } catch (error) {
      console.error('Error fetching logbooks:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLogbook = async (logbookData) => {
    try {
      if (!logbookData.tanggal || !logbookData.aktivitas || !logbookData.progress) {
        throw new Error('Mohon lengkapi semua field yang diperlukan');
      }

      const formData = new FormData();
      formData.append('tanggal', logbookData.tanggal);
      formData.append('aktivitas', logbookData.aktivitas);
      formData.append('progress', logbookData.progress);
      
      if (logbookData.file) {
        formData.append('file_dokumentasi', logbookData.file);
      }

      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('/api/logbook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        setIsModalOpen(false);
        await fetchLogbooks(); // Refresh data after successful submission
        alert('Logbook berhasil disimpan');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting logbook:', error);
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan logbook');
    }
  };

  const handleUpdateLogbookStatus = async (logbookId, status, catatan, paraf) => {
    try {
      const response = await axiosInstance.put(`/api/logbook/${logbookId}/status`, {
        status,
        catatan_admin: catatan,
        paraf_admin: paraf
      });

      if (response.data.success) {
        fetchLogbooks();
        alert('Status logbook berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating logbook status:', error);
      alert(error.response?.data?.message || 'Gagal mengupdate status logbook');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axiosInstance.get('/api/logbook/export', {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logbook.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Terjadi kesalahan saat mengunduh PDF');
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <div className="space-x-4">
             <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <span className="text-xl mr-2">+</span> Tambah Aktivitas
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <ArrowUpDown className="mr-2 h-5 w-5" /> Download PDF
            </button>
          </div>
        </div>

        {
        logbooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Belum ada data logbook</p>
          </div>
        ) : 
        (
          <>
            <LogbookCard logbooks={logbooks} />
            <LogbookData logbooks={logbooks} />
          </>
        )}

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