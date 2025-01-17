const { body, param, query, validationResult } = require('express-validator');

const validationMiddleware = {
  // Validate registration input
  validateRegister: [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password minimal 6 karakter')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
      .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
    body('nim').notEmpty().withMessage('NIM wajib diisi'),
    body('nama').notEmpty().withMessage('Nama wajib diisi'),
    body('institusi').notEmpty().withMessage('Institusi wajib diisi'),
    body('tanggal_mulai').isDate().withMessage('Tanggal mulai tidak valid'),
    body('tanggal_selesai').isDate().withMessage('Tanggal selesai tidak valid'),
  ],

  // Validate login input
  validateLogin: [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
  ],

  // Validate absensi input
  validateAbsensi: [
    body('qrData').notEmpty().withMessage('QR data wajib diisi'),
    body('latitude').isFloat().withMessage('Latitude tidak valid'),
    body('longitude').isFloat().withMessage('Longitude tidak valid'),
    body('deviceInfo').notEmpty().withMessage('Device info wajib diisi'),
  ],

  // Validate izin input
  validateIzin: [
    body('tanggal_mulai').isDate().withMessage('Tanggal mulai tidak valid'),
    body('tanggal_selesai').isDate().withMessage('Tanggal selesai tidak valid'),
    body('kategori').notEmpty().withMessage('Kategori wajib diisi'),
    body('keterangan').notEmpty().withMessage('Keterangan wajib diisi'),
  ],

  // Validate logbook input
  validateLogbook: [
    body('tanggal').isDate().withMessage('Tanggal tidak valid'),
    body('aktivitas').notEmpty().withMessage('Aktivitas wajib diisi'),
    body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress harus antara 0-100'),
  ],

  // Validate laporan input
  validateLaporan: [
    body('versi').notEmpty().withMessage('Versi wajib diisi'),
    body('progress').isFloat({ min: 0, max: 100 }).withMessage('Progress harus antara 0-100'),
  ],

  // Validate update profile
  validateUpdateProfile: [
    body('email').optional().isEmail().withMessage('Email tidak valid'),
    body('no_telepon')
      .optional()
      .matches(/^[\d\-+\s()]{10,15}$/)
      .withMessage('Nomor telepon tidak valid'),
    body('alamat').optional().notEmpty().withMessage('Alamat tidak boleh kosong'),
  ],

  // Validate date range query
  validateDateRange: [
    query('startDate').optional().isDate().withMessage('Format tanggal awal tidak valid'),
    query('endDate').optional().isDate().withMessage('Format tanggal akhir tidak valid'),
  ],

  // Validate pagination query
  validatePagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Halaman harus berupa angka positif'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit harus berupa angka positif'),
  ],

  // Handle validation errors
  handleValidationErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  },

  // Custom validators
  validatePassword: body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),

  validateEmail: body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail(),

  validateDate: (field) => 
    body(field)
      .isDate()
      .withMessage('Format tanggal tidak valid')
      .custom((value, { req }) => {
        const date = new Date(value);
        const now = new Date();
        if (date < now) {
          throw new Error('Tanggal tidak boleh kurang dari hari ini');
        }
        return true;
      }),

  validateDateRange: (startField, endField) => [
    body(startField)
      .isDate()
      .withMessage('Format tanggal mulai tidak valid'),
    body(endField)
      .isDate()
      .withMessage('Format tanggal selesai tidak valid')
      .custom((value, { req }) => {
        const startDate = new Date(req.body[startField]);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('Tanggal selesai harus setelah tanggal mulai');
        }
        return true;
      }),
  ]
};

module.exports = validationMiddleware;