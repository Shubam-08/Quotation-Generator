require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function approveAdmin() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Update ALL users with role 'admin' to approved
    const result = await db.collection('users').updateMany(
      { role: 'admin' },
      { $set: { status: 'approved' } }
    );
    
    console.log(`Updated ${result.modifiedCount} admin users to approved`);
    
    // Also show all users and their status
    const users = await db.collection('users').find({}, 
      { projection: { name: 1, email: 1, role: 1, status: 1 } }
    ).toArray();
    
    console.log('\nAll users:');
    users.forEach(u => {
      console.log(`${u.name} | ${u.email} | ${u.role} | ${u.status}`);
    });
    
  } finally {
    await client.close();
  }
}

approveAdmin();
