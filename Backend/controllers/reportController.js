const db = require('../config/database');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');


const reportController = {
  // Submit laporan
  submitLaporan: async (req, res) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const { versi, progress } = req.body;
      const filePath = req.file ? req.file.filename : null;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File laporan wajib diunggah'
        });
      }

      // Get admin_id from mahasiswa
      const [mahasiswa] = await db.execute(
        'SELECT admin_id FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

      if (!mahasiswa[0] || !mahasiswa[0].admin_id) {
        return res.status(400).json({
          success: false,
          message: 'Admin belum ditentukan untuk mahasiswa ini'
        });
      }

      // Check if version already exists
      const [existingVersion] = await db.execute(
        'SELECT id FROM laporan WHERE mahasiswa_id = ? AND versi = ?',
        [mahasiswaId, versi]
      );

      if (existingVersion.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Versi laporan ini sudah ada'
        });
      }

      await db.execute(
        `INSERT INTO laporan (
          mahasiswa_id, admin_id, versi,
          file_path, status, progress, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending_review', ?, NOW(), NOW())`,
        [mahasiswaId, mahasiswa[0].admin_id, versi, filePath, progress]
      );

      res.status(201).json({
        success: true,
        message: 'Laporan berhasil diunggah'
      });

    } catch (error) {
      console.error('Submit report error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengunggah laporan'
      });
    }
  },

  // Get laporan with filtering
  getLaporan: async (req, res) => {
    try {
      const isAdmin = req.user.role === 'admin';
      const userId = isAdmin ? req.user.admin_id : req.user.mahasiswa_id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let query = '';
      let countQuery = '';
      let queryParams = [];

      if (isAdmin) {
        query = `
          SELECT 
            l.*,
            m.nama as mahasiswa_nama,
            m.nim,
            DATE_FORMAT(l.created_at, '%Y-%m-%d') as tanggal_submit,
            a.nama as admin_nama
          FROM laporan l
          JOIN mahasiswa m ON l.mahasiswa_id = m.id
          LEFT JOIN admin a ON l.admin_id = a.id
          WHERE l.admin_id = ?
        `;
        countQuery = 'SELECT COUNT(DISTINCT l.id) as total FROM laporan l JOIN mahasiswa m ON l.mahasiswa_id = m.id WHERE l.admin_id = ?';
        queryParams = [userId];

        if (req.query.status) {
          query += ' AND l.status = ?';
          countQuery += ' AND l.status = ?';
          queryParams.push(req.query.status);
        }

        if (req.query.search) {
          query += ' AND (m.nama LIKE ? OR m.nim LIKE ?)';
          countQuery += ' AND (m.nama LIKE ? OR m.nim LIKE ?)';
          const searchTerm = `%${req.query.search}%`;
          queryParams.push(searchTerm, searchTerm);
        }

        if (req.query.startDate && req.query.endDate) {
          query += ' AND DATE(l.created_at) BETWEEN ? AND ?';
          countQuery += ' AND DATE(l.created_at) BETWEEN ? AND ?';
          queryParams.push(req.query.startDate, req.query.endDate);
        }
      } else {
        query = `
          SELECT l.*, m.nama as mahasiswa_nama 
          FROM laporan l
          JOIN mahasiswa m ON l.mahasiswa_id = m.id
          WHERE l.mahasiswa_id = ?
        `;
        countQuery = 'SELECT COUNT(DISTINCT l.id) as total FROM laporan l WHERE mahasiswa_id = ?';
        queryParams = [userId];
      }

      query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);

      const [reports] = await db.execute(query, queryParams);
      const [countResult] = await db.execute(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;

      const formattedReports = reports.map(report => ({
        ...report,
        file_path: report.file_path ? `/uploads/reports/${report.file_path}` : null,
        file_revisi_path: report.file_revisi_path ? `/uploads/reports/${report.file_revisi_path}` : null
      }));

      res.json({
        success: true,
        data: formattedReports,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });

    } catch (error) {
      console.error('Get laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data laporan',
        error: error.message
      });
    }
  },

  // Get mahasiswa list
  getMahasiswaList: async (req, res) => {
    try {
      const adminId = req.user.admin_id;
      
      const [mahasiswa] = await db.execute(`
        SELECT id, nama, nim
        FROM mahasiswa
        WHERE admin_id = ?
        ORDER BY nama ASC
      `, [adminId]);

      res.json({
        success: true,
        data: mahasiswa
      });

    } catch (error) {
      console.error('Get mahasiswa list error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data mahasiswa'
      });
    }
  },

  // Review laporan (untuk admin)
  reviewLaporan: async (req, res) => {
    try {
      const { laporanId } = req.params;
      const { status, feedback } = req.body;
      const fileRevisi = req.file ? req.file.filename : null;
      const adminId = req.user.admin_id;

      // Verify laporan belongs to admin
      const [laporan] = await db.execute(
        'SELECT * FROM laporan WHERE id = ? AND admin_id = ?',
        [laporanId, adminId]
      );

      if (laporan.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Laporan tidak ditemukan atau bukan milik admin ini'
        });
      }

      // Update laporan status
      await db.execute(
        `UPDATE laporan 
         SET status = ?,
             feedback = ?,
             file_revisi_path = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [status, feedback, fileRevisi, laporanId]
      );

      res.json({
        success: true,
        message: 'Review laporan berhasil disimpan'
      });

    } catch (error) {
      console.error('Review laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat review laporan'
      });
    }
  },

  // Get progress laporan
  getProgressLaporan: async (req, res) => {
    try {
      const mahasiswaId = req.params.id || req.user.mahasiswa_id;

      const [progress] = await db.execute(
        `SELECT
          COUNT(*) as total_versi,
          COUNT(CASE WHEN status = 'disetujui' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'perlu_revisi' THEN 1 END) as need_revision,
          MAX(progress) as progress_terakhir,
          MIN(created_at) as tanggal_mulai,
          MAX(updated_at) as update_terakhir
         FROM laporan
         WHERE mahasiswa_id = ?`,
        [mahasiswaId]
      );

      // Get deadline from mahasiswa table
      const [deadline] = await db.execute(
        'SELECT tanggal_selesai as deadline FROM mahasiswa WHERE id = ?',
        [mahasiswaId]
      );

      res.json({
        success: true,
        data: {
          ...progress[0],
          deadline: deadline[0]?.deadline
        }
      });

    } catch (error) {
      console.error('Get progress laporan error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil progress laporan'
      });
    }
  },

  // Get statistics for admin dashboard
  getStats: async (req, res) => {
    try {
      const adminId = req.user.admin_id;
      const { startDate, endDate, mahasiswaId, search } = req.query;
      
      let query = `
        SELECT
          COUNT(DISTINCT l.id) as total_laporan,
          COUNT(DISTINCT CASE WHEN l.status = 'disetujui' THEN l.id END) as disetujui,
          COUNT(DISTINCT CASE WHEN l.status = 'pending_review' THEN l.id END) as pending_review,
          COUNT(DISTINCT CASE WHEN l.status = 'perlu_revisi' THEN l.id END) as perlu_revisi,
          COALESCE(AVG(l.progress), 0) as avg_progress,
          MIN(l.created_at) as first_submit,
          MAX(l.created_at) as last_submit
        FROM laporan l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ?
      `;
      
      const params = [adminId];
      
      if (startDate && endDate) {
        query += ' AND DATE(l.created_at) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      if (mahasiswaId) {
        query += ' AND l.mahasiswa_id = ?';
        params.push(mahasiswaId);
      }
      
      if (search) {
        query += ' AND (m.nama LIKE ? OR m.nim LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const [summary] = await db.execute(query, params);

      res.json({
        success: true,
        summary: {
          ...summary[0],
          total_laporan: parseInt(summary[0].total_laporan) || 0,
          disetujui: parseInt(summary[0].disetujui) || 0,
          pending_review: parseInt(summary[0].pending_review) || 0,
          perlu_revisi: parseInt(summary[0].perlu_revisi) || 0,
          avg_progress: Math.round(summary[0].avg_progress) || 0
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil statistik laporan',
        error: error.message
      });
    }
  },

  exportLaporan: async (req, res) => {
    try {
      const adminId = req.user.admin_id;
      // Get admin name from database
      const [adminData] = await db.execute(
        'SELECT nama FROM admin WHERE id = ?',
        [adminId]
      );
      const adminName = adminData[0]?.nama || 'Admin';
      const { selectedIds } = req.body;
  
      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Pilih setidaknya satu laporan untuk diekspor'
        });
      }
  
      const placeholders = selectedIds.map(() => '?').join(',');
      const query = `
        SELECT
          m.nim,
          m.nama,
          l.versi,
          CASE
            WHEN l.status = 'pending_review' THEN 'Menunggu Review'
            WHEN l.status = 'perlu_revisi' THEN 'Perlu Revisi'
            WHEN l.status = 'disetujui' THEN 'Disetujui'
            ELSE l.status
          END as status,
          l.progress,
          COALESCE(l.feedback, '-') as feedback,
          DATE_FORMAT(l.created_at, '%d/%m/%Y') as tanggal_submit
        FROM laporan l
        JOIN mahasiswa m ON l.mahasiswa_id = m.id
        WHERE l.admin_id = ? AND l.id IN (${placeholders})
        ORDER BY l.created_at DESC, m.nama ASC
      `;
  
      const [data] = await db.execute(query, [adminId, ...selectedIds]);
  
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tidak ada data untuk diekspor'
        });
      }
  
      const doc = new PDFDocument({
        size: 'A4',
        margin: 60,
        bufferPages: true
      });
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Laporan_Mahasiswa_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
  
      // Header
      const createHeader = () => {
        const logoPath = path.join(__dirname, '../uploads/assets');
        const semenPadangLogo = path.join(logoPath, 'semen-padang-logo.png');
        const sigLogo = path.join(logoPath, 'sig-logo.png');
  
        if (fs.existsSync(semenPadangLogo)) {
          doc.image(semenPadangLogo, 60, 40, { width: 60 });
        }
        
        if (fs.existsSync(sigLogo)) {
          doc.image(sigLogo, 495, 40, { width: 60 });
        }
  
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('SISTEM MONITORING MAGANG', 160, 50, { align: 'center', width: 300 })
           .fontSize(14)
           .text('Laporan Akhir Magang', 160, 75, { align: 'center', width: 300 });
  
        doc.moveTo(60, 110)
           .lineTo(535, 110)
           .lineWidth(0.5)
           .strokeColor('#e0e0e0')
           .stroke();
      };
  
      createHeader();
  
      // Metadata
      const currentDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#444444')
         .moveDown(2.5)
         .text(`Tanggal Cetak: ${currentDate}`, 60)
         .moveDown(0.5)
         .text(`Dicetak oleh: ${adminName}`, 60)
         .moveDown(0.5)
         .text(`Total Data: ${data.length} laporan`, 60)
         .moveDown(1);
  
      // Table
      const tableHeaders = ['No', 'NIM', 'Nama', 'Versi', 'Status', 'Progress', 'Tanggal'];
      const colWidths = [40, 85, 110, 50, 90, 60, 65];
      const startX = 60;
      let yPos = doc.y;
  
      // Header row
      doc.fillColor('#f8f9fa')
         .roundedRect(startX, yPos, 500, 30, 3)
         .fill();
  
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor('#444444');
  
      let xPos = startX;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, yPos + 10, {
          width: colWidths[i],
          align: 'center'
        });
        xPos += colWidths[i];
      });
  
      // Data rows
      doc.font('Helvetica').fontSize(9);
  
      data.forEach((item, index) => {
        yPos += 35;
        
        if (yPos > 700) {
          doc.addPage();
          createHeader();
          yPos = 150;
        }
  
        // Alternating row backgrounds
        if (index % 2 === 0) {
          doc.fillColor('#fafafa')
             .roundedRect(startX, yPos, 500, 30, 2)
             .fill();
        }
  
        xPos = startX;
        const rowData = [
          (index + 1).toString(),
          item.nim,
          item.nama,
          item.versi,
          item.status,
          `${item.progress}%`,
          item.tanggal_submit
        ];
  
        rowData.forEach((text, i) => {
          const cellX = xPos;
          const cellWidth = colWidths[i];
  
          if (i === 4) { // Status column
            let statusColor = '#444444';
            let statusBg = '#ffffff';
            
            switch(text) {
              case 'Disetujui':
                statusColor = '#1a8754';
                statusBg = '#e8f5e9';
                break;
              case 'Perlu Revisi':
                statusColor = '#dc3545';
                statusBg = '#fee2e2';
                break;
              case 'Menunggu Review':
                statusColor = '#fd7e14';
                statusBg = '#fff3e0';
                break;
            }
  
            // Status pill
            const pillWidth = cellWidth - 10;
            const pillX = cellX + (cellWidth - pillWidth) / 2;
            
            doc.fillColor(statusBg)
               .roundedRect(pillX, yPos + 5, pillWidth, 20, 10)
               .fill()
               .fillColor(statusColor)
               .text(text, cellX, yPos + 8, {
                 width: cellWidth,
                 align: 'center'
               });
          } else {
            const align = i === 5 ? 'center' : (i === 0 ? 'center' : 'left');
            const padding = i === 0 ? 0 : 5;
            
            doc.fillColor('#444444')
               .text(text, cellX + padding, yPos + 8, {
                 width: cellWidth - (padding * 2),
                 align: align
               });
          }
          xPos += cellWidth;
        });
      });
  
      // Footer
      const createFooter = (pageNumber) => {
        const totalPages = doc.bufferedPageRange().count;
        doc.switchToPage(pageNumber);
        
        doc.moveTo(60, doc.page.height - 50)
           .lineTo(535, doc.page.height - 50)
           .lineWidth(0.5)
           .strokeColor('#e0e0e0')
           .stroke();
  
        doc.fontSize(8)
           .fillColor('#666666')
           .text(
             `PT Semen Padang - Sistem Monitoring Magang | Halaman ${pageNumber + 1} dari ${totalPages}`,
             60,
             doc.page.height - 35,
             { align: 'center' }
           );
      };
  
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        createFooter(i);
      }
  
      doc.end();
  
    } catch (error) {
      console.error('Export error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Gagal mengekspor data',
          error: error.message
        });
      }
    }
  }
};

module.exports = reportController;