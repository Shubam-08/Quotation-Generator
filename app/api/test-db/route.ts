import { NextResponse } from 'next/server';
import { checkConnection, getDatabase } from '@/lib/mongodb';
import type { ConnectionStatus } from '@/types/mongodb';

export async function GET() {
  try {
    // Check if MongoDB connects
    const isConnected = await checkConnection();

    if (!isConnected) {
      return NextResponse.json({ connected: false, error: 'Failed to connect to MongoDB' }, { status: 500 });
    }

    // Optional: get database instance
    const db = await getDatabase();
    
    return NextResponse.json({
      connected: true,
      message: 'Successfully connected to MongoDB',
      database: db.databaseName
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
