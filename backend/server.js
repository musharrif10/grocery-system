const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================

const DB_URI = process.env.MONGO_URI;

// Safety check
if (!DB_URI) {
  console.error("❌ MONGO_URI is missing. Check your .env file or dotenv configuration.");
  process.exit(1);
}

console.log("Attempting to connect to:", DB_URI);

mongoose
  .connect(DB_URI)
  .then(() => console.log("✅ SUCCESS: Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    process.exit(1);
  });

// ================= MODELS =================

const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

// ================= AUTH ROUTES =================

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword });
    await user.save();

    res.json({ success: true, msg: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).send('Server Error');
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: '1h' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ================= PRODUCT ROUTES =================

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ================= SALES ROUTES =================

// RECORD A SALE (Decreases stock + creates sale record)
app.post('/api/sales', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 1. Find the product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ msg: "Insufficient stock" });

    // 2. Decrease Stock
    product.stock -= quantity;
    await product.save();

    // 3. Create Sale Record
    const sale = new Sale({
      productId: product._id,
      productName: product.name,
      category: product.category,
      quantitySold: quantity,
      totalPrice: product.price * quantity
    });
    await sale.save();

    res.json({ product, sale });
  } catch (err) {
    console.error("Sale Error:", err);
    res.status(500).send('Server Error');
  }
});

// GET SALES STATS (Aggregation)
app.get('/api/sales/stats', async (req, res) => {
  try {
    // Total Revenue
    const revenueData = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Sales by Category
    const categorySales = await Sale.aggregate([
      { $group: { _id: "$category", totalSales: { $sum: "$totalPrice" }, count: { $sum: "$quantitySold" } } },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      totalRevenue,
      categorySales
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).send('Server Error');
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Initialize Daily Expiry Check Scheduler
  const { initScheduler } = require('./utils/scheduler');
  initScheduler();
});
