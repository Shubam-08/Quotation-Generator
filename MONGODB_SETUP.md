# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas connection for your Next.js project.

## Prerequisites

- Node.js installed
- MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Setup Steps

### 1. Create MongoDB Atlas Account and Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login
2. Create a new cluster (free M0 tier is sufficient for development)
3. Wait for the cluster to be provisioned (usually takes 3-5 minutes)

### 2. Configure Database Access

1. In Atlas dashboard, go to **Database Access** (under Security)
2. Click **Add New Database User**
3. Choose authentication method (Username/Password recommended)
4. Create a username and strong password
5. Set user privileges (e.g., "Read and write to any database")
6. Click **Add User**

### 3. Configure Network Access

1. Go to **Network Access** (under Security)
2. Click **Add IP Address**
3. For development, you can click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IP addresses
4. Click **Confirm**

### 4. Get Connection String

1. Go to **Database** (under Deployment)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Driver**: Node.js and **Version**: 6.0 or later
5. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholders:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/qlite_quotation?retryWrites=true&w=majority
   MONGODB_DB=qlite_quotation
   ```

   Replace:
   - `your-username` with your database username
   - `your-password` with your database password
   - `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - `qlite_quotation` with your desired database name

### 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the test endpoint in your browser:
   ```
   http://localhost:3000/api/test-db
   ```

3. You should see a JSON response like:
   ```json
   {
     "connected": true,
     "message": "Successfully connected to MongoDB",
     "database": "qlite_quotation",
     "collections": 0,
     "dataSize": 0,
     "indexes": 0
   }
   ```

## Project Structure

```
qlite-quotation/
├── lib/
│   └── mongodb.ts          # MongoDB connection utility
├── types/
│   └── mongodb.ts          # TypeScript types for MongoDB
├── app/
│   └── api/
│       └── test-db/
│           └── route.ts    # Test endpoint to verify connection
├── .env.example            # Environment variables template
└── .env.local             # Your actual environment variables (gitignored)
```

## Usage in Your Code

### Using Mongoose (Recommended for Models)

```typescript
import dbConnect from '@/lib/mongodb';
import YourModel from '@/lib/models/YourModel';

// In your API route
export async function GET() {
  await dbConnect(); // Establishes Mongoose connection
  const data = await YourModel.find();
  return NextResponse.json(data);
}
```

### Using Native MongoDB Driver

```typescript
import { getDatabase } from '@/lib/mongodb';

// Get database instance
const db = await getDatabase();

// Access a collection
const collection = db.collection('your-collection-name');

// Insert a document
await collection.insertOne({ name: 'Example', createdAt: new Date() });

// Find documents
const documents = await collection.find({}).toArray();
```

### Check Connection Status

```typescript
import { checkConnection } from '@/lib/mongodb';

const isConnected = await checkConnection();
if (isConnected) {
  console.log('MongoDB is connected');
}
```

## Troubleshooting

### Connection Timeout
- Check if your IP address is whitelisted in Network Access
- Verify your connection string is correct
- Ensure your cluster is running

### Authentication Failed
- Double-check username and password in `.env.local`
- Make sure password doesn't contain special characters that need URL encoding
- If password has special characters, encode them (e.g., `@` becomes `%40`)

### Database Not Found
- MongoDB creates databases automatically when you first write data
- The database name in the connection string is optional
- You can specify it via `MONGODB_DB` environment variable

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong passwords** for database users
3. **Restrict IP access** in production environments
4. **Rotate credentials** regularly
5. **Use separate databases** for development, staging, and production
6. **Enable audit logs** in MongoDB Atlas for production

## Next Steps

- Create your data models/schemas
- Set up collections and indexes
- Implement CRUD operations
- Add data validation
- Set up backup strategies

## Resources

- [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
- [Next.js with MongoDB Example](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
