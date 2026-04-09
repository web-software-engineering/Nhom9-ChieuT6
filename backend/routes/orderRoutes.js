import express from "express";
import * as ordersController from "../controllers/ordersController.js";

const router = express.Router();

router.get("/", ordersController.getOrders);
router.get("/:id", ordersController.getOrderDetails);
router.post("/:id/pay", ordersController.payOrder);
router.post("/:id/deliver", ordersController.deliverOrder);

export default router;