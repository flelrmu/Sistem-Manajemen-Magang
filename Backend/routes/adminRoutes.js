const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Wrong file type');
      error.code = 'WRONG_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

// Protect all routes
router.use(auth.verifyToken);
router.use(auth.isAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Profile management
router.put('/profile',
  upload.single('photo_profile'),
  (error, req, res, next) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB'
        });
      }
      if (error.code === 'WRONG_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          message: 'Tipe file tidak diizinkan. Gunakan JPG, JPEG, atau PNG'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error saat upload file'
      });
    }
    next();
  },
  validation.validateUpdateProfile,
  validation.handleValidationErrors,
  adminController.updateProfile
);

// Validation code
router.post('/generate-validation-code', adminController.generateValidationCode);

// Mahasiswa management
router.get('/mahasiswa', adminController.getMahasiswa);

router.post('/mahasiswa',
  validation.validateRegister,
  validation.handleValidationErrors,
  adminController.createMahasiswa
);

router.put('/mahasiswa/:id/status',
  auth.isResourceOwner,
  adminController.updateMahasiswaStatus
);

module.exports = router;