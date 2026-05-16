const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
    const { data, count, error } = await supabase.from('products').select('*', { count: 'exact' }).limit(5);
    console.log('Count:', count);
    console.log('Error:', error);
    console.log('Data sample:', data ? data.length : 0);
}

test();
