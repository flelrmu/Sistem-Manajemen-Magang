const db = require("../config/database");
const geolib = require("geolib");
const qrcodeUtil = require("../utils/qrcode");

const absenController = {
  // Scan QR Code untuk absensi
  scanQR: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Verifikasi bahwa user yang login adalah mahasiswa
      if (req.user.role !== "mahasiswa") {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak. Hanya mahasiswa yang dapat melakukan absensi",
        });
      }

      const { qrData, latitude, longitude, deviceInfo } = req.body;

      // Validate QR code
      const validationResult = qrcodeUtil.validateQRContent(qrData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
        });
      }

      const mahasiswa_id = validationResult.data.mahasiswa_id;

      // Verifikasi bahwa QR code milik mahasiswa yang login
      if (mahasiswa_id !== req.user.mahasiswa_id) {
        return res.status(403).json({
          success: false,
          message: "QR Code tidak sesuai dengan akun yang login",
        });
      }

      // Get mahasiswa data
      const [mahasiswa] = await connection.execute(
        'SELECT * FROM mahasiswa WHERE id = ? AND status = "aktif"',
        [mahasiswa_id]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Mahasiswa tidak ditemukan atau tidak aktif",
        });
      }

      // Get active setting
      const [settings] = await connection.execute(
        "SELECT * FROM setting_absensi WHERE is_active = true"
      );

      if (settings.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pengaturan absensi belum dikonfigurasi",
        });
      }

      const setting = settings[0];

      // Check if within radius
      const distance = geolib.getDistance(
        { latitude, longitude },
        {
          latitude: setting.latitude_pusat,
          longitude: setting.longitude_pusat,
        }
      );

      const dalamRadius = distance <= setting.radius_meter;

      // Get current time
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0];
      const currentDate = now.toISOString().split("T")[0];

      // Check if already checked in today
      const [existingAbsensi] = await connection.execute(
        "SELECT * FROM absensi WHERE mahasiswa_id = ? AND DATE(tanggal) = ?",
        [mahasiswa_id, currentDate]
      );

      // Determine status
      let statusMasuk = "tepat_waktu";
      if (currentTime > setting.jam_masuk) {
        const timeDiff =
          (new Date(`2000/01/01 ${currentTime}`) -
            new Date(`2000/01/01 ${setting.jam_masuk}`)) /
          1000 /
          60;

        if (timeDiff > setting.batas_telat_menit) {
          statusMasuk = "telat";
        }
      }

      if (existingAbsensi.length === 0) {
        // Create new attendance record
        await connection.execute(
          `INSERT INTO absensi (
            mahasiswa_id, setting_absensi_id, tanggal,
            waktu_masuk, status_masuk, status_kehadiran,
            latitude_scan, longitude_scan, dalam_radius,
            device_info
          ) VALUES (?, ?, ?, NOW(), ?, 'hadir', ?, ?, ?, ?)`,
          [
            mahasiswa_id,
            setting.id,
            currentDate,
            statusMasuk,
            latitude,
            longitude,
            dalamRadius,
            deviceInfo,
          ]
        );

        await connection.commit();

        return res.json({
          success: true,
          message: "Absen masuk berhasil",
          data: {
            status: statusMasuk,
            dalam_radius: dalamRadius,
            nama: mahasiswa[0].nama,
            waktu: currentTime,
            latitude: latitude,
            longitude: longitude,
          },
        });
      } else {
        // Check if can check out
        if (currentTime < setting.jam_pulang) {
          return res.status(400).json({
            success: false,
            message: "Belum waktunya pulang",
          });
        }

        // Update existing record with check out time
        await connection.execute(
          "UPDATE absensi SET waktu_keluar = NOW() WHERE id = ?",
          [existingAbsensi[0].id]
        );

        await connection.commit();

        return res.json({
          success: true,
          message: "Absen pulang berhasil",
          data: {
            nama: mahasiswa[0].nama,
            waktu: currentTime,
            latitude: latitude,
            longitude: longitude,
          },
        });
      }
    } catch (error) {
      await connection.rollback();
      console.error("Scan QR error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat proses absensi",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    } finally {
      connection.release();
    }
  },

  // Get riwayat absensi mahasiswa
  getRiwayatAbsensi: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      const { startDate, endDate, status, search } = req.query;

      // Query dasar untuk mengambil data absensi
      let query = `
        SELECT 
          a.tanggal,
          a.waktu_masuk,
          a.waktu_keluar,
          a.status_masuk,
          a.status_kehadiran,
          m.nama AS mahasiswa_nama,
          m.nim,
          m.admin_id
        FROM absensi a
        JOIN mahasiswa m ON a.mahasiswa_id = m.id
        WHERE m.admin_id = ?
      `;

      const params = [req.user.id];

      // Tambahkan filter tanggal jika ada
      if (startDate && endDate) {
        query += " AND DATE(a.tanggal) BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      // Tambahkan filter status jika ada
      if (status && status !== "Semua Status") {
        query += " AND a.status_kehadiran = ?";
        params.push(status);
      }

      // Tambahkan filter pencarian nama atau NIM jika ada
      if (search) {
        query += " AND (m.nama LIKE ? OR m.nim LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // Urutkan data
      query += " ORDER BY a.tanggal DESC, a.waktu_masuk DESC";

      // Eksekusi query
      const [riwayat] = await db.execute(query, params);

      // Kembalikan hasil, meskipun kosong
      res.status(200).json({
        success: true,
        data: riwayat,
      });
    } catch (error) {
      console.error("Get riwayat absensi error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil riwayat absensi",
      });
    }
  },

  getAbsensi: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;

      let query = `
        SELECT 
          a.id,
          a.tanggal,
          a.waktu_masuk,
          a.waktu_keluar,
          a.status_masuk,
          a.status_kehadiran,
          a.dalam_radius,
          a.latitude_scan,
          a.longitude_scan,
          m.nama AS mahasiswa_nama,
          m.nim
        FROM absensi a
        JOIN mahasiswa m ON a.mahasiswa_id = m.id
        WHERE a.mahasiswa_id = ?
        ORDER BY a.tanggal DESC, a.waktu_masuk DESC
      `;

      const [riwayat] = await db.execute(query, [mahasiswaId]);

      // Optional: Get total for pagination
      const [total] = await db.execute(
        "SELECT COUNT(*) as total FROM absensi WHERE mahasiswa_id = ?",
        [mahasiswaId]
      );

      res.status(200).json({
        success: true,
        data: riwayat,
        total: total[0].total,
      });
    } catch (error) {
      console.error("Get riwayat absensi error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil riwayat absensi",
      });
    }
  },

  getDashboardStats: async (req, res) => {
    try {
      const adminId = req.user.id;
      const today = new Date().toISOString().split("T")[0];

      // Get total active students
      const [totalMahasiswa] = await db.execute(
        'SELECT COUNT(*) as total FROM mahasiswa WHERE admin_id = ? AND status = "aktif"',
        [adminId]
      );

      // Get today's attendance stats
      const [attendanceStats] = await db.execute(
        `SELECT 
          COUNT(CASE WHEN status_kehadiran = 'hadir' THEN 1 END) as hadir,
          COUNT(CASE WHEN status_kehadiran = 'izin' THEN 1 END) as izin,
          COUNT(CASE WHEN status_kehadiran = 'alpha' THEN 1 END) as alpha
         FROM absensi a
         JOIN mahasiswa m ON a.mahasiswa_id = m.id 
         WHERE m.admin_id = ? AND DATE(a.tanggal) = ?`,
        [adminId, today]
      );

      res.json({
        success: true,
        data: {
          totalMahasiswa: totalMahasiswa[0].total,
          ...attendanceStats[0],
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

  // Get statistik absensi
  getAbsensiStatistics: async (req, res) => {
    try {
      const adminId = req.user.id; // admin_id berasal dari token pengguna
      const { startDate, endDate } = req.query;

      // Debug parameter untuk troubleshooting
      console.log("Received query parameters:", { startDate, endDate });

      // Validasi input untuk startDate dan endDate
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Parameter startDate dan endDate harus disediakan",
        });
      }

      // Validasi format tanggal
      const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          message:
            "Format startDate atau endDate tidak valid. Gunakan format YYYY-MM-DD.",
        });
      }

      // Query untuk mengambil statistik absensi berdasarkan admin_id
      const [statistics] = await db.execute(
        `SELECT 
           DATE(a.tanggal) AS date,
           COUNT(CASE WHEN a.status_kehadiran = 'hadir' THEN 1 END) AS hadir,
           COUNT(CASE WHEN a.status_kehadiran = 'izin' THEN 1 END) AS izin,
           COUNT(CASE WHEN a.status_kehadiran = 'alpha' THEN 1 END) AS alpha
         FROM absensi a
         JOIN mahasiswa m ON a.mahasiswa_id = m.id
         WHERE m.admin_id = ?
           AND DATE(a.tanggal) BETWEEN ? AND ?
         GROUP BY DATE(a.tanggal)
         ORDER BY DATE(a.tanggal)`,
        [adminId, startDate, endDate]
      );

      // Kembalikan hasil statistik
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error("Get absensi statistics error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil statistik absensi",
      });
    }
  },

  // Pengajuan izin
  getKategoriIzin: async (req, res) => {
    try {
      const [categories] = await db.execute("SELECT * FROM kategori_izin");
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil kategori",
      });
    }
  },

  // Submit permission request
  submitIzin: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { tanggal_mulai, tanggal_selesai, kategori, keterangan } = req.body;
      const mahasiswaId = req.user.mahasiswa_id;
      const fileBukti = req.file ? req.file.filename : null;

      // Get admin_id from mahasiswa
      const [mahasiswa] = await connection.execute(
        "SELECT admin_id FROM mahasiswa WHERE id = ?",
        [mahasiswaId]
      );

      if (mahasiswa.length === 0) {
        throw new Error("Mahasiswa tidak ditemukan");
      }

      // Insert permission request
      await connection.execute(
        `INSERT INTO izin (
          mahasiswa_id, admin_id, tanggal_mulai,
          tanggal_selesai, kategori, keterangan,
          file_bukti, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          mahasiswaId,
          mahasiswa[0].admin_id,
          tanggal_mulai,
          tanggal_selesai,
          kategori,
          keterangan,
          fileBukti,
        ]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Pengajuan izin berhasil dikirim",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Submit izin error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan saat mengajukan izin",
      });
    } finally {
      connection.release();
    }
  },

  // Update status izin (untuk admin)
  updateStatusIzin: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const izinId = req.params.id;
      const { status, alasan_response } = req.body;
      const adminId = req.user.id;

      // Verify izin belongs to admin
      const [izin] = await connection.execute(
        "SELECT * FROM izin WHERE id = ? AND admin_id = ?",
        [izinId, adminId]
      );

      if (izin.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Izin tidak ditemukan",
        });
      }

      // Update izin status
      await connection.execute(
        "UPDATE izin SET status = ?, alasan_response = ? WHERE id = ?",
        [status, alasan_response, izinId]
      );

      // If approved, update absensi status
      if (status === "approved") {
        const startDate = new Date(izin[0].tanggal_mulai);
        const endDate = new Date(izin[0].tanggal_selesai);

        // Loop through each day in the permission period
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const currentDate = date.toISOString().split("T")[0];

          // Check if absensi exists for this date
          const [existingAbsensi] = await connection.execute(
            "SELECT id FROM absensi WHERE mahasiswa_id = ? AND DATE(tanggal) = ?",
            [izin[0].mahasiswa_id, currentDate]
          );

          if (existingAbsensi.length === 0) {
            // Create new absensi record with izin status
            await connection.execute(
              `INSERT INTO absensi (
                mahasiswa_id, setting_absensi_id, tanggal,
                status_kehadiran, dalam_radius
              ) VALUES (?,
                (SELECT id FROM setting_absensi WHERE is_active = 1 LIMIT 1),
                ?, 'izin', true
              )`,
              [izin[0].mahasiswa_id, currentDate]
            );
          } else {
            // Update existing absensi to izin status
            await connection.execute(
              'UPDATE absensi SET status_kehadiran = "izin" WHERE id = ?',
              [existingAbsensi[0].id]
            );
          }
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: `Izin berhasil ${
          status === "approved" ? "disetujui" : "ditolak"
        }`,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Update status izin error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memproses izin",
      });
    } finally {
      connection.release();
    }
  },

  // Get riwayat izin (continued...)
  getRiwayatIzin: async (req, res) => {
    const connection = await db.getConnection();
    try {
      const userId = req.user.mahasiswa_id || req.user.admin_id;
      const userRole = req.user.role;

      let query = `
        SELECT 
          i.*,
          m.nama as mahasiswa_nama,
          m.nim,
          a.nama as admin_nama,
          DATE_FORMAT(i.tanggal_mulai, '%Y-%m-%d') as tanggal_mulai,
          DATE_FORMAT(i.tanggal_selesai, '%Y-%m-%d') as tanggal_selesai,
          DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
          DATEDIFF(i.tanggal_selesai, i.tanggal_mulai) + 1 as total_hari
        FROM izin i
        JOIN mahasiswa m ON i.mahasiswa_id = m.id
        JOIN admin a ON i.admin_id = a.id
        WHERE `;

      const params = [];

      if (userRole === "mahasiswa") {
        query += "i.mahasiswa_id = ?";
        params.push(userId);
      } else {
        query += "i.admin_id = ?";
        params.push(userId);
      }

      query += " ORDER BY i.created_at DESC";

      const [riwayat] = await connection.execute(query, params);

      res.json({
        success: true,
        data: riwayat,
      });
    } catch (error) {
      console.error("Get riwayat izin error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil riwayat izin",
      });
    } finally {
      connection.release();
    }
  },

  // Export data absensi
  exportAbsensi: async (req, res) => {
    try {
      const { startDate, endDate, mahasiswaId, status } = req.query;
      const adminId = req.user.id;

      let query = `
        SELECT
          m.nim,
          m.nama,
          m.institusi,
          DATE_FORMAT(a.tanggal, '%Y-%m-%d') as tanggal,
          TIME_FORMAT(a.waktu_masuk, '%H:%i:%s') as waktu_masuk,
          TIME_FORMAT(a.waktu_keluar, '%H:%i:%s') as waktu_keluar,
          TIME_FORMAT(TIMEDIFF(a.waktu_keluar, a.waktu_masuk), '%H:%i:%s') as durasi,
          a.status_masuk,
          a.status_kehadiran,
          a.dalam_radius,
          a.device_info,
          a.latitude_scan,
          a.longitude_scan
        FROM absensi a
        JOIN mahasiswa m ON a.mahasiswa_id = m.id
        WHERE m.admin_id = ?
      `;

      const params = [adminId];

      if (startDate && endDate) {
        query += " AND DATE(a.tanggal) BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      if (mahasiswaId) {
        query += " AND m.id = ?";
        params.push(mahasiswaId);
      }

      if (status) {
        query += " AND a.status_kehadiran = ?";
        params.push(status);
      }

      query += " ORDER BY a.tanggal DESC, m.nama ASC";

      const [data] = await db.execute(query, params);

      // Calculate summary statistics
      const summary = {
        total_records: data.length,
        tepat_waktu: data.filter((r) => r.status_masuk === "tepat_waktu")
          .length,
        telat: data.filter((r) => r.status_masuk === "telat").length,
        hadir: data.filter((r) => r.status_kehadiran === "hadir").length,
        izin: data.filter((r) => r.status_kehadiran === "izin").length,
        alpha: data.filter((r) => r.status_kehadiran === "alpha").length,
        dalam_radius: data.filter((r) => r.dalam_radius).length,
        luar_radius: data.filter((r) => !r.dalam_radius).length,
      };

      res.json({
        success: true,
        data: data,
        summary: summary,
        filter: {
          startDate,
          endDate,
          mahasiswaId,
          status,
        },
      });
    } catch (error) {
      console.error("Export absensi error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengexport data absensi",
      });
    }
  },

  // Get status absensi hari ini
  getStatusAbsensiHariIni: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const today = new Date().toISOString().split("T")[0];

      const [absensi] = await db.execute(
        `SELECT a.*, s.jam_masuk, s.jam_pulang
         FROM absensi a
         JOIN setting_absensi s ON a.setting_absensi_id = s.id
         WHERE a.mahasiswa_id = ? AND DATE(a.tanggal) = ?`,
        [mahasiswaId, today]
      );

      // Get active settings
      const [settings] = await db.execute(
        "SELECT * FROM setting_absensi WHERE is_active = true"
      );

      res.json({
        success: true,
        data: {
          absensi: absensi[0] || null,
          setting: settings[0] || null,
        },
      });
    } catch (error) {
      console.error("Get status absensi hari ini error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil status absensi",
      });
    }
  },

  // Update setting absensi
  updateSettingAbsensi: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        jam_masuk,
        jam_pulang,
        batas_telat_menit,
        radius_meter,
        latitude_pusat,
        longitude_pusat,
      } = req.body;

      // Deactivate current active setting
      await connection.execute(
        "UPDATE setting_absensi SET is_active = false WHERE is_active = true"
      );

      // Create new setting
      await connection.execute(
        `INSERT INTO setting_absensi (
          jam_masuk, jam_pulang, batas_telat_menit,
          radius_meter, latitude_pusat, longitude_pusat,
          is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, true, ?)`,
        [
          jam_masuk,
          jam_pulang,
          batas_telat_menit,
          radius_meter,
          latitude_pusat,
          longitude_pusat,
          req.user.id,
        ]
      );

      await connection.commit();

      res.json({
        success: true,
        message: "Setting absensi berhasil diupdate",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Update setting absensi error:", error);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat update setting absensi",
      });
    } finally {
      connection.release();
    }
  },
};

module.exports = absenController;
