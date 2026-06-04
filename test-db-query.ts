const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./lib/db/schema');
const pool = new Pool({
  connectionString: "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});
const db = drizzle(pool, { schema });
db.query.passports.findMany({ with: { tasks: true } }).then(res => {
  console.log("Success:", res);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
