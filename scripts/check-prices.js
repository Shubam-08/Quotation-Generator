// Quick script to check what prices are actually in the database
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: String,
  price: Number,
  ipRatings: [{
    rating: String,
    price: Number
  }]
}, { strict: false });

async function checkPrices() {
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
    
    // Get first 5 products
    const products = await Product.find({}).limit(5);
    
    console.log('📦 Sample Products:\n');
    products.forEach(p => {
      console.log(`SKU: ${p.sku}`);
      if (p.ipRatings && p.ipRatings.length > 0) {
        p.ipRatings.forEach(ip => {
          console.log(`  └─ ${ip.rating}: ${ip.price}`);
        });
      } else if (p.price) {
        console.log(`  └─ Price: ${p.price}`);
      }
      console.log('');
    });

    await mongoose.connection.close();
    console.log('🔌 Disconnected');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPrices().then(() => process.exit(0));
