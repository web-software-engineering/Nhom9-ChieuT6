import pool from "../services/db.js";

// Lấy tất cả đơn hàng
export const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.order_ID, u.name AS customer_name, o.order_date,
        IF(p.payment_date IS NULL,'Chưa thanh toán','Đã thanh toán') AS payment_status,
        IF(d.delivery_date IS NULL,'Chưa giao','Đã giao') AS delivery_status
      FROM shoppingorder o
      LEFT JOIN users u ON o.user_ID = u.user_ID
      LEFT JOIN payment p ON o.order_ID = p.order_ID
      LEFT JOIN deliveries d ON o.order_ID = d.order_ID
      ORDER BY o.order_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xem chi tiết đơn hàng
export const getOrderDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT od.quantity, p.product_name, p.price, (od.quantity*p.price) AS total
      FROM order_details od
      LEFT JOIN products p ON od.product_ID = p.product_ID
      WHERE od.order_ID = ?
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Xác nhận thanh toán
export const payOrder = async (req, res) => {
  const { id } = req.params;
  try {
    // Chỉ insert nếu chưa có order_ID trong payment
    await pool.query(`
      INSERT INTO payment (order_ID, payment_date)
      SELECT ?, CURDATE()
      WHERE NOT EXISTS (SELECT 1 FROM payment WHERE order_ID = ?)
    `, [id, id]);

    res.json({ message: "Thanh toán thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xác nhận giao hàng

export const deliverOrder = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert vào deliveries nếu chưa có
    await conn.query(`
      INSERT INTO deliveries (order_ID, delivery_date)
      SELECT ?, CURDATE()
      WHERE NOT EXISTS (SELECT 1 FROM deliveries WHERE order_ID = ?)
    `, [id, id]);

    // Lấy chi tiết đơn hàng
    const [details] = await conn.query(`
      SELECT product_ID, quantity FROM order_details WHERE order_ID = ?
    `, [id]);

    // Trừ số lượng sản phẩm trong kho
    for (const item of details) {
      const [result] = await conn.query(`
        UPDATE products
        SET number = number - ?
        WHERE product_ID = ? AND number >= ?
      `, [item.quantity, item.product_ID, item.quantity]);

      if (result.affectedRows === 0) {
        throw new Error(`Sản phẩm ID=${item.product_ID} không đủ trong kho!`);
      }
    }

    await conn.commit();
    res.json({ message: "Giao hàng thành công và số lượng sản phẩm đã cập nhật" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};