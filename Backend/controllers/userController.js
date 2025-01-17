const db = require('../config/database');
const bcrypt = require('bcryptjs');

const userController = {
  // Get profile mahasiswa
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const [user] = await db.execute(
        `SELECT u.email, u.photo_profile, m.*
         FROM users u
         JOIN mahasiswa m ON u.id = m.user_id
         WHERE u.id = ?`,
        [userId]
      );

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Get statistik kehadiran
      const [statistik] = await db.execute(
        `SELECT 
           COUNT(*) as total_kehadiran,
           COUNT(CASE WHEN status_masuk = 'tepat_waktu' THEN 1 END) as tepat_waktu,
           COUNT(CASE WHEN status_masuk = 'telat' THEN 1 END) as telat,
           COUNT(CASE WHEN status_kehadiran = 'izin' THEN 1 END) as izin
         FROM absensi
         WHERE mahasiswa_id = ?`,
        [user[0].id]
      );

      // Get logbook stats
      const [logbook] = await db.execute(
        `SELECT 
           COUNT(*) as total_entries,
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
         FROM logbook
         WHERE mahasiswa_id = ?`,
        [user[0].id]
      );

      // Get laporan progress
      const [laporan] = await db.execute(
        `SELECT MAX(progress) as progress_laporan
         FROM laporan
         WHERE mahasiswa_id = ?`,
        [user[0].id]
      );

      res.json({
        success: true,
        data: {
          profile: user[0],
          statistik: statistik[0],
          logbook: logbook[0],
          laporan: laporan[0]
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data profile'
      });
    }
  },

  // Update profile mahasiswa
  updateProfile: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const userId = req.user.id;
      const { email, no_telepon, alamat } = req.body;
      const photoProfile = req.file ? req.file.filename : null;

      // Update user data
      if (email) {
        await connection.execute(
          'UPDATE users SET email = ? WHERE id = ?',
          [email, userId]
        );
      }

      if (photoProfile) {
        await connection.execute(
          'UPDATE users SET photo_profile = ? WHERE id = ?',
          [photoProfile, userId]
        );
      }

      // Update mahasiswa data
      const updateFields = [];
      const updateValues = [];

      if (no_telepon) {
        updateFields.push('no_telepon = ?');
        updateValues.push(no_telepon);
      }

      if (alamat) {
        updateFields.push('alamat = ?');
        updateValues.push(alamat);
      }

      if (updateFields.length > 0) {
        await connection.execute(
          `UPDATE mahasiswa 
           SET ${updateFields.join(', ')} 
           WHERE user_id = ?`,
          [...updateValues, userId]
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

  // Get QR Code
  getQRCode: async (req, res) => {
    try {
      const userId = req.user.id;

      const [mahasiswa] = await db.execute(
        'SELECT qr_code FROM mahasiswa WHERE user_id = ?',
        [userId]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'QR Code tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: {
          qr_code: mahasiswa[0].qr_code
        }
      });

    } catch (error) {
      console.error('Get QR Code error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil QR Code'
      });
    }
  },

  // Get dashboard summary
  getDashboardSummary: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get mahasiswa data
      const [mahasiswa] = await db.execute(
        'SELECT id, nama, sisa_hari FROM mahasiswa WHERE user_id = ?',
        [userId]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data mahasiswa tidak ditemukan'
        });
      }

      const mahasiswaId = mahasiswa[0].id;

      // Get today's attendance status
      const today = new Date().toISOString().split('T')[0];
      const [absensi] = await db.execute(
        `SELECT status_kehadiran, waktu_masuk, waktu_keluar, status_masuk
         FROM absensi 
         WHERE mahasiswa_id = ? AND DATE(tanggal) = ?`,
        [mahasiswaId, today]
      );

      // Get total attendance
      const [totalKehadiran] = await db.execute(
        `SELECT COUNT(*) as total 
         FROM absensi 
         WHERE mahasiswa_id = ? AND status_kehadiran = 'hadir'`,
        [mahasiswaId]
      );

      // Get logbook status
      const [logbook] = await db.execute(
        `SELECT COUNT(*) as total_entries
         FROM logbook
         WHERE mahasiswa_id = ?`,
        [mahasiswaId]
      );

      // Get report status
      const [laporan] = await db.execute(
        `SELECT status, feedback
         FROM laporan
         WHERE mahasiswa_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [mahasiswaId]
      );

      res.json({
        success: true,
        data: {
          nama: mahasiswa[0].nama,
          sisa_hari: mahasiswa[0].sisa_hari,
          absensi_hari_ini: absensi[0] || null,
          total_kehadiran: totalKehadiran[0].total,
          logbook_terisi: logbook[0].total_entries,
          status_laporan: laporan[0] ? laporan[0].status : null
        }
      });

    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data dashboard'
      });
    }
  }
};

module.exports = userController;