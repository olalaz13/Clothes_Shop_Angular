const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            title: String,
            price: Number,
            qty: {
                type: Number,
                required: true,
                default: 1
            },
            size: String,
            color: String,
            img: String
        }
    ],
    total: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    shippingInfo: {
        fullname: String,
        address: String,
        phone: String,
        paymentMethod: {
            type: String,
            default: 'cod'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
