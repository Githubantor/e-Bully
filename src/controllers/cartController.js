const { getMasterModels } = require('../config/db');

exports.getCart = async (req, res, next) => {
  try {
    const { Cart, Product } = getMasterModels();
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const populatedItems = await Promise.all(cart.items.map(async (item) => {
      const product = await Product.findById(item.product).select('title slug images price variants');
      return { ...item.toObject(), product };
    }));
    res.json({ cart: { ...cart.toObject(), items: populatedItems } });
  } catch (error) {
    next(error);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, variantSku, quantity = 1 } = req.body;
    const { Product } = getMasterModels();
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    const variant = product.variants.find(v => v.sku === variantSku);
    if (!variant || !variant.isActive) {
      return res.status(404).json({ message: 'Variant not found.' });
    }
    if (variant.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock.' });
    }
    const { Cart } = getMasterModels();
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const existingItem = cart.items.find(
      i => i.product.toString() === productId && i.variantSku === variantSku
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = variant.price;
    } else {
      cart.items.push({
        product: productId,
        variantSku,
        quantity,
        price: variant.price,
      });
    }
    await cart.save();
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { Cart } = getMasterModels();
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }
    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { Cart } = getMasterModels();
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const { Cart } = getMasterModels();
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.couponCode = undefined;
      cart.discount = 0;
      await cart.save();
    }
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};
