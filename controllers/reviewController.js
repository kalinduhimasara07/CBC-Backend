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
