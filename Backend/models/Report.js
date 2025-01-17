const db = require('../config/database');
const path = require('path');
const fs = require('fs');

class Report {
  static async create(reportData) {
    try {
      const {
        mahasiswa_id,
        admin_id,
        versi,
        file_path,
        progress
      } = reportData;

      const [result] = await db.execute(
        `INSERT INTO laporan (
          mahasiswa_id, admin_id, versi,
          file_path, status, progress
        ) VALUES (?, ?, ?, ?, 'pending_review', ?)`,
        [mahasiswa_id, admin_id, versi, file_path, progress]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [reports] = await db.execute(
        `SELECT l.*, m.nama as mahasiswa_nama, m.nim
         FROM laporan l
         JOIN mahasiswa m ON l.mahasiswa_id = m.id
         WHERE l.id = ?`,
        [id]
      );
      return reports[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByMahasiswa(mahasiswa_id) {
    try {
      const [reports] = await db.execute(
        `SELECT l.*, a.nama as admin_nama
         FROM laporan l
         JOIN admin a ON l.admin_id = a.id
         WHERE l.mahasiswa_id = ?
         ORDER BY l.created_at DESC`,
        [mahasiswa_id]
      );
      return reports;
    } catch (error) {
      throw error;
    }
  }

  static async findByAdmin(admin_id, filters = {}) {
    try {
      let query = `
        SELECT l.*, m.nama as mahasiswa_nama, m.nim
        FROM laporan l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?
      `;
      
      const queryParams = [admin_id];

      if (filters.status) {
        query += ' AND l.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.mahasiswaId) {
        query += ' AND l.mahasiswa_id = ?';
        queryParams.push(filters.mahasiswaId);
      }

      query += ' ORDER BY l.created_at DESC';

      const [reports] = await db.execute(query, queryParams);
      return reports;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, statusData) {
    try {
      const { status, feedback, file_revisi_path } = statusData;

      const [result] = await db.execute(
        `UPDATE laporan 
         SET status = ?, feedback = ?, file_revisi_path = ?
         WHERE id = ?`,
        [status, feedback, file_revisi_path, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [report] = await db.execute(
        'SELECT file_path, file_revisi_path FROM laporan WHERE id = ?',
        [id]
      );

      // Delete main file if exists
      if (report[0]?.file_path) {
        const mainFilePath = path.join(__dirname, '../uploads/reports', report[0].file_path);
        if (fs.existsSync(mainFilePath)) {
          fs.unlinkSync(mainFilePath);
        }
      }

      // Delete revision file if exists
      if (report[0]?.file_revisi_path) {
        const revisionFilePath = path.join(__dirname, '../uploads/reports', report[0].file_revisi_path);
        if (fs.existsSync(revisionFilePath)) {
          fs.unlinkSync(revisionFilePath);
        }
      }

      const [result] = await db.execute(
        'DELETE FROM laporan WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getProgress(mahasiswa_id) {
    try {
      const [progress] = await db.execute(
        `SELECT 
          COUNT(*) as total_versions,
          MAX(progress) as latest_progress,
          COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'perlu_revisi' THEN 1 END) as need_revision,
          COUNT(CASE WHEN status = 'disetujui' THEN 1 END) as approved
         FROM laporan
         WHERE mahasiswa_id = ?`,
        [mahasiswa_id]
      );
      return progress[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkVersionExists(mahasiswa_id, versi) {
    try {
      const [reports] = await db.execute(
        'SELECT id FROM laporan WHERE mahasiswa_id = ? AND versi = ?',
        [mahasiswa_id, versi]
      );
      return reports.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Report;