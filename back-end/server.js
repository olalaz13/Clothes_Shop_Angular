const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('--- ENV CHECK ---');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'LOADED' : 'MISSING');
console.log('-----------------');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const productRoutes = require('./src/routes/product.routes');
const authRoutes = require('./src/routes/auth.routes');
const userServiceRoutes = require('./src/routes/user.routes');
const orderRoutes = require('./src/routes/order.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const categoryRoutes = require('./src/routes/category.routes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userServiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler Middleware (Must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
