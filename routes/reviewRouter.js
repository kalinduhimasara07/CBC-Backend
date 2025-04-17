import express from "express";
import { getReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/:productId", getReviews);

export default reviewRouter;
