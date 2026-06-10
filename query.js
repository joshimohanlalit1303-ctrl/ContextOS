import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: apiKeys } = await supabase.from('api_keys').select('*');
  console.log("All API Keys:", apiKeys);
  const { data: memories } = await supabase.from('memories').select('id, api_key_id, end_user_id').limit(5);
  console.log("Memories:", memories);
}
run();
