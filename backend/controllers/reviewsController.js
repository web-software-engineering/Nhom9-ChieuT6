// backend/controllers/reviewsController.js
import pool from "../services/db.js"; // file db.js chứa connection pool MySQL

// Lấy tất cả đánh giá kèm tên user và tên sản phẩm
export const getAllReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.name AS user_name,
        p.product_name,
        r.rating,
        r.comment,
        r.review_date
      FROM reviews r
      JOIN users u ON r.user_ID = u.user_ID
      JOIN products p ON r.product_ID = p.product_ID
      ORDER BY r.review_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy summary: tổng review và rating trung bình
export const getReviewSummary = async (req, res) => {
  try {
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        ROUND(AVG(rating),1) AS avgRating
      FROM reviews
    `);

    const [latestReviews] = await pool.query(`
      SELECT 
        u.name AS user_name,
        p.product_name,
        r.rating,
        r.comment,
        r.review_date
      FROM reviews r
      JOIN users u ON r.user_ID = u.user_ID
      JOIN products p ON r.product_ID = p.product_ID
      ORDER BY r.review_date DESC
      LIMIT 3
    `);

    res.json({
      total: summary[0].total,
      avgRating: summary[0].avgRating,
      reviews: latestReviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};