// services/db.js
import mysql from "mysql2/promise";

// Dùng biến môi trường, fallback nếu không có
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "onlineshoppingsystem",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;  // ✅ default export