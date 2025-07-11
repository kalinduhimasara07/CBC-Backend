import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  productId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  profileImg: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
