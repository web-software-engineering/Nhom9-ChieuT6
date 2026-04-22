import bcrypt from "bcrypt";
import pool from "../services/db.js";

// Lấy tất cả user là khách hàng
export const getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
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

    if (!user_ID || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_ID = ?",
      [user_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const user = rows[0];

    // 🔥 FIX Ở ĐÂY
    const isMatch =
      user.password.startsWith("$2b$")
        ? await bcrypt.compare(oldPassword.trim(), user.password)
        : oldPassword.trim() === user.password;

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // hash password mới
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
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email } = req.body;

    if (!username || !name) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    // check username trùng
    const [check] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND user_ID != ?",
      [username, id]
    );

    if (check.length > 0) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    await pool.query(
      "UPDATE users SET username = ?, name = ?, email = ? WHERE user_ID = ?",
      [username, name, email, id]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};