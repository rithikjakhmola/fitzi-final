const db = require('../config/db');

class Metrics {
  static async upsert({ userId, activityLevel, goal, bmr, tdee, targetCalories }) {
    const sql = `
      INSERT INTO user_metrics (user_id, activity_level, goal, bmr, tdee, target_calories) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      activity_level = VALUES(activity_level), goal = VALUES(goal), bmr = VALUES(bmr), tdee = VALUES(tdee), target_calories = VALUES(target_calories)
    `;
    await db.execute(sql, [userId, activityLevel, goal, bmr, tdee, targetCalories]);
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(`SELECT * FROM user_metrics WHERE user_id = ?`, [userId]);
    return rows[0];
  }
}

module.exports = Metrics;