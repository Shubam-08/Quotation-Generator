/**
 * Migration Script: Convert old IP rating format to new format with individual prices
 * 
 * This script migrates products from the old format:
 *   ipRating: ["IP20", "IP30"]
 *   price: 100
 * 
 * To the new format:
 *   ipRatings: [{ rating: "IP20", price: 100 }, { rating: "IP30", price: 100 }]
 * 
 * Run this script once to migrate existing data.
 * Usage: npx ts-node scripts/migrate-ip-ratings.ts
 */

import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import Product from '../lib/models/Product';

async function migrateIpRatings() {
  try {
    console.log('🔄 Starting IP rating migration...\n');
    
    await dbConnect();
    
    // Find all products with old format (has ipRating array but no ipRatings)
    const productsToMigrate = await Product.find({
      ipRating: { $exists: true, $ne: [] },
      $or: [
        { ipRatings: { $exists: false } },
        { ipRatings: { $size: 0 } }
      ]
    });
    
    console.log(`📦 Found ${productsToMigrate.length} products to migrate\n`);
    
    if (productsToMigrate.length === 0) {
      console.log('✅ No products need migration. All products are up to date!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of productsToMigrate) {
      try {
        // Convert old format to new format
        const ipRatings = product.ipRating.map((rating: string) => ({
          rating: rating,
          price: product.price || 0
        }));
        
        // Update the product
        await Product.findByIdAndUpdate(product._id, {
          ipRatings: ipRatings,
          // Keep the old fields for backward compatibility
          ipRating: product.ipRating,
          price: product.price
        });
        
        successCount++;
        console.log(`✅ Migrated: ${product.sku} - ${product.ipRating.length} IP ratings`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating ${product.sku}:`, error);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} products`);
    console.log(`   ❌ Failed: ${errorCount} products`);
    console.log(`   📦 Total processed: ${productsToMigrate.length} products\n`);
    
    if (successCount > 0) {
      console.log('⚠️  IMPORTANT: After migration, admin users should:');
      console.log('   1. Review each product in the admin panel');
      console.log('   2. Update prices for each IP rating as needed');
      console.log('   3. The current price has been copied to all IP ratings\n');
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
migrateIpRatings()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
