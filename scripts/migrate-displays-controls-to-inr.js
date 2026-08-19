require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const RATE = 95.62;
const DRY_RUN = false;

async function migratePrices() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    let totalUpdated = 0;
    let totalSkipped = 0;

    // ---- LED DISPLAYS ----
    console.log('\n=== LED DISPLAYS ===');
    const displays = await db.collection('leddisplays').find({}).toArray();
    console.log(`Found ${displays.length} LED Displays`);

    for (const display of displays) {
      const updateData = {};

      if (display.price && display.price > 0) {
        if (display.price > 10000) {
          console.log(`SKIP ${display.sku}: price ${display.price} already INR`);
          totalSkipped++;
          continue;
        }
        const newPrice = Math.round(display.price * RATE * 100) / 100;
        updateData.price = newPrice;
        console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${display.sku}: $${display.price} → ₹${newPrice}`);
      }

      if (display.cabinetMaterialVariants && display.cabinetMaterialVariants.length > 0) {
        const newVariants = display.cabinetMaterialVariants.map(v => ({
          ...v,
          price: v.price > 10000 ? v.price : Math.round(v.price * RATE * 100) / 100
        }));
        updateData.cabinetMaterialVariants = newVariants;
      }

      if (Object.keys(updateData).length > 0) {
        if (!DRY_RUN) {
          await db.collection('leddisplays').updateOne(
            { _id: display._id },
            { $set: updateData }
          );
        }
        totalUpdated++;
      }
    }

    // ---- LIGHTING CONTROLS ----
    console.log('\n=== LIGHTING CONTROLS ===');
    const controls = await db.collection('lightingcontrols').find({}).toArray();
    console.log(`Found ${controls.length} Lighting Controls`);

    for (const control of controls) {
      const updateData = {};

      if (control.price && control.price > 0) {
        if (control.price > 10000) {
          console.log(`SKIP ${control.sku}: price ${control.price} already INR`);
          totalSkipped++;
          continue;
        }
        const newPrice = Math.round(control.price * RATE * 100) / 100;
        updateData.price = newPrice;
        console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}${control.sku}: $${control.price} → ₹${newPrice}`);
      }

      if (control.priceVariants && control.priceVariants.length > 0) {
        const newVariants = control.priceVariants.map(v => ({
          ...v,
          price: v.price > 10000 ? v.price : Math.round(v.price * RATE * 100) / 100
        }));
        updateData.priceVariants = newVariants;
      }

      if (Object.keys(updateData).length > 0) {
        if (!DRY_RUN) {
          await db.collection('lightingcontrols').updateOne(
            { _id: control._id },
            { $set: updateData }
          );
        }
        totalUpdated++;
      }
    }

    console.log('\n=== MIGRATION COMPLETE ===');
    console.log(`Updated: ${totalUpdated}`);
    console.log(`Skipped: ${totalSkipped}`);
    if (DRY_RUN) console.log('\n⚠️  DRY RUN — No actual changes made!');

  } finally {
    await client.close();
  }
}

migratePrices();
