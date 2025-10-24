/**
 * ONE-TIME MIGRATION: Convert existing INR prices to USD
 * 
 * This will convert all your existing prices from INR to USD
 * After this, you can upload new products in USD
 * 
 * IMPORTANT: Run this ONLY ONCE!
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Conversion rate: 1 USD = 88.65 INR
const INR_TO_USD_RATE = 88.65;

const ProductSchema = new mongoose.Schema({
  sku: String,
  price: Number,
  ipRatings: [{
    rating: String,
    price: Number
  }]
}, { strict: false });

async function convertPrices() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const Product = mongoose.model('Product', ProductSchema);
    
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;

    for (const product of products) {
      let hasChanges = false;
      const updates = {};

      // Convert legacy price field
      if (product.price && product.price > 0) {
        const oldPrice = product.price;
        const newPrice = Math.round((oldPrice / INR_TO_USD_RATE) * 100) / 100;
        updates.price = newPrice;
        hasChanges = true;
        console.log(`📝 ${product.sku}: Price ${oldPrice.toFixed(2)} INR → ${newPrice.toFixed(2)} USD`);
      }

      // Convert ipRatings prices
      if (product.ipRatings && product.ipRatings.length > 0) {
        const newIpRatings = product.ipRatings.map(ip => {
          if (ip.price && ip.price > 0) {
            const oldPrice = ip.price;
            const newPrice = Math.round((oldPrice / INR_TO_USD_RATE) * 100) / 100;
            console.log(`   └─ ${ip.rating}: ${oldPrice.toFixed(2)} INR → ${newPrice.toFixed(2)} USD`);
            hasChanges = true;
            return { rating: ip.rating, price: newPrice };
          }
          return ip;
        });
        
        if (hasChanges) {
          updates.ipRatings = newIpRatings;
        }
      }

      // Update product
      if (hasChanges) {
        await Product.findByIdAndUpdate(product._id, updates);
        updated++;
        console.log(`✅ Updated ${product.sku}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CONVERSION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Converted: ${updated} products from INR to USD`);
    console.log('='.repeat(60));
    console.log('\n✨ All prices are now in USD!');
    console.log('💡 From now on, upload all new products in USD.');

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('\n❌ Conversion failed:', error);
    process.exit(1);
  }
}

console.log('\n' + '⚠️ '.repeat(30));
console.log('⚠️  PRICE CONVERSION: INR → USD');
console.log('⚠️ '.repeat(30));
console.log('\n📋 This will convert ALL prices from INR to USD');
console.log(`💱 Conversion rate: 1 USD = ${INR_TO_USD_RATE} INR`);
console.log('\n⚠️  Run this ONLY ONCE!\n');
console.log('⏳ Starting in 3 seconds...\n');

setTimeout(() => {
  convertPrices().then(() => process.exit(0));
}, 3000);
