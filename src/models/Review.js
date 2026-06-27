const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 200 },
  body: { type: String, trim: true, maxlength: 5000 },
  images: [String],
  verifiedPurchase: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  sellerResponse: {
    body: String,
    createdAt: Date,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = reviewSchema;
