const db = require('../config/database');

const reportController = {
  // Submit laporan
  submitLaporan: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const { versi, progress } = req.body;
      const filePath = req.file ? req.file.filename : null;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File laporan wajib diunggah'
        });
      }

      // Get admin_id from mahasiswa
      const [mahasiswa] = await db.execute(
        'SELECT admin_id FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

      // Check if version already exists
      const [existingVersion] = await db.execute(
        'SELECT id FROM laporan WHERE mahasiswa_id = ? AND versi = ?',
        [mahasiswaId, versi]
      );

      if (existingVersion.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Versi laporan ini sudah ada'
        });
      }

      await db.execute(
        `INSERT INTO laporan (
          mahasiswa_id, admin_id, versi, 
          file_path, status, progress
        ) VALUES (?, ?, ?, ?, 'pending_review', ?)`,
        [mahasiswaId, mahasiswa[0].admin_id, versi, filePath, progress]
      );

      res.status(201).json({
        success: true,
        message: 'Laporan berhasil diunggah'
      });

    } catch (error) {
      console.error('Submit report error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengunggah laporan'
      });
    }
  },

  // Get laporan
  getLaporan: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;

      const [laporan] = await db.execute(
        `SELECT l.*, m.nama as mahasiswa_nama
         FROM laporan l
         JOIN mahasiswa m ON l.mahasiswa_id = m.id
         WHERE l.mahasiswa_id = ?
         ORDER BY l.created_at DESC`,
        [mahasiswaId]
      );

      res.json({
        success: true,
        data: laporan
      });

    } catch (error) {
      console.error('Get laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data laporan'
      });
    }
  },

  // Review laporan (untuk admin)
  reviewLaporan: async (req, res) => {
    try {
      const { laporanId } = req.params;
      const { status, feedback } = req.body;
      const fileRevisi = req.file ? req.file.filename : null;
      const adminId = req.user.id;

      // Verify laporan belongs to admin
      const [laporan] = await db.execute(
        'SELECT * FROM laporan WHERE id = ? AND admin_id = ?',
        [laporanId, adminId]
      );

      if (laporan.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Laporan tidak ditemukan'
        });
      }

      // Update laporan status
      await db.execute(
        `UPDATE laporan 
         SET status = ?, feedback = ?, file_revisi_path = ?
         WHERE id = ?`,
        [status, feedback, fileRevisi, laporanId]
      );

      res.json({
        success: true,
        message: 'Review laporan berhasil disimpan'
      });

    } catch (error) {
      console.error('Review laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat review laporan'
      });
    }
  },

  // Get progress laporan
  getProgressLaporan: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;

      const [progress] = await db.execute(
        `SELECT 
          COUNT(*) as total_versi,
          COUNT(CASE WHEN status = 'disetujui' THEN 1 END) as versi_disetujui,
          MAX(progress) as progress_terakhir,
          MIN(created_at) as tanggal_mulai,
          MAX(created_at) as update_terakhir
         FROM laporan
         WHERE mahasiswa_id = ?`,
        [mahasiswaId]
      );

      const [detailStatus] = await db.execute(
        `SELECT 
          status,
          COUNT(*) as jumlah
         FROM laporan
         WHERE mahasiswa_id = ?
         GROUP BY status`,
        [mahasiswaId]
      );

      res.json({
        success: true,
        data: {
          ...progress[0],
          detail_status: detailStatus
        }
      });

    } catch (error) {
      console.error('Get progress laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil progress laporan'
      });
    }
  },

  // Export data laporan
  exportLaporan: async (req, res) => {
    try {
      const { startDate, endDate, mahasiswaId, status } = req.query;
      const adminId = req.user.id;

      let query = `
        SELECT 
          m.nim,
          m.nama,
          m.institusi,
          l.versi,
          l.status,
          l.progress,
          l.feedback,
          DATE_FORMAT(l.created_at, '%Y-%m-%d') as tanggal_submit
        FROM laporan l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?
      `;
      
      const params = [adminId];

      if (startDate && endDate) {
        query += ' AND DATE(l.created_at) BETWEEN ? AND ?';
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

      query += ' ORDER BY l.created_at DESC, m.nama ASC';

      const [data] = await db.execute(query, params);

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('Export laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengexport data laporan'
      });
    }
  }
};

module.exports = reportController;