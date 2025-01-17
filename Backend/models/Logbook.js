const db = require('../config/database');
const path = require('path');
const fs = require('fs');

class Logbook {
  static async create(logbookData) {
    try {
      const {
        mahasiswa_id,
        admin_id,
        tanggal,
        aktivitas,
        progress,
        file_dokumentasi
      } = logbookData;

      const [result] = await db.execute(
        `INSERT INTO logbook (
          mahasiswa_id, admin_id, tanggal,
          aktivitas, progress, file_dokumentasi
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          mahasiswa_id, admin_id, tanggal,
          aktivitas, progress, file_dokumentasi
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [logbooks] = await db.execute(
        `SELECT l.*, m.nama as mahasiswa_nama, m.nim
         FROM logbook l
         JOIN mahasiswa m ON l.mahasiswa_id = m.id
         WHERE l.id = ?`,
        [id]
      );
      return logbooks[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByMahasiswa(mahasiswa_id, filters = {}) {
    try {
      let query = `
        SELECT l.*, a.nama as admin_nama
        FROM logbook l
        JOIN admin a ON l.admin_id = a.id
        WHERE l.mahasiswa_id = ?
      `;
      
      const queryParams = [mahasiswa_id];

      if (filters.status) {
        query += ' AND l.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.startDate && filters.endDate) {
        query += ' AND l.tanggal BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      }

      query += ' ORDER BY l.tanggal DESC, l.created_at DESC';

      const [logbooks] = await db.execute(query, queryParams);
      return logbooks;
    } catch (error) {
      throw error;
    }
  }

  static async findByAdmin(admin_id, filters = {}) {
    try {
      let query = `
        SELECT l.*, m.nama as mahasiswa_nama, m.nim
        FROM logbook l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?
      `;
      
      const queryParams = [admin_id];

      if (filters.status) {
        query += ' AND l.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.startDate && filters.endDate) {
        query += ' AND l.tanggal BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      }

      if (filters.mahasiswaId) {
        query += ' AND l.mahasiswa_id = ?';
        queryParams.push(filters.mahasiswaId);
      }

      query += ' ORDER BY l.tanggal DESC, l.created_at DESC';

      const [logbooks] = await db.execute(query, queryParams);
      return logbooks;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, statusData) {
    try {
      const { status, catatan_admin, paraf_admin } = statusData;

      const [result] = await db.execute(
        `UPDATE logbook 
         SET status = ?, catatan_admin = ?, paraf_admin = ?
         WHERE id = ?`,
        [status, catatan_admin, paraf_admin, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [logbook] = await db.execute(
        'SELECT file_dokumentasi FROM logbook WHERE id = ?',
        [id]
      );

      // Delete file if exists
      if (logbook[0]?.file_dokumentasi) {
        const filePath = path.join(__dirname, '../uploads/logbooks', logbook[0].file_dokumentasi);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const [result] = await db.execute(
        'DELETE FROM logbook WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(mahasiswa_id) {
    try {
      const [stats] = await db.execute(
        `SELECT 
          COUNT(*) as total_entries,
          AVG(progress) as avg_progress,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
         FROM logbook
         WHERE mahasiswa_id = ?`,
        [mahasiswa_id]
      );
      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkExistingEntry(mahasiswa_id, tanggal) {
    try {
      const [logbooks] = await db.execute(
        'SELECT id FROM logbook WHERE mahasiswa_id = ? AND tanggal = ?',
        [mahasiswa_id, tanggal]
      );
      return logbooks.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Logbook;