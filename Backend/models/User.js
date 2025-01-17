const db = require('../config/database');

class User {
  static async findById(id) {
    try {
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return users[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return users[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      const { email, password, role, photo_profile } = userData;
      
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, role, photo_profile) VALUES (?, ?, ?, ?)',
        [email, password, role, photo_profile]
      );
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, userData) {
    try {
      const { email, password, photo_profile } = userData;
      
      let query = 'UPDATE users SET';
      const updateFields = [];
      const values = [];

      if (email) {
        updateFields.push(' email = ?');
        values.push(email);
      }
      if (password) {
        updateFields.push(' password = ?');
        values.push(password);
      }
      if (photo_profile) {
        updateFields.push(' photo_profile = ?');
        values.push(photo_profile);
      }

      if (updateFields.length === 0) return false;

      query += updateFields.join(',') + ' WHERE id = ?';
      values.push(id);

      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, isActive) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete related records first
      await connection.execute(
        'DELETE FROM mahasiswa WHERE user_id = ?',
        [id]
      );
      
      await connection.execute(
        'DELETE FROM admin WHERE user_id = ?',
        [id]
      );
      
      // Then delete user
      await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;