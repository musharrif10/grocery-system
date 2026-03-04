const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    category: String,
    quantitySold: Number,
    totalPrice: Number,
    saleDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', SaleSchema);
