const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Create admin accounts
    const adminAccounts = [
      {
        email: 'admin1@example.com',
        password: 'Admin123!',
        nama: 'Administrator Satu',
        validation_code: 'ADMIN1'
      },
      {
        email: 'admin2@example.com',
        password: 'Admin123!',
        nama: 'Administrator Dua',
        validation_code: 'ADMIN2'
      },
      {
        email: 'admin3@example.com',
        password: 'Admin123!',
        nama: 'Administrator Tiga',
        validation_code: 'ADMIN3'
      },
      {
        email: 'admin4@example.com',
        password: 'Admin123!',
        nama: 'Administrator Empat',
        validation_code: 'ADMIN4'
      }
    ];

    // Insert admin accounts
    for (const admin of adminAccounts) {
      // Create user account
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, "admin", true)',
        [admin.email, hashedPassword]
      );

      // Create admin profile
      await connection.execute(
        'INSERT INTO admin (user_id, nama, validation_code) VALUES (?, ?, ?)',
        [userResult.insertId, admin.nama, admin.validation_code]
      );
    }

    // Create default attendance settings
    await connection.execute(
      `INSERT INTO setting_absensi (
        jam_masuk, jam_pulang, batas_telat_menit,
        radius_meter, latitude_pusat, longitude_pusat,
        is_active
      ) VALUES (
        '08:00:00', '17:00:00', 30,
        100, -6.200000, 106.816666,
        true
      )`
    );

    // Sample kategori izin
    const kategoriIzin = ['Sakit', 'Keperluan Keluarga', 'Keperluan Kampus', 'Lainnya'];
    
    // Create kategori_izin table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS kategori_izin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert kategori izin
    for (const kategori of kategoriIzin) {
      await connection.execute(
        'INSERT INTO kategori_izin (nama) VALUES (?)',
        [kategori]
      );
    }

    await connection.commit();
    console.log('Database seeding completed successfully');

  } catch (error) {
    await connection.rollback();
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Create seeder script
const runSeeder = async () => {
  try {
    console.log('Starting database seeding...');
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

// Run seeder if executed directly
if (require.main === module) {
  runSeeder();
}

module.exports = seedDatabase;