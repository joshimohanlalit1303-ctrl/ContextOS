const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  await client.connect();
  console.log("Connected to DB");
  const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '00003_upgrade_to_768_again.sql'), 'utf-8');
  await client.query(sql);
  console.log("Migration executed successfully!");
  await client.end();
}

run().catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
