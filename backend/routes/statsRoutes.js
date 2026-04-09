// backend/routes/statsRoutes.js
import express from "express";
import { getRevenueByDay, getOrdersByDay, getTopProducts } from "../controllers/statsController.js";

const router = express.Router();

// API prefix: /api/stats
router.get("/revenue", getRevenueByDay);
router.get("/orders", getOrdersByDay);
router.get("/top-products", getTopProducts);

export default router;