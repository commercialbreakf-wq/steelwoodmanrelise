const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYxMDgxNiwiZXhwIjoyMDk0MTg2ODE2fQ.dnQgta6bz30KP_NWmN-LOEdccSiVUxs2ZYvvOJCY8Hk';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CATEGORY_IMAGES_LIKE = {
    'Профнастил окрашенный%': '/images/products/real/profnastil_okrashenniy_gen.png',
    'Профнастил оцинкованный%': '/images/products/real/profnastil_ocinkovanniy_gen.png'
};

async function updateSupabase() {
    console.log("Updating Supabase images for Profnastil...");
    for (const [categoryLike, imgPath] of Object.entries(CATEGORY_IMAGES_LIKE)) {
        const { data, error } = await supabase
            .from('products')
            .update({ image: imgPath })
            .ilike('category', categoryLike);
            
        if (error) {
            console.error(`Error updating ${categoryLike}:`, error.message);
        } else {
            console.log(`Successfully updated ${categoryLike}`);
        }
    }
    console.log("Done.");
}

updateSupabase();
