import bcrypt from "bcrypt";
import pool from "../services/db.js";

// Lấy tất cả user là khách hàng
export const getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE role = 'customer'");
    res.json(rows); // trả về mảng khách hàng
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND role = 'admin'",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Sai tài khoản" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const changePassword = async (req, res) => {
  try {
    const { user_ID, oldPassword, newPassword } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_ID = ?",
      [user_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const user = rows[0];

    // 🔐 so sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // 🔐 mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE user_ID = ?",
      [hashedPassword, user_ID]
    );

    res.json({ message: "Đổi mật khẩu thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// controllers/userController.js
export const changeUsername = async (req, res) => {
  try {
    const { user_ID, newUsername } = req.body;

    if (!newUsername) {
      return res.status(400).json({ message: "Nhập username mới" });
    }

    // Kiểm tra username đã tồn tại chưa
    const [check] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND user_ID != ?",
      [newUsername, user_ID]
    );

    if (check.length > 0) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    await pool.query(
      "UPDATE users SET username = ? WHERE user_ID = ?",
      [newUsername, user_ID]
    );

    res.json({ message: "Đổi username thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};