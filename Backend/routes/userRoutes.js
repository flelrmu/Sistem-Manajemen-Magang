const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Ensure upload directory exists
const uploadDir = 'uploads/profiles';
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
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
        message: 'File terlalu besar. Maksimal 5MB'
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

// Protect all routes
router.use(auth.verifyToken);
router.use(auth.isMahasiswa);

// Profile routes
router.get('/profile', userController.getProfile);

router.put('/profile',
  upload.single('photo_profile'),
  handleUploadError,
  validation.validateUpdateProfile,
  validation.handleValidationErrors,
  userController.updateProfile
);

// QR Code route
router.get('/qrcode', userController.getQRCode);

// Dashboard route
router.get('/dashboard/summary', userController.getDashboardSummary);

module.exports = router;