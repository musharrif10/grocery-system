const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    unit: { type: String, default: 'pcs' },
    stock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    expiryDate: Date,
    threshold: { type: Number, default: 5 }, // For low stock alerts
    supplier: String,
    lastExpiryAlertSentAt: { type: Date } // Tracks when the last alert was sent
});

module.exports = mongoose.model('Product', ProductSchema);