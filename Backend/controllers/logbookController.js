const db = require('../config/database');

const logbookController = {
  // Submit logbook baru
  submitLogbook: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const { tanggal, aktivitas, progress } = req.body;
      const fileDokumentasi = req.file ? req.file.filename : null;

      // Get admin_id from mahasiswa
      const [mahasiswa] = await db.execute(
        'SELECT admin_id FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

      // Check if logbook already exists for this date
      const [existingLogbook] = await db.execute(
        'SELECT id FROM logbook WHERE mahasiswa_id = ? AND tanggal = ?',
        [mahasiswaId, tanggal]
      );

      if (existingLogbook.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Logbook untuk tanggal ini sudah ada'
        });
      }

      await db.execute(
        `INSERT INTO logbook (
          mahasiswa_id, admin_id, tanggal, 
          aktivitas, progress, file_dokumentasi
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [mahasiswaId, mahasiswa[0].admin_id, tanggal,
         aktivitas, progress, fileDokumentasi]
      );

      res.status(201).json({
        success: true,
        message: 'Logbook berhasil disimpan'
      });

    } catch (error) {
      console.error('Submit logbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan logbook'
      });
    }
  },

  // Get logbook by mahasiswa
  getLogbook: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      const { startDate, endDate, status } = req.query;

      let query = `
        SELECT l.*, m.nama as mahasiswa_nama
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.mahasiswa_id = ?
      `;
      
      const params = [mahasiswaId];

      if (startDate && endDate) {
        query += ' AND DATE(l.tanggal) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      if (status) {
        query += ' AND l.status = ?';
        params.push(status);
      }

      query += ' ORDER BY l.tanggal DESC';

      const [logbooks] = await db.execute(query, params);

      res.json({
        success: true,
        data: logbooks
      });

    } catch (error) {
      console.error('Get logbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data logbook'
      });
    }
  },

  // Update status logbook (untuk admin)
  updateLogbookStatus: async (req, res) => {
    try {
      const { logbookId } = req.params;
      const { status, catatan_admin, paraf_admin } = req.body;
      const adminId = req.user.id;

      // Verify logbook belongs to admin
      const [logbook] = await db.execute(
        'SELECT * FROM logbook WHERE id = ? AND admin_id = ?',
        [logbookId, adminId]
      );

      if (logbook.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Logbook tidak ditemukan'
        });
      }

      await db.execute(
        `UPDATE logbook 
         SET status = ?, catatan_admin = ?, paraf_admin = ?
         WHERE id = ?`,
        [status, catatan_admin, paraf_admin, logbookId]
      );

      res.json({
        success: true,
        message: 'Status logbook berhasil diupdate'
      });

    } catch (error) {
      console.error('Update logbook status error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat update status logbook'
      });
    }
  },

  // Export logbook
  exportLogbook: async (req, res) => {
    try {
      const { startDate, endDate, mahasiswaId, status } = req.query;
      const adminId = req.user.id;

      let query = `
        SELECT 
          m.nim,
          m.nama,
          m.institusi,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') as tanggal,
          l.aktivitas,
          l.progress,
          l.status,
          l.catatan_admin,
          l.paraf_admin
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?
      `;
      
      const params = [adminId];

      if (startDate && endDate) {
        query += ' AND DATE(l.tanggal) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      if (mahasiswaId) {
        query += ' AND m.id = ?';
        params.push(mahasiswaId);
      }

      if (status) {
        query += ' AND l.status = ?';
        params.push(status);
      }

      query += ' ORDER BY l.tanggal DESC, m.nama ASC';

      const [data] = await db.execute(query, params);

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('Export logbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengexport logbook'
      });
    }
  }
};

module.exports = logbookController;