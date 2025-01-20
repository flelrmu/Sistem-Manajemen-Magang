const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const qrcodeUtil = {
  // Generate QR code for mahasiswa
  generateMahasiswaQR: async (mahasiswaData) => {
    try {
      // Create qrcodes directory if it doesn't exist
      const qrPath = path.join(__dirname, '../uploads/qrcodes');
      if (!fs.existsSync(qrPath)) {
        fs.mkdirSync(qrPath, { recursive: true });
      }

      // Remove old QR code if exists
      const oldFiles = fs.readdirSync(qrPath).filter(file => 
        file.startsWith(`${mahasiswaData.nim}-`)
      );
      oldFiles.forEach(file => {
        fs.unlinkSync(path.join(qrPath, file));
      });

      // Create QR payload
      const payload = {
        id: mahasiswaData.id,
        nim: mahasiswaData.nim,
        nama: mahasiswaData.nama,
        timestamp: Date.now(),
        hash: crypto.createHash('sha256')
          .update(`${mahasiswaData.id}${mahasiswaData.nim}${Date.now()}`)
          .digest('hex')
      };

      // Generate unique filename
      const fileName = `${mahasiswaData.nim}-${Date.now()}.png`;
      const filePath = path.join(qrPath, fileName);
      
      // Create QR code file
      await QRCode.toFile(filePath, JSON.stringify(payload), {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Return relative path for database storage
      return `qrcodes/${fileName}`;

    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  },

  // Validate QR code data
  validateQRContent: (qrData) => {
    try {
      const data = JSON.parse(qrData);
      
      // Check required fields
      if (!data.id || !data.nim || !data.timestamp || !data.hash) {
        return {
          isValid: false,
          message: 'Format QR code tidak valid'
        };
      }

      // Validate hash
      const expectedHash = crypto.createHash('sha256')
        .update(`${data.id}${data.nim}${data.timestamp}`)
        .digest('hex');

      if (data.hash !== expectedHash) {
        return {
          isValid: false,
          message: 'QR code tidak valid'
        };
      }

      // Check expiration (24 hours)
      const timeDiff = Date.now() - data.timestamp;
      if (timeDiff > 24 * 60 * 60 * 1000) {
        return {
          isValid: false,
          message: 'QR code telah kadaluarsa'
        };
      }

      return {
        isValid: true,
        data: {
          id: data.id,
          nim: data.nim,
          nama: data.nama
        }
      };

    } catch (error) {
      console.error('Error validating QR code:', error);
      return {
        isValid: false,
        message: 'Data QR code tidak valid'
      };
    }
  },

  // Delete QR code file
  deleteQRCode: async (qrCodePath) => {
    try {
      if (!qrCodePath) return false;

      const fullPath = path.join(__dirname, '../uploads', qrCodePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      return false;
    }
  }
};

module.exports = qrcodeUtil;