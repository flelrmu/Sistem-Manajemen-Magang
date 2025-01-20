const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logbookController = require('../controllers/logbookController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Pastikan direktori uploads/logbooks ada
const uploadDir = 'uploads/logbooks';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Protected Routes - Semua route membutuhkan authentication
router.use(auth.verifyToken);

// Routes
router.get('/', logbookController.getLogbook);
router.get('/:logbookId', logbookController.getLogbookDetail);

router.post('/',
  auth.isMahasiswa,
  upload.upload.single('file_dokumentasi'),
  upload.handleUploadError,
  logbookController.submitLogbook
);

router.put('/:logbookId/status',
  auth.isAdmin,
  auth.isResourceOwner,
  logbookController.updateLogbookStatus
);

router.delete('/:logbookId',
  auth.verifyToken,
  logbookController.deleteLogbook
);

module.exports = router;