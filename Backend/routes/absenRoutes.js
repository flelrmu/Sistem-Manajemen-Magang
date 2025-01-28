const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// QR Code scan
router.post('/scan',
  validation.validateAbsensi,
  validation.handleValidationErrors,
  absenController.scanQR
);

// Middleware untuk memverifikasi token untuk semua routes
router.use(auth.verifyToken);

router.get('/dashboard/stats', auth.isAdmin, absenController.getDashboardStatisticsPerDay);

router.get('/dashboard', auth.isAdmin, absenController.getDashboardStats);

// Route untuk riwayat absensi
router.get('/riwayat', absenController.getRiwayatAbsensi);

router.get('/absensi', absenController.getAbsensi);

// Route untuk riwayat absensi specific mahasiswa
router.get('/riwayat/:id', absenController.getRiwayatAbsensi);


// Route untuk statistik absensi
router.get('/statistics', absenController.getAbsensiStatistics);

// Routes untuk izin
router.post('/izin',
  auth.isMahasiswa,
  validation.validateIzin,
  absenController.submitIzin
);

router.get('/izin/riwayat/:id?', absenController.getRiwayatIzin);

// Admin only routes
router.use(auth.isAdmin);

router.put('/izin/:izinId/status',
  auth.isResourceOwner,
  absenController.updateStatusIzin
);

router.get('/export',
  validation.validateDateRange,
  absenController.exportAbsensi
);

module.exports = router;