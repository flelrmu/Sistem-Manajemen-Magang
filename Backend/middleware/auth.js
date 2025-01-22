const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Token received:', token);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Get updated user data with role-specific information
      let userData;

      if (decoded.role === 'mahasiswa') {
        const [users] = await db.execute(
          `SELECT u.*, m.id as mahasiswa_id, m.admin_id, m.nama, m.nim 
           FROM users u 
           JOIN mahasiswa m ON u.id = m.user_id 
           WHERE u.id = ?`,
          [decoded.id]
        );
        userData = users[0];
      } else if (decoded.role === 'admin') {
        const [users] = await db.execute(
          `SELECT u.*, a.id as admin_id, a.nama 
           FROM users u 
           JOIN admin a ON u.id = a.user_id 
           WHERE u.id = ?`,
          [decoded.id]
        );
        userData = users[0];
      }

      if (!userData) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      console.log('User data:', userData);
      req.user = userData;
      next();

    } catch (error) {
      console.error('Auth middleware error:', error);
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
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada autentikasi'
      });
    }
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang diizinkan.'
      });
    }
    next();
  },

  // Check if user is mahasiswa
  isMahasiswa: (req, res, next) => {
    if (req.user.role !== 'mahasiswa') {
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
      const resourceId = req.params.logbookId || req.params.id;
      
      if (!resourceId || !adminId) {
        return res.status(400).json({
          success: false,
          message: 'Parameter ID tidak valid'
        });
      }
      const resource = req.baseUrl.split('/')[2]; // e.g., /api/mahasiswa -> mahasiswa

      let query;
      switch (resource) {
        case 'mahasiswa':
          query = 'SELECT id FROM mahasiswa WHERE id = ? AND admin_id = ?';
          break;
        case 'logbook':
          query = 'SELECT id FROM logbook WHERE id = ? AND admin_id = ?';
          break;
        case 'laporan':
          query = 'SELECT id FROM laporan WHERE id = ? AND admin_id = ?';
          break;
        case 'izin':
          query = 'SELECT id FROM izin WHERE id = ? AND admin_id = ?';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Resource type tidak valid'
          });
      }

      const [result] = await db.execute(query, [resourceId, adminId]);

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
  }
};

module.exports = authMiddleware;