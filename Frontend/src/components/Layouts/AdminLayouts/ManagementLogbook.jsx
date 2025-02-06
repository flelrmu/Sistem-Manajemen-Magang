import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Swal from 'sweetalert2';
import LogbookCard from "../../Fragment/AdminFragment/LogbookCard";
import FilterLogbook from "../../Fragment/AdminFragment/FilterLogbook";
import DataLogbook from "../../Fragment/AdminFragment/DataLogbook";
import PageTitle from "../../Elements/Items/PageTitle";
import axios from 'axios';

function ManagementLogbook() {
  const [logbooks, setLogbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filters, setFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchLogbooks();
  }, [refreshTrigger]);

  const fetchLogbooks = async (filterParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:3000/api/logbook', { 
        params: filterParams 
      });
      
      if (response.data.success) {
        setLogbooks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching logbooks:', error);
      setError('Gagal mengambil data logbook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchLogbooks(newFilters);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleDownloadLogbook = async () => {
    if (!selectedUser?.id || isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      const response = await axios.get(
        `http://localhost:3000/api/logbook/export/${selectedUser.id}`, 
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logbook_${selectedUser.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading logbook:', error);
      await Swal.fire({
        title: 'Gagal!',
        text: 'Gagal mengunduh logbook',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApproveLogbook = async (logbookId) => {
    try {
      const result = await Swal.fire({
        title: 'Konfirmasi Persetujuan',
        text: 'Apakah Anda yakin ingin menyetujui logbook ini?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Setujui',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280'
      });

      if (result.isConfirmed) {
        const response = await axios.put(`http://localhost:3000/api/logbook/${logbookId}/status`, {
          status: 'approved'
        });

        if (response.data.success) {
          setRefreshTrigger(prev => prev + 1);
          await fetchLogbooks(filters);
          
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Logbook telah disetujui',
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
        }
      }
    } catch (error) {
      console.error('Error approving logbook:', error);
      await Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || 'Gagal menyetujui logbook',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };
  
  const handleRejectLogbook = async (logbookId, catatanAdmin) => {
    try {
      const response = await axios.put(`http://localhost:3000/api/logbook/${logbookId}/status`, {
        status: 'rejected',
        catatan_admin: catatanAdmin
      });
  
      if (response.data.success) {
        setRefreshTrigger(prev => prev + 1);
        await fetchLogbooks(filters);
        
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Logbook telah ditolak',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
      }
    } catch (error) {
      console.error('Error rejecting logbook:', error);
      await Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.message || 'Gagal menolak logbook',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  return (
    <div className="h-auto relative px-8 pt-[70px]">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <PageTitle>Manajemen Logbook</PageTitle>
          <button
            onClick={handleDownloadLogbook}
            disabled={!selectedUser || isDownloading}
            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg 
              inline-flex items-center transition-colors duration-200
              ${(!selectedUser || isDownloading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="mr-2 h-5 w-5" />
            {isDownloading ? 'Mengunduh...' : 'Download Logbook'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <LogbookCard refreshTrigger={refreshTrigger} />
        
        <FilterLogbook onFilter={handleFilter} />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logbooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Tidak ada data logbook yang ditemukan
          </div>
        ) : (
          <DataLogbook 
            logbooks={logbooks}
            onSelectUser={handleSelectUser}
            onApprove={handleApproveLogbook}
            onReject={handleRejectLogbook}
          />
        )}

        {selectedUser && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Selected: {selectedUser.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagementLogbook;