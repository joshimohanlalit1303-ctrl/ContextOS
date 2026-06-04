const { Pool } = require('pg');
const pool = new Pool({
  connectionString: '\"postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres\"'
});
pool.query('SELECT 1').then(() => console.log('success')).catch(e => console.error(e));
