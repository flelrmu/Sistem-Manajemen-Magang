// Frontend/src/components/Fragment/UserFragment/RiwayatPengumpulan.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';
import { useAuth } from '../../Context/UserContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function RiwayatPengumpulan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://api.simagang.tech/api/reports', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReports(response.data.data);
      setError('');
    } catch (error) {
      setError('Gagal memuat riwayat pengumpulan');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      // Pastikan URL lengkap
      const fullUrl = `http://api.simagang.tech${url}`;
      console.log('Downloading from:', fullUrl);
  
      const response = await axios({
        url: fullUrl,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        }
      });
  
      // Buat blob dari response
      const blob = new Blob([response.data], { 
        type: 'application/pdf' 
      });
  
      // Buat URL untuk blob
      const downloadUrl = window.URL.createObjectURL(blob);
  
      // Buat temporary link untuk download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
  
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mengunduh file. ' + (error.response?.data?.message || 'Silakan coba lagi.'));
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'd MMMM yyyy', { locale: id });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_review': 'bg-yellow-100 text-yellow-800',
      'perlu_revisi': 'bg-red-100 text-red-800',
      'disetujui': 'bg-green-100 text-green-800'
    };
    const statusText = {
      'pending_review': 'Menunggu Review',
      'perlu_revisi': 'Perlu Revisi',
      'disetujui': 'Disetujui'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riwayat Pengumpulan</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada laporan yang dikumpulkan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, index) => (
                  <tr key={report.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.versi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {report.feedback || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-4">
                        {report.file_path && (
                          <button
                            onClick={() => handleDownload(report.file_path, `Laporan_${report.versi}.pdf`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" /> Laporan
                          </button>
                        )}
                        {report.file_revisi_path && (
                          <button
                            onClick={() => handleDownload(report.file_revisi_path, `Revisi_${report.versi}.pdf`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" /> Revisi
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiwayatPengumpulan;