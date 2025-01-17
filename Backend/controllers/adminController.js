const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const qr = require('qrcode');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const adminId = req.user.id;

      // Get mahasiswa data
      const [totalMahasiswa] = await db.execute(
        'SELECT COUNT(*) as total FROM mahasiswa WHERE admin_id = ? AND status = "aktif"',
        [adminId]
      );

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const [todayAttendance] = await db.execute(
        `SELECT COUNT(*) as total FROM absensi a 
         JOIN mahasiswa m ON a.mahasiswa_id = m.id 
         WHERE m.admin_id = ? AND DATE(a.tanggal) = ?`,
        [adminId, today]
      );

      // Get pending permissions
      const [pendingPermissions] = await db.execute(
        `SELECT COUNT(*) as total FROM izin i 
         JOIN mahasiswa m ON i.mahasiswa_id = m.id 
         WHERE m.admin_id = ? AND i.status = 'pending'`,
        [adminId]
      );

      // Get pending logbooks
      const [pendingLogbooks] = await db.execute(
        `SELECT COUNT(*) as total FROM logbook l 
         JOIN mahasiswa m ON l.mahasiswa_id = m.id 
         WHERE m.admin_id = ? AND l.status = 'pending'`,
        [adminId]
      );

      // Get weekly attendance stats
      const [weeklyStats] = await db.execute(
        `SELECT 
           DATE(a.tanggal) as date,
           COUNT(CASE WHEN a.status_kehadiran = 'hadir' THEN 1 END) as hadir,
           COUNT(CASE WHEN a.status_kehadiran = 'izin' THEN 1 END) as izin,
           COUNT(CASE WHEN a.status_kehadiran = 'alpha' THEN 1 END) as alpha
         FROM absensi a
         JOIN mahasiswa m ON a.mahasiswa_id = m.id
         WHERE m.admin_id = ?
           AND a.tanggal >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
         GROUP BY DATE(a.tanggal)
         ORDER BY DATE(a.tanggal)`,
        [adminId]
      );

      // Get logbook statistics
      const [logbookStats] = await db.execute(
        `SELECT
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
           COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
         FROM logbook l
         JOIN mahasiswa m ON l.mahasiswa_id = m.id
         WHERE m.admin_id = ?`,
        [adminId]
      );

      // Get recent activities
      const [recentActivities] = await db.execute(
        `(SELECT 'logbook' as type, l.created_at, m.nama, 'mengajukan logbook baru' as activity
          FROM logbook l
          JOIN mahasiswa m ON l.mahasiswa_id = m.id
          WHERE m.admin_id = ?
          ORDER BY l.created_at DESC
          LIMIT 3)
        UNION ALL
        (SELECT 'absensi' as type, a.created_at, m.nama,
         CONCAT('melakukan absensi ', a.status_kehadiran) as activity
          FROM absensi a
          JOIN mahasiswa m ON a.mahasiswa_id = m.id
          WHERE m.admin_id = ?
          ORDER BY a.created_at DESC
          LIMIT 3)
        UNION ALL
        (SELECT 'izin' as type, i.created_at, m.nama, 'mengajukan izin baru' as activity
          FROM izin i
          JOIN mahasiswa m ON i.mahasiswa_id = m.id
          WHERE m.admin_id = ?
          ORDER BY i.created_at DESC
          LIMIT 3)
        ORDER BY created_at DESC
        LIMIT 3`,
        [adminId, adminId, adminId]
      );

      res.json({
        success: true,
        data: {
          totalMahasiswa: totalMahasiswa[0].total,
          todayAttendance: todayAttendance[0].total,
          pendingPermissions: pendingPermissions[0].total,
          pendingLogbooks: pendingLogbooks[0].total,
          weeklyStats,
          logbookStats: logbookStats[0],
          recentActivities
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dashboard'
      });
    }
  },

  // Update profile admin
  updateProfile: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const adminId = req.user.id;
      const { nama, email } = req.body;
      const photoProfile = req.file ? req.file.filename : null;

      // Update user data if email provided
      if (email) {
        await connection.execute(
          'UPDATE users SET email = ? WHERE id = ?',
          [email, adminId]
        );
      }

      // Update photo if provided
      if (photoProfile) {
        await connection.execute(
          'UPDATE users SET photo_profile = ? WHERE id = ?',
          [photoProfile, adminId]
        );
      }

      // Update admin name if provided
      if (nama) {
        await connection.execute(
          'UPDATE admin SET nama = ? WHERE user_id = ?',
          [nama, adminId]
        );
      }

      await connection.commit();
      res.json({
        success: true,
        message: 'Profile berhasil diupdate'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat update profile'
      });
    } finally {
      connection.release();
    }
  },

  // Generate validation code
  generateValidationCode: async (req, res) => {
    try {
      const adminId = req.user.id;
      const newValidationCode = uuidv4().substring(0, 6).toUpperCase();

      await db.execute(
        'UPDATE admin SET validation_code = ? WHERE user_id = ?',
        [newValidationCode, adminId]
      );

      res.json({
        success: true,
        validation_code: newValidationCode
      });
    } catch (error) {
      console.error('Generate validation code error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat generate kode validasi'
      });
    }
  },

  // Get mahasiswa list
  getMahasiswa: async (req, res) => {
    try {
      const adminId = req.user.id;
      const { status, institusi, periode, search } = req.query;
      
      let query = `
        SELECT m.*, u.email, u.photo_profile
        FROM mahasiswa m
        JOIN users u ON m.user_id = u.id
        WHERE m.admin_id = ?
      `;
      
      const params = [adminId];

      if (status && status !== 'Semua Status') {
        query += ' AND m.status = ?';
        params.push(status);
      }

      if (institusi && institusi !== 'Semua Institusi') {
        query += ' AND m.institusi = ?';
        params.push(institusi);
      }

      if (periode) {
        query += ' AND (DATE(m.tanggal_mulai) <= ? AND DATE(m.tanggal_selesai) >= ?)';
        params.push(periode, periode);
      }

      if (search) {
        query += ' AND (m.nama LIKE ? OR m.nim LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY m.created_at DESC';

      const [mahasiswa] = await db.execute(query, params);

      res.json({
        success: true,
        data: mahasiswa
      });
    } catch (error) {
      console.error('Get mahasiswa error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mahasiswa'
      });
    }
  },

  // Create new mahasiswa
  createMahasiswa: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        email,
        password,
        nim,
        nama,
        institusi,
        jenis_kelamin,
        alamat,
        no_telepon,
        tanggal_mulai,
        tanggal_selesai
      } = req.body;
      const adminId = req.user.id;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate QR Code
      const qrContent = JSON.stringify({
        nim,
        nama,
        institusi,
        id: uuidv4()
      });
      const qrCodeImage = await qr.toDataURL(qrContent);

      // Create user account
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, "mahasiswa")',
        [email, hashedPassword]
      );

      const userId = userResult.insertId;

      // Calculate remaining days
      const start = new Date(tanggal_mulai);
      const end = new Date(tanggal_selesai);
      const sisaHari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Create mahasiswa profile
      await connection.execute(
        `INSERT INTO mahasiswa (
          user_id, admin_id, nim, nama, institusi,
          jenis_kelamin, alamat, no_telepon,
          tanggal_mulai, tanggal_selesai, qr_code,
          status, sisa_hari
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
        [userId, adminId, nim, nama, institusi, jenis_kelamin,
         alamat, no_telepon, tanggal_mulai, tanggal_selesai,
         qrCodeImage, sisaHari]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Akun mahasiswa berhasil dibuat'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Create mahasiswa error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat akun mahasiswa'
      });
    } finally {
      connection.release();
    }
  },

  // Update mahasiswa status
  updateMahasiswaStatus: async (req, res) => {
    try {
      const { mahasiswaId } = req.params;
      const { status } = req.body;
      const adminId = req.user.id;

      // Verify mahasiswa belongs to admin
      const [mahasiswa] = await db.execute(
        'SELECT * FROM mahasiswa WHERE id = ? AND admin_id = ?',
        [mahasiswaId, adminId]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mahasiswa tidak ditemukan'
        });
      }

      // Update status
      await db.execute(
        'UPDATE mahasiswa SET status = ? WHERE id = ?',
        [status, mahasiswaId]
      );

      res.json({
        success: true,
        message: 'Status mahasiswa berhasil diupdate'
      });
    } catch (error) {
      console.error('Update mahasiswa status error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat update status mahasiswa'
      });
    }
  }
};

module.exports = adminController;