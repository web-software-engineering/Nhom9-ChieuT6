import db from "../services/db.js";
import fs from "fs";
import path from "path";

// ================= GET ALL =================
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.category_name, u.name AS seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_ID = c.category_ID
      LEFT JOIN users u ON p.seller_ID = u.user_ID
      ORDER BY p.product_ID
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADD =================
export const addProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { category_ID, product_name, price, number } = req.body;

    //  validate
    if (
      !category_ID ||
      !product_name?.trim() ||
      price == null ||
      number == null
    ) {
      return res.status(400).json({
        message: "Thiếu category, tên sản phẩm, giá hoặc số lượng",
      });
    }

    const seller_ID = 2; // tạm thời hardcode

    let product_image = null;
    if (req.file) {
      product_image = `uploads/${req.file.filename}`;
    }

    const [result] = await db.query(
      `INSERT INTO products 
       (category_ID, seller_ID, product_name, price, number, product_image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(category_ID), seller_ID, product_name, Number(price), Number(number), product_image]
    );

    res.json({
      message: "Thêm sản phẩm thành công",
      product_ID: result.insertId,
    });
  } catch (err) {
    console.error("ADD ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= UPDATE =================
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { category_ID, product_name, price, number } = req.body;

  try {
    if (
      !category_ID ||
      !product_name?.trim() ||
      price == null ||
      number == null
    ) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    let product_image = null;
    if (req.file) product_image = `uploads/${req.file.filename}`;

    const [existing] = await db.query(
      "SELECT product_image FROM products WHERE product_ID = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (!product_image) {
      product_image = existing[0].product_image;
    }

    await db.query(
      `UPDATE products 
       SET category_ID = ?, product_name = ?, price = ?, number = ?, product_image = ? 
       WHERE product_ID = ?`,
      [Number(category_ID), product_name, Number(price), Number(number), product_image, id]
    );

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= DELETE =================
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query(
      "SELECT product_image FROM products WHERE product_ID = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // xóa file
    if (existing[0].product_image) {
      const filePath = path.join("public", existing[0].product_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM products WHERE product_ID = ?", [id]);

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};