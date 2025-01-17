const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan untuk berbagai jenis file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Tentukan folder berdasarkan jenis file
    switch (req.baseUrl) {
      case '/api/profiles':
        uploadPath += 'profiles/';
        break;
      case '/api/reports':
        uploadPath += 'reports/';
        break;
      case '/api/logbooks':
        uploadPath += 'logbooks/';
        break;
      default:
        uploadPath += 'others/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file yang diizinkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png'],
    'document': ['application/pdf', 'application/msword', 
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'all': ['image/jpeg', 'image/png', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  let fileTypes;
  
  // Tentukan tipe file yang diizinkan berdasarkan route
  switch (req.baseUrl) {
    case '/api/profiles':
      fileTypes = allowedTypes.image;
      break;
    case '/api/reports':
      fileTypes = allowedTypes.document;
      break;
    case '/api/logbooks':
      fileTypes = allowedTypes.all;
      break;
    default:
      fileTypes = allowedTypes.all;
  }

  if (fileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Konfigurasi upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batas ukuran file 5MB
  }
});

module.exports = upload;