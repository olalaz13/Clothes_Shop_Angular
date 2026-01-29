const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Only Employees and Admins can modify products)
router.post('/', protect, authorize('admin', 'employee'), productController.createProduct);
router.put('/:id', protect, authorize('admin', 'employee'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'employee'), productController.deleteProduct);

module.exports = router;
