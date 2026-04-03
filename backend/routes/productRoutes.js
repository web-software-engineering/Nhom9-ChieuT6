import express from "express";
import multer from "multer";
import { getAllProducts, addProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/", getAllProducts);
router.post("/", upload.single("product_image"), addProduct);
router.put("/:id", upload.single("product_image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;