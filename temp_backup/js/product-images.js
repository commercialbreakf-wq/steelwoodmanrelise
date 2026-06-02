const categoryImages = {
    'Проволока': '/images/products/steel_wire_premium_1778423804026.png',
    'Катанка': '/images/products/wire_rod_premium_1778423828914.png',
    'Квадрат': '/images/products/square_steel_premium_1778423850615.png',
    'Круг': '/images/products/round_steel_premium_1778423868660.png',
    'Труба ВГП': '/images/products/vgp_pipes_premium_1778423885236.png',
    'Труба профильная': '/images/products/profile_tubes_premium_1778423900429.png',
    'Лист горячекатаный': '/images/products/hot_rolled_sheets_premium_1778423920658.png',
    'Лист г/к риф': '/images/products/checker_plate_premium_1778423936809.png',
    'Лист холоднокатаный': '/images/products/cold_rolled_sheets_premium_1778423951350.png',
    'Сетка': '/images/products/steel_mesh_premium_1778423969480.png',
    'Балка': '/images/products/steel_beams_premium_1778423982429.png',
    'Уголок': '/images/products/steel_angles_premium_1778423996872.png',
    'Швеллер': '/images/products/steel_channels_premium_1778424020131.png',
    'Профнастил': '/images/products/hot_rolled_sheets_premium_1778423920658.png', // Fallback
    'Арматура': '/images/products/round_steel_premium_1778423868660.png', // Fallback
    'default': '/images/products/hot_rolled_sheets_premium_1778423920658.png'
};

function getProductImage(category) {
    return categoryImages[category] || categoryImages['default'];
}

if (typeof window !== 'undefined') {
    window.getProductImage = getProductImage;
}
