const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getMasterModels } = require('../config/db');

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { Cart } = getMasterModels();
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const taxRate = 0.08;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + shipping + tax - cart.discount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret, total: total / 100 });
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { Order } = getMasterModels();
    await Order.findOneAndUpdate(
      { 'payment.stripePaymentIntentId': paymentIntent.id },
      {
        'payment.status': 'paid',
        'payment.paidAt': new Date(),
        status: 'confirmed',
        $push: { statusHistory: { status: 'confirmed', note: 'Payment confirmed.' } },
      }
    );
  }
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const { Order } = getMasterModels();
    await Order.findOneAndUpdate(
      { 'payment.stripePaymentIntentId': paymentIntent.id },
      { 'payment.status': 'failed' }
    );
  }
  res.json({ received: true });
};
