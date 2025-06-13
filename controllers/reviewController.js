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
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "You must be logged in to create a review" });
    }
    const email = req.user.email;
    const review = new Review(req.body);
    // review.userId = req.user._id;
    review.email = email;
    await review.save();
    return res.status(201).json({ message: "Review created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
