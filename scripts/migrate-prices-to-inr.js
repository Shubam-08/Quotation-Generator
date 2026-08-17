require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const DRY_RUN = false; // Change to false to actually update

async function migratePrices() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    
    console.log(`Found ${products.length} products`);
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const product of products) {
      try {
        const updateData = {};
        
        // Convert base price
        if (product.price && product.price > 0) {
          if (product.price > 10000) {
            console.log(`SKIP ${product.sku}: price ${product.price} looks like INR already`);
            skipped++;
            continue;
          }
          const newPrice = Math.round(product.price * 95.62 * 100) / 100;
          updateData.price = newPrice;
          console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${product.sku}: $${product.price} → ₹${newPrice}`);
        }
        
        // Convert IP rating prices
        if (product.ipRatings && product.ipRatings.length > 0) {
          const newIpRatings = product.ipRatings.map(ip => {
            const newPrice = ip.price > 10000 ? ip.price : Math.round(ip.price * 95.62 * 100) / 100;
            if (newPrice !== ip.price) {
              console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${product.sku} [${ip.rating}]: $${ip.price} → ₹${newPrice}`);
            }
            return { ...ip, price: newPrice };
          });
          updateData.ipRatings = newIpRatings;
        }
        
        if (Object.keys(updateData).length > 0) {
          if (!DRY_RUN) {
            await db.collection('products').updateOne(
              { _id: product._id },
              { $set: updateData }
            );
          }
          updated++;
        }
        
      } catch (err) {
        console.error(`FAILED ${product.sku}:`, err.message);
        failed++;
      }
    }
    
    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);
    
  } finally {
    await client.close();
  }
}

migratePrices();
