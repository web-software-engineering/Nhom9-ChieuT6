// services/db.js
import mysql from "mysql2/promise";

<<<<<<< HEAD
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
=======
const poolDefaults = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
};

const buildDbConfig = () => {
  const connectionUrl =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL;

  if (connectionUrl) {
    const url = new URL(connectionUrl);

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username || ""),
      password: decodeURIComponent(url.password || ""),
      database: decodeURIComponent((url.pathname || "").replace(/^\//, "")),
      ssl: {
        rejectUnauthorized: false,
      },
      ...poolDefaults,
    };
  }

  return {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASS,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
    ssl:
      process.env.MYSQL_SSL === "false"
        ? undefined
        : {
            rejectUnauthorized: false,
          },
    ...poolDefaults,
  };
};

const db = mysql.createPool(buildDbConfig());
>>>>>>> 53b5e2e (add login feature)

export default db;  // ✅ default export