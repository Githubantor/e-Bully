const { getMasterModels } = require('../config/db');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const { Order, Product, Cart } = getMasterModels();
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      const variant = product.variants.find(v => v.sku === item.variantSku);
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title} (${item.variantSku}).`,
        });
      }
    }
    const orderItems = await Promise.all(cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      const variant = product.variants.find(v => v.sku === item.variantSku);
      return {
        product: product._id,
        title: product.title,
        variantSku: item.variantSku,
        variantAttributes: variant?.attributes,
        quantity: item.quantity,
        price: item.price,
        image: product.images[0]?.url || '',
        seller: product.seller,
      };
    }));
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const taxRate = 0.08;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + shipping + tax - cart.discount) * 100) / 100;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
      status: 'pending',
      statusHistory: [{ status: 'pending', note: 'Order placed.' }],
      totals: { subtotal, shipping, tax, discount: cart.discount, total },
      couponCode: cart.couponCode,
      notes,
    });
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.variantSku },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }
    cart.items = [];
    cart.couponCode = undefined;
    cart.discount = 0;
    await cart.save();
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const { Order } = getMasterModels();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    order.status = status;
    order.statusHistory.push({ status, note: note || `Status changed to ${status}.` });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be confirmed.' });
    }
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Confirmed by customer.' });
    await order.save();
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { Order, Product } = getMasterModels();
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage.' });
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer.' });
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.variantSku },
        { $inc: { 'variants.$.stock': item.quantity } }
      );
    }
    await order.save();
    res.json({ order });
  } catch (error) {
    next(error);
  }
};
