import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Prevent crash on import if env variable is missing (e.g., server not restarted)
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
