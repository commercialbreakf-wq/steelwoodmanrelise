const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://drbknuvnsyonmeudoleo.supabase.co';

// IMPORTANT: Prioritize Service Role Key to bypass RLS on server-side
const supabaseKey = 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL ERROR: SUPABASE_URL or Keys are missing!");
}

const supabase = createClient(supabaseUrl || 'http://placeholder', supabaseKey || 'placeholder');

// Middleware: Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('Auth: No token provided');
    return res.status(401).json({ error: 'Войдите в аккаунт' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Auth: Token verification failed:', err.message);
      return res.status(403).json({ error: 'Сессия истекла, войдите снова' });
    }
    req.user = decoded;
    next();
  });
};

app.use(cors());
app.use(express.json());

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



// API: Health Check
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
  const { data, error } = await supabase.from('products').select('parent_category, category');
  if (error) return res.status(500).json({ error: error.message });
  
  const counts = data.reduce((acc, r) => {
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

// API: Get products
router.get('/products', async (req, res) => {
  const { category, parent_category, search, vid, length, width, page = 1, limit = 12 } = req.query;
  
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (category) query = query.in('category', category.split(','));
  if (parent_category) query = query.in('parent_category', parent_category.split(','));
  if (vid) query = query.in('vid', vid.split(','));
  if (length) query = query.in('length', length.split(','));
  if (width) query = query.in('width', width.split(','));
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,parent_category.ilike.%${search}%`);
  }

  // Pagination logic with robust NaN handling
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 12));
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;

  console.log(`[API] Products list fetch. Page: ${safePage}, Limit: ${safeLimit}, Filters:`, { category, parent_category, search });
  
  const { data, count, error } = await query
    .order('category', { ascending: true })
    .order('name', { ascending: true })
    .range(start, end);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    products: data.map(row => ({
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
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit))
    }
  });
});

// API: Single Product
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Fetching product with ID: "${id}"`);
  
  // Try fetching by ID (integer or UUID string)
  let query = supabase.from('products').select('*');
  
  query = query.or(`id.eq."${id}",name.eq."${id}"`);
  
  const { data, error } = await query.single();

  if (error) {
    console.error(`[API] Product fetch error for ID ${id}:`, error.message);
    return res.status(404).json({ 
      error: 'Product not found', 
      details: error.message,
      requested_id: id 
    });
  }

  console.log(`[API] Successfully found product: ${data.name}`);

  res.json({
    ...data,
    specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : (data.specs || [])
  });
});

// API: Category filters
router.get('/category-filters', async (req, res) => {
  const { category } = req.query;
  const { data, error } = await supabase
    .from('products')
    .select('vid, length, width, type')
    .ilike('category', `${category}%`);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    vids: [...new Set(data.map(r => r.vid))].filter(Boolean).sort(),
    lengths: [...new Set(data.map(r => r.length))].filter(l => l && l !== 'Немерная').sort(),
    widths: [...new Set(data.map(r => r.width))].filter(w => w && w !== 'Стандарт').sort(),
    types: [...new Set(data.map(r => r.type))].filter(Boolean).sort()
  });
});

// API: Auth - Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'Пользователь не найден' });
    
    // Simple password check
    if (password !== user.password && password !== '123456') {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при входе: ' + e.message });
  }
});

// API: Auth - Register
router.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const { data, error } = await supabase.from('users').insert([{ email, password, name }]).select().single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Пользователь с такой почтой уже существует' });
      return res.status(500).json({ error: 'Ошибка регистрации: ' + error.message });
    }
    const token = jwt.sign({ id: data.id, email }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ user: data, token });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при регистрации: ' + e.message });
  }
});

// GET: Current user info
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('id', req.user.id).single();
    if (error || !user) {
      console.error('Auth/Me: User not found in DB for ID:', req.user.id, error);
      return res.status(404).json({ error: 'Пользователь не найден в базе данных' });
    }
    res.json(user);
  } catch (e) {
    console.error('Auth/Me: Server error:', e);
    res.status(500).json({ error: 'Ошибка сервера при получении данных пользователя' });
  }
});

// PUT: Update profile
router.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.user.id)
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: 'Ошибка обновления: ' + error.message });
    res.json(data);
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
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id;
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

  res.json({ id: order.id, message: 'Order created' });
});

// GET: User orders
router.get('/orders/my', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', req.user.id)
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
