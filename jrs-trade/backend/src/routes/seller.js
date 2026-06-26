const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');

const router = express.Router();

router.use(authenticate, authorize('seller', 'admin'));

router.get('/dashboard', sellerController.getDashboard);
router.get('/orders', sellerController.getSellerOrders);
router.get('/products', sellerController.getSellerProducts);
router.get('/analytics', sellerController.getSellerAnalytics);
router.put('/orders/:orderId/items/:itemId', sellerController.updateOrderItemStatus);
router.put('/orders/:orderId/items', sellerController.bulkUpdateOrderItems);

module.exports = router;
