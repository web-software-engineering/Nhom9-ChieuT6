import db from "../services/db.js";

// Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY category_ID");
    res.json(rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Thêm danh mục
export const addCategory = async (req, res) => {
  const { category_name, category_type } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO categories (category_name, category_type) VALUES (?, ?)",
      [category_name, category_type]
    );
    res.json({ message: "Thêm danh mục thành công", category_ID: result.insertId });
  } catch (err) {
    console.error("Lỗi khi thêm danh mục:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM categories WHERE category_ID = ?", [id]);
    res.json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa danh mục:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, category_type } = req.body;
  try {
    await db.query(
      "UPDATE categories SET category_name = ?, category_type = ? WHERE category_ID = ?",
      [category_name, category_type, id]
    );
    res.json({ message: "Cập nhật danh mục thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật danh mục:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};