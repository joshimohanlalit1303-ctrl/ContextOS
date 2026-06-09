const { db } = require('./lib/db/index.ts');
// Wait, lib/db/index is typescript. I'll use raw pg.
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query('SELECT content FROM memories');
  console.log("Here are the memories stored:");
  res.rows.forEach(r => console.log("- " + r.content));
  await client.end();
}
run();
