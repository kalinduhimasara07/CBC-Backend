import Order from "../models/order.js";
import SiteReview from "../models/siteReview.js";
import { isAdmin } from "./userController.js";

export async function getSiteReviews(req, res) {
  const userRole = req.user?.role;

  try {
    if (userRole === "admin") {
      const siteReviews = await SiteReview.find({});
      return res.json(siteReviews);
    }

    const siteReviews = await SiteReview.find({ isApproved: true });
    return res.json(siteReviews);
  } catch (error) {
    console.error("Error fetching site reviews:", error);
    return res.status(500).json({ error: "Error fetching site reviews" });
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
      return res
        .status(404)
        .json({
          message:
            "You can't create a site review! Because you don't have an order",
        });
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

export async function approveSiteReview(req, res) {
  if (!isAdmin) {
    res.status(403).json({ error: "You are not authorized" });
    return;
  }
  const status = req.body.isApproved;
  try {
    const siteReview = await SiteReview.findById(req.params.id);
    if (!siteReview) {
      return res.status(404).json({ error: "Site review not found" });
    }
    siteReview.isApproved = status;
    await siteReview.save();
    res.json({ message: "Site review approved successfully" });
  } catch (error) {
    console.error("Error approving site review:", error);
    res.status(500).json({ error: "Error approving site review" });
  }
}

export async function deleteSiteReview(req, res) {
  if (!isAdmin) {
    res.status(403).json({ error: "You are not authorized" });
    return;
  }
  try {
    await SiteReview.findByIdAndDelete(req.params.id);
    res.json({ message: "Site review deleted successfully" });
  } catch (error) {
    console.error("Error deleting site review:", error);
    res.status(500).json({ error: "Error deleting site review" });
  }
}
