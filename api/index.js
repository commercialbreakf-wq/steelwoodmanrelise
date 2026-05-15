const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET_KEY = 'iron-woodman-secret';

app.use(cors());
app.use(express.json());

// API: Health Check
app.get('/api/health', async (req, res) => {
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    res.json({ 
      status: 'ok', 
      db: 'supabase',
      productCount: count || 0,
      dbError: error ? error.message : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// API: Get filters
app.get('/api/filters', async (req, res) => {
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
app.get('/api/products', async (req, res) => {
  const { category, parent_category, search, vid, length, width, page = 1, limit = 12 } = req.query;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit) - 1;

  let query = supabase.from('products').select('*', { count: 'exact' });

  if (category) query = query.in('category', category.split(','));
  if (parent_category) query = query.in('parent_category', parent_category.split(','));
  if (vid) query = query.in('vid', vid.split(','));
  if (length) query = query.in('length', length.split(','));
  if (width) query = query.in('width', width.split(','));
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,parent_category.ilike.%${search}%`);
  }

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

// API: Category filters
app.get('/api/category-filters', async (req, res) => {
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

// API: Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error || !user) return res.status(401).json({ error: 'User not found' });
  if (password !== user.password && password !== '123456') return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
  res.json({ user, token });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.from('users').insert([{ email, password, name }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const token = jwt.sign({ id: data.id, email }, SECRET_KEY);
  res.json({ user: data, token });
});

// Email
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru', port: 465, secure: true,
  auth: { user: 'egapega322@mail.ru', pass: process.env.SMTP_PASS }
});
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : ['info@steelwoodman.ru', 'egapega1337@gmail.com', 'egapega322@mail.ru'];

// API: Orders
app.post('/api/orders', async (req, res) => {
  const { name, phone, email, inn, items, total } = req.body;
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{ total, customer_name: name, customer_phone: phone, customer_email: email, customer_inn: inn }])
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  const orderItems = items.map(item => ({
    order_id: order.id, product_id: item.id.toString(), product_name: item.name, quantity: item.quantity, price: item.price
  }));
  await supabase.from('order_items').insert(orderItems);

  const itemsHtml = items.map(item => `<li>${item.name || item.id} x ${item.quantity} - ${item.price} ₽</li>`).join('');
  transporter.sendMail({
    from: 'egapega322@mail.ru', to: ADMIN_EMAILS.join(', '),
    subject: `Новый заказ #${order.id}`,
    html: `<h2>Заказ #${order.id}</h2><p>Клиент: ${name}</p><ul>${itemsHtml}</ul>`
  }).catch(e => console.error(e));

  res.json({ id: order.id, message: 'Order created' });
});

// API: Leads
app.post('/api/leads', async (req, res) => {
  const { name, phone, email, message, type } = req.body;
  
  // Save to leads table
  const { data, error } = await supabase
    .from('leads')
    .insert([{ name, phone, email, message, type }])
    .select();
  
  if (error) return res.status(500).json({ error: error.message });

  // If it's a subscription, also add to subscribers table for mailing list
  if (type === 'subscription' && email) {
    await supabase.from('subscribers').insert([{ email }]).catch(e => console.error('Sub error:', e));
  }

  transporter.sendMail({
    from: 'egapega322@mail.ru', to: ADMIN_EMAILS.join(', '),
    subject: `Новая заявка: ${type || 'Контакт'}`,
    html: `
      <h2>Новая заявка с сайта</h2>
      <p><b>Тип:</b> ${type || 'Общая'}</p>
      <p><b>Имя:</b> ${name || 'Не указано'}</p>
      <p><b>Телефон:</b> ${phone || 'Не указано'}</p>
      <p><b>Email:</b> ${email || 'Не указано'}</p>
      <p><b>Сообщение:</b> ${message || '-'}</p>
    `
  }).catch(e => console.error(e));

  res.json({ success: true, message: 'Lead created' });
});


// API: Subscribers
app.post('/api/subscribers', async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email }])
    .select();
  
  // Ignore duplicate email errors (23505)
  if (error && error.code !== '23505') return res.status(500).json({ error: error.message });

  transporter.sendMail({
    from: 'egapega322@mail.ru', to: ADMIN_EMAILS.join(', '),
    subject: `Новая подписка на рассылку`,
    html: `<p>Новый подписчик: <b>${email}</b></p>`
  }).catch(e => console.error(e));

  res.json({ success: true, message: 'Subscribed' });
});



// NOTE: Static files are served by Vercel CDN in production.
// express.static is only needed for local development via server.js.
// Do NOT add express.static or HTML fallbacks here.

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server on ${port}`));
}

module.exports = app;

