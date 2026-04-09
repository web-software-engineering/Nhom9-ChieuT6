// backend/routes/reviews.js
import express from "express";
import { getAllReviews, getReviewSummary } from "../controllers/reviewsController.js";

const router = express.Router();


router.get("/all", getAllReviews);


router.get("/summary", getReviewSummary);

export default router;