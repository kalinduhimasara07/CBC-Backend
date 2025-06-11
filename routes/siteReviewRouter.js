import express from "express";
import {
  approveSiteReview,
  createSiteReview,
  getSiteReviews,
} from "../controllers/siteReviewController.js";

const siteReviewRouter = express.Router();

siteReviewRouter.get("/", getSiteReviews);
siteReviewRouter.post("/", createSiteReview);
siteReviewRouter.put("/:id", approveSiteReview);

export default siteReviewRouter;
