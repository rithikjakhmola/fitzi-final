const db = require('../config/db');

class User {
  static async create({ name, email, password, age, weight, height, gender }) {
    const sql = `INSERT INTO users (name, email, password, age, weight_kg, height_cm, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [name, email, password, age, weight, height, gender]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0];
  }

  // NEW: Allows users to update their stats after profile creation
  static async updateStats(id, { age, weight, height }) {
    const sql = `UPDATE users SET age = ?, weight_kg = ?, height_cm = ? WHERE id = ?`;
    await db.execute(sql, [age, weight, height, id]);
  }
}

module.exports = User;