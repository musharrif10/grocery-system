const now = new Date();
const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD
const expiryDate = new Date(todayString); // Midnight UTC? or Local?

console.log("Now:", now.toISOString());
console.log("Expiry (Today String):", expiryDate.toISOString());

const daysLeft = (expiryDate - now) / (1000 * 60 * 60 * 24);
console.log("Days Left raw:", daysLeft);
console.log("Is >= 0?", daysLeft >= 0);
