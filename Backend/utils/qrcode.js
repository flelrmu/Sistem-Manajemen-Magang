const QRCode = require('qrcode');
const crypto = require('crypto');

const qrcodeUtil = {
  // Generate QR code for mahasiswa
  generateMahasiswaQR: async (mahasiswaData) => {
    try {
      // Create payload dengan data mahasiswa dan timestamp
      const payload = {
        id: mahasiswaData.id,
        nim: mahasiswaData.nim,
        nama: mahasiswaData.nama,
        timestamp: Date.now(),
        hash: crypto.createHash('sha256')
          .update(`${mahasiswaData.id}${mahasiswaData.nim}${Date.now()}`)
          .digest('hex')
      };

      // Convert payload ke string
      const dataString = JSON.stringify(payload);

      // Generate QR code sebagai data URL
      const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  },

  // Validate QR code content
  validateQRContent: (qrData) => {
    try {
      // Parse QR data
      const data = JSON.parse(qrData);

      // Verify required fields
      if (!data.id || !data.nim || !data.timestamp || !data.hash) {
        return {
          isValid: false,
          message: 'Invalid QR code format'
        };
      }

      // Verify hash
      const expectedHash = crypto.createHash('sha256')
        .update(`${data.id}${data.nim}${data.timestamp}`)
        .digest('hex');

      if (data.hash !== expectedHash) {
        return {
          isValid: false,
          message: 'Invalid QR code signature'
        };
      }

      // Check if QR code is expired (24 hours)
      const timeDiff = Date.now() - data.timestamp;
      if (timeDiff > 24 * 60 * 60 * 1000) {
        return {
          isValid: false,
          message: 'QR code has expired'
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
        message: 'Invalid QR code data'
      };
    }
  },

  // Generate temporary QR code for one-time use
  generateTemporaryQR: async (data, expiryMinutes = 5) => {
    try {
      const payload = {
        ...data,
        timestamp: Date.now(),
        expiry: Date.now() + (expiryMinutes * 60 * 1000),
        hash: crypto.createHash('sha256')
          .update(`${JSON.stringify(data)}${Date.now()}`)
          .digest('hex')
      };

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating temporary QR code:', error);
      throw new Error('Failed to generate temporary QR code');
    }
  }
};

module.exports = qrcodeUtil;