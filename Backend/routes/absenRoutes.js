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

// Export routes - pastikan ini ada sebelum middleware admin
router.post('/export-admin', auth.isAdmin, absenController.exportAbsensiAdmin);
router.post('/export-mahasiswa', auth.isMahasiswa, absenController.exportAbsensiMahasiswa);

// Dashboard routes
router.get('/dashboard/stats', auth.isAdmin, absenController.getDashboardStatisticsPerDay);
router.get('/dashboard', auth.isAdmin, absenController.getDashboardStats);

// Riwayat absensi routes
router.get('/riwayat', absenController.getRiwayatAbsensi);
router.get('/absensi', absenController.getAbsensi);
router.get('/riwayat/:id', absenController.getRiwayatAbsensi);

// Statistik routes
router.get('/statistics', absenController.getAbsensiStatistics);

// Izin routes
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

module.exports = router;