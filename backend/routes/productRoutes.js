import express from "express";
import multer from "multer";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { deliverOrder } from "../controllers/ordersController.js"; // <- thêm

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/products/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("product_image"), addProduct);
router.put("/:id", upload.single("product_image"), updateProduct);
router.delete("/:id", deleteProduct);

// Route giao hàng
router.post("/:id/deliver", deliverOrder);

export default router;
