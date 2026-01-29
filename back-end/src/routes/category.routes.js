const express = require('express');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin', 'employee'), createCategory);

router.route('/:id')
    .put(protect, authorize('admin', 'employee'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
