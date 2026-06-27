const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);

router.post(
  '/',
  authenticate,
  [
    body('productId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('title').optional().trim().isLength({ max: 200 }),
  ],
  validate,
  reviewController.createReview
);

router.post('/:id/helpful', reviewController.markHelpful);

router.post(
  '/:id/respond',
  authenticate,
  [body('body').trim().notEmpty()],
  validate,
  reviewController.respondToReview
);

module.exports = router;
