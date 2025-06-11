import express from "express";
import {
  approveSiteReview,
  createSiteReview,
  deleteSiteReview,
  getSiteReviews,
} from "../controllers/siteReviewController.js";

const siteReviewRouter = express.Router();

siteReviewRouter.get("/", getSiteReviews);
siteReviewRouter.post("/", createSiteReview);
siteReviewRouter.put("/:id", approveSiteReview);
siteReviewRouter.delete("/:id", deleteSiteReview);

export default siteReviewRouter;
