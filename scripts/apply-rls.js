const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// We use the same pool configuration as the app
let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.startsWith('"') && connectionString.endsWith('"')) {
  connectionString = connectionString.slice(1, -1);
}

if (!connectionString) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- 1. Helper function to get the internal user ID from the Supabase JWT
CREATE OR REPLACE FUNCTION get_internal_user_id() 
RETURNS uuid AS $$
  SELECT id FROM users WHERE email = (auth.jwt() ->> 'email')::varchar LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Helper function to get the internal user ID given a project ID
-- Assumes a user has access to a project if they belong to its organization
CREATE OR REPLACE FUNCTION has_project_access(p_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members om
    JOIN projects p ON p.organization_id = om.organization_id
    WHERE p.id = p_id AND om.user_id = get_internal_user_id()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Apply RLS to Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own record" ON users;
CREATE POLICY "Users can access their own record" ON users
  FOR ALL USING (id = get_internal_user_id());

-- 4. Apply RLS to Passports Table
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their passports" ON passports;
CREATE POLICY "Users can manage their passports" ON passports
  FOR ALL USING (user_id = get_internal_user_id());

-- 5. Apply RLS to Passport Tasks
ALTER TABLE passport_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage tasks via passport" ON passport_tasks;
CREATE POLICY "Users can manage tasks via passport" ON passport_tasks
  FOR ALL USING (passport_id IN (SELECT id FROM passports WHERE user_id = get_internal_user_id()));

-- 6. Apply RLS to Passport Decisions
ALTER TABLE passport_decisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage decisions via passport" ON passport_decisions;
CREATE POLICY "Users can manage decisions via passport" ON passport_decisions
  FOR ALL USING (passport_id IN (SELECT id FROM passports WHERE user_id = get_internal_user_id()));

-- 7. Organizations and Organization Members
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view orgs they belong to" ON organizations;
CREATE POLICY "Users can view orgs they belong to" ON organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = get_internal_user_id()));

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
CREATE POLICY "Users can view their own memberships" ON organization_members
  FOR SELECT USING (user_id = get_internal_user_id());

-- 8. Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view and manage org projects" ON projects;
CREATE POLICY "Users can view and manage org projects" ON projects
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = get_internal_user_id()));

-- 9. End Users
ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage end users via project" ON end_users;
CREATE POLICY "Users can manage end users via project" ON end_users
  FOR ALL USING (has_project_access(project_id));

-- 10. Memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage memories via API keys" ON memories;
CREATE POLICY "Users can manage memories via API keys" ON memories
  FOR ALL USING (api_key_id IN (SELECT id FROM api_keys WHERE user_id = get_internal_user_id()));

-- 11. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage profiles via end users" ON profiles;
CREATE POLICY "Users can manage profiles via end users" ON profiles
  FOR ALL USING (end_user_id IN (SELECT id FROM end_users WHERE has_project_access(project_id)));

-- 12. Timeline Events, Graph Nodes & Edges
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage timeline via end users" ON timeline_events;
CREATE POLICY "Users can manage timeline via end users" ON timeline_events
  FOR ALL USING (end_user_id IN (SELECT id FROM end_users WHERE has_project_access(project_id)));

ALTER TABLE context_graph_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage nodes via end users" ON context_graph_nodes;
CREATE POLICY "Users can manage nodes via end users" ON context_graph_nodes
  FOR ALL USING (end_user_id IN (SELECT id FROM end_users WHERE has_project_access(project_id)));

ALTER TABLE context_graph_edges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage edges via nodes" ON context_graph_edges;
CREATE POLICY "Users can manage edges via nodes" ON context_graph_edges
  FOR ALL USING (source_node_id IN (
    SELECT id FROM context_graph_nodes WHERE end_user_id IN (
      SELECT id FROM end_users WHERE has_project_access(project_id)
    )
  ));
  
-- 13. API Keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage API keys" ON api_keys;
CREATE POLICY "Users can manage API keys" ON api_keys
  FOR ALL USING (user_id = get_internal_user_id());

-- 14. Logs & Feedback
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage usage logs via project" ON usage_logs;
CREATE POLICY "Users can manage usage logs via project" ON usage_logs
  FOR ALL USING (has_project_access(project_id));
  
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage feedback via project" ON feedback;
CREATE POLICY "Users can manage feedback via project" ON feedback
  FOR ALL USING (has_project_access(project_id));
  
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage api logs via project" ON api_logs;
CREATE POLICY "Users can manage api logs via project" ON api_logs
  FOR ALL USING (has_project_access(project_id));

-- 15. Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view audit logs for their org" ON audit_logs;
CREATE POLICY "Users can view audit logs for their org" ON audit_logs
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = get_internal_user_id()));

-- 16. Billing
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view billing for their org" ON billing;
CREATE POLICY "Users can view billing for their org" ON billing
  FOR ALL USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = get_internal_user_id()));
  
-- 17. Waitlist
ALTER TABLE sdk_waitlist ENABLE ROW LEVEL SECURITY;
-- Waitlist should only be accessible via service role

`;

async function applyRLS() {
  console.log("Connecting to database to apply RLS...");
  try {
    await pool.query(sql);
    console.log("Successfully applied RLS to all tables!");
  } catch (error) {
    console.error("Failed to apply RLS:", error);
  } finally {
    pool.end();
  }
}

applyRLS();
