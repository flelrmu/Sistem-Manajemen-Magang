// middleware/auth.js

const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get updated user data
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User tidak valid'
        });
      }

      const user = users[0];

      // Get role specific data
      if (user.role === 'mahasiswa') {
        const [mahasiswa] = await db.execute(
          'SELECT * FROM mahasiswa WHERE user_id = ?',
          [user.id]
        );
        if (mahasiswa.length > 0) {
          user.mahasiswa_id = mahasiswa[0].id;
          user.admin_id = mahasiswa[0].admin_id;
        } else {
          return res.status(401).json({
            success: false,
            message: 'Data mahasiswa tidak ditemukan'
          });
        }
      } else if (user.role === 'admin') {
        const [admin] = await db.execute(
          'SELECT * FROM admin WHERE user_id = ?',
          [user.id]
        );
        if (admin.length > 0) {
          user.admin_id = admin[0].id;
        } else {
          return res.status(401).json({
            success: false,
            message: 'Data admin tidak ditemukan'
          });
        }
      }

      req.user = user;
      console.log('verifyToken - User:', {
        id: user.id,
        role: user.role,
        admin_id: user.admin_id,
        mahasiswa_id: user.mahasiswa_id
      });
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token sudah kadaluarsa'
        });
      }
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada autentikasi'
      });
    }
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    console.log('isAdmin check - User:', req.user);
    if (!req.user || req.user.role !== 'admin' || !req.user.admin_id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang diizinkan.'
      });
    }
    next();
  },

  // Check if user is mahasiswa
  isMahasiswa: (req, res, next) => {
    console.log('isMahasiswa check - User:', req.user);
    if (!req.user || req.user.role !== 'mahasiswa' || !req.user.mahasiswa_id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya mahasiswa yang diizinkan.'
      });
    }
    next();
  },

  // Check if admin owns the resource
  isResourceOwner: async (req, res, next) => {
    try {
      const adminId = req.user.admin_id;
      const resourceId = req.params.laporanId || req.params.id; // Support both parameter names
      const resource = req.baseUrl.split('/')[2];

      console.log('Resource owner check:', {
        adminId,
        resourceId,
        resource,
        baseUrl: req.baseUrl
      });

      let query;
      let queryParams = [resourceId, adminId];

      switch (resource) {
        case 'mahasiswa':
          query = 'SELECT id FROM mahasiswa WHERE id = ? AND admin_id = ?';
          break;
        case 'logbook':
          query = 'SELECT id FROM logbook WHERE id = ? AND admin_id = ?';
          break;
        case 'reports': // Handle both 'reports' and 'laporan'
        case 'laporan':
          query = 'SELECT id FROM laporan WHERE id = ? AND admin_id = ?';
          break;
        case 'izin':
        case 'permissions':
          query = 'SELECT id FROM izin WHERE id = ? AND admin_id = ?';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Resource type tidak valid'
          });
      }

      const [result] = await db.execute(query, queryParams);
      console.log('Resource owner query result:', result);

      if (result.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Resource tidak ditemukan atau bukan milik admin ini.'
        });
      }

      next();
    } catch (error) {
      console.error('Resource owner check error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi kepemilikan resource'
      });
    }
  },

  // Check if mahasiswa owns the resource
  isMahasiswaOwner: async (req, res, next) => {
    try {
      const mahasiswaId = req.user.mahasiswa_id;
      const resourceId = req.params.id;
      const resource = req.baseUrl.split('/')[2];

      console.log('Mahasiswa resource check:', {
        mahasiswaId,
        resourceId,
        resource
      });

      let query;
      switch (resource) {
        case 'logbook':
          query = 'SELECT id FROM logbook WHERE id = ? AND mahasiswa_id = ?';
          break;
        case 'reports':
        case 'laporan':
          query = 'SELECT id FROM laporan WHERE id = ? AND mahasiswa_id = ?';
          break;
        case 'permissions':
        case 'izin':
          query = 'SELECT id FROM izin WHERE id = ? AND mahasiswa_id = ?';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Resource type tidak valid'
          });
      }

      const [result] = await db.execute(query, [resourceId, mahasiswaId]);
      if (result.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Resource tidak ditemukan atau bukan milik mahasiswa ini.'
        });
      }

      next();
    } catch (error) {
      console.error('Mahasiswa resource check error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi kepemilikan resource'
      });
    }
  },

  // Verify user is active
  isActiveUser: (req, res, next) => {
    if (!req.user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif. Silahkan hubungi admin.'
      });
    }
    next();
  }
};

module.exports = authMiddleware;