const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder berdasarkan route
    const resource = req.baseUrl.split('/')[2];
    let uploadPath = 'uploads/';
    
    switch (resource) {
      case 'user':
        uploadPath += 'profiles';
        break;
      case 'reports':
        uploadPath += 'reports';
        break;
      case 'logbooks':
        uploadPath += 'logbooks';
        break;
      case 'permissions':
        uploadPath += 'permissions';
        break;
      default:
        uploadPath += 'others';
    }
    
    // Pastikan direktori ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filter file yang diizinkan
const fileFilter = (req, file, cb) => {
  // Tentukan tipe file yang diizinkan berdasarkan route
  const resource = req.baseUrl.split('/')[2];
  const allowedTypes = {
    'user': ['image/jpeg', 'image/png'],
    'reports': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'logbooks': ['image/jpeg', 'image/png', 'application/pdf'],
    'permissions': ['application/pdf', 'image/jpeg', 'image/png']
  };

  const fileTypes = allowedTypes[resource] || allowedTypes['user'];
  
  if (fileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Tipe yang diizinkan: ${fileTypes.join(', ')}`), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadMiddleware = {
  // Export konfigurasi multer
  upload,

  // Handle file upload errors
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran file melebihi batas maksimum (5MB)'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Error upload file: ${err.message}`
      });
    }
    
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Terjadi kesalahan saat upload file'
      });
    }
    
    next();
  },

  // Delete old file if exists
  deleteOldFile: async (req, res, next) => {
    try {
      if (!req.file) return next();

      const userId = req.user.id;
      const resource = req.baseUrl.split('/')[2];
      
      let query;
      let folder;

      switch (resource) {
        case 'user':
          query = 'SELECT photo_profile FROM users WHERE id = ?';
          folder = 'profiles';
          break;
        case 'reports':
          query = 'SELECT file_path FROM laporan WHERE mahasiswa_id = ? ORDER BY created_at DESC LIMIT 1';
          folder = 'reports';
          break;
        case 'logbooks':
          query = 'SELECT file_dokumentasi FROM logbook WHERE mahasiswa_id = ? ORDER BY created_at DESC LIMIT 1';
          folder = 'logbooks';
          break;
        case 'permissions':
          query = 'SELECT file_bukti FROM izin WHERE mahasiswa_id = ? ORDER BY created_at DESC LIMIT 1';
          folder = 'permissions';
          break;
        default:
          return next();
      }

      const [files] = await db.execute(query, [userId]);
      
      if (files.length > 0) {
        const oldFile = files[0].photo_profile || 
                       files[0].file_path || 
                       files[0].file_dokumentasi || 
                       files[0].file_bukti;

        if (oldFile) {
          const filePath = path.join(__dirname, '../uploads', folder, oldFile);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      next();
    } catch (error) {
      console.error('Delete old file error:', error);
      next(error);
    }
  },

  // Validate file type
  validateFileType: (allowedTypes) => (req, res, next) => {
    if (!req.file) return next();

    const mimeType = req.file.mimetype;
    if (!allowedTypes.includes(mimeType)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: `Tipe file tidak diizinkan. Tipe yang diizinkan: ${allowedTypes.join(', ')}`
      });
    }
    next();
  },

  // Create upload directories if not exist
  createUploadDirs: (req, res, next) => {
    const dirs = [
      'uploads/profiles',
      'uploads/reports',
      'uploads/logbooks',
      'uploads/permissions'
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    next();
  }
};

module.exports = uploadMiddleware;