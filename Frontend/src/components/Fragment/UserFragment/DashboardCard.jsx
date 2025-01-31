import React, { useState, useEffect } from 'react';

const DashboardCard = () => {
  const [stats, setStats] = useState({
    attendance: {
      total: 0,
      days: 0
    },
    logbook: {
      submitted: 0,
      total: 0,
      lastUpdate: null
    },
    report: {
      status: '',
      lastSubmission: null,
      version: '',
      feedback: '',
      daysSinceSubmission: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data for dates and logbook stats
        const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const profileData = await profileResponse.json();
        
        // Fetch logbook data for submission details
        const logbookResponse = await fetch('http://localhost:3000/api/logbook', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const logbookData = await logbookResponse.json();

        // Fetch report status
        const reportResponse = await fetch('http://localhost:3000/api/reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const reportData = await reportResponse.json();

        // Calculate total internship days
        const startDate = new Date(profileData.data.profile.tanggal_mulai);
        const endDate = new Date(profileData.data.profile.tanggal_selesai);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Calculate total attendance
        const totalPresent = profileData.data.statistik.total_kehadiran || 0;

        // Get last logbook submission date
        const sortedLogbooks = logbookData.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        const lastUpdate = sortedLogbooks.length > 0 
          ? new Date(sortedLogbooks[0].created_at).toLocaleDateString()
          : 'No submissions yet';

        // Process report data
        const latestReport = reportData.data[0] || {};
        const lastSubmissionDate = latestReport.created_at 
          ? new Date(latestReport.created_at)
          : null;
        
        const daysSinceSubmission = lastSubmissionDate
          ? Math.ceil((new Date() - lastSubmissionDate) / (1000 * 60 * 60 * 24))
          : 0;

        setStats({
          attendance: {
            total: totalPresent,
            days: totalDays
          },
          logbook: {
            submitted: logbookData.data.length,
            total: totalDays,
            lastUpdate
          },
          report: {
            status: latestReport.status || 'Belum Submit',
            lastSubmission: lastSubmissionDate?.toLocaleDateString('id-ID'),
            version: latestReport.versi || '-',
            feedback: latestReport.feedback || '-',
            daysSinceSubmission
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAttendancePercentage = () => {
    if (stats.attendance.days === 0) return 0;
    return (stats.attendance.total / stats.attendance.days) * 100;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'disetujui':
        return 'text-green-500';
      case 'pending_review':
      case 'menunggu review':
        return 'text-orange-500';
      case 'perlu_revisi':
      case 'perlu revisi':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'disetujui':
        return 'bg-green-100';
      case 'pending_review':
      case 'menunggu review':
        return 'bg-orange-100';
      case 'perlu_revisi':
      case 'perlu revisi':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Total Kehadiran</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="text-xl font-bold mb-4">
              {stats.attendance.total}/{stats.attendance.days} Hari
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${calculateAttendancePercentage()}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Logbook Terisi</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <>
            <div className="text-xl font-bold mb-4">
              {stats.logbook.submitted}/{stats.logbook.total} Hari
            </div>
            <div className="text-sm text-gray-500">
              Terakhir diperbarui: {stats.logbook.lastUpdate}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-gray-600 mb-2">Status Laporan</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <>
            <div className={`${getStatusColor(stats.report.status)} font-medium mb-2`}>
              <span className={`${getStatusBadge(stats.report.status)} px-3 py-1 rounded-full text-sm`}>
                {stats.report.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Versi:</span> {stats.report.version}
              </div>
              {stats.report.lastSubmission && (
                <>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Terakhir disubmit</span> {stats.report.daysSinceSubmission} hari yang lalu
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;