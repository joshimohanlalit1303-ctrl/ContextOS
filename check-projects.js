import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  try {
    const projects = await pool.query('SELECT id, organization_id FROM projects;');
    console.log("Projects:", projects.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
