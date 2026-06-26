const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  attributes: { type: Map, of: String },
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: String,
  variants: [variantSchema],
  images: [{ url: String, alt: String }],
  tags: [String],
  ratings: {
    avg: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'in' },
  },
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ 'ratings.avg': -1, 'ratings.count': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.price': 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });

productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + (v.isActive ? v.stock : 0), 0);
});

productSchema.virtual('minPrice').get(function () {
  const active = this.variants.filter(v => v.isActive);
  return active.length ? Math.min(...active.map(v => v.price)) : 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = productSchema;
