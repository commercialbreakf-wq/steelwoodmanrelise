const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function test() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Product 1 found:', data.name);
    }
}

test();
