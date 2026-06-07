import { pool } from '../lib/db';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkHealth() {
  console.log("Checking Database Health...");
  try {
    const start = Date.now();
    const result = await pool.query('SELECT count(*) as count FROM memories');
    const latency = Date.now() - start;
    
    console.log("✅ Database is reachable!");
    console.log(`⏱️  Query Latency: ${latency}ms`);
    console.log(`📊 Total Memories in DB: ${result.rows[0].count}`);
    
  } catch (err: any) {
    console.error("❌ Database health check failed:");
    console.error(err.stack || err);
  }
}

checkHealth().then(() => process.exit(0));
