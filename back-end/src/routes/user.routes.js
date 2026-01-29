const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Current user
router.get('/me', protect, userController.getMe);

// Wishlist
router.post('/wishlist/:productId', protect, userController.toggleWishlist);
router.get('/wishlist', protect, userController.getWishlist);

// Admin/Staff only
router.get('/employees', protect, authorize('admin'), userController.getEmployees);
router.get('/customers', protect, authorize('admin', 'employee'), userController.getCustomers);

// User editing
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);
router.put('/:id', protect, authorize('admin'), userController.updateUser);

module.exports = router;
