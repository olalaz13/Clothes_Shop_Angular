const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all employees
// @route   GET /api/users/employees
// @access  Private/Admin
exports.getEmployees = asyncHandler(async (req, res, next) => {
    const employees = await User.find({ role: { $in: ['employee', 'admin'] } });
    res.status(200).json(employees);
});

// @desc    Get all customers
// @route   GET /api/users/customers
// @access  Private/Staff
exports.getCustomers = asyncHandler(async (req, res, next) => {
    const customers = await User.find({ role: 'customer' });
    res.status(200).json(customers);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ message: 'User deleted' });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json(user);
});

// @desc    Get current user profile
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user?._id).select('-password');
    res.status(200).json(user);
});

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
        user.wishlist.splice(index, 1);
        await user.save();
        res.status(200).json({ status: 'removed', wishlist: user.wishlist });
    } else {
        user.wishlist.push(productId);
        await user.save();
        res.status(200).json({ status: 'added', wishlist: user.wishlist });
    }
});

// @desc    Get user wishlist products
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(user.wishlist);
});
