const ExcelJS = require('exceljs');

const exportUtil = {
  // Format tanggal untuk Excel
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Format waktu untuk Excel
  formatTime: (time) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Export data absensi ke Excel
  exportAbsensi: async (data, filters = {}) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Absensi');

    // Set columns
    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'NIM', key: 'nim', width: 15 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Waktu Masuk', key: 'waktu_masuk', width: 15 },
      { header: 'Waktu Keluar', key: 'waktu_keluar', width: 15 },
      { header: 'Status Masuk', key: 'status_masuk', width: 15 },
      { header: 'Status Kehadiran', key: 'status_kehadiran', width: 15 },
      { header: 'Dalam Radius', key: 'dalam_radius', width: 12 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    data.forEach(item => {
      worksheet.addRow({
        tanggal: exportUtil.formatDate(item.tanggal),
        nim: item.nim,
        nama: item.nama,
        waktu_masuk: exportUtil.formatTime(item.waktu_masuk),
        waktu_keluar: exportUtil.formatTime(item.waktu_keluar),
        status_masuk: item.status_masuk,
        status_kehadiran: item.status_kehadiran,
        dalam_radius: item.dalam_radius ? 'Ya' : 'Tidak'
      });
    });

    // Add filters info
    if (filters.startDate || filters.endDate) {
      worksheet.addRow([]);
      worksheet.addRow(['Filter Periode:', `${filters.startDate || ''} s/d ${filters.endDate || ''}`]);
    }

    return workbook;
  },

  // Export data logbook ke Excel
  exportLogbook: async (data, filters = {}) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Logbook');

    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'NIM', key: 'nim', width: 15 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Aktivitas', key: 'aktivitas', width: 40 },
      { header: 'Progress', key: 'progress', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Catatan Admin', key: 'catatan_admin', width: 30 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    data.forEach(item => {
      worksheet.addRow({
        tanggal: exportUtil.formatDate(item.tanggal),
        nim: item.nim,
        nama: item.nama,
        aktivitas: item.aktivitas,
        progress: `${item.progress}%`,
        status: item.status,
        catatan_admin: item.catatan_admin || ''
      });
    });

    if (filters.startDate || filters.endDate) {
      worksheet.addRow([]);
      worksheet.addRow(['Filter Periode:', `${filters.startDate || ''} s/d ${filters.endDate || ''}`]);
    }

    return workbook;
  },

  // Export data laporan ke Excel
  exportLaporan: async (data, filters = {}) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Laporan');

    worksheet.columns = [
      { header: 'Tanggal Submit', key: 'tanggal_submit', width: 15 },
      { header: 'NIM', key: 'nim', width: 15 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Versi', key: 'versi', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Progress', key: 'progress', width: 10 },
      { header: 'Feedback', key: 'feedback', width: 40 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    data.forEach(item => {
      worksheet.addRow({
        tanggal_submit: exportUtil.formatDate(item.created_at),
        nim: item.nim,
        nama: item.nama,
        versi: item.versi,
        status: item.status,
        progress: `${item.progress}%`,
        feedback: item.feedback || ''
      });
    });

    if (filters.startDate || filters.endDate) {
      worksheet.addRow([]);
      worksheet.addRow(['Filter Periode:', `${filters.startDate || ''} s/d ${filters.endDate || ''}`]);
    }

    return workbook;
  }
};

module.exports = exportUtil;