const mysql = require("mysql2");

// Tạo connection pool (tối ưu hơn connect thường)
const db = mysql.createPool({
  host: process.env.DB_HOST, // host từ Railway
  user: process.env.DB_USER, // username
  password: process.env.DB_PASS, // password
  database: process.env.DB_NAME, // tên database
});

// dùng promise để viết async/await
module.exports = db.promise();
