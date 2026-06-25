const db = require('../config/db');

class Log {
  // Save a logged meal
  static async create({ userId, foodName, calories, protein, carbs, fats, weight }) {
    const sql = `INSERT INTO daily_logs (user_id, food_name, calories, protein, carbs, fats, weight_g) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [userId, foodName, calories, protein, carbs, fats, weight]);
  }

  // Get total calories eaten today
  static async getConsumedToday(userId) {
    const [rows] = await db.execute(`
      SELECT SUM(calories) as total_eaten 
      FROM daily_logs 
      WHERE user_id = ? AND DATE(logged_at) = CURDATE()
    `, [userId]);
    return rows[0].total_eaten || 0;
  }

  // Get weekly progress for the chart
  static async getWeeklyProgress(userId) {
    const [rows] = await db.execute(`
      SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') as log_date, SUM(calories) as total_calories 
      FROM daily_logs 
      WHERE user_id = ? AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY log_date
      ORDER BY log_date ASC
    `, [userId]);
    return rows;
  }
}

module.exports = Log;