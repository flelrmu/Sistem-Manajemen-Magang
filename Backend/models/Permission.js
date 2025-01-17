const db = require('../config/database');

class Permission {
  static async create(permissionData) {
    try {
      const {
        mahasiswa_id,
        admin_id,
        tanggal_mulai,
        tanggal_selesai,
        kategori,
        keterangan,
        file_bukti
      } = permissionData;

      const [result] = await db.execute(
        `INSERT INTO izin (
          mahasiswa_id, admin_id, tanggal_mulai,
          tanggal_selesai, kategori, keterangan,
          file_bukti, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          mahasiswa_id, admin_id, tanggal_mulai,
          tanggal_selesai, kategori, keterangan,
          file_bukti
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [permissions] = await db.execute(
        `SELECT i.*, m.nama as mahasiswa_nama, a.nama as admin_nama
         FROM izin i
         JOIN mahasiswa m ON i.mahasiswa_id = m.id
         JOIN admin a ON i.admin_id = a.id
         WHERE i.id = ?`,
        [id]
      );
      return permissions[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByMahasiswa(mahasiswa_id) {
    try {
      const [permissions] = await db.execute(
        `SELECT i.*, a.nama as admin_nama
         FROM izin i
         JOIN admin a ON i.admin_id = a.id
         WHERE i.mahasiswa_id = ?
         ORDER BY i.created_at DESC`,
        [mahasiswa_id]
      );
      return permissions;
    } catch (error) {
      throw error;
    }
  }

  static async findByAdmin(admin_id, filters = {}) {
    try {
      let query = `
        SELECT i.*, m.nama as mahasiswa_nama, m.nim
        FROM izin i
        JOIN mahasiswa m ON i.mahasiswa_id = m.id
        WHERE i.admin_id = ?
      `;
      
      const queryParams = [admin_id];

      if (filters.status) {
        query += ' AND i.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.startDate && filters.endDate) {
        query += ' AND i.tanggal_mulai BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      }

      if (filters.mahasiswaId) {
        query += ' AND i.mahasiswa_id = ?';
        queryParams.push(filters.mahasiswaId);
      }

      query += ' ORDER BY i.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(filters.limit));
      }

      const [permissions] = await db.execute(query, queryParams);
      return permissions;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, statusData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { status, alasan_response } = statusData;

      // Update permission status
      await connection.execute(
        'UPDATE izin SET status = ?, alasan_response = ? WHERE id = ?',
        [status, alasan_response, id]
      );

      // If approved, update attendance records
      if (status === 'approved') {
        const [permission] = await connection.execute(
          'SELECT * FROM izin WHERE id = ?',
          [id]
        );

        if (permission.length > 0) {
          const { mahasiswa_id, tanggal_mulai, tanggal_selesai } = permission[0];
          
          // Get all dates between start and end date
          const dates = [];
          let currentDate = new Date(tanggal_mulai);
          const endDate = new Date(tanggal_selesai);
          
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Update or create attendance records for each date
          for (const date of dates) {
            const formattedDate = date.toISOString().split('T')[0];
            
            // Check if attendance record exists
            const [existingAttendance] = await connection.execute(
              'SELECT id FROM absensi WHERE mahasiswa_id = ? AND DATE(tanggal) = ?',
              [mahasiswa_id, formattedDate]
            );

            if (existingAttendance.length > 0) {
              // Update existing record
              await connection.execute(
                'UPDATE absensi SET status_kehadiran = "izin" WHERE id = ?',
                [existingAttendance[0].id]
              );
            } else {
              // Create new record
              await connection.execute(
                `INSERT INTO absensi (
                  mahasiswa_id, setting_absensi_id, tanggal,
                  status_kehadiran, dalam_radius
                ) VALUES (?, 
                  (SELECT id FROM setting_absensi WHERE is_active = 1 LIMIT 1),
                  ?, 'izin', true)`,
                [mahasiswa_id, formattedDate]
              );
            }
          }
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      const [permission] = await db.execute(
        'SELECT file_bukti FROM izin WHERE id = ?',
        [id]
      );

      // Delete file if exists
      if (permission[0]?.file_bukti) {
        const filePath = path.join(__dirname, '../uploads/permissions', permission[0].file_bukti);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const [result] = await db.execute(
        'DELETE FROM izin WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(admin_id) {
    try {
      const [stats] = await db.execute(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
         FROM izin
         WHERE admin_id = ?`,
        [admin_id]
      );
      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Permission;