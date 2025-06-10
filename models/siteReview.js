import mongoose from "mongoose";

const siteReviewSchema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  profileImg: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, required: true, default: false },
});

const SiteReview = mongoose.model("SiteReview", siteReviewSchema);

export default SiteReview;
