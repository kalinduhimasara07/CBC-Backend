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
  if (req.user == null) {
    res.status(403).json({ error: "Please login and try again" });
    return;
  }
  const reviewInfo = req.body;
  const email = req.user.email;
  const name = req.user.firstName + " " + req.user.lastName;
  reviewInfo.email = email;
  reviewInfo.name = name;
  const review = new Review(reviewInfo);
  try {
    await review.save();
    res.json({ message: "Review saved successfully" });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Error saving review" });
  }
}
