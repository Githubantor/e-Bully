const { getMasterModels } = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter['variants.price'] = {};
      if (minPrice) filter['variants.price'].$gte = Number(minPrice);
      if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'variants.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'variants.price': -1 };
    else if (sort === 'rating') sortOption = { 'ratings.avg': -1 };
    else if (sort === 'popular') sortOption = { 'ratings.count': -1 };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('seller', 'name profile.avatar');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name profile');
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

async function generateUniqueSlug(Product, baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const existing = await Product.findOne(filter);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

exports.create = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const baseSlug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = await generateUniqueSlug(Product, baseSlug);
    const productData = { ...req.body, slug, seller: req.user._id };
    const product = await Product.create(productData);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const updateData = { ...req.body };
    if (updateData.slug) {
      updateData.slug = await generateUniqueSlug(Product, updateData.slug, req.params.id);
    }
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized.' });
    }
    res.json({ message: 'Product deactivated.' });
  } catch (error) {
    next(error);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(10)
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.getByCategorySlug = async (req, res, next) => {
  try {
    const { Product, Category } = getMasterModels();
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    const subcategories = await Category.find({ parent: category._id });
    const catIds = [category._id, ...subcategories.map(c => c._id)];
    const { sort, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true, category: { $in: catIds } };
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'variants.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'variants.price': -1 };
    else if (sort === 'rating') sortOption = { 'ratings.avg': -1 };
    else if (sort === 'popular') sortOption = { 'ratings.count': -1 };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({
      products,
      category,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRelated = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    const products = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    }).limit(6).sort({ 'ratings.avg': -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};
