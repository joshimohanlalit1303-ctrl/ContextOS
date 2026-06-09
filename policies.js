import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    const { data: qData } = await supabase.from('pg_policies').select('*');
    console.log(qData);
  } else {
    console.log(data);
  }
}
run();
