import express from "express";
import {
  createSiteReview,
  getSiteReviews,
} from "../controllers/siteReviewController.js";

const siteReviewRouter = express.Router();

siteReviewRouter.get("/", getSiteReviews);
siteReviewRouter.post("/", createSiteReview);

export default siteReviewRouter;
