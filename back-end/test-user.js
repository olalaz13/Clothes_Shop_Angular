const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clothes-shop';

async function testUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected');

        await User.deleteMany({ username: 'testuser' });

        const user = new User({
            fullname: 'Test User',
            username: 'testuser',
            password: 'password123',
            role: 'customer'
        });

        await user.save();
        console.log('Test User Saved!');
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

testUser();
