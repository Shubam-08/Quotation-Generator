import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

// Extend the global namespace for MongoDB client caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongooseConnection: typeof mongoose | undefined;
}

// Base interface for MongoDB documents
export interface MongoDocument {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Connection status type
export interface ConnectionStatus {
  connected: boolean;
  message?: string;
  error?: string;
}

// Database configuration
export interface MongoDBConfig {
  uri: string;
  dbName?: string;
  options?: Record<string, unknown>;
}
