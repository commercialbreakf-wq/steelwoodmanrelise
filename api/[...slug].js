const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const supabaseUrl = process.env.SUPABASE_URL || 'https://drbknuvnsyonmeudoleo.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing');
}
if (!supabaseAnonKey) {
  console.error('CRITICAL: SUPABASE_ANON_KEY is missing (required for Supabase Auth)');
}

const supabase = createClient(supabaseUrl || 'http://placeholder', supabaseServiceKey || 'placeholder');
const supabaseAuth = createClient(supabaseUrl || 'http://placeholder', supabaseAnonKey || 'placeholder');

// --- In-Memory Blazing-Fast Database Engine & Caching ---
let allProductsInMemory = [];
let allUsersInMemory = [];
let allOrdersInMemory = [];
let allLeadsInMemory = [];

let isProductsWarming = false;
let isUsersWarming = false;
let isOrdersWarming = false;
let isLeadsWarming = false;

async function warmProducts() {
  if (isProductsWarming) return;
  isProductsWarming = true;
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      allProductsInMemory = data;
      console.log(`[CACHE] Successfully warmed ${allProductsInMemory.length} products in memory.`);
    } else if (error) {
      console.error('[CACHE] Error loading products into memory:', error.message);
    }
  } catch (e) {
    console.error('[CACHE] Products warming failed:', e.message);
  } finally {
    isProductsWarming = false;
  }
}

async function invalidateProductCache(productIds) {
  if (!productIds || productIds.length === 0) return;
  console.log(`[CACHE] Granularly invalidating ${productIds.length} products...`);
  try {
    const { data, error } = await supabase.from('products').select('*').in('id', productIds);
    if (!error && data) {
      data.forEach(updatedProduct => {
        const idx = allProductsInMemory.findIndex(p => String(p.id) === String(updatedProduct.id));
        if (idx !== -1) {
          allProductsInMemory[idx] = updatedProduct;
        } else {
          allProductsInMemory.unshift(updatedProduct);
        }
      });
      console.log(`[CACHE] Granularly updated ${data.length} products in memory.`);
    }
  } catch (e) {
    console.error('[CACHE] Granular invalidation failed:', e.message);
  }
}

async function warmUsers() {
  if (isUsersWarming) return;
  isUsersWarming = true;
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      allUsersInMemory = data;
      console.log(`[CACHE] Successfully warmed ${allUsersInMemory.length} users in memory.`);
    } else if (error) {
      console.error('[CACHE] Error loading users into memory:', error.message);
    }
  } catch (e) {
    console.error('[CACHE] Users warming failed:', e.message);
  } finally {
    isUsersWarming = false;
  }
}

async function warmOrders() {
  if (isOrdersWarming) return;
  isOrdersWarming = true;
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (!error && data) {
      allOrdersInMemory = data;
      console.log(`[CACHE] Successfully warmed ${allOrdersInMemory.length} orders in memory.`);
    } else if (error) {
      console.error('[CACHE] Error loading orders into memory:', error.message);
    }
  } catch (e) {
    console.error('[CACHE] Orders warming failed:', e.message);
  } finally {
    isOrdersWarming = false;
  }
}

async function warmLeads() {
  if (isLeadsWarming) return;
  isLeadsWarming = true;
  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      allLeadsInMemory = data;
      console.log(`[CACHE] Successfully warmed ${allLeadsInMemory.length} leads in memory.`);
    } else if (error) {
      console.error('[CACHE] Error loading leads into memory:', error.message);
    }
  } catch (e) {
    console.error('[CACHE] Leads warming failed:', e.message);
  } finally {
    isLeadsWarming = false;
  }
}

function clearProductsCache() {
  console.log('[CACHE] Triggering immediate proactive Products refresh...');
  warmProducts();
}

function clearUsersCache() {
  console.log('[CACHE] Triggering immediate proactive Users refresh...');
  warmUsers();
}

function clearOrdersCache() {
  console.log('[CACHE] Triggering immediate proactive Orders refresh...');
  warmOrders();
}

function clearLeadsCache() {
  console.log('[CACHE] Triggering immediate proactive Leads refresh...');
  warmLeads();
}

// Proactive warm up on startup
async function warmupAllCaches() {
  console.log('[CACHE] Initializing proactive database warming...');
  await Promise.all([
    warmProducts(),
    warmUsers(),
    warmOrders(),
    warmLeads()
  ]);
  console.log('[CACHE] Proactive warming completed successfully!');
}

warmupAllCaches().catch(e => console.error('[CACHE] Startup warmup failed:', e.message));


const PROFILE_FIELDS = [
  'name', 'phone', 'company_name', 'inn', 'kpp',
  'legal_address', 'actual_address', 'position'
];

function sanitizeUser(row) {
  if (!row) return null;
  const { password, ...user } = row;
  return user;
}

async function getProfileByAuthId(authId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id')
    .eq('auth_id', authId)
    .maybeSingle();
  if (error) console.error('getProfileByAuthId:', error.message);
  return data;
}

async function waitForProfile(authId, attempts = 8) {
  for (let i = 0; i < attempts; i++) {
    const profile = await getProfileByAuthId(authId);
    if (profile) return profile;
    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}

async function resolveAuthSession(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (!error && data.session) {
    return { session: data.session, authUser: data.user };
  }

  const { data: legacy } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (!legacy || !legacy.password || legacy.password !== password) {
    return { error: error || new Error('Invalid credentials') };
  }

  if (!legacy.auth_id) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: legacy.name }
    });
    if (createErr && !/already|registered|exists/i.test(createErr.message)) {
      return { error: createErr };
    }
    const authId = created?.user?.id;
    if (authId) {
      await supabase.from('users').update({ auth_id: authId, password: '' }).eq('id', legacy.id);
    }
  }

  const retry = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (retry.error || !retry.data.session) {
    return { error: retry.error || error || new Error('Login failed') };
  }
  return { session: retry.data.session, authUser: retry.data.user };
}

function attachAuth(req, profile, authUser) {
  req.authUser = authUser;
  req.profile = profile;
  req.user = { id: profile.id, email: profile.email, authId: authUser.id };
}

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Войдите в аккаунт' });
  }

  try {
    const { data: { user: authUser }, error } = await supabaseAuth.auth.getUser(token);
    if (!error && authUser) {
      let profile = await getProfileByAuthId(authUser.id);
      if (!profile) profile = await waitForProfile(authUser.id);
      if (!profile) {
        return res.status(404).json({ error: 'Профиль пользователя не найден' });
      }
      attachAuth(req, profile, authUser);
      return next();
    }

    // Legacy custom JWT (старые сессии до миграции)
    const decoded = jwt.verify(token, SECRET_KEY);
    const { data: profile } = await supabase.from('users').select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id').eq('id', decoded.id).single();
    if (profile) {
      attachAuth(req, profile, { id: profile.auth_id || decoded.id });
      return next();
    }
    return res.status(403).json({ error: 'Сессия истекла, войдите снова' });
  } catch (e) {
    console.error('Auth: Token verification failed:', e.message);
    return res.status(403).json({ error: 'Сессия истекла, войдите снова' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (req.profile && req.profile.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Доступ запрещен: требуется роль администратора' });
    }
  });
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV, 
    timestamp: new Date().toISOString(),
    api: 'unified-handler'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', api: 'unified-handler' });
});

app.get('/api/test-root', (req, res) => {
  res.json({ message: 'Root API reached', url: req.url, method: req.method });
});

const router = express.Router();

// --- ADMIN API ---

// Products Management
router.get('/admin/products', authenticateAdmin, async (req, res) => {
  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }
  console.log(`[CACHE] Serving ${allProductsInMemory.length} admin products from memory.`);
  res.json(allProductsInMemory);
});

router.post('/admin/products', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase.from('products').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  allProductsInMemory.unshift(data);
  warmProducts();
  res.json(data);
});

router.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const idx = allProductsInMemory.findIndex(p => String(p.id) === String(id));
  if (idx !== -1) {
    allProductsInMemory[idx] = { ...allProductsInMemory[idx], ...data };
  } else {
    allProductsInMemory.unshift(data);
  }
  warmProducts();
  res.json(data);
});

router.delete('/admin/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  allProductsInMemory = allProductsInMemory.filter(p => String(p.id) !== String(id));
  warmProducts();
  res.json({ success: true });
});

// Users Management
router.get('/admin/users', authenticateAdmin, async (req, res) => {
  if (allUsersInMemory.length === 0) {
    await warmUsers();
  }
  console.log(`[CACHE] Serving ${allUsersInMemory.length} admin users from memory.`);
  res.json(allUsersInMemory);
});

router.put('/admin/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const idx = allUsersInMemory.findIndex(u => String(u.id) === String(id));
  if (idx !== -1) {
    allUsersInMemory[idx] = { ...allUsersInMemory[idx], ...data };
  }
  warmUsers();
  res.json(data);
});

router.delete('/admin/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Set user_id reference to null in any of their orders to satisfy the foreign key constraint
  const { error: ordersError } = await supabase.from('orders').update({ user_id: null }).eq('user_id', id);
  if (ordersError) return res.status(500).json({ error: ordersError.message });

  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  
  allUsersInMemory = allUsersInMemory.filter(u => String(u.id) !== String(id));
  warmUsers();
  res.json({ success: true });
});

// Orders Management
router.get('/admin/orders', authenticateAdmin, async (req, res) => {
  if (allOrdersInMemory.length === 0) {
    await warmOrders();
  }
  console.log(`[CACHE] Serving ${allOrdersInMemory.length} admin orders from memory.`);
  res.json(allOrdersInMemory);
});

router.put('/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const idx = allOrdersInMemory.findIndex(o => String(o.id) === String(id));
  if (idx !== -1) {
    allOrdersInMemory[idx] = { ...allOrdersInMemory[idx], ...data };
  }
  warmOrders();
  res.json(data);
});

router.delete('/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  // First delete referencing order_items rows
  const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Then delete the order itself
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  allOrdersInMemory = allOrdersInMemory.filter(o => String(o.id) !== String(id));
  warmOrders();
  res.json({ success: true });
});

// Leads Management
router.get('/admin/leads', authenticateAdmin, async (req, res) => {
  if (allLeadsInMemory.length === 0) {
    await warmLeads();
  }
  console.log(`[CACHE] Serving ${allLeadsInMemory.length} admin leads from memory.`);
  res.json(allLeadsInMemory);
});

router.put('/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const idx = allLeadsInMemory.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    allLeadsInMemory[idx] = { ...allLeadsInMemory[idx], ...data };
  }
  warmLeads();
  res.json(data);
});

router.delete('/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  allLeadsInMemory = allLeadsInMemory.filter(l => String(l.id) !== String(id));
  warmLeads();
  res.json({ success: true });
});


// --- PUBLIC API ---
router.get('/health', async (req, res) => {
  try {
    const { count: productCount, error: productError } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      products: { count: productCount || 0, error: productError ? productError.message : null },
      users: { count: userCount || 0, error: userError ? userError.message : null },
      env: {
        url: !!process.env.SUPABASE_URL,
        service_key: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
        anon_key: !!process.env.SUPABASE_ANON_KEY
      }
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// API: Get filters
router.get('/filters', async (req, res) => {
  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }

  const counts = allProductsInMemory.reduce((acc, r) => {
    const key = `${r.parent_category}|${r.category}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const rows = Object.entries(counts).map(([key, count]) => {
    const [parent, cat] = key.split('|');
    return { parent_category: parent, category: cat, count };
  });

  const filters = {
    parentCategories: [...new Set(rows.map(r => r.parent_category))],
    categories: rows.reduce((acc, r) => {
      if (!acc[r.parent_category]) acc[r.parent_category] = [];
      acc[r.parent_category].push({ name: r.category, count: r.count });
      return acc;
    }, {}),
    totalCount: rows.reduce((sum, r) => sum + r.count, 0)
  };

  res.json(filters);
});

// API: Get products (Completely in-memory for sub-millisecond loads!)
router.get('/products', async (req, res) => {
  const { category, parent_category, search, vid, length, width, page = 1, limit = 12 } = req.query;

  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }

  let list = [...allProductsInMemory];

  // Apply filters in-memory
  if (category) {
    const cats = category.split(',').map(c => c.trim().toLowerCase());
    list = list.filter(p => p.category && cats.some(c => p.category.toLowerCase().includes(c)));
  }
  if (parent_category) {
    const parents = parent_category.split(',').map(p => p.trim().toLowerCase());
    list = list.filter(p => p.parent_category && parents.some(pr => p.parent_category.toLowerCase().includes(pr)));
  }
  if (vid) {
    const vids = vid.split(',').map(v => v.trim().toLowerCase());
    list = list.filter(p => p.vid && vids.some(v => p.vid.toLowerCase().includes(v)));
  }
  if (length) {
    const lengths = length.split(',').map(l => l.trim().toLowerCase());
    list = list.filter(p => p.length && lengths.some(l => p.length.toString().toLowerCase().includes(l)));
  }
  if (width) {
    const widths = width.split(',').map(w => w.trim().toLowerCase());
    list = list.filter(p => p.width && widths.some(w => p.width.toString().toLowerCase().includes(w)));
  }
  
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.parent_category && p.parent_category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sort by category ascending, name ascending to match Postgres order
  list.sort((a, b) => {
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;
    
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  const count = list.length;
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 12));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;
  const paginatedList = list.slice(start, end);

  const responseData = {
    products: paginatedList.map(row => ({
      ...row,
      parentCategory: row.parent_category,
      priceTon: row.price_ton ? row.price_ton.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '',
      priceTonNum: row.price_ton,
      priceUnit: row.price_unit ? row.price_unit.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '',
      unitLabel: row.unit_label,
      perTon: row.weight,
      desc: row.description,
      img: row.image,
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || []),
      badge: 'В НАЛИЧИИ',
      variantCount: 1
    })),
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(count / safeLimit)
    }
  };

  res.json(responseData);
});

// API: Single Product
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Fetching product with ID: "${id}"`);
  
  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }

  const idLower = id.toLowerCase();
  const p = allProductsInMemory.find(x => 
    x.id.toString() === id || 
    x.id.toString().toLowerCase() === idLower || 
    (x.name && x.name.toLowerCase() === idLower)
  );

  if (!p) {
    return res.status(404).json({ 
      error: 'Product not found', 
      requested_id: id 
    });
  }

  res.json({
    ...p,
    specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || [])
  });
});

// API: Category filters
router.get('/category-filters', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Укажите категорию' });

  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }

  const categoryLower = category.toLowerCase();
  const matched = allProductsInMemory.filter(p => p.category && p.category.toLowerCase().startsWith(categoryLower));

  const result = {
    vids: [...new Set(matched.map(r => r.vid))].filter(Boolean).sort(),
    lengths: [...new Set(matched.map(r => r.length))].filter(l => l && l !== 'Немерная').sort(),
    widths: [...new Set(matched.map(r => r.width))].filter(w => w && w !== 'Стандарт').sort(),
    types: [...new Set(matched.map(r => r.type))].filter(Boolean).sort()
  };

  res.json(result);
});

// API: Auth - Login (Supabase Auth)
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Укажите email и пароль' });
  }
  try {
    const result = await resolveAuthSession(email, password);
    if (result.error) {
      const errMsg = result.error.message || '';
      if (errMsg.toLowerCase().includes('confirm') || errMsg.toLowerCase().includes('email not verified')) {
        return res.status(400).json({ 
          error: 'email_not_confirmed', 
          message: 'Адрес электронной почты не подтвержден. Проверьте почтовый ящик или запросите письмо повторно.',
          email 
        });
      }
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    if (!result.session) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    let profile = await getProfileByAuthId(result.authUser.id);
    if (!profile) profile = await waitForProfile(result.authUser.id);
    if (!profile) {
      return res.status(500).json({ error: 'Профиль не создан. Попробуйте войти позже.' });
    }
    res.json({
      user: sanitizeUser(profile),
      token: result.session.access_token,
      refresh_token: result.session.refresh_token
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при входе: ' + e.message });
  }
});

// API: Auth - Register (Supabase Auth → auth.users + trigger → public.users)
router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Заполните имя, email и пароль' });
  }

  // Backend password strength validation
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+=\-{}[\]|\\:;"'<>,.?/~`]/.test(password);
  const isLengthOk = password.length >= 8;

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !isLengthOk) {
    return res.status(400).json({ 
      error: 'Пароль слишком слабый. Он должен содержать не менее 8 символов, заглавную и строчную буквы, одну цифру и один спецсимвол.' 
    });
  }

  try {
    const { data: created, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        return res.status(400).json({ error: 'Пользователь с такой почтой уже существует' });
      }
      return res.status(500).json({ error: 'Ошибка регистрации: ' + error.message });
    }

    const user = created.user;
    if (!user) {
      return res.status(500).json({ error: 'Не удалось создать аккаунт' });
    }

    let profile = await waitForProfile(user.id);
    if (!profile) {
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .upsert({ auth_id: user.id, email, name, role: 'user' }, { onConflict: 'email' })
        .select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id')
        .single();
      if (insertErr) {
        return res.status(500).json({ error: 'Ошибка создания профиля: ' + insertErr.message });
      }
      profile = inserted;
    }

    if (created.session) {
      return res.json({
        user: sanitizeUser(profile),
        token: created.session.access_token,
        refresh_token: created.session.refresh_token
      });
    }

    res.json({
      success: true,
      email_confirm_required: true,
      message: 'На указанную почту отправлено письмо для подтверждения аккаунта. Пожалуйста, подтвердите вашу почту перед входом.'
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при регистрации: ' + e.message });
  }
});

// API: Auth - Resend Confirmation Email
router.post('/auth/resend-confirmation', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Укажите email' });
  }
  try {
    const origin = req.headers.origin || 'https://steelwoodman.ru';
    const { error } = await supabaseAuth.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${origin}/`
      }
    });

    if (error) {
      return res.status(500).json({ error: 'Ошибка отправки: ' + error.message });
    }

    res.json({ success: true, message: 'Письмо с подтверждением отправлено повторно.' });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера: ' + e.message });
  }
});

// API: Auth - Reset Password Request (Send Recovery Link)
router.post('/auth/reset-password-request', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Укажите email' });
  }
  try {
    const origin = req.headers.origin || 'https://steelwoodman.ru';
    const redirectTo = `${origin}/reset-password.html`;

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      return res.status(500).json({ error: 'Ошибка восстановления: ' + error.message });
    }

    res.json({ success: true, message: 'Ссылка для восстановления пароля отправлена на вашу почту.' });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при сбросе пароля: ' + e.message });
  }
});

// API: Auth - Reset Password Confirm (Protected by token)
router.post('/auth/reset-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Укажите новый пароль' });
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+=\-{}[\]|\\:;"'<>,.?/~`]/.test(password);
  const isLengthOk = password.length >= 8;

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial || !isLengthOk) {
    return res.status(400).json({ 
      error: 'Пароль слишком слабый. Он должен содержать не менее 8 символов, заглавную и строчную буквы, одну цифру и один спецсимвол.' 
    });
  }

  try {
    const { error } = await supabase.auth.admin.updateUserById(
      req.user.authId,
      { password }
    );

    if (error) {
      return res.status(500).json({ error: 'Не удалось обновить пароль: ' + error.message });
    }

    res.json({ success: true, message: 'Пароль успешно обновлен.' });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при сбросе пароля: ' + e.message });
  }
});

// GET: Current user info
router.get('/auth/me', authenticateToken, async (req, res) => {
  res.json(sanitizeUser(req.profile));
});

// PUT: Update profile
router.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const updates = {};
    for (const key of PROFILE_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.profile.id)
      .select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id')
      .single();

    if (error) return res.status(500).json({ error: 'Ошибка обновления: ' + error.message });
    res.json(sanitizeUser(data));
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: 'commercialbreakf@gmail.com', pass: process.env.SMTP_PASS }
});
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : ['info@steelwoodman.ru', 'commercialbreakf@gmail.com'];

// API: Orders
router.post('/orders', async (req, res) => {
  const { name, phone, email, inn, items, total } = req.body;
  const authHeader = req.headers['authorization'];
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const { data: { user: authUser } } = await supabaseAuth.auth.getUser(token);
      if (authUser) {
        const profile = await getProfileByAuthId(authUser.id);
        if (profile) userId = profile.id;
      } else {
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.id;
      }
    } catch (e) {
      console.error('Order auth error:', e.message);
    }
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ 
      total, 
      customer_name: name, 
      customer_phone: phone, 
      customer_email: email, 
      customer_inn: inn,
      user_id: userId 
    }])
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  const orderItems = items.map(item => ({
    order_id: order.id, product_id: item.id.toString(), product_name: item.name, quantity: item.quantity, price: item.price
  }));
  await supabase.from('order_items').insert(orderItems);

  const itemsHtml = items.map(item => `<li>${item.name || item.id} x ${item.quantity} - ${item.price} ₽</li>`).join('');
  transporter.sendMail({
    from: 'commercialbreakf@gmail.com', to: ADMIN_EMAILS.join(', '),
    subject: `Новый заказ #${order.id}`,
    html: `<h2>Заказ #${order.id}</h2><p>Клиент: ${name}</p><ul>${itemsHtml}</ul>`
  }).catch(e => console.error(e));

  clearOrdersCache();
  res.json({ id: order.id, message: 'Order created' });
});

// GET: User orders
router.get('/orders/my', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', req.profile.id)
      .order('created_at', { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    
    const orders = data.map(order => ({
      ...order,
      items: order.order_items || []
    }));
    
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при загрузке заказов' });
  }
});

// API: Leads
router.post('/leads', async (req, res) => {
  const { name, phone, email, message, type } = req.body;
  
  const { error } = await supabase.from('leads').insert([{ 
    name, phone, email, message, type: type || 'callback' 
  }]);
  
  if (error) return res.status(500).json({ error: error.message });

  transporter.sendMail({
    from: 'commercialbreakf@gmail.com', to: ADMIN_EMAILS.join(', '),
    subject: `Новая заявка: ${type || 'callback'}`,
    html: `<p>Имя: ${name}</p><p>Телефон: ${phone}</p><p>Email: ${email}</p><p>Сообщение: ${message}</p>`
  }).catch(e => console.error(e));

  clearLeadsCache();
  res.json({ success: true });
});

// Mount router on both /api and / to handle different rewrite/invocation scenarios
app.use('/api', router);
app.use(router);

// Catch-all for unhandled routes
app.use((req, res) => {
  console.error(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Маршрут не найден на сервере',
    path: req.url,
    originalUrl: req.originalUrl,
    method: req.method
  });
});

module.exports = app;
