// backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const uploadMiddleware = require('../middleware/upload');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Middleware untuk menghandle file static dengan validasi
const serveFile = async (req, res, next) => {
  try {
    const filePath = req.params[0]; // Ambil full path dari URL
    const absolutePath = path.resolve(__dirname, '../uploads/reports', filePath);

    // Validasi path untuk mencegah directory traversal
    if (!absolutePath.startsWith(path.resolve(__dirname, '../uploads/reports'))) {
      return res.status(403).json({
        success: false,
        message: 'Akses file tidak diizinkan'
      });
    }

    // Cek apakah file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);

    // Stream file ke response
    const stream = fs.createReadStream(absolutePath);
    stream.pipe(res);

  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengakses file'
    });
  }
};

// Route untuk mengakses file
router.get('/uploads/reports/*', auth.verifyToken, serveFile);

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Hanya file PDF dan Word yang diizinkan'), false);
    }
    cb(null, true);
  }
});

// Error handling middleware for file upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error pada upload file'
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat upload file'
    });
  }
  next();
};

// Add this route handler for file downloads
router.get('/download/:type/:filename', auth.verifyToken, async (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, `../uploads/${type}`, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    // Get file mime type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengunduh file'
    });
  }
});

// Protect all routes
router.use(auth.verifyToken);

// Admin routes
router.get('/stats',
  auth.isAdmin,
  reportController.getStats
);

router.get('/mahasiswa',
  auth.isAdmin,
  reportController.getMahasiswaList
);

router.get('/export',
  auth.isAdmin,
  validation.validateDateRange,
  validation.handleValidationErrors,
  reportController.exportLaporan
);

// Routes for both admin and mahasiswa
router.get('/progress/:id?',
  reportController.getProgressLaporan
);

router.get('/:id?',
  reportController.getLaporan
);

// Mahasiswa routes
router.post('/',
  auth.isMahasiswa,
  uploadMiddleware.upload.single('file_laporan'),
  uploadMiddleware.handleUploadError,
  validation.validateLaporan,
  validation.handleValidationErrors,
  reportController.submitLaporan
);

// Admin review routes
router.post('/:laporanId/review',
  auth.isAdmin,
  auth.isResourceOwner,
  uploadMiddleware.upload.single('file_revisi'),
  uploadMiddleware.handleUploadError,
  reportController.reviewLaporan
);

// reportRoutes.js
router.post('/export', auth.verifyToken, auth.isAdmin, reportController.exportLaporan);

module.exports = router;