const db = require('../config/database');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const fs = require('fs');
const userController = require('../controllers/userController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
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
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
    }
    cb(null, true);
  }
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error saat upload file'
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Public route for getting admin users list (used in registration)
router.get('/users', adminController.getAdminUsers);
router.get('/institutions', adminController.getInstitutions);

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
// Profile routes
router.put('/profile',
  auth.verifyToken,
  auth.isAdmin,
  upload.single('photo_profile'),
  handleMulterError,
  adminController.updateProfile
);

router.get('/profile',
  auth.verifyToken,
  auth.isAdmin,
  adminController.getProfile
);

router.post('/institutions', 
  auth.verifyToken,
  auth.isAdmin,
  adminController.addInstitution
);



// Validation code
router.post('/generate-validation-code', adminController.generateValidationCode);

// Configure multer storage for paraf
const parafStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'paraf');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'paraf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadParaf = multer({
  storage: parafStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
    }
    cb(null, true);
  }
});

// Update paraf route
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
    if (rows[0]?.paraf_image) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'paraf', rows[0].paraf_image.split('/').pop());
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store relative path in database
    const relativePath = `uploads/paraf/${req.file.filename}`;

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