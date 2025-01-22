const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const logbookController = require('../controllers/logbookController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logbooks';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logbook-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept only certain file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Wrong file type');
      error.code = 'WRONG_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

// Protected Routes - Semua route membutuhkan authentication
router.use(auth.verifyToken);

// Routes
router.post('/', 
  upload.single('file_dokumentasi'),
  logbookController.submitLogbook
);

router.get('/stats', logbookController.getLogbookStatusStats);


router.get('/export/:mahasiswaId?', logbookController.downloadLogbook);

router.get('/export', logbookController.downloadLogbook);         
router.get('/', logbookController.getLogbook);                   
router.get('/:logbookId', logbookController.getLogbookDetail);   
router.get('/:logbookId/preview', logbookController.previewLogbook);

// Routes untuk update logbook
router.put('/:logbookId/status', 
  auth.isAdmin, 
  auth.isResourceOwner, 
  logbookController.updateLogbookStatus
);

// Route untuk update logbook yang direject (dengan file upload)
router.put('/:logbookId', logbookController.updateRejectedLogbook);

router.delete('/:logbookId',
  auth.verifyToken,
  logbookController.deleteLogbook
);

module.exports = router;