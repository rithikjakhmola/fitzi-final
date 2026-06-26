const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // CRITICAL: Aiven needs this port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // CRITICAL: Aiven requires SSL, localhost does not
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: true } 
});

// Test the connection immediately on boot
db.getConnection()
  .then(() => console.log("✅ Successfully connected to MySQL/Aiven database!"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = db;