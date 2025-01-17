const db = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    try {
      const {
        mahasiswa_id,
        setting_absensi_id,
        tanggal,
        waktu_masuk,
        status_masuk,
        status_kehadiran,
        latitude_scan,
        longitude_scan,
        dalam_radius,
        device_info
      } = attendanceData;

      const [result] = await db.execute(
        `INSERT INTO absensi (
          mahasiswa_id, setting_absensi_id, tanggal,
          waktu_masuk, status_masuk, status_kehadiran,
          latitude_scan, longitude_scan, dalam_radius,
          device_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mahasiswa_id, setting_absensi_id, tanggal,
          waktu_masuk, status_masuk, status_kehadiran,
          latitude_scan, longitude_scan, dalam_radius,
          device_info
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateCheckout(id, waktu_keluar) {
    try {
      const [result] = await db.execute(
        'UPDATE absensi SET waktu_keluar = ? WHERE id = ?',
        [waktu_keluar, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findByMahasiswaAndDate(mahasiswa_id, tanggal) {
    try {
      const [attendances] = await db.execute(
        `SELECT a.*, s.jam_masuk, s.jam_pulang
         FROM absensi a
         JOIN setting_absensi s ON a.setting_absensi_id = s.id
         WHERE a.mahasiswa_id = ? AND DATE(a.tanggal) = ?`,
        [mahasiswa_id, tanggal]
      );
      return attendances[0];
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(mahasiswa_id, startDate, endDate) {
    try {
      const [statistics] = await db.execute(
        `SELECT 
          COUNT(*) as total_hari,
          COUNT(CASE WHEN status_masuk = 'tepat_waktu' THEN 1 END) as tepat_waktu,
          COUNT(CASE WHEN status_masuk = 'telat' THEN 1 END) as telat,
          COUNT(CASE WHEN status_kehadiran = 'izin' THEN 1 END) as izin,
          COUNT(CASE WHEN status_kehadiran = 'alpha' THEN 1 END) as alpha
         FROM absensi
         WHERE mahasiswa_id = ?
         ${startDate && endDate ? 'AND tanggal BETWEEN ? AND ?' : ''}`,
        startDate && endDate ? [mahasiswa_id, startDate, endDate] : [mahasiswa_id]
      );
      return statistics[0];
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyReport(mahasiswa_id, year, month) {
    try {
      const [report] = await db.execute(
        `SELECT 
          DATE_FORMAT(tanggal, '%Y-%m-%d') as tanggal,
          status_masuk,
          status_kehadiran,
          TIME_FORMAT(waktu_masuk, '%H:%i:%s') as waktu_masuk,
          TIME_FORMAT(waktu_keluar, '%H:%i:%s') as waktu_keluar,
          dalam_radius
         FROM absensi
         WHERE mahasiswa_id = ?
         AND YEAR(tanggal) = ?
         AND MONTH(tanggal) = ?
         ORDER BY tanggal ASC`,
        [mahasiswa_id, year, month]
      );
      return report;
    } catch (error) {
      throw error;
    }
  }

  static async getAttendanceSetting() {
    try {
      const [settings] = await db.execute(
        'SELECT * FROM setting_absensi WHERE is_active = true LIMIT 1'
      );
      return settings[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateAttendanceSetting(settingData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deactivate all current settings
      await connection.execute(
        'UPDATE setting_absensi SET is_active = false'
      );

      // Insert new setting
      const {
        jam_masuk,
        jam_pulang,
        batas_telat_menit,
        radius_meter,
        latitude_pusat,
        longitude_pusat
      } = settingData;

      await connection.execute(
        `INSERT INTO setting_absensi (
          jam_masuk, jam_pulang, batas_telat_menit,
          radius_meter, latitude_pusat, longitude_pusat,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, true)`,
        [
          jam_masuk, jam_pulang, batas_telat_menit,
          radius_meter, latitude_pusat, longitude_pusat
        ]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Attendance;