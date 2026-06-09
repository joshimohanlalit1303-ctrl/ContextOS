const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("Connected to DB.");

  try {
    await client.query('ALTER TABLE memories ADD COLUMN vector_id SERIAL UNIQUE;');
    console.log("Added vector_id to memories.");
  } catch (e) {
    console.log("memories: " + e.message);
  }

  try {
    await client.query('ALTER TABLE passports ADD COLUMN vector_id SERIAL UNIQUE;');
    console.log("Added vector_id to passports.");
  } catch (e) {
    console.log("passports: " + e.message);
  }

  await client.end();
}
run();
