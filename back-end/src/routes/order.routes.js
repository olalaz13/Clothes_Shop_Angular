const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin', 'employee'), orderController.getAllOrders);
router.get('/mine', protect, orderController.getMyOrders);
router.post('/', protect, orderController.createOrder);
router.patch('/:id', protect, authorize('admin', 'employee'), orderController.updateOrderStatus);

module.exports = router;
