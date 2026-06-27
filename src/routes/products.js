const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

const productValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('category').notEmpty().withMessage('Category is required.'),
  body('variants').isArray({ min: 1 }).withMessage('At least one variant is required.'),
  body('variants.*.price').isFloat({ min: 0 }).withMessage('Variant price must be a positive number.'),
  body('variants.*.stock').isInt({ min: 0 }).withMessage('Variant stock must be a non-negative integer.'),
];

router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/category/:slug', productController.getByCategorySlug);
router.get('/related/:id', productController.getRelated);
router.get('/:slug', productController.getBySlug);

router.post('/', authenticate, productValidation, validate, productController.create);
router.put('/:id', authenticate, productValidation, validate, productController.update);
router.delete('/:id', authenticate, productController.remove);

module.exports = router;
