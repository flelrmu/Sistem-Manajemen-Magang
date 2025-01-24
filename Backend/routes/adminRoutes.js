const db = require('../config/database');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const fs = require('fs');

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

// Public route for getting admin users list (used in registration)
router.get('/users', adminController.getAdminUsers);

// Protect all routes below this point
router.use(auth.verifyToken);
router.use(auth.isAdmin);

router.put('/mahasiswa/:id', adminController.updateMahasiswa);
router.delete('/mahasiswa/:id', adminController.deleteMahasiswa);


// Update admin password
router.put('/profile/password', adminController.updatePassword);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

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

router.get('/institutions', adminController.getInstitutions);


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

// Update paraf route
// Configure multer storage for paraf
const parafStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/paraf/';
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'paraf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload for paraf
const uploadParaf = multer({ 
  storage: parafStorage,
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

// Update paraf route with new configuration
router.put('/paraf', uploadParaf.single('paraf_image'), async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File paraf tidak ditemukan'
      });
    }

    const adminId = req.user.admin_id;
    
    // Get the old paraf image path
    const [rows] = await connection.execute(
      'SELECT paraf_image FROM admin WHERE id = ?',
      [adminId]
    );

    // Delete old paraf file if it exists
    if (rows[0] && rows[0].paraf_image) {
      const oldParafPath = rows[0].paraf_image.toString();
      const oldPath = path.join(__dirname, '..', oldParafPath);
      
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log('Old paraf deleted successfully');
        } catch (err) {
          console.error('Error deleting old paraf:', err);
        }
      }
    }

    // Store the relative path in database
    const relativePath = req.file.path.replace(/\\/g, '/');
    console.log('New paraf path:', relativePath);

    await connection.execute(
      'UPDATE admin SET paraf_image = ? WHERE id = ?',
      [relativePath, adminId]
    );

    res.json({
      success: true,
      message: 'Paraf berhasil diupload',
      data: {
        paraf_url: relativePath
      }
    });

  } catch (error) {
    console.error('Upload paraf error:', error);
    // Delete uploaded file if database update fails
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting failed upload:', err);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengupload paraf'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;