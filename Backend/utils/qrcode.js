const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Ensure QR_SECRET is properly loaded from environment variables
if (!process.env.QR_SECRET) {
  throw new Error('QR_SECRET environment variable is not set');
}

const QR_SECRET = process.env.QR_SECRET;

// Helper function for rounded rectangles
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

// Enhanced mergeLogo function with environment-aware error handling
const mergeLogo = async (qrCanvas, logoPath, size) => {
  const padding = 80;
  const finalSize = size + padding;
  const canvas = createCanvas(finalSize, finalSize);
  const ctx = canvas.getContext('2d');

  // Create smooth white background with enhanced shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFFFF';
  
  drawRoundedRect(ctx, padding/2, padding/2, size, size, 40);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  drawRoundedRect(ctx, padding/2, padding/2, size, size, 40);
  ctx.clip();

  ctx.drawImage(qrCanvas, padding/2, padding/2, size, size);

  try {
    if (!fs.existsSync(logoPath)) {
      console.warn('Logo file not found:', logoPath);
      return canvas;
    }

    const logo = await loadImage(logoPath);
    const logoSize = size * 0.28;
    const logoX = (finalSize - logoSize) / 2;
    const logoY = (finalSize - logoSize) / 2;

    ctx.globalCompositeOperation = 'destination-out';
    const gradient = ctx.createRadialGradient(
      finalSize/2, finalSize/2, logoSize/2.4,
      finalSize/2, finalSize/2, logoSize/1.6
    );
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(finalSize/2, finalSize/2, logoSize/1.8, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(finalSize/2, finalSize/2, logoSize/2, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(finalSize/2, finalSize/2, logoSize/2, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    return canvas;
  } catch (error) {
    console.error('Error processing logo:', error);
    // Return basic QR code without logo if logo processing fails
    return canvas;
  }
};

const qrcodeUtil = {
  generateMahasiswaQR: async (mahasiswaData) => {
    try {
      if (!mahasiswaData?.id || !mahasiswaData?.nim) {
        throw new Error('Invalid mahasiswa data');
      }

      const qrPath = path.join(__dirname, '../uploads/qrcodes');
      if (!fs.existsSync(qrPath)) {
        fs.mkdirSync(qrPath, { recursive: true });
      }

      // Cleanup old QR codes with error handling
      try {
        const oldFiles = fs.readdirSync(qrPath)
          .filter(file => file.startsWith(`${mahasiswaData.nim}-`));
        for (const file of oldFiles) {
          fs.unlinkSync(path.join(qrPath, file));
        }
      } catch (error) {
        console.warn('Error cleaning up old QR codes:', error);
      }

      // Generate secure identifier using environment QR_SECRET
      const shortId = crypto
        .createHash('sha256')
        .update(`${mahasiswaData.id}:${mahasiswaData.nim}:${QR_SECRET}`)
        .digest('hex')
        .slice(0, 8);

      const payload = {
        i: mahasiswaData.id.toString(),
        n: mahasiswaData.nim,
        s: crypto
          .createHmac('sha256', QR_SECRET)
          .update(`${mahasiswaData.id}:${mahasiswaData.nim}:${shortId}`)
          .digest('hex')
          .slice(0, 8)
      };

      const fileName = `${mahasiswaData.nim}-${shortId}.png`;
      const filePath = path.join(qrPath, fileName);

      const qrCanvas = createCanvas(540, 540);
      await QRCode.toCanvas(qrCanvas, JSON.stringify(payload), {
        errorCorrectionLevel: 'H',
        version: 6,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 540,
        rendererOpts: {
          quality: 1
        }
      });

      const logoPath = path.join(__dirname, '../uploads/assets/semen-padang-logo.png');
      const finalCanvas = await mergeLogo(qrCanvas, logoPath, 540);

      return new Promise((resolve, reject) => {
        const stream = finalCanvas.createPNGStream();
        const writeStream = fs.createWriteStream(filePath);
        
        writeStream.on('finish', () => resolve(`qrcodes/${fileName}`));
        writeStream.on('error', (error) => {
          console.error('Error saving QR code:', error);
          reject(error);
        });
        
        stream.pipe(writeStream);
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  validateQRContent: (qrData) => {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

      if (!data.i || !data.n || !data.s) {
        return {
          isValid: false,
          message: 'Format QR code tidak valid'
        };
      }

      // Use environment QR_SECRET for validation
      const shortId = crypto
        .createHash('sha256')
        .update(`${data.i}:${data.n}:${QR_SECRET}`)
        .digest('hex')
        .slice(0, 8);

      const expectedSignature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(`${data.i}:${data.n}:${shortId}`)
        .digest('hex')
        .slice(0, 8);

      if (data.s !== expectedSignature) {
        return {
          isValid: false,
          message: 'QR code tidak valid atau telah dimodifikasi'
        };
      }

      return {
        isValid: true,
        data: {
          mahasiswa_id: parseInt(data.i),
          nim: data.n
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