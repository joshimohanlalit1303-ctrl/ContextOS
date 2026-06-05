import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Prevent crash on import if env variable is missing (e.g., server not restarted)
let connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres";
if (connectionString.startsWith('"') && connectionString.endsWith('"')) {
  connectionString = connectionString.slice(1, -1);
}

// Cache the pool to prevent connection exhaustion in Next.js dev mode
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
