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

// ================= GET ONE =================
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT p.*, c.category_name, u.name AS seller_name
      FROM products p
      LEFT JOIN categories c ON p.category_ID = c.category_ID
      LEFT JOIN users u ON p.seller_ID = u.user_ID
      WHERE p.product_ID = ?
      LIMIT 1
    `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("GET BY ID ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= ADD =================
export const addProduct = async (req, res) => {
  try {
    const { category_ID, product_name, price, number } = req.body;

    if (!category_ID || !product_name?.trim()) {
      return res
        .status(400)
        .json({ message: "Thiếu category hoặc tên sản phẩm" });
    }

    const priceNum = Number(price ?? 0);
    const numberNum = Number(number ?? 0);
    const seller_ID = 2;

    let product_image = req.file
      ? `uploads/products/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `
  INSERT INTO products (category_ID, seller_ID, product_name, price, number, product_image, import_date)
  VALUES (?, ?, ?, ?, ?, ?, CURDATE())
`,
      [
        category_ID,
        seller_ID,
        product_name,
        priceNum,
        numberNum,
        product_image,
      ],
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
  const { category_ID, product_name, price, number, import_date } = req.body;

  try {
    if (!category_ID || !product_name?.trim()) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const priceNum = Number(price ?? 0);
    const numberNum = Number(number ?? 0);

    let product_image = req.file
      ? `uploads/products/${req.file.filename}`
      : null;

    // Lấy thông tin hiện tại
    const [existing] = await db.query(
      "SELECT product_image FROM products WHERE product_ID = ?",
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (!product_image) product_image = existing[0].product_image;

    // Cập nhật sản phẩm
    await db.query(
      `
      UPDATE products
      SET category_ID = ?, product_name = ?, price = ?, number = ?, product_image = ?, import_date = ?
      WHERE product_ID = ?
    `,
      [
        category_ID,
        product_name,
        priceNum,
        numberNum,
        product_image,
        import_date || new Date().toISOString().split("T")[0],
        id,
      ],
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
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

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
