import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/UserContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function StatusLaporan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState({
    progress_terakhir: 0,
    deadline: null
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await axios.get('http://157.245.206.178:3000/api/reports/progress');
      setProgressData(response.data.data);
      setError('');
    } catch (error) {
      setError('Gagal memuat data progress');
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'd MMMM yyyy', { locale: id });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (approved, pending, needRevision) => {
    if (approved > 0) return 'text-green-600';
    if (needRevision > 0) return 'text-red-600';
    if (pending > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusText = (approved, pending, needRevision) => {
    if (approved > 0) return 'Disetujui';
    if (needRevision > 0) return 'Perlu Revisi';
    if (pending > 0) return 'Menunggu Review';
    return 'Belum Ada Laporan';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Status Laporan</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-600">{progressData.progress_terakhir || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressData.progress_terakhir || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Deadline Pengumpulan:</span>
          <span className="text-gray-800 font-medium">
            {formatDate(progressData.deadline)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-1">Total Versi</h3>
            <p className="text-2xl font-bold text-gray-800">
              {progressData.total_versi || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-1">Versi Disetujui</h3>
            <p className="text-2xl font-bold text-green-600">
              {progressData.approved || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-600 mb-1">Status</h3>
            <p className={`text-lg font-bold ${getStatusColor(
              progressData.approved,
              progressData.pending,
              progressData.need_revision
            )}`}>
              {getStatusText(
                progressData.approved,
                progressData.pending,
                progressData.need_revision
              )}
            </p>
          </div>
        </div>

        {progressData.update_terakhir && (
          <div className="text-sm text-gray-500 mt-4">
            Terakhir diperbarui: {formatDate(progressData.update_terakhir)}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusLaporan;