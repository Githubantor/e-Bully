const { getMasterModels } = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { Category } = getMasterModels();
    const categories = await Category.find({ isActive: true })
      .populate('children')
      .sort({ order: 1, name: 1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const { Category } = getMasterModels();
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('children');
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { Category } = getMasterModels();
    const { name, slug, description, image, parent, order } = req.body;
    const category = await Category.create({ name, slug, description, image, parent, order });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { Category } = getMasterModels();
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { Category } = getMasterModels();
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ message: 'Category deactivated.' });
  } catch (error) {
    next(error);
  }
};
