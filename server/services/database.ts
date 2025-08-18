import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../database/schema';

// Initialize database connection
function createDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - database features will be unavailable');
    return null;
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return drizzle({ client: pool, schema });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
}

export const db = createDatabaseConnection();

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return db !== null;
}