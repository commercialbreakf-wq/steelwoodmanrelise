require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  console.log("Error:", error);
  console.log("Data count:", data ? data.length : 0);
}
run();
