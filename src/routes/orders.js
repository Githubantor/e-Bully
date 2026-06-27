const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('shippingAddress.street').notEmpty(),
    body('shippingAddress.city').notEmpty(),
    body('shippingAddress.state').notEmpty(),
    body('shippingAddress.zip').notEmpty(),
    body('paymentMethod').isIn(['stripe', 'paypal', 'cod']),
  ],
  validate,
  orderController.createOrder
);

router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/confirm', orderController.confirmOrder);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
