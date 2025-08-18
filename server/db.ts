import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Handle database endpoint being disabled
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Database connection established');
  } catch (error) {
    console.log('Database connection failed:', error);
    throw new Error("Database connection failed. Please check DATABASE_URL configuration.");
  }
} else {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export { pool, db };