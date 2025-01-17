const db = require('../config/database');
const geolib = require('geolib');

const absenController = {
  // Scan QR Code untuk absensi
  scanQR: async (req, res) => {
    try {
      const { qrData, latitude, longitude, deviceInfo } = req.body;

      // Decode QR data
      const decodedData = JSON.parse(qrData);
      const nim = decodedData.nim;

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
          message: 'Lokasi di luar radius yang diizinkan'
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
        SELECT a.*, s.jam_masuk, s.jam_pulang
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
          COUNT(CASE WHEN status_kehadiran = 'alpha' THEN 1 END) as alpha
         FROM absensi
         WHERE mahasiswa_id = ?
         ${bulan ? 'AND MONTH(tanggal) = ?' : ''}
         ${tahun ? 'AND YEAR(tanggal) = ?' : ''}`,
        [mahasiswaId, ...(bulan ? [bulan] : []), ...(tahun ? [tahun] : [])]
      );

      res.json({
        success: true,
        data: statistik[0]
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

      // Get admin_id from mahasiswa
      const [mahasiswa] = await db.execute(
        'SELECT admin_id FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

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

  // Get riwayat izin
  getRiwayatIzin: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;
      
      const [riwayat] = await db.execute(
        `SELECT i.*, m.nama as mahasiswa_nama, a.nama as admin_nama
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
          a.status_masuk,
          a.status_kehadiran,
          a.dalam_radius,
          a.device_info
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

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('Export absensi error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengexport data absensi'
      });
    }
  }
};

module.exports = absenController;