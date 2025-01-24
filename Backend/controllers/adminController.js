const db = require("../config/database");
const bcrypt = require("bcryptjs");
const qrcodeUtil = require("../utils/qrcode");
const { v4: uuidv4 } = require("uuid");

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
      const today = new Date().toISOString().split("T")[0];
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
          recentActivities,
        },
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data dashboard",
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
        await connection.execute("UPDATE users SET email = ? WHERE id = ?", [
          email,
          adminId,
        ]);
      }

      // Update photo if provided
      if (photoProfile) {
        await connection.execute(
          "UPDATE users SET photo_profile = ? WHERE id = ?",
          [photoProfile, adminId]
        );
      }

      // Update admin name if provided
      if (nama) {
        await connection.execute(
          "UPDATE admin SET nama = ? WHERE user_id = ?",
          [nama, adminId]
        );
      }

      await connection.commit();

      // Fetch updated profile data
      const [updatedAdmin] = await db.execute(
        `SELECT u.email, u.photo_profile, a.nama
         FROM users u
         LEFT JOIN admin a ON u.id = a.user_id
         WHERE u.id = ?`,
        [adminId]
      );

      // Add full URL for photo_profile
      if (updatedAdmin[0].photo_profile) {
        updatedAdmin[0].photo_profile = `${req.protocol}://${req.get(
          "host"
        )}/uploads/profiles/${updatedAdmin[0].photo_profile}`;
      }

      res.json({
        success: true,
        message: "Profile berhasil diupdate",
        data: updatedAdmin[0],
      });
    } catch (error) {
      await connection.rollback();
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat update profile",
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
        "UPDATE admin SET validation_code = ? WHERE user_id = ?",
        [newValidationCode, adminId]
      );

      res.json({
        success: true,
        validation_code: newValidationCode,
      });
    } catch (error) {
      console.error("Generate validation code error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat generate kode validasi",
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
        tanggal_selesai,
      } = req.body;
      const adminId = req.user.id;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, "mahasiswa")',
        [email, hashedPassword]
      );

      const userId = userResult.insertId;

      // Generate QR Code
      const qrCodePath = await qrcodeUtil.generateMahasiswaQR({
        id: userId,
        nim,
        nama,
      });

      // Calculate remaining days
      const start = new Date(tanggal_mulai);
      const end = new Date(tanggal_selesai);
      const sisaHari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Create mahasiswa profile
      await connection.execute(
        `INSERT INTO mahasiswa (
          user_id, admin_id, nim, nama, institusi,
          jenis_kelamin, alamat, no_telepon, tanggal_mulai, tanggal_selesai,
          qr_code, status, sisa_hari
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
        [
          userId,
          adminId,
          nim,
          nama,
          institusi,
          jenis_kelamin,
          alamat,
          no_telepon,
          tanggal_mulai,
          tanggal_selesai,
          qrCodePath,
          sisaHari,
        ]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Akun mahasiswa berhasil dibuat",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Create mahasiswa error:", error);
      // Delete QR code if exists
      if (error.qrCodePath) {
        await qrcodeUtil.deleteQRCode(error.qrCodePath);
      }
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat membuat akun mahasiswa",
      });
    } finally {
      connection.release();
    }
  },

  // Get all mahasiswa under admin
  getMahasiswa: async (req, res) => {
    try {
      const adminId = req.user.id;
      const {
        status,
        institusi,
        periode,
        search,
        page = 1,
        limit = 10,
      } = req.query;

      let query = `
            SELECT m.*, u.email, u.photo_profile
            FROM mahasiswa m
            JOIN users u ON m.user_id = u.id
            WHERE m.admin_id = ?
        `;

      const params = [adminId];

      // Add filters
      if (status && status !== "Semua Status") {
        query += " AND m.status = ?";
        params.push(status);
      }
      if (institusi && institusi !== "Semua Institusi") {
        query += " AND m.institusi = ?";
        params.push(institusi);
      }
      if (periode) {
        query +=
          " AND (DATE(m.tanggal_mulai) <= ? AND DATE(m.tanggal_selesai) >= ?)";
        params.push(periode, periode);
      }
      if (search) {
        query += " AND (m.nama LIKE ? OR m.nim LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // Get total count
      const [totalRows] = await db.execute(
        `SELECT COUNT(*) as total FROM (${query}) as subquery`,
        params
      );
      const total = totalRows[0].total;

      // Add pagination
      query += " ORDER BY m.created_at DESC LIMIT ? OFFSET ?";
      const offset = (page - 1) * limit;
      params.push(Number(limit), offset);

      const [mahasiswa] = await db.execute(query, params);

      res.json({
        success: true,
        mahasiswa,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Get mahasiswa error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data mahasiswa",
      });
    }
  },

  // Add this new method to adminController
  getInstitutions: async (req, res) => {
    try {
      const adminId = req.user.id;

      // Get unique institutions from mahasiswa table for this admin
      const [institutions] = await db.execute(
        `SELECT DISTINCT institusi 
         FROM mahasiswa 
         WHERE admin_id = ? 
         AND institusi IS NOT NULL 
         ORDER BY institusi`,
        [adminId]
      );

      res.json({
        success: true,
        institutions: institutions.map((row) => row.institusi),
      });
    } catch (error) {
      console.error("Get institutions error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data institusi",
      });
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
        "SELECT * FROM mahasiswa WHERE id = ? AND admin_id = ?",
        [mahasiswaId, adminId]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mahasiswa tidak ditemukan",
        });
      }

      // Update status
      await db.execute("UPDATE mahasiswa SET status = ? WHERE id = ?", [
        status,
        mahasiswaId,
      ]);

      res.json({
        success: true,
        message: "Status mahasiswa berhasil diupdate",
      });
    } catch (error) {
      console.error("Update mahasiswa status error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat update status mahasiswa",
      });
    }
  },

  getAdminUsers: async (req, res) => {
    try {
      // Hanya mengambil data yang diperlukan untuk registrasi
      const [admins] = await db.execute(
        `SELECT a.id, a.nama 
         FROM admin a 
         INNER JOIN users u ON a.user_id = u.id 
         WHERE u.role = 'admin'`
      );

      res.json({
        success: true,
        admins: admins.map((admin) => ({
          id: admin.id,
          nama: admin.nama,
        })),
      });
    } catch (error) {
      console.error("Get admin list error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil data admin",
      });
    }
  },

  // Update admin password
  updatePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const adminId = req.user.id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Password lama dan baru harus diisi",
        });
      }

      // Get current admin
      const [admins] = await db.execute("SELECT * FROM users WHERE id = ?", [
        adminId,
      ]);

      if (admins.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin tidak ditemukan",
        });
      }

      // Verify old password
      const validPassword = await bcrypt.compare(
        oldPassword,
        admins[0].password
      );
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Password lama tidak sesuai",
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password baru minimal 6 karakter",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.execute("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        adminId,
      ]);

      res.json({
        success: true,
        message: "Password berhasil diupdate",
      });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat update password",
      });
    }
  },

  deleteMahasiswa: async (req, res) => {
    try {
      const { id } = req.params;

      // Verifikasi mahasiswa milik admin
      const [mahasiswa] = await db.execute(
        "SELECT * FROM mahasiswa WHERE id = ? AND admin_id = ?",
        [id, req.user.id]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Data mahasiswa tidak ditemukan.",
        });
      }

      // Hapus data mahasiswa
      await db.execute("DELETE FROM mahasiswa WHERE id = ?", [id]);
      await db.execute("DELETE FROM users WHERE id = ?", [
        mahasiswa[0].user_id,
      ]);

      res.json({
        success: true,
        message: "Data mahasiswa berhasil dihapus.",
      });
    } catch (error) {
      console.error("Delete mahasiswa error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus data mahasiswa.",
      });
    }
  },

  updateMahasiswa: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nama,
        nim,
        institusi,
        jenis_kelamin,
        alamat,
        no_telepon,
        tanggal_mulai,
        tanggal_selesai,
      } = req.body;

      // Verifikasi mahasiswa milik admin
      const [mahasiswa] = await db.execute(
        "SELECT * FROM mahasiswa WHERE id = ? AND admin_id = ?",
        [id, req.user.id]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Data mahasiswa tidak ditemukan.",
        });
      }

      // Update data mahasiswa
      await db.execute(
        `UPDATE mahasiswa SET 
         nama = ?, nim = ?, institusi = ?, jenis_kelamin = ?, 
         alamat = ?, no_telepon = ?, tanggal_mulai = ?, tanggal_selesai = ?
         WHERE id = ?`,
        [
          nama,
          nim,
          institusi,
          jenis_kelamin,
          alamat,
          no_telepon,
          tanggal_mulai,
          tanggal_selesai,
          id,
        ]
      );

      res.json({
        success: true,
        message: "Data mahasiswa berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Update mahasiswa error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui data mahasiswa.",
      });
    }
  },
};

module.exports = adminController;
