const mongoose = require('mongoose');
const Product = require('./src/models/product.model');
const User = require('./src/models/user.model');
const Order = require('./src/models/order.model');
const Category = require('./src/models/category.model');
require('dotenv').config();

const products = [
    // --- SHIRTS ---
    { title: 'Linen Shirt', price: 49, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200', desc: 'Lightweight linen shirt — perfect for summer.' },
    { title: 'Oxford Button-Down', price: 55, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1200', desc: 'Classic oxford shirt for a smart look.' },
    { title: 'Flannel Plaid Shirt', price: 45, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=1200', desc: 'Warm and cozy flannel for cooler days.' },
    { title: 'Denim Shirt', price: 59, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1583912267550-d44d4a3c5a71?q=80&w=1200', desc: 'Rugged denim shirt with a vintage wash.' },
    { title: 'Striped Business Shirt', price: 65, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?q=80&w=1200', desc: 'Professional striped shirt for office wear.' },
    { title: 'Hawaiian Party Shirt', price: 39, cat: 'Shirts', img: 'https://images.unsplash.com/photo-1598911510795-7e720ff392a9?q=80&w=1200', desc: 'Vibrant hawaiian shirt for vacation vibes.' },

    // --- T-SHIRTS ---
    { title: 'Classic Tee', price: 19, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200', desc: 'Soft cotton t-shirt with a relaxed fit.' },
    { title: 'Graphic Logo Tee', price: 25, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200', desc: 'Stylish tee with our signature logo.' },
    { title: 'V-Neck Essential', price: 22, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200', desc: 'Premium v-neck tee for everyday layering.' },
    { title: 'Oversized Streetwear Tee', price: 29, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1554568212-3a1a8ba2c754?q=80&w=1200', desc: 'Urban oversized fit with heavy cotton.' },
    { title: 'Pocket Tee', price: 24, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1200', desc: 'Casual pocket tee in slate grey.' },
    { title: 'Retro Ringer Tee', price: 27, cat: 'T-Shirts', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1200', desc: 'Vintage inspired ringer tee with contrast collar.' },

    // --- JACKETS ---
    { title: 'Denim Jacket', price: 89, cat: 'Jackets', img: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?q=80&w=1200', desc: 'Timeless denim jacket with contrast stitching.' },
    { title: 'Leather Biker Jacket', price: 199, cat: 'Jackets', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200', desc: 'Premium genuine leather biker jacket.' },
    { title: 'Puffer Winter Coat', price: 129, cat: 'Jackets', img: 'https://images.unsplash.com/photo-1544022613-e87ef75a784a?q=80&w=1200', desc: 'Highly insulated puffer for extreme cold.' },
    { title: 'Light Bomber Jacket', price: 75, cat: 'Jackets', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200', desc: 'Sleek bomber jacket for transitional seasons.' },
    { title: 'Windbreaker Pro', price: 69, cat: 'Jackets', img: 'https://images.unsplash.com/photo-1504191467541-2511bd7bb3a3?q=80&w=1200', desc: 'Weather-resistant windbreaker for outdoor adventures.' },

    // --- PANTS ---
    { title: 'Chino Pants', price: 54, cat: 'Pants', img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200', desc: 'Smart-casual chinos, straight fit.' },
    { title: 'Slim Fit Jeans', price: 65, cat: 'Pants', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200', desc: 'Dark wash slim fit jeans with slight stretch.' },
    { title: 'Cargo Joggers', price: 49, cat: 'Pants', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200', desc: 'Utility joggers with multiple pockets.' },
    { title: 'Tailored Trousers', price: 85, cat: 'Pants', img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200', desc: 'Formal wool-blend trousers for business.' },
    { title: 'Corduroy Slacks', price: 59, cat: 'Pants', img: 'https://images.unsplash.com/photo-1517444810072-239106093902?q=80&w=1200', desc: 'Soft corduroy pants for a textured look.' },

    // --- DRESSES ---
    { title: 'Summer Floral Dress', price: 69, cat: 'Dresses', img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200', desc: 'Flowy dress with vibrant floral print.' },
    { title: 'Midnight Silk Gown', price: 150, cat: 'Dresses', img: 'https://images.unsplash.com/photo-1539008835279-43467f27ef74?q=80&w=1200', desc: 'Elegant silk gown for evening events.' },
    { title: 'Casual Knit Dress', price: 45, cat: 'Dresses', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200', desc: 'Comfortable day dress in soft knit fabric.' },
    { title: 'Polka Dot Midi', price: 59, cat: 'Dresses', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200', desc: 'Vintage style polka dot midi dress.' },
    { title: 'Lace Evening Dress', price: 180, cat: 'Dresses', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200', desc: 'Exquisite lace detail evening dress.' },

    // --- SHOES ---
    { title: 'Canvas Sneakers', price: 79, cat: 'Shoes', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200', desc: 'Everyday sneakers with rubber sole.' },
    { title: 'Leather Loafers', price: 110, cat: 'Shoes', img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1200', desc: 'Premium handcrafted leather loafers.' },
    { title: 'Running Pro Max', price: 135, cat: 'Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200', desc: 'High-performance running shoes.' },
    { title: 'Combat Boots', price: 145, cat: 'Shoes', img: 'https://images.unsplash.com/photo-1520639889410-d0413410137f?q=80&w=1200', desc: 'Durable combat boots with side zip.' },
    { title: 'Suede Chelsea Boots', price: 160, cat: 'Shoes', img: 'https://images.unsplash.com/photo-1549415654-754859a032f6?q=80&w=1200', desc: 'Elegant suede chelsea boots in tan.' },

    // --- HOODIES/SWEATSHIRTS ---
    { title: 'Core Hoodie', price: 59, cat: 'Sweatshirts', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200', desc: 'Our most popular hoodie in charcoal grey.' },
    { title: 'Zip-Up Sport Hoodie', price: 65, cat: 'Sweatshirts', img: 'https://images.unsplash.com/photo-1513373319109-eb154073eb0b?q=80&w=1200', desc: 'Moisture-wicking zip-up for workouts.' },
    { title: 'Crewneck Pullover', price: 40, cat: 'Sweatshirts', img: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1200', desc: 'Simple and clean crewneck sweatshirt.' },
    { title: 'Vintage Wash Hoodie', price: 70, cat: 'Sweatshirts', img: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?q=80&w=1200', desc: 'Faded vintage look with premium feel.' },
    { title: 'Sherpa Lined Hoodie', price: 85, cat: 'Sweatshirts', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200', desc: 'Ultra-warm hoodie with soft sherpa lining.' }
];

const users = [
    { fullname: 'Admin User', username: 'admin', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', phone: '0901234567', isVerified: true },
    { fullname: 'Employee One', username: 'emp1', password: 'emp123', role: 'employee', firstName: 'Emp', lastName: 'One', email: 'emp1@example.com', phone: '0901234568', isVerified: true },
    { fullname: 'Customer One', username: 'cust1', password: 'cust123', role: 'customer', firstName: 'Cust', lastName: 'One', email: 'cust1@example.com', phone: '0901234569', isVerified: true },
    { fullname: 'Customer Two', username: 'cust2', password: 'cust123', role: 'customer', firstName: 'Cust', lastName: 'Two', email: 'cust2@example.com', phone: '0901234570', isVerified: true }
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clothes-shop';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        console.log('Cleaning existing data...');
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleaned!');

        console.log('Seeding categories...');
        const uniqueCats = [...new Set(products.map(p => p.cat))];
        const categoryData = uniqueCats.map(name => ({
            name,
            description: `Quality collection of ${name.toLowerCase()}`,
            image: products.find(p => p.cat === name).img
        }));
        await Category.insertMany(categoryData);
        console.log(`Seeded ${categoryData.length} categories!`);

        console.log('Seeding products...');
        const seededProducts = await Product.insertMany(products);
        console.log(`Seeded ${seededProducts.length} products!`);

        console.log('Seeding users...');
        const seededUsers = [];
        for (const u of users) {
            console.log(`Saving user: ${u.username}...`);
            const user = new User(u);
            const savedUser = await user.save();
            seededUsers.push(savedUser);
        }
        console.log('Seeded all users!');

        console.log('Seeding Sample Orders...');
        const customer = seededUsers.find(u => u.role === 'customer');
        if (customer) {
            const sampleOrder = new Order({
                user: customer._id,
                items: [
                    {
                        product: seededProducts[0]._id,
                        title: seededProducts[0].title,
                        price: seededProducts[0].price,
                        qty: 2
                    },
                    {
                        product: seededProducts[1]._id,
                        title: seededProducts[1].title,
                        price: seededProducts[1].price,
                        qty: 1
                    }
                ],
                total: seededProducts[0].price * 2 + seededProducts[1].price,
                shippingInfo: {
                    fullname: customer.fullname,
                    address: '123 Fake Street, Clothes City',
                    phone: '0123456789',
                    paymentMethod: 'cod'
                },
                status: 'delivered'
            });
            await sampleOrder.save();
            console.log('Sample order seeded!');
        }

        console.log('Data Seeding Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
}

seed();
