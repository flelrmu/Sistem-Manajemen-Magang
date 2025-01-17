const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const qr = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const authController = {
  // Register mahasiswa baru
  register: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const {
        email,
        password,
        nim,
        nama,
        institusi,
        jenis_kelamin,
        alamat,
        no_telepon,
        tanggal_mulai,
        tanggal_selesai,
        admin_id
      } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate QR Code content (data mahasiswa)
      const qrContent = JSON.stringify({
        nim,
        nama,
        institusi,
        id: uuidv4()
      });

      // Generate QR Code image
      const qrCodeImage = await qr.toDataURL(qrContent);
      
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role, photo_profile) VALUES (?, ?, ?, NULL)',
        [email, hashedPassword, 'mahasiswa']
      );
      
      const userId = userResult.insertId;

      // Calculate sisa_hari
      const start = new Date(tanggal_mulai);
      const end = new Date(tanggal_selesai);
      const sisaHari = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Insert mahasiswa
      await connection.execute(
        `INSERT INTO mahasiswa (user_id, admin_id, nim, nama, institusi, 
          jenis_kelamin, alamat, no_telepon, tanggal_mulai, tanggal_selesai, 
          qr_code, status, sisa_hari) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aktif', ?)`,
        [userId, admin_id, nim, nama, institusi, jenis_kelamin, alamat, 
         no_telepon, tanggal_mulai, tanggal_selesai, qrCodeImage, sisaHari]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi'
      });
    } finally {
      connection.release();
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Get user by email
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      const user = users[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Get additional user data based on role
      let additionalData = {};
      if (user.role === 'mahasiswa') {
        const [mahasiswa] = await db.execute(
          'SELECT * FROM mahasiswa WHERE user_id = ?',
          [user.id]
        );
        if (mahasiswa.length > 0) {
          additionalData = mahasiswa[0];
        }
      } else if (user.role === 'admin') {
        const [admin] = await db.execute(
          'SELECT * FROM admin WHERE user_id = ?',
          [user.id]
        );
        if (admin.length > 0) {
          additionalData = admin[0];
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          email: user.email,
          ...additionalData
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          ...additionalData
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login'
      });
    }
  },

  // Check validation code untuk akses scan QR
  checkValidationCode: async (req, res) => {
    try {
      const { validation_code } = req.body;

      const [admins] = await db.execute(
        'SELECT * FROM admin WHERE validation_code = ?',
        [validation_code]
      );

      if (admins.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Kode validasi tidak valid'
        });
      }

      res.json({
        success: true,
        message: 'Kode validasi benar'
      });

    } catch (error) {
      console.error('Validation code check error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi kode'
      });
    }
  },

  // Update password
  updatePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get current user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Verify old password
      const validPassword = await bcrypt.compare(oldPassword, users[0].password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Password lama tidak sesuai'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password berhasil diupdate'
      });

    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat update password'
      });
    }
  }
};

module.exports = authController;