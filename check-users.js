import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.lyqbelghbraqizurewwj:byKcyq-kuhqax-5gogfi@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  try {
    const users = await pool.query('SELECT id, email FROM users;');
    console.log("Users:", users.rows);
    
    const endUsers = await pool.query('SELECT id, project_id, external_id FROM end_users;');
    console.log("End Users:", endUsers.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
