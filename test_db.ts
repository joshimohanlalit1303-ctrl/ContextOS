import { Pool } from 'pg';
require('dotenv').config({ path: '.env.local' });
let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.startsWith('"') && connectionString.endsWith('"')) { connectionString = connectionString.slice(1, -1); }
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
async function run() {
  const res = await pool.query(`
    SELECT atttypmod
    FROM pg_attribute
    WHERE attrelid = 'memories'::regclass AND attname = 'embedding';
  `);
  console.log(res.rows);
  pool.end();
}
run();
