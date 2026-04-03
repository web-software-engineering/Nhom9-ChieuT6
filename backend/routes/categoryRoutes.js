import express from "express";
import { getAllCategories, addCategory, deleteCategory, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", addCategory);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;