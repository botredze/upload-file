const database = require('../config/database');

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    database.query(sql, [id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};

const createUser = (id, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO users (id, password) VALUES (?, ?)';
    const values = [id, password];
    database.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

const findOneAndUpdate = (userId, updateData) => {
  return new Promise((resolve, reject) => {
    connection.query(
        'UPDATE users SET ? WHERE id = ?',
        [updateData, userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
    );
  });
};

// Функция для деактивации или удаления токена
const deactivateToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    connection.query(
        'UPDATE users SET refreshToken = NULL WHERE refreshToken = ?',
        [refreshToken],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
    );
  });
};

module.exports = {
  getUserById,
  createUser,
  findOneAndUpdate,
  deactivateToken
};
