const db = require('../config/database');

const logbookController = {
  // Get logbook by mahasiswa/admin
  getLogbook: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Debug logs
      console.log('Auth User:', req.user);
      console.log('Role:', req.user.role);
      console.log('ID:', req.user.mahasiswa_id || req.user.admin_id);

      let query = `
        SELECT 
          l.*,
          m.nama as mahasiswa_nama,
          m.nim,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') as tanggal,
          DATE_FORMAT(l.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          DATE_FORMAT(l.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
      `;

      let params = [];

      // Filter berdasarkan role
      if (req.user.role === 'mahasiswa') {
        query += ' WHERE l.mahasiswa_id = ?';
        params.push(req.user.mahasiswa_id);
      } else if (req.user.role === 'admin') {
        query += ' WHERE l.admin_id = ?';
        params.push(req.user.admin_id);
      }

      // Filter tambahan dari query params
      if (req.query.startDate && req.query.endDate) {
        query += ' AND l.tanggal BETWEEN ? AND ?';
        params.push(req.query.startDate, req.query.endDate);
      }

      if (req.query.status) {
        query += ' AND l.status = ?';
        params.push(req.query.status);
      }

      // Sorting
      query += ' ORDER BY l.tanggal DESC';

      // Pagination (opsional)
      if (req.query.page && req.query.limit) {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      // Execute query
      const [logbooks] = await connection.execute(query, params);
      
      // Get total count for pagination
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM logbook l WHERE ${
          req.user.role === 'mahasiswa' ? 'l.mahasiswa_id = ?' : 'l.admin_id = ?'
        }`,
        [req.user.role === 'mahasiswa' ? req.user.mahasiswa_id : req.user.admin_id]
      );

      await connection.commit();

      // Response dengan pagination info jika ada
      const response = {
        success: true,
        data: logbooks,
        message: logbooks.length ? undefined : 'Belum ada data logbook'
      };

      if (req.query.page && req.query.limit) {
        response.pagination = {
          total: countResult[0].total,
          page: parseInt(req.query.page),
          limit: parseInt(req.query.limit),
          total_pages: Math.ceil(countResult[0].total / parseInt(req.query.limit))
        };
      }

      res.json(response);

    } catch (error) {
      await connection.rollback();
      console.error('Get logbook error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data logbook',
        error: error.message
      });
    } finally {
      connection.release();
    }
  },

  // Submit logbook baru
  submitLogbook: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const mahasiswaId = req.user.mahasiswa_id;
      const adminId = req.user.admin_id;
      const { tanggal, aktivitas, progress } = req.body;
      const fileDokumentasi = req.file ? req.file.filename : null;

      // Validasi input
      if (!tanggal || !aktivitas || !progress) {
        throw new Error('Semua field wajib diisi');
      }

      if (isNaN(progress) || progress < 0 || progress > 100) {
        throw new Error('Progress harus berupa angka antara 0-100');
      }

      // Cek duplikasi tanggal
      const [existingLogbook] = await connection.execute(
        'SELECT id FROM logbook WHERE mahasiswa_id = ? AND tanggal = ?',
        [mahasiswaId, tanggal]
      );

      if (existingLogbook.length > 0) {
        throw new Error('Logbook untuk tanggal ini sudah ada');
      }

      // Insert logbook
      const [result] = await connection.execute(
        `INSERT INTO logbook (
          mahasiswa_id, 
          admin_id, 
          tanggal,
          aktivitas, 
          progress, 
          file_dokumentasi,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [mahasiswaId, adminId, tanggal, aktivitas, progress, fileDokumentasi]
      );

      await connection.commit();

      // Get inserted data
      const [newLogbook] = await connection.execute(
        `SELECT 
          l.*,
          m.nama as mahasiswa_nama,
          m.nim,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') as tanggal
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Logbook berhasil disimpan',
        data: newLogbook[0]
      });

    } catch (error) {
      await connection.rollback();
      console.error('Submit logbook error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      connection.release();
    }
  },

  // Update status logbook (untuk admin)
  updateLogbookStatus: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { logbookId } = req.params;
      const { status, catatan_admin, paraf_admin } = req.body;
      const adminId = req.user.admin_id;

      // Validasi input
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Status tidak valid');
      }

      // Verify logbook belongs to admin
      const [logbook] = await connection.execute(
        'SELECT * FROM logbook WHERE id = ? AND admin_id = ?',
        [logbookId, adminId]
      );

      if (logbook.length === 0) {
        throw new Error('Logbook tidak ditemukan');
      }

      // Update logbook status
      await connection.execute(
        `UPDATE logbook 
         SET 
           status = ?, 
           catatan_admin = ?, 
           paraf_admin = ?,
           updated_at = NOW()
         WHERE id = ?`,
        [status, catatan_admin, paraf_admin, logbookId]
      );

      await connection.commit();

      // Get updated data
      const [updatedLogbook] = await connection.execute(
        `SELECT 
          l.*,
          m.nama as mahasiswa_nama,
          m.nim,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') as tanggal
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.id = ?`,
        [logbookId]
      );

      res.json({
        success: true,
        message: 'Status logbook berhasil diupdate',
        data: updatedLogbook[0]
      });

    } catch (error) {
      await connection.rollback();
      console.error('Update logbook status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      connection.release();
    }
  },

  // Delete logbook
  deleteLogbook: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { logbookId } = req.params;
      const userId = req.user.mahasiswa_id || req.user.admin_id;

      // Verify ownership
      const [logbook] = await connection.execute(
        `SELECT * FROM logbook WHERE id = ? AND 
         (mahasiswa_id = ? OR admin_id = ?)`,
        [logbookId, userId, userId]
      );

      if (logbook.length === 0) {
        throw new Error('Logbook tidak ditemukan');
      }

      // Delete logbook
      await connection.execute(
        'DELETE FROM logbook WHERE id = ?',
        [logbookId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Logbook berhasil dihapus'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Delete logbook error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      connection.release();
    }
  },

  // Get logbook detail
  getLogbookDetail: async (req, res) => {
    const connection = await db.getConnection();
    try {
      const { logbookId } = req.params;
      const userId = req.user.mahasiswa_id || req.user.admin_id;

      const [logbook] = await connection.execute(
        `SELECT 
          l.*,
          m.nama as mahasiswa_nama,
          m.nim,
          DATE_FORMAT(l.tanggal, '%Y-%m-%d') as tanggal,
          DATE_FORMAT(l.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          DATE_FORMAT(l.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.id = ? AND (l.mahasiswa_id = ? OR l.admin_id = ?)`,
        [logbookId, userId, userId]
      );

      if (logbook.length === 0) {
        throw new Error('Logbook tidak ditemukan');
      }

      res.json({
        success: true,
        data: logbook[0]
      });

    } catch (error) {
      console.error('Get logbook detail error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      connection.release();
    }
  }
};

module.exports = logbookController;