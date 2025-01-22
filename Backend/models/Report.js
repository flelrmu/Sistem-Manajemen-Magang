const db = require('../config/database');
const path = require('path');
const fs = require('fs');

class Report {
  static async checkVersionExists(mahasiswaId, versi) {
    const connection = await db.getConnection();
    try {
      const [reports] = await connection.execute(
        'SELECT id FROM laporan WHERE mahasiswa_id = ? AND versi = ?',
        [mahasiswaId, versi]
      );
      return reports.length > 0;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async create(reportData) {
    const connection = await db.getConnection();
    try {
      const {
        mahasiswa_id,
        admin_id,
        versi,
        file_path,
        progress,
        catatan
      } = reportData;

      // Validate required fields
      if (!mahasiswa_id || !admin_id || !versi || !file_path) {
        throw new Error('Missing required fields');
      }

      const [result] = await connection.execute(
        `INSERT INTO laporan (
          mahasiswa_id, admin_id, versi,
          file_path, status, progress, catatan,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending_review', ?, ?, NOW(), NOW())`,
        [mahasiswa_id, admin_id, versi, file_path, progress || 0, catatan || '']
      );

      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await db.getConnection();
    try {
      const [reports] = await connection.execute(
        `SELECT l.*, m.nama as mahasiswa_nama, m.nim,
         DATE_FORMAT(l.created_at, '%d %b %Y') as tanggal_submit
         FROM laporan l
         JOIN mahasiswa m ON l.mahasiswa_id = m.id
         WHERE l.id = ?`,
        [id]
      );

      if (reports.length === 0) {
        return null;
      }

      return this.formatReportPaths(reports[0]);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByMahasiswa(mahasiswaId) {
    const connection = await db.getConnection();
    try {
      const [reports] = await connection.execute(
        `SELECT l.*, a.nama as admin_nama,
         DATE_FORMAT(l.created_at, '%d %b %Y') as tanggal_submit
         FROM laporan l
         JOIN admin a ON l.admin_id = a.id
         WHERE l.mahasiswa_id = ?
         ORDER BY l.created_at DESC`,
        [mahasiswaId]
      );

      return reports.map(report => this.formatReportPaths(report));
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByAdmin(adminId, filters = {}) {
    const connection = await db.getConnection();
    try {
      let query = `
        SELECT l.*, m.nama as mahasiswa_nama, m.nim,
        DATE_FORMAT(l.created_at, '%d %b %Y') as tanggal_submit
        FROM laporan l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?`;

      const queryParams = [adminId];

      // Add filters
      if (filters.status) {
        query += ' AND l.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.mahasiswaId) {
        query += ' AND l.mahasiswa_id = ?';
        queryParams.push(filters.mahasiswaId);
      }

      if (filters.startDate && filters.endDate) {
        query += ' AND DATE(l.created_at) BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      }

      query += ' ORDER BY l.created_at DESC';

      const [reports] = await connection.execute(query, queryParams);
      return reports.map(report => this.formatReportPaths(report));
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getProgress(mahasiswaId) {
    const connection = await db.getConnection();
    try {
      const [progress] = await connection.execute(
        `SELECT
          COUNT(*) as total_versi,
          MAX(progress) as progress_terakhir,
          COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'perlu_revisi' THEN 1 END) as need_revision,
          COUNT(CASE WHEN status = 'disetujui' THEN 1 END) as approved,
          MIN(created_at) as tanggal_mulai,
          MAX(updated_at) as update_terakhir
         FROM laporan
         WHERE mahasiswa_id = ?`,
        [mahasiswaId]
      );

      return progress[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getDeadline(mahasiswaId) {
    const connection = await db.getConnection();
    try {
      const [deadlines] = await connection.execute(
        'SELECT tanggal_selesai FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );
      return deadlines[0]?.tanggal_selesai;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, statusData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const { status, feedback, file_revisi_path } = statusData;

      // Get existing report
      const [oldReport] = await connection.execute(
        'SELECT file_revisi_path FROM laporan WHERE id = ?',
        [id]
      );

      // Delete old revision file if exists
      if (oldReport[0]?.file_revisi_path) {
        const oldFilePath = path.join(__dirname, '../uploads/reports', oldReport[0].file_revisi_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update report status
      const [result] = await connection.execute(
        `UPDATE laporan
         SET status = ?, feedback = ?, file_revisi_path = ?,
         updated_at = NOW()
         WHERE id = ?`,
        [status, feedback, file_revisi_path, id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get file paths
      const [report] = await connection.execute(
        'SELECT file_path, file_revisi_path FROM laporan WHERE id = ?',
        [id]
      );

      // Delete files if they exist
      if (report[0]) {
        if (report[0].file_path) {
          const mainFilePath = path.join(__dirname, '../uploads/reports', report[0].file_path);
          if (fs.existsSync(mainFilePath)) {
            fs.unlinkSync(mainFilePath);
          }
        }
        if (report[0].file_revisi_path) {
          const revisionFilePath = path.join(__dirname, '../uploads/reports', report[0].file_revisi_path);
          if (fs.existsSync(revisionFilePath)) {
            fs.unlinkSync(revisionFilePath);
          }
        }
      }

      // Delete database record
      const [result] = await connection.execute(
        'DELETE FROM laporan WHERE id = ?',
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Helper method to format file paths
  static formatReportPaths(report) {
    return {
      ...report,
      file_path: report.file_path ? `/uploads/reports/${report.file_path}` : null,
      file_revisi_path: report.file_revisi_path ? `/uploads/reports/${report.file_revisi_path}` : null
    };
  }
}

module.exports = Report;