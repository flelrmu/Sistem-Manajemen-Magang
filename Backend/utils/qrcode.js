const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Secret key untuk signing QR code
const QR_SECRET = process.env.QR_SECRET || 'your-secret-key';

const qrcodeUtil = {
  // Generate QR code untuk mahasiswa
  generateMahasiswaQR: async (mahasiswaData) => {
    try {
      // Buat direktori jika belum ada
      const qrPath = path.join(__dirname, '../uploads/qrcodes');
      if (!fs.existsSync(qrPath)) {
        fs.mkdirSync(qrPath, { recursive: true });
      }

      // Hapus QR code lama jika ada
      const oldFiles = fs.readdirSync(qrPath)
        .filter(file => file.startsWith(`${mahasiswaData.nim}-`));
      oldFiles.forEach(file => {
        fs.unlinkSync(path.join(qrPath, file));
      });

      // Generate unique identifier yang permanen
      const permanentId = crypto
        .createHash('sha256')
        .update(`${mahasiswaData.id}:${mahasiswaData.nim}:${QR_SECRET}`)
        .digest('hex');

      // Buat payload dengan data penting
      const payload = {
        id: mahasiswaData.id,
        nim: mahasiswaData.nim,
        nama: mahasiswaData.nama,
        permanent_id: permanentId
      };

      // Sign payload
      const signature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      // Tambahkan signature ke payload
      payload.signature = signature;

      // Generate nama file unik
      const fileName = `${mahasiswaData.nim}-${permanentId.substr(0, 8)}.png`;
      const filePath = path.join(qrPath, fileName);

      // Buat QR code
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

      return `qrcodes/${fileName}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  // Validasi konten QR code
  validateQRContent: (qrData) => {
    try {
      // Parse data QR
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

      // Validasi field yang diperlukan
      if (!data.id || !data.nim || !data.permanent_id || !data.signature) {
        return {
          isValid: false,
          message: 'Format QR code tidak valid'
        };
      }

      // Buat copy payload tanpa signature untuk verifikasi
      const payloadForVerification = {...data};
      delete payloadForVerification.signature;

      // Validasi signature
      const expectedSignature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(JSON.stringify(payloadForVerification))
        .digest('hex');

      if (data.signature !== expectedSignature) {
        return {
          isValid: false,
          message: 'QR code tidak valid atau telah dimodifikasi'
        };
      }

      // Verifikasi permanent_id
      const expectedPermanentId = crypto
        .createHash('sha256')
        .update(`${data.id}:${data.nim}:${QR_SECRET}`)
        .digest('hex');

      if (data.permanent_id !== expectedPermanentId) {
        return {
          isValid: false,
          message: 'QR code tidak valid'
        };
      }

      return {
        isValid: true,
        data: {
          mahasiswa_id: data.id,
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
  }
};

module.exports = qrcodeUtil;