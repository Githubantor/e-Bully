const { getMasterModels } = require('../config/db');

exports.getDashboard = async (req, res, next) => {
  try {
    const { Product, Order } = getMasterModels();
    const sellerId = req.user._id;
    const [totalProducts, totalOrders, revenue, recentOrders] = await Promise.all([
      Product.countDocuments({ seller: sellerId, isActive: true }),
      Order.countDocuments({ 'items.seller': sellerId }),
      Order.aggregate([
        { $match: { 'items.seller': sellerId, 'payment.status': 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      ]),
      Order.find({ 'items.seller': sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name'),
    ]);
    const priority = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    const enrichedOrders = recentOrders.filter(order => order.items).map(order => {
      const sellerItems = (order.items || []).filter(i => i.seller && i.seller.toString() === sellerId.toString());
      if (sellerItems.length === 0) return null;
      const sellerStatuses = sellerItems.map(i => i.status || 'pending');
      const sellerStatus = sellerStatuses.reduce((a, b) =>
        priority.indexOf(a) >= priority.indexOf(b) ? a : b
      , 'pending');
      return {
        ...order.toObject(),
        sellerStatus,
        sellerItemCount: sellerItems.length,
      };
    }).filter(Boolean);
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        revenue: revenue[0]?.total || 0,
      },
      recentOrders: enrichedOrders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const { page = 1, limit = 20, status } = req.query;
    const sellerId = req.user._id;
    const filter = { items: { $elemMatch: { seller: sellerId } } };
    if (status) filter.items.$elemMatch.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    const enriched = orders.filter(order => order.items).map(order => {
      const sellerItems = (order.items || []).filter(i => i.seller && i.seller.toString() === sellerId.toString());
      if (sellerItems.length === 0) return null;
      const sellerStatuses = sellerItems.map(i => i.status || 'pending');
      const priority = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      const sellerStatus = sellerStatuses.reduce((a, b) =>
        priority.indexOf(a) >= priority.indexOf(b) ? a : b
      , 'pending');
      return {
        ...order.toObject(),
        sellerStatus,
        sellerItemCount: sellerItems.length,
      };
    }).filter(Boolean);
    res.json({
      orders: enriched,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const { Product } = getMasterModels();
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderItemStatus = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const sellerItem = order.items.find(
      i => i._id.toString() === req.params.itemId && i.seller.toString() === req.user._id.toString()
    );
    if (!sellerItem) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (!sellerItem.statusHistory) sellerItem.statusHistory = [];
    sellerItem.status = req.body.status;
    sellerItem.statusHistory.push({ status: req.body.status, note: req.body.note || `Status updated.` });
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    order.markModified('items');
    await order.save();
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateOrderItems = async (req, res, next) => {
  try {
    const { Order } = getMasterModels();
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    let updated = 0;
    for (const item of order.items) {
      if (item.seller.toString() === req.user._id.toString()) {
        if (!item.statusHistory) item.statusHistory = [];
        item.status = req.body.status;
        item.statusHistory.push({ status: req.body.status, note: req.body.note || `Status updated to ${req.body.status}.` });
        updated++;
      }
    }
    if (updated === 0) {
      return res.status(403).json({ message: 'No items found for this seller.' });
    }
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    order.markModified('items');
    await order.save();
    res.json({ order, updated });
  } catch (error) {
    next(error);
  }
};

exports.getSellerAnalytics = async (req, res, next) => {
  try {
    const { Order, Product } = getMasterModels();
    const sellerId = req.user._id;
    const { period = '30d' } = req.query;
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [salesByDay, topProducts, categoryBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: { 'items.seller': sellerId, createdAt: { $gte: since }, 'payment.status': 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            orders: { $addToSet: '$_id' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { 'items.seller': sellerId, createdAt: { $gte: since }, 'payment.status': 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: '$items.product',
            title: { $first: '$items.title' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 },
      ]),
      Product.aggregate([
        { $match: { seller: sellerId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      period,
      salesByDay,
      topProducts,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
