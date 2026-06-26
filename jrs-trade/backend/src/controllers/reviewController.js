const { getMasterModels } = require('../config/db');

exports.getProductReviews = async (req, res, next) => {
  try {
    const { Review } = getMasterModels();
    const { page = 1, limit = 10, rating } = req.query;
    const filter = { product: req.params.productId, isActive: true };
    if (rating) filter.rating = Number(rating);
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate('user', 'name profile.avatar').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments(filter),
    ]);
    res.json({
      reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, body, images } = req.body;
    const { Order, Product, Review } = getMasterModels();
    const hasOrdered = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'delivered',
    });
    if (!hasOrdered) {
      return res.status(400).json({ message: 'You must purchase and receive this product to review it.' });
    }
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: hasOrdered._id,
      rating,
      title,
      body,
      images,
      verifiedPurchase: true,
    });
    const stats = await Review.aggregate([
      { $match: { product: review.product, isActive: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Product.findByIdAndUpdate(productId, {
        'ratings.avg': Math.round(stats[0].avg * 10) / 10,
        'ratings.count': stats[0].count,
      });
    }
    await review.populate('user', 'name profile.avatar');
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};

exports.markHelpful = async (req, res, next) => {
  try {
    const { Review } = getMasterModels();
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.json({ review });
  } catch (error) {
    next(error);
  }
};

exports.respondToReview = async (req, res, next) => {
  try {
    const { Review, Product } = getMasterModels();
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    const product = await Product.findById(review.product);
    if (!product || product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the product seller can respond.' });
    }
    review.sellerResponse = {
      body: req.body.body,
      createdAt: new Date(),
    };
    await review.save();
    res.json({ review });
  } catch (error) {
    next(error);
  }
};
