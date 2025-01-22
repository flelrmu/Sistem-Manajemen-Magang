const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Configure multer storage for paraf uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads/paraf directory if it doesn't exist
    const uploadDir = 'uploads/paraf';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `paraf-${uniqueSuffix}${fileExt}`);
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
      const error = new Error('File harus berupa gambar (JPG, JPEG, atau PNG)');
      error.code = 'WRONG_FILE_TYPE';
      return cb(error, false);  
    }
    cb(null, true);
  }
});

// Public route for getting admin users list (used in registration)
router.get('/users', adminController.getAdminUsers);

// Protect all routes
router.use(auth.verifyToken);
router.use(auth.isAdmin);

// Update paraf route
router.put('/paraf', upload.single('paraf_image'), async (req, res) => {
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
      const oldParafPath = rows[0].paraf_image.toString(); // Convert Buffer to string if needed
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