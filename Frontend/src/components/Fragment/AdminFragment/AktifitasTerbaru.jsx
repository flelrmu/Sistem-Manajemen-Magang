import React, { useState, useEffect } from 'react';
import { Clock, FileText, BookOpen, CalendarClock } from 'lucide-react';
import axios from 'axios';

function AktifitasTerbaru() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const now = new Date();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000);
        const dateParam = yesterday.toISOString().split('T')[0];

        const [logbooks, reports, permissions] = await Promise.all([
          axios.get('http://157.245.206.178:3000/api/logbook', {
            params: { 
              startDate: dateParam,
              endDate: new Date().toISOString().split('T')[0],
            }
          }),
          axios.get('http://157.245.206.178:3000/api/reports', {
            params: { 
              startDate: dateParam,
              sort: 'created_at',
              order: 'desc'
            }
          }),
          axios.get('http://157.245.206.178:3000/api/izin/history', {
            params: {
              startDate: dateParam
            }
          })
        ]);

        const processActivities = (data, type, getDescription) => {
          return data.filter(item => {
            const itemDate = new Date(item.created_at || item.tanggal);
            return (now - itemDate) <= 24 * 60 * 60 * 1000;
          }).map(item => ({
            type,
            description: getDescription(item),
            timestamp: new Date(item.created_at || item.tanggal),
            status: item.status,
            mahasiswa_nama: item.mahasiswa_nama,
            details: item
          }));
        };

        const combinedActivities = [
          ...processActivities(
            logbooks.data.data, 
            'Logbook',
            (log) => `${log.mahasiswa_nama} mengajukan logbook untuk tanggal ${new Date(log.tanggal).toLocaleDateString('id-ID')}`
          ),
          ...processActivities(
            reports.data.data,
            'Laporan',
            (report) => `${report.mahasiswa_nama} mengajukan laporan V${report.versi}`
          ),
          ...processActivities(
            permissions.data.data,
            'Pengajuan Izin',
            (permission) => `${permission.mahasiswa_nama} mengajukan izin ${permission.kategori || ''}`
          )
        ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

        setActivities(combinedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'Logbook':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'Laporan':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'Pengajuan Izin':
        return <CalendarClock className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: ['Menunggu', 'bg-yellow-100 text-yellow-800'],
      approved: ['Disetujui', 'bg-green-100 text-green-800'],
      rejected: ['Ditolak', 'bg-red-100 text-red-800'],
      pending_review: ['Menunggu Review', 'bg-blue-100 text-blue-800'],
      perlu_revisi: ['Perlu Revisi', 'bg-orange-100 text-orange-800']
    };

    const [label, className] = statusMap[status] || ['Unknown', 'bg-gray-100 text-gray-800'];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
        {label}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!(timestamp instanceof Date) || isNaN(timestamp)) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else {
      return timestamp.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Aktifitas Terbaru</h3>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="mt-1">{getIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{activity.type}</h4>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Tidak ada aktivitas dalam 24 jam terakhir
        </p>
      )}
    </div>
  );
}

export default AktifitasTerbaru;