const db = require('../config/database');
const geolib = require('geolib');
const qrcodeUtil = require('../utils/qrcode');

const absenController = {
  // Scan QR Code untuk absensi
  scanQR: async (req, res) => {
    try {
      const { qrData, latitude, longitude, deviceInfo } = req.body;

      // Validasi QR code
      const validationResult = qrcodeUtil.validateQRContent(qrData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message
        });
      }

      const nim = validationResult.data.nim;

      // Get mahasiswa data
      const [mahasiswa] = await db.execute(
        'SELECT * FROM mahasiswa WHERE nim = ? AND status = "aktif"',
        [nim]
      );

      if (mahasiswa.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mahasiswa tidak ditemukan atau tidak aktif'
        });
      }

      // Get absensi settings
      const [settings] = await db.execute(
        'SELECT * FROM setting_absensi WHERE is_active = true'
      );

      if (settings.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pengaturan absensi belum dikonfigurasi'
        });
      }

      const setting = settings[0];

      // Check if within radius
      const distance = geolib.getDistance(
        { latitude, longitude },
        { latitude: setting.latitude_pusat, longitude: setting.longitude_pusat }
      );

      const dalamRadius = distance <= setting.radius_meter;

      if (!dalamRadius) {
        return res.status(400).json({
          success: false,
          message: `Lokasi di luar radius yang diizinkan (${distance}m dari pusat)`
        });
      }

      // Get current time
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0];
      const currentDate = now.toISOString().split('T')[0];

      // Check if already checked in today
      const [existingAbsensi] = await db.execute(
        'SELECT * FROM absensi WHERE mahasiswa_id = ? AND DATE(tanggal) = ?',
        [mahasiswa[0].id, currentDate]
      );

      let statusMasuk = 'tepat_waktu';
      if (currentTime > setting.jam_masuk) {
        const timeDiff = (new Date(`2000/01/01 ${currentTime}`) - new Date(`2000/01/01 ${setting.jam_masuk}`)) / 1000 / 60;
        if (timeDiff > setting.batas_telat_menit) {
          statusMasuk = 'telat';
        }
      }

      if (existingAbsensi.length === 0) {
        // Create new attendance record
        await db.execute(
          `INSERT INTO absensi (
            mahasiswa_id, setting_absensi_id, tanggal,
            waktu_masuk, status_masuk, status_kehadiran,
            latitude_scan, longitude_scan, dalam_radius,
            device_info
          ) VALUES (?, ?, ?, NOW(), ?, 'hadir', ?, ?, ?, ?)`,
          [mahasiswa[0].id, setting.id, currentDate, statusMasuk,
           latitude, longitude, dalamRadius, deviceInfo]
        );

        return res.json({
          success: true,
          message: 'Absen masuk berhasil',
          status: statusMasuk
        });
      } else {
        // Check if can check out
        if (currentTime < setting.jam_pulang) {
          return res.status(400).json({
            success: false,
            message: 'Belum waktunya pulang'
          });
        }

        // Update existing record with check out time
        await db.execute(
          'UPDATE absensi SET waktu_keluar = NOW() WHERE id = ?',
          [existingAbsensi[0].id]
        );

        return res.json({
          success: true,
          message: 'Absen pulang berhasil'
        });
      }

    } catch (error) {
      console.error('Scan QR error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat proses absensi'
      });
    }
  },

  // Get riwayat absensi mahasiswa
  getRiwayatAbsensi: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      const { startDate, endDate } = req.query;

      let query = `
        SELECT 
          a.*,
          s.jam_masuk,
          s.jam_pulang,
          TIMEDIFF(a.waktu_keluar, a.waktu_masuk) as durasi_kerja
        FROM absensi a
        JOIN setting_absensi s ON a.setting_absensi_id = s.id
        WHERE a.mahasiswa_id = ?
      `;
      
      const params = [mahasiswaId];

      if (startDate && endDate) {
        query += ' AND DATE(a.tanggal) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY a.tanggal DESC';

      const [riwayat] = await db.execute(query, params);

      res.json({
        success: true,
        data: riwayat
      });

    } catch (error) {
      console.error('Get riwayat absensi error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil riwayat absensi'
      });
    }
  },

  // Get statistik absensi
  getStatistikAbsensi: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      const { bulan, tahun } = req.query;

      const [statistik] = await db.execute(
        `SELECT
          COUNT(*) as total_hari,
          COUNT(CASE WHEN status_masuk = 'tepat_waktu' THEN 1 END) as tepat_waktu,
          COUNT(CASE WHEN status_masuk = 'telat' THEN 1 END) as telat,
          COUNT(CASE WHEN status_kehadiran = 'izin' THEN 1 END) as izin,
          COUNT(CASE WHEN status_kehadiran = 'alpha' THEN 1 END) as alpha,
          ROUND(AVG(TIME_TO_SEC(TIMEDIFF(waktu_keluar, waktu_masuk)) / 3600), 2) as rata_rata_jam_kerja,
          COUNT(CASE WHEN waktu_keluar IS NULL AND status_kehadiran = 'hadir' THEN 1 END) as belum_absen_pulang
         FROM absensi
         WHERE mahasiswa_id = ?
         ${bulan ? 'AND MONTH(tanggal) = ?' : ''}
         ${tahun ? 'AND YEAR(tanggal) = ?' : ''}`,
        [mahasiswaId, ...(bulan ? [bulan] : []), ...(tahun ? [tahun] : [])]
      );

      // Get detail kehadiran per minggu
      const [detailMingguan] = await db.execute(
        `SELECT 
          WEEK(tanggal) as minggu,
          COUNT(*) as total_hari,
          COUNT(CASE WHEN status_masuk = 'tepat_waktu' THEN 1 END) as tepat_waktu,
          COUNT(CASE WHEN status_masuk = 'telat' THEN 1 END) as telat
         FROM absensi
         WHERE mahasiswa_id = ?
         ${bulan ? 'AND MONTH(tanggal) = ?' : ''}
         ${tahun ? 'AND YEAR(tanggal) = ?' : ''}
         GROUP BY WEEK(tanggal)
         ORDER BY WEEK(tanggal)`,
        [mahasiswaId, ...(bulan ? [bulan] : []), ...(tahun ? [tahun] : [])]
      );

      res.json({
        success: true,
        data: {
          summary: statistik[0],
          detail_mingguan: detailMingguan
        }
      });

    } catch (error) {
      console.error('Get statistik absensi error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik absensi'
      });
    }
  },

  // Pengajuan izin
  submitIzin: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const { tanggal_mulai, tanggal_selesai, kategori, keterangan } = req.body;
      const fileBukti = req.file ? req.file.filename : null;

      // Validate dates
      const startDate = new Date(tanggal_mulai);
      const endDate = new Date(tanggal_selesai);
      const today = new Date();

      if (startDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal mulai tidak boleh kurang dari hari ini'
        });
      }

      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal selesai harus setelah tanggal mulai'
        });
      }

      // Get admin_id from mahasiswa
      const [mahasiswa] = await db.execute(
        'SELECT admin_id FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

      // Check for overlapping permissions
      const [existingIzin] = await db.execute(
        `SELECT id FROM izin 
         WHERE mahasiswa_id = ? 
         AND status != 'rejected'
         AND (
           (tanggal_mulai BETWEEN ? AND ?) OR
           (tanggal_selesai BETWEEN ? AND ?) OR
           (? BETWEEN tanggal_mulai AND tanggal_selesai)
         )`,
        [mahasiswaId, tanggal_mulai, tanggal_selesai, 
         tanggal_mulai, tanggal_selesai, tanggal_mulai]
      );

      if (existingIzin.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Sudah ada pengajuan izin untuk periode yang sama'
        });
      }

      // Insert izin
      await db.execute(
        `INSERT INTO izin (
          mahasiswa_id, admin_id, tanggal_mulai,
          tanggal_selesai, kategori, keterangan,
          file_bukti, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [mahasiswaId, mahasiswa[0].admin_id, tanggal_mulai,
         tanggal_selesai, kategori, keterangan, fileBukti]
      );

      res.status(201).json({
        success: true,
        message: 'Pengajuan izin berhasil dikirim'
      });

    } catch (error) {
      console.error('Submit izin error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengajukan izin'
      });
    }
  },

  // Update status izin (untuk admin)
  updateStatusIzin: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { izinId } = req.params;
      const { status, alasan_response } = req.body;
      const adminId = req.user.id;

      // Verify izin belongs to admin
      const [izin] = await connection.execute(
        'SELECT * FROM izin WHERE id = ? AND admin_id = ?',
        [izinId, adminId]
      );

      if (izin.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Izin tidak ditemukan'
        });
      }

      // Update izin status
      await connection.execute(
        'UPDATE izin SET status = ?, alasan_response = ? WHERE id = ?',
        [status, alasan_response, izinId]
      );

      // If approved, update absensi status
      if (status === 'approved') {
        const startDate = new Date(izin[0].tanggal_mulai);
        const endDate = new Date(izin[0].tanggal_selesai);
        
        // Loop through each day in the permission period
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const currentDate = date.toISOString().split('T')[0];
          
          // Check if absensi exists for this date
          const [existingAbsensi] = await connection.execute(
            'SELECT id FROM absensi WHERE mahasiswa_id = ? AND DATE(tanggal) = ?',
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
        message: `Izin berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
      });

    } catch (error) {
      await connection.rollback();
      console.error('Update status izin error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memproses izin'
      });
    } finally {
      connection.release();
    }
  },

  // Get riwayat izin (continued...)
  getRiwayatIzin: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      
      const [riwayat] = await db.execute(
        `SELECT i.*, m.nama as mahasiswa_nama, a.nama as admin_nama,
           DATEDIFF(i.tanggal_selesai, i.tanggal_mulai) + 1 as total_hari
         FROM izin i
         JOIN mahasiswa m ON i.mahasiswa_id = m.id
         JOIN admin a ON i.admin_id = a.id
         WHERE i.mahasiswa_id = ?
         ORDER BY i.created_at DESC`,
        [mahasiswaId]
      );

      res.json({
        success: true,
        data: riwayat
      });

    } catch (error) {
      console.error('Get riwayat izin error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil riwayat izin'
      });
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
        query += ' AND DATE(a.tanggal) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      if (mahasiswaId) {
        query += ' AND m.id = ?';
        params.push(mahasiswaId);
      }

      if (status) {
        query += ' AND a.status_kehadiran = ?';
        params.push(status);
      }

      query += ' ORDER BY a.tanggal DESC, m.nama ASC';

      const [data] = await db.execute(query, params);

      // Calculate summary statistics
      const summary = {
        total_records: data.length,
        tepat_waktu: data.filter(r => r.status_masuk === 'tepat_waktu').length,
        telat: data.filter(r => r.status_masuk === 'telat').length,
        hadir: data.filter(r => r.status_kehadiran === 'hadir').length,
        izin: data.filter(r => r.status_kehadiran === 'izin').length,
        alpha: data.filter(r => r.status_kehadiran === 'alpha').length,
        dalam_radius: data.filter(r => r.dalam_radius).length,
        luar_radius: data.filter(r => !r.dalam_radius).length
      };

      res.json({
        success: true,
        data: data,
        summary: summary,
        filter: {
          startDate,
          endDate,
          mahasiswaId,
          status
        }
      });

    } catch (error) {
      console.error('Export absensi error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengexport data absensi'
      });
    }
  },

  // Get status absensi hari ini
  getStatusAbsensiHariIni: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const today = new Date().toISOString().split('T')[0];

      const [absensi] = await db.execute(
        `SELECT a.*, s.jam_masuk, s.jam_pulang
         FROM absensi a
         JOIN setting_absensi s ON a.setting_absensi_id = s.id
         WHERE a.mahasiswa_id = ? AND DATE(a.tanggal) = ?`,
        [mahasiswaId, today]
      );

      // Get active settings
      const [settings] = await db.execute(
        'SELECT * FROM setting_absensi WHERE is_active = true'
      );

      res.json({
        success: true,
        data: {
          absensi: absensi[0] || null,
          setting: settings[0] || null
        }
      });

    } catch (error) {
      console.error('Get status absensi hari ini error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil status absensi'
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
        longitude_pusat
      } = req.body;

      // Deactivate current active setting
      await connection.execute(
        'UPDATE setting_absensi SET is_active = false WHERE is_active = true'
      );

      // Create new setting
      await connection.execute(
        `INSERT INTO setting_absensi (
          jam_masuk, jam_pulang, batas_telat_menit,
          radius_meter, latitude_pusat, longitude_pusat,
          is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, true, ?)`,
        [jam_masuk, jam_pulang, batas_telat_menit,
         radius_meter, latitude_pusat, longitude_pusat,
         req.user.id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Setting absensi berhasil diupdate'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Update setting absensi error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat update setting absensi'
      });
    } finally {
      connection.release();
    }
  }
};

module.exports = absenController;