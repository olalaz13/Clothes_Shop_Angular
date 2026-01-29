const Order = require('../models/order.model');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    console.log('API: Get All Orders called by user:', req.user?._id);
    const orders = await Order.find().populate('user', 'fullname username');
    res.status(200).json(orders);
});

// @desc    Create an order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    console.log('API: Create Order called');
    const order = await Order.create({
        user: req.user?._id,
        items: req.body.items,
        total: req.body.total,
        shippingInfo: req.body.shippingInfo,
        shippingFee: req.body.shippingFee
    });

    res.status(201).json(order);
});

// @desc    Update order status
// @route   PATCH /api/orders/:id
// @access  Private/Staff
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    let order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
    );

    res.status(200).json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    console.log('API: Get My Orders called for user:', req.user?._id);
    const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
});
