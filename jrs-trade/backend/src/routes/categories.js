const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [body('name').trim().notEmpty(), body('slug').trim().notEmpty()],
  validate,
  categoryController.create
);

router.put('/:id', authenticate, authorize('admin'), categoryController.update);
router.delete('/:id', authenticate, authorize('admin'), categoryController.remove);

module.exports = router;
