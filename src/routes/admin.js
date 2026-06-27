const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/orders', adminController.getAllOrders);
router.get('/products', adminController.getAllProducts);

module.exports = router;
