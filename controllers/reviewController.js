import Review from "../models/review.js";

export async function getReviews(req, res) {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productId: productId });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
}

export async function createReview(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "You are not authorized" });
    }

    const { id, isApp } = req.body;

    const updatedReview = await Order.findOneAndUpdate({ id }, { status });

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.json({
      message: "Review status updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
