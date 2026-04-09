// backend/controllers/statsController.js
import pool from "../services/db.js";

// Doanh thu theo ngày/tháng/năm
export const getRevenueByDay = async (req, res) => {
  try {
    const { start, end } = req.query;
    const [rows] = await pool.query(`
      SELECT o.order_date, IFNULL(SUM(p.price * od.quantity), 0) AS total
      FROM shoppingorder o
      LEFT JOIN order_details od ON o.order_ID = od.order_ID
      LEFT JOIN products p ON od.product_ID = p.product_ID
      LEFT JOIN payment pay ON o.order_ID = pay.order_ID
      WHERE pay.payment_date IS NOT NULL
        AND o.order_date BETWEEN ? AND ?
      GROUP BY o.order_date
      ORDER BY o.order_date ASC
    `, [start, end]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Số đơn hàng theo ngày/tháng/năm
export const getOrdersByDay = async (req, res) => {
  try {
    const { start, end } = req.query;
    const [rows] = await pool.query(`
      SELECT order_date, COUNT(*) AS total_orders
      FROM shoppingorder
      WHERE order_date BETWEEN ? AND ?
      GROUP BY order_date
      ORDER BY order_date ASC
    `, [start, end]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Top sản phẩm bán chạy (có thể lọc theo ngày nếu muốn)
export const getTopProducts = async (req, res) => {
  try {
    let { start, end } = req.query;

    // Mặc định: từ đầu đến cuối hiện tại nếu không có start/end
    if (!start) start = '2000-01-01';
    if (!end) end = new Date().toISOString().slice(0,10);

    const [rows] = await pool.query(`
      SELECT p.product_name, SUM(od.quantity) AS sold
      FROM order_details od
      INNER JOIN products p ON od.product_ID = p.product_ID
      INNER JOIN shoppingorder o ON od.order_ID = o.order_ID
      LEFT JOIN payment pay ON o.order_ID = pay.order_ID
      WHERE pay.payment_date IS NOT NULL
        AND o.order_date BETWEEN ? AND ?
      GROUP BY p.product_name
      ORDER BY sold DESC
      LIMIT 5
    `, [start, end]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};