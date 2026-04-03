// services/db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlineshoppingsystem",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;  // ✅ dùng default export