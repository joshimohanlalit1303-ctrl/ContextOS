import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  try {
    const orgs = await pool.query('SELECT * FROM organization_members;');
    console.log("Org Members:", orgs.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
