const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
});
pool.query('SELECT NOW()').then(res => {
  console.log("Success:", res.rows);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
