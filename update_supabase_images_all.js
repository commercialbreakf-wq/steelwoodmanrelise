const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYxMDgxNiwiZXhwIjoyMDk0MTg2ODE2fQ.dnQgta6bz30KP_NWmN-LOEdccSiVUxs2ZYvvOJCY8Hk';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CATEGORY_IMAGES_LIKE = {
    'Катанка%': '/images/products/real/Склад_катанка.jpg',
    'Труба ВГП%': '/images/products/real/Склад_труба_ВГП.jpg',
    'Труба профильная%': '/images/products/real/Склад_профильная_труба.jpg',
    'Лист горячекатаный%': '/images/products/real/Склад_лист_ПВЛ.jpg',
    'Лист хк%': '/images/products/real/Склад_лист_ПВЛ.jpg',
    'Балка%': '/images/products/real/beams_realistic_1_1779883702409.png',
    'Швеллер%': '/images/products/real/channel_realistic_1_1779883730333.png',
    'Профнастил%': '/images/products/real/corrugated_realistic_1_1779883763240.png'
};

async function updateSupabase() {
    console.log("Updating Supabase images...");
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
