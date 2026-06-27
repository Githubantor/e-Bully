const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);

router.post(
  '/items',
  [
    body('productId').notEmpty().withMessage('Product ID is required.'),
    body('variantSku').notEmpty().withMessage('Variant SKU is required.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validate,
  cartController.addItem
);

router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
