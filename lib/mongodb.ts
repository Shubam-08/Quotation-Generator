import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongooseConnection: typeof mongoose | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose connection function
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    // Already connected
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, use a global variable to preserve the connection
    if (!global._mongooseConnection) {
      global._mongooseConnection = await mongoose.connect(uri);
    }
    return global._mongooseConnection;
  }

  // In production, create a new connection
  return mongoose.connect(uri);
}

// Export the Mongoose connection function as default
export default dbConnect;

// Also export the native MongoDB client promise for direct access
export const mongoClientPromise = clientPromise;

// Helper function to get the database
export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await clientPromise;
  const databaseName = dbName || process.env.MONGODB_DB || 'gshubam704_db_user';
  return client.db(databaseName);
}

// Helper function to check connection status
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}
