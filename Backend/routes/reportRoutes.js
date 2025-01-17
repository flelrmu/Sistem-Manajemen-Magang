const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Ensure uploads directory exists
const uploadDir = 'uploads/reports';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for reports
  },
  fileFilter: function(req, file, cb) {
    // Accept only documents
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      req.fileValidationError = 'Invalid file type';
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

// All routes are protected
router.use(auth.verifyToken);

// Routes for both admin and mahasiswa
router.get('/:id?', reportController.getLaporan);
router.get('/progress/:id?', reportController.getProgressLaporan);

// Mahasiswa routes
router.post('/',
  auth.isMahasiswa,
  upload.single('file_laporan'),
  handleUploadError,
  validation.validateLaporan,
  validation.handleValidationErrors,
  reportController.submitLaporan
);

// Admin routes
router.use(auth.isAdmin);

router.post('/:laporanId/review',
  auth.isResourceOwner,
  upload.single('file_revisi'),
  handleUploadError,
  reportController.reviewLaporan
);

// Export data
router.get('/export',
  validation.validateDateRange,
  validation.handleValidationErrors,
  reportController.exportLaporan
);

module.exports = router;