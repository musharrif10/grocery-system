const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port for other services
    auth: {
        user: process.env.EMAIL_USER, // Admin email address to send from
        pass: process.env.EMAIL_PASS  // App Password (not login password)
    }
});

/**
 * Check for products about to expire and send alerts
 */
const checkExpiryAndSendAlert = async () => {
    console.log('⏳ Running Daily Expiry Check...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        // Find products expiring within the next 3 days (including today)
        // Query condition: expiryDate >= today AND expiryDate <= threeDaysLater
        const expiringProducts = await Product.find({
            expiryDate: {
                $gte: today,
                $lte: threeDaysLater
            }
        });

        if (expiringProducts.length === 0) {
            console.log('✅ No products expiring soon.');
            return;
        }

        // Filter out products already alerted today
        const productsToAlert = expiringProducts.filter(product => {
            if (!product.lastExpiryAlertSentAt) return true; // Never alerted

            const lastAlertDate = new Date(product.lastExpiryAlertSentAt);
            lastAlertDate.setHours(0, 0, 0, 0);

            // If last alert date is less than today, send again (once per day rule)
            return lastAlertDate.getTime() < today.getTime();
        });

        console.log(`🔍 Found ${productsToAlert.length} products to alert.`);

        // Send emails
        for (const product of productsToAlert) {
            const daysRemaining = Math.ceil((new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24));

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL, // The registered admin email
                subject: `🚨 Expiry Alert: ${product.name}`,
                html: `
          <h3>Product Expiry Warning</h3>
          <p>The following product is expiring soon:</p>
          <ul>
            <li><strong>Product Name:</strong> ${product.name}</li>
            <li><strong>Product ID:</strong> ${product._id}</li>
            <li><strong>Expiry Date:</strong> ${new Date(product.expiryDate).toDateString()}</li>
            <li><strong>Days Remaining:</strong> ${daysRemaining} day(s)</li>
          </ul>
          <p>Please take necessary action.</p>
        `
            };

            await transporter.sendMail(mailOptions);
            console.log(`📧 Alert sent for ${product.name}`);

            // Update lastExpiryAlertSentAt
            product.lastExpiryAlertSentAt = new Date();
            await product.save();
        }

    } catch (err) {
        console.error('❌ Error during expiry check:', err);
    }
};

// Schedule the task to run daily at 9:00 AM
// Cron format: '0 9 * * *' (At 09:00)
// For testing purposes, you can change this to run every minute: '* * * * *'
const initScheduler = () => {
    // Check immediately on server start (optional, good for verifying)
    checkExpiryAndSendAlert();

    cron.schedule('0 9 * * *', () => {
        checkExpiryAndSendAlert();
    });

    console.log('📅 Expiry Scheduler Initialized (Runs daily at 9:00 AM)');
};

module.exports = { initScheduler, checkExpiryAndSendAlert };
