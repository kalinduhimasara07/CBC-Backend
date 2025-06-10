import Order from "../models/order.js";
import SiteReview from "../models/siteReview.js";
import { isAdmin } from "./userController.js";

export async function getSiteReviews(req, res) {
  if (isAdmin) {
    try {
      const siteReviews = await SiteReview.find();
      res.json(siteReviews);
    } catch (error) {
      console.error("Error fetching site reviews:", error);
      res.status(500).json({ error: "Error fetching site reviews" });
    }
  } else {
    try {
      const siteReviews = await SiteReview.find({ isApproved: true });
      res.json(siteReviews);
    } catch (error) {
      console.error("Error fetching site reviews:", error);
      res.status(500).json({ error: "Error fetching site reviews" });
    }
  }
}

export async function createSiteReview(req, res) {
  if (req.user == null) {
    res.status(403).json({ error: "Please login and try again" });
    return;
  }
  const email = req.user.email;
  try {
    const order = await Order.findOne({ email });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    } else {
      const siteReview = new SiteReview(req.body);
      await siteReview.save();
      res.json({ message: "Site review saved successfully" });
    }
  } catch (error) {
    console.error("Error saving site review:", error);
    res.status(500).json({ error: "Error saving site review" });
  }
}
