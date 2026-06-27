const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication & user management
 *
 * components:
 *   schemas:
 *     SignupInput:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         password: { type: string, minLength: 8 }
 *         role: { type: string, enum: [buyer, seller] }
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user: { $ref: '#/components/schemas/User' }
 *         accessToken: { type: string }
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 *         role: { type: string }
 *         isActive: { type: boolean }
 */

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character.'),
    body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller.'),
  ],
  validate,
  authController.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.put('/profile', authenticate, authController.updateProfile);

router.post('/addresses', authenticate, authController.addAddress);
router.put('/addresses/:addressId', authenticate, authController.updateAddress);
router.delete('/addresses/:addressId', authenticate, authController.deleteAddress);

module.exports = router;
