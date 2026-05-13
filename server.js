const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ============================================================
// SUPABASE CLIENTS
// ============================================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';

// Service client — bypasses RLS, for server-side writes
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Anon client — for verifying user tokens
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// EMAIL TRANSPORTER
// ============================================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'egapega322@gmail.com',
    pass: process.env.SMTP_PASS || 'n9CBCOuWpzfJLYuDw9d0'
  }
});

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// URL REFACTORING: Old Stitch _N paths → Logical clean URLs
// ============================================================
const legacyRedirects = {
  '/_1/code':         '/calculator/',
  '/_1/code.html':    '/calculator/',
  '/_2/code':         '/certificates/',
  '/_2/code.html':    '/certificates/',
  '/_4/code':         '/fleet/',
  '/_4/code.html':    '/fleet/',
  '/_5/code':         '/catalog/',
  '/_5/code.html':    '/catalog/',
  '/_6/code':         '/services/',
  '/_6/code.html':    '/services/',
  '/_7/code':         '/about/',
  '/_7/code.html':    '/about/',
  '/_8/code':         '/contacts/',
  '/_8/code.html':    '/contacts/',
  '/news.html':               '/news/',
  '/news_trends_2026.html':   '/news/trends-2026/',
  '/news_sheets_2026.html':   '/news/sheets-2026/',
  '/news_market_adaptation.html': '/news/market-adaptation/',
  '/cart.html':       '/cart/',
  '/cabinet.html':    '/cabinet/',
  '/catalog.html':    '/catalog/',
};

// Logging & Clean URL Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  const legacyDest = legacyRedirects[req.path];
  if (legacyDest) {
    const query = req.url.slice(req.path.length);
    return res.redirect(301, legacyDest + query);
  }

  if (req.path.endsWith('.html') && req.path !== '/index.html') {
    const newPath = req.path.slice(0, -5);
    const query = req.url.slice(req.path.length);
    return res.redirect(301, newPath + '/' + query);
  }

  if (req.path === '/index') {
    return res.redirect(301, '/');
  }

  next();
});

// Static file serving
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

// ============================================================
// PAGE ROUTES
// ============================================================
const pageRoutes = [
  { path: '/calculator', dir: 'calculator' },
  { path: '/certificates', dir: 'certificates' },
  { path: '/fleet', dir: 'fleet' },
  { path: '/catalog', dir: 'catalog' },
  { path: '/services', dir: 'services' },
  { path: '/about', dir: 'about' },
  { path: '/contacts', dir: 'contacts' },
  { path: '/news', dir: 'news' },
  { path: '/cart', dir: 'cart' },
  { path: '/cabinet', dir: 'cabinet' },
];

pageRoutes.forEach(({ path: routePath, dir }) => {
  app.get(`${routePath}/`, (req, res) => {
    res.sendFile(path.join(__dirname, dir, 'index.html'));
  });
  app.get(routePath, (req, res) => {
    const query = req.url.slice(routePath.length);
    res.redirect(301, `${routePath}/${query}`);
  });
});

const newsArticles = ['trends-2026', 'sheets-2026', 'market-adaptation'];
newsArticles.forEach(slug => {
  app.get(`/news/${slug}/`, (req, res) => {
    res.sendFile(path.join(__dirname, 'news', slug, 'index.html'));
  });
  app.get(`/news/${slug}`, (req, res) => {
    res.redirect(301, `/news/${slug}/`);
  });
});

const certs = ['certificate_carbon', 'certificate_eco', 'certificate_pipes', 'certificate_stainless', 'certificate_view'];
certs.forEach(cert => {
  app.get(`/certificates/${cert}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'certificates', `${cert}.html`));
  });
});

// ============================================================
// SIMPLE IN-MEMORY CACHE
// ============================================================
const cache = {
  data: {},
  get(key) { return null; }, // disable for fresh data; enable if needed
  set(key, value, ttl = 60000) {
    this.data[key] = { value, expires: Date.now() + ttl };
  }
};

// ============================================================
// AUTH MIDDLEWARE — verify Supabase JWT
// ============================================================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
    if (error || !user) {
      req.user = null;
      return next();
    }
    req.user = user; // { id (auth UUID), email, ... }
    req.token = token;
  } catch (e) {
    req.user = null;
  }
  next();
};

// ============================================================
// API: CATALOG — Get filters
// ============================================================
app.get('/api/filters', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('parent_category, category')
    .order('parent_category');

  if (error) return res.status(500).json({ error: error.message });

  const grouped = {};
  const parentCategories = [];

  data.forEach(row => {
    if (!grouped[row.parent_category]) {
      grouped[row.parent_category] = [];
      parentCategories.push(row.parent_category);
    }
    const exists = grouped[row.parent_category].find(c => c.name === row.category);
    if (!exists) {
      grouped[row.parent_category].push({ name: row.category, count: 1 });
    } else {
      exists.count++;
    }
  });

  res.json({
    parentCategories: [...new Set(parentCategories)],
    categories: grouped,
    totalCount: data.length
  });
});

// ============================================================
// API: CATALOG — Get products with pagination
// ============================================================
app.get('/api/products', async (req, res) => {
  const { category, parent_category, search, vid, length, width, page = 1, limit = 12 } = req.query;
  const from = (parseInt(page) - 1) * parseInt(limit);
  const to = from + parseInt(limit) - 1;

  let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

  if (parent_category) {
    const parents = parent_category.split(',');
    query = query.in('parent_category', parents);
  }
  if (category) {
    const cats = category.split(',');
    query = query.in('category', cats);
  }
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (vid) {
    query = query.in('vid', vid.split(','));
  }
  if (length) {
    query = query.in('length', length.split(','));
  }
  if (width) {
    query = query.in('width', width.split(','));
  }

  query = query.order('category').order('name').range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const products = (data || []).map(row => ({
    ...row,
    parentCategory: row.parent_category,
    priceTon: row.price_ton ? Number(row.price_ton).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '',
    priceTonNum: row.price_ton ? Number(row.price_ton) : null,
    priceUnit: row.price_unit ? Number(row.price_unit).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '',
    unitLabel: row.unit_label,
    perTon: row.weight,
    desc: row.description,
    img: row.image,
    specs: (() => {
      try { return row.specs ? (typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs) : []; }
      catch (e) { return []; }
    })(),
    badge: 'В НАЛИЧИИ',
    variantCount: 1
  }));

  res.json({
    products,
    pagination: {
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil((count || 0) / parseInt(limit))
    }
  });
});

// ============================================================
// API: CATALOG — Category-specific filters (vid, length, width)
// ============================================================
app.get('/api/category-filters', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Категория не указана' });

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('vid, length, width, type')
    .ilike('category', `${category}%`);

  if (error) return res.status(500).json({ error: error.message });

  const filters = {
    vids: [...new Set(data.map(r => r.vid))].filter(Boolean).sort(),
    lengths: [...new Set(data.map(r => r.length))].filter(l => l && l !== 'Немерная').sort(),
    widths: [...new Set(data.map(r => r.width))].filter(w => w && w !== 'Стандарт').sort(),
    types: [...new Set(data.map(r => r.type))].filter(Boolean).sort()
  };

  res.json(filters);
});

// ============================================================
// API: CATALOG — Single product
// ============================================================
app.get('/api/products/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Товар не найден' });

  res.json({
    ...data,
    specs: (() => {
      try { return data.specs ? (typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs) : []; }
      catch (e) { return []; }
    })()
  });
});

// ============================================================
// API: AUTH — Register (via Supabase Auth)
// ============================================================
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name: name || email.split('@')[0] },
    email_confirm: true  // auto-confirm for B2B use
  });

  if (error) {
    if (error.message.includes('already')) return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    return res.status(500).json({ error: error.message });
  }

  // Sign in immediately to get a token
  const { data: session, error: signInErr } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (signInErr) return res.status(500).json({ error: signInErr.message });

  const profile = await supabaseAdmin.from('users').select('*').eq('auth_id', data.user.id).single();

  res.json({
    user: {
      id: profile.data?.id,
      email,
      name: profile.data?.name || name,
      role: 'user'
    },
    token: session.session.access_token,
    refresh_token: session.session.refresh_token
  });
});

// ============================================================
// API: AUTH — Login (via Supabase Auth)
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  // Fetch profile from public.users
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', data.user.id)
    .single();

  res.json({
    user: {
      id: profile?.id,
      email: data.user.email,
      name: profile?.name || data.user.user_metadata?.name,
      phone: profile?.phone,
      company_name: profile?.company_name,
      inn: profile?.inn,
      kpp: profile?.kpp,
      legal_address: profile?.legal_address,
      actual_address: profile?.actual_address,
      position: profile?.position,
      role: profile?.role || 'user'
    },
    token: data.session.access_token,
    refresh_token: data.session.refresh_token
  });
});

// ============================================================
// API: AUTH — Get current user profile
// ============================================================
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', req.user.id)
    .single();

  if (error || !profile) return res.status(404).json({ error: 'Профиль не найден' });

  res.json({
    id: profile.id,
    email: req.user.email,
    name: profile.name,
    phone: profile.phone,
    company_name: profile.company_name,
    inn: profile.inn,
    kpp: profile.kpp,
    legal_address: profile.legal_address,
    actual_address: profile.actual_address,
    position: profile.position,
    role: profile.role
  });
});

// ============================================================
// API: AUTH — Update profile
// ============================================================
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const { name, phone, company_name, inn, kpp, legal_address, actual_address, position } = req.body;

  const { error } = await supabaseAdmin
    .from('users')
    .update({ name, phone, company_name, inn, kpp, legal_address, actual_address, position })
    .eq('auth_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Profile updated successfully' });
});

// ============================================================
// API: ORDERS — Get user orders
// ============================================================
app.get('/api/orders/my', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  // First get the public.users.id for this auth user
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', req.user.id)
    .single();

  if (!profile) return res.json([]);

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const result = (orders || []).map(order => ({
    ...order,
    items: (order.order_items || []).map(item => ({
      ...item,
      name: item.product_name || item.product_id
    }))
  }));

  res.json(result);
});

// ============================================================
// API: ORDERS — Create order
// ============================================================
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { name, phone, email, inn, items, total } = req.body;

  // Find user_id if authenticated
  let userId = null;
  if (req.user) {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', req.user.id)
      .single();
    userId = profile?.id || null;
  }

  // Create order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      total,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_inn: inn,
      status: 'pending'
    })
    .select()
    .single();

  if (orderErr) return res.status(500).json({ error: orderErr.message });

  // Insert order items
  const orderItems = (items || []).map(item => ({
    order_id: order.id,
    product_id: String(item.id),
    product_name: item.name,
    quantity: item.quantity,
    price: item.price
  }));

  if (orderItems.length > 0) {
    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsErr) console.error('Order items insert error:', itemsErr.message);
  }

  // Update user profile if authenticated
  if (userId) {
    await supabaseAdmin.from('users').update({ name, phone }).eq('id', userId);
  }

  // Send email notification
  const itemsHtml = (items || []).map(item =>
    `<li>${item.name || item.id} x ${item.quantity} — ${item.price} ₽</li>`
  ).join('');

  transporter.sendMail({
    from: 'egapega322@gmail.com',
    to: process.env.ADMIN_EMAILS || 'egapega322@gmail.com',
    subject: `Новый заказ #${order.id} — ${name}`,
    html: `<h2>Новый заказ на сайте</h2>
      <p><strong>Заказ #:</strong> ${order.id}</p>
      <p><strong>Клиент:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>ИНН:</strong> ${inn || 'не указан'}</p>
      <h3>Товары:</h3><ul>${itemsHtml}</ul>
      <p><strong>Итого:</strong> ${total} ₽</p>`
  }).catch(e => console.error('Order email error:', e.message));

  res.json({ id: order.id, message: 'Order created successfully' });
});

// ============================================================
// API: LEADS — Create lead/request
// ============================================================
app.post('/api/leads', async (req, res) => {
  const { name, phone, email, message, type = 'contact' } = req.body;

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .insert({ name, phone, email, message, type })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Send email notification
  transporter.sendMail({
    from: 'egapega322@gmail.com',
    to: process.env.ADMIN_EMAILS || 'egapega322@gmail.com',
    subject: `Заявка №${lead.id} ${phone}`,
    html: `<h2>Новая заявка на сайте</h2>
      <p><strong>Заявка №:</strong> ${lead.id}</p>
      <p><strong>Имя:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Тип:</strong> ${type}</p>
      <p><strong>Сообщение:</strong><br/>${message}</p>`
  }).catch(e => console.error('Lead email error:', e.message));

  // Handle subscription
  if (type === 'subscription' && email && email !== 'Не указано') {
    await supabaseAdmin.from('subscribers').upsert({ email, status: 'active' }, { onConflict: 'email' });
  }

  res.json({ id: lead.id, message: 'Application submitted successfully' });
});

// ============================================================
// HOME ROUTE
// ============================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// 404
// ============================================================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// ============================================================
// START
// ============================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log(`API available at http://localhost:${port}/api/products`);
  });
}

module.exports = app;
