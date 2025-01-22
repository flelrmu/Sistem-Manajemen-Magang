import React, { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
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
      
      const response = await axiosInstance.get('/api/logbook');
      
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

      const response = await axiosInstance.post('/api/logbook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        setIsModalOpen(false);
        await fetchLogbooks();
        alert('Logbook berhasil disimpan');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting logbook:', error);
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan logbook');
    }
  };

  const handleEditLogbook = async (editedLogbook) => {
    try {
      const formData = new FormData();
      formData.append('tanggal', editedLogbook.tanggal);
      formData.append('aktivitas', editedLogbook.aktivitas);
      formData.append('progress', editedLogbook.progress);
      
      const response = await axiosInstance.put(`/api/logbook/${editedLogbook.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        await fetchLogbooks();
        alert('Logbook berhasil diperbarui');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating logbook:', error);
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan saat memperbarui logbook');
    }
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      const response = await axiosInstance.get('/api/logbook/export', {
        responseType: 'blob'
      });
  
      // Handle error jika response bukan PDF
      const contentType = response.headers['content-type'];
      if (contentType === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const result = JSON.parse(reader.result);
          alert(result.message || 'Terjadi kesalahan saat mengunduh logbook');
        };
        reader.readAsText(response.data);
        return;
      }
  
      // Proses download PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logbook_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading logbook:', error);
      alert('Terjadi kesalahan saat mengunduh logbook');
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
              disabled={isDownloading || logbooks.length === 0}
            >
              <Download className="mr-2 h-5 w-5" />
              {isDownloading ? 'Mengunduh...' : 'Download Rekap'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logbooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Belum ada data logbook</p>
          </div>
        ) : (
          <>
            <LogbookCard logbooks={logbooks} />
            <LogbookData logbooks={logbooks} onEdit={handleEditLogbook} />
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