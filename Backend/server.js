require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const absenRoutes = require('./routes/absenRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const reportRoutes = require('./routes/reportRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

const app = express();

const uploadDir = path.join(__dirname, 'uploads/reports');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads/profiles',
  'uploads/reports',
  'uploads/logbooks',
  'uploads/qrcodes',
  'uploads/assets'  // Tambahkan ini
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/absen', absenRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/reports', reportRoutes); // Changed from report to reports
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/izin', permissionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Sistem Absensi Magang API',
    version: '1.0.0',
    status: 'active'
  });
});

// Database connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Serve static files dengan konfigurasi yang benar
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers untuk file download
    if (filePath.endsWith('.pdf')) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment'
      });
    }
  }
}));