const database = require('../config/database');

class File {
  static async createFile(originalname, filename, mimetype, size, uploadDate) {
    try {
      const sql = 'INSERT INTO files (name, filename, mimetype, size, upload_date) VALUES (?, ?, ?, ?, ?)';
      const values = [originalname, filename, mimetype, size, uploadDate];
      const [result] = await database.query(sql, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getFileById(fileId) {
    try {
      const sql = 'SELECT * FROM files WHERE id = ?';
      const [result] = await database.query(sql, fileId);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteFileById(fileId) {
    try {
      const sql = 'DELETE FROM files WHERE id = ?';
      const [result] = await database.query(sql, fileId);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getAllFiles(limit, offset) {
    try {
      const sql = 'SELECT * FROM files LIMIT ? OFFSET ?';
      const [result] = await database.query(sql, [limit, offset]);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = File;
