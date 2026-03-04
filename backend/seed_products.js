const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Product = require('./models/Product');

const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
    console.error("❌ MONGO_URI is missing.");
    process.exit(1);
}

const CATEGORIES = [
    'Fresh Poultry', 'Eggs', 'Dairy Products', 'Beverages',
    'Ice Cream & Frozen', 'Rice & Grains', 'Canned Goods',
    'Snacks', 'Packaged Food'
];

const UNITS = ['pcs', 'kg', 'g', 'L', 'box'];

const FAKE_PRODUCTS = [
    { name: 'Whole Chicken', category: 'Fresh Poultry', unit: 'kg' },
    { name: 'Chicken Breast', category: 'Fresh Poultry', unit: 'kg' },
    { name: 'Chicken Wings', category: 'Fresh Poultry', unit: 'kg' },
    { name: 'Chicken Drumsticks', category: 'Fresh Poultry', unit: 'kg' },
    { name: 'White Eggs (10 pack)', category: 'Eggs', unit: 'box' },
    { name: 'Brown Eggs (10 pack)', category: 'Eggs', unit: 'box' },
    { name: 'Quail Eggs', category: 'Eggs', unit: 'pcs' },
    { name: 'Full Cream Milk', category: 'Dairy Products', unit: 'L' },
    { name: 'Low Fat Milk', category: 'Dairy Products', unit: 'L' },
    { name: 'Cheddar Cheese', category: 'Dairy Products', unit: 'g' },
    { name: 'Yogurt Cup', category: 'Dairy Products', unit: 'pcs' },
    { name: 'Butter', category: 'Dairy Products', unit: 'g' },
    { name: 'Coca-Cola 1.5L', category: 'Beverages', unit: 'pcs' },
    { name: 'Pepsi 1.5L', category: 'Beverages', unit: 'pcs' },
    { name: 'Orange Juice', category: 'Beverages', unit: 'L' },
    { name: 'Mineral Water 500ml', category: 'Beverages', unit: 'pcs' },
    { name: 'Iced Coffee', category: 'Beverages', unit: 'pcs' },
    { name: 'Vanilla Ice Cream', category: 'Ice Cream & Frozen', unit: 'box' },
    { name: 'Chocolate Ice Cream', category: 'Ice Cream & Frozen', unit: 'box' },
    { name: 'Frozen Peas', category: 'Ice Cream & Frozen', unit: 'g' },
    { name: 'Frozen Corn', category: 'Ice Cream & Frozen', unit: 'g' },
    { name: 'Ice Cubes', category: 'Ice Cream & Frozen', unit: 'box' },
    { name: 'Basmati Rice', category: 'Rice & Grains', unit: 'kg' },
    { name: 'Samba Rice', category: 'Rice & Grains', unit: 'kg' },
    { name: 'Red Rice', category: 'Rice & Grains', unit: 'kg' },
    { name: 'Wheat Flour', category: 'Rice & Grains', unit: 'kg' },
    { name: 'Mung Beans', category: 'Rice & Grains', unit: 'kg' },
    { name: 'Canned Fish (Mackerel)', category: 'Canned Goods', unit: 'pcs' },
    { name: 'Canned Tuna', category: 'Canned Goods', unit: 'pcs' },
    { name: 'Baked Beans', category: 'Canned Goods', unit: 'pcs' },
    { name: 'Condensed Milk', category: 'Canned Goods', unit: 'pcs' },
    { name: 'Corned Beef', category: 'Canned Goods', unit: 'pcs' },
    { name: 'Potato Chips', category: 'Snacks', unit: 'pcs' },
    { name: 'Chocolate Bar', category: 'Snacks', unit: 'pcs' },
    { name: 'Assorted Biscuits', category: 'Snacks', unit: 'box' },
    { name: 'Peanuts 100g', category: 'Snacks', unit: 'pcs' },
    { name: 'Gummy Bears', category: 'Snacks', unit: 'pcs' },
    { name: 'Instant Noodles', category: 'Packaged Food', unit: 'pcs' },
    { name: 'Pasta (Spaghetti)', category: 'Packaged Food', unit: 'pcs' },
    { name: 'Tomato Ketchup', category: 'Packaged Food', unit: 'pcs' },
    { name: 'Mayonnaise', category: 'Packaged Food', unit: 'pcs' },
    { name: 'Sugar 1kg', category: 'Packaged Food', unit: 'kg' },
    { name: 'Tea Leaves 250g', category: 'Packaged Food', unit: 'pcs' }
];

async function seed() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Connected to MongoDB for seeding...");

        const productsToInsert = [];

        for (let i = 0; i < 85; i++) {
            // Pick a base product template or create a generic one
            const template = FAKE_PRODUCTS[i % FAKE_PRODUCTS.length];

            // Randomize some values
            const name = template.name;
            const stock = Math.floor(Math.random() * 100) + 10;
            const price = Math.floor(Math.random() * 1500) + 50;
            const threshold = Math.floor(Math.random() * 20) + 5;

            // Expiry Date within the next 2 months, or already expired for some
            const now = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(now.getDate() + (Math.floor(Math.random() * 120) - 10)); // -10 to 110 days from now

            productsToInsert.push({
                name,
                category: template.category,
                unit: template.unit,
                stock,
                price,
                expiryDate,
                threshold,
                supplier: "ABC Distributor Ltd"
            });
        }

        await Product.insertMany(productsToInsert);
        console.log(`✅ Successfully added 85 fake products!`);

        process.exit(0);
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
}

seed();
