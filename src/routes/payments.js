const express = require('express');
const { authenticate } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Raw body needed for Stripe webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);

module.exports = router;
