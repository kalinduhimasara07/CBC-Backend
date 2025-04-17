import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/:productId", getReviews);
reviewRouter.post("/", createReview);

export default reviewRouter;
