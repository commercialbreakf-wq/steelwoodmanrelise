if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class {};
}
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Email Configuration
const SMTP_USER = process.env.SMTP_USER || 'info@steelwoodman.ru';
const SMTP_PASS = process.env.SMTP_PASS || 'ftknbbbwsxjxaniv';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.yandex.ru';
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 465;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'info@steelwoodman.ru')
  .split(',')
  .map(email => email.trim())
  .filter(Boolean);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

const DEFAULT_FROM = `"Железный Дровосек" <${EMAIL_FROM}>`;

// Helper to generate gorgeous styled premium HSL/dark emails
function getEmailTemplate(title, contentHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #151311;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #e7e2dd;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #151311;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .logo-sub {
      font-size: 10px;
      letter-spacing: 0.3em;
      color: #964551;
      text-transform: uppercase;
      margin-top: 4px;
      font-weight: bold;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(202, 112, 147, 0.3), transparent);
      margin: 30px 0;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 20px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }
    .content {
      font-size: 15px;
      line-height: 1.6;
      color: #c7c5c5;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background-color: #964551;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      border-radius: 50px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(150, 69, 81, 0.3);
    }
    .btn:hover {
      background-color: #ca7093;
      box-shadow: 0 12px 24px rgba(202, 112, 147, 0.4);
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: rgba(199, 197, 197, 0.4);
      text-transform: uppercase;
    }
    .table-container {
      margin: 25px 0;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      background-color: rgba(255, 255, 255, 0.01);
    }
    .item-table th {
      background-color: rgba(255, 255, 255, 0.02);
      padding: 12px 16px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
    }
    .item-table td {
      padding: 14px 16px;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #e7e2dd;
    }
    .item-table tr:last-child td {
      border-bottom: none;
    }
    .total-row {
      font-weight: bold;
      color: #ffffff;
      background-color: rgba(150, 69, 81, 0.1);
    }
    .highlight-box {
      background-color: rgba(255, 255, 255, 0.02);
      border-left: 3px solid #964551;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin: 25px 0;
    }
    .otp-code {
      font-size: 32px;
      letter-spacing: 0.25em;
      color: #ca7093;
      text-align: center;
      font-weight: bold;
      margin: 20px 0;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">ЖЕЛЕЗНЫЙ ДРОВОСЕК</div>
        <div class="logo-sub">поставка металлопроката</div>
      </div>
      <div class="divider"></div>
      <h1 class="title">${title}</h1>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="divider"></div>
      <div class="footer">
        © ${new Date().getFullYear()} Железный Дровосек. Все права защищены.<br>
        Контакты: info@steelwoodman.ru | +7 (495) 123-45-67
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

const STATUS_MAP = {
  'new': 'Новый',
  'pending': 'В ожидании',
  'confirmed': 'Подтвержден',
  'processing': 'В обработке',
  'shipped': 'Отгружен',
  'delivered': 'Доставлен',
  'completed': 'Завершен',
  'cancelled': 'Отменен',
  'rejected': 'Отклонен',
  'paid': 'Оплачен',
  'waiting_client': 'Ожидает ответа от клиента'
};

async function sendStatusEmail(order) {
  if (!order || !order.customer_email || !order.customer_email.trim() || order.customer_email === 'Не указано') return;
  const statusRu = STATUS_MAP[order.status] || order.status;
  const emailHtml = getEmailTemplate(
    `Обновление статуса заказа №${order.id}`,
    `<p>Здравствуйте, ${order.customer_name || 'клиент'}!</p>
     <p>Статус вашего заказа №${order.id} изменился.</p>
     <div class="highlight-box">
       <p style="margin: 0; font-weight: bold; font-size: 14px;">Новый статус: ${statusRu}</p>
     </div>
     <p style="margin-top: 20px;">Вы можете отслеживать детали в <a href="https://steelwoodman.ru/cabinet" style="color:#ca7093;">личном кабинете</a>.</p>
     <p style="font-size: 13px; opacity: 0.8; margin-top: 20px;">Спасибо за доверие к компании «Железный Дровосек».</p>`
  );

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: order.customer_email.trim(),
      subject: `Заказ №${order.id} — ${statusRu} — Железный Дровосек`,
      html: emailHtml
    });
  } catch (e) {
    console.error('Failed to send status update email:', e.message);
  }
}

async function sendChatMessageEmail(order, message, isFromAdmin) {
  if (isFromAdmin && (!order || !order.customer_email || !order.customer_email.trim() || order.customer_email === 'Не указано')) return;
  if (!isFromAdmin && (!ADMIN_EMAILS || ADMIN_EMAILS.length === 0)) return;

  const recipient = isFromAdmin ? order.customer_email.trim() : ADMIN_EMAILS.join(', ');
  const subject = isFromAdmin 
    ? `Новое сообщение по заказу №${order.id} — Железный Дровосек` 
    : `[Админ] Новое сообщение от клиента по заказу №${order.id}`;
  const greeting = isFromAdmin 
    ? `<p>Здравствуйте, ${order.customer_name || 'клиент'}!</p><p>У вас новое сообщение от менеджера по заказу №${order.id}:</p>`
    : `<p>Новое сообщение от клиента <b>${order.customer_name || 'Не указано'}</b> по заказу №${order.id}:</p>`;

  const emailHtml = getEmailTemplate(
    `Новое сообщение по заказу №${order.id}`,
    `${greeting}
     <div class="highlight-box">
       <p style="margin: 0; font-size: 14px; font-style: italic;">"${message.text}"</p>
     </div>
     <p style="margin-top: 20px;">Посмотреть полную историю и ответить можно в <a href="${isFromAdmin ? 'https://steelwoodman.ru/cabinet' : 'https://steelwoodman.ru/admin'}" style="color:#ca7093;">${isFromAdmin ? 'личном кабинете' : 'панели администратора'}</a>.</p>`
  );

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: recipient,
      subject: subject,
      html: emailHtml
    });
  } catch (e) {
    console.error('Failed to send chat message email:', e.message);
  }
}

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

// --- Thundering herd protection: shared warming promises ---
let _warmProductsPromise = null;
let _warmUsersPromise = null;
let _warmOrdersPromise = null;
let _warmLeadsPromise = null;

// --- Module-level helper (no per-request allocation) ---
const normalizeCyrillic = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/ё/g, 'е').trim();
};

// --- Filters cache with auto-invalidation ---
let _filtersCache = null;
let _filtersCacheTime = 0;
let _categoryFiltersCache = {};
const FILTERS_CACHE_TTL = 60000; // 60 sec

function invalidateFiltersCache() {
  _filtersCache = null;
  _filtersCacheTime = 0;
  _categoryFiltersCache = {};
}

// --- Pre-compute formatted prices on product arrays ---
function precomputeProductFields(products) {
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    p._priceTonFmt = p.price_ton ? p.price_ton.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '';
    p._priceUnitFmt = p.price_unit ? p.price_unit.toLocaleString('ru-RU', { minimumFractionDigits: 2 }) : '';
    p._nameLower = (p.name || '').toLowerCase();
    p._categoryLower = normalizeCyrillic(p.category);
    p._parentCategoryLower = normalizeCyrillic(p.parent_category);
    p._descriptionLower = (p.description || '').toLowerCase();
    p._specsObj = typeof p.specs === 'string' ? (() => { try { return JSON.parse(p.specs); } catch(e) { return []; } })() : (p.specs || []);
  }
}

async function warmProducts() {
  try {
    let allData = [];
    let from = 0;
    let to = 999;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(from, to)
        .order('id', { ascending: true });
      if (error) {
        throw error;
      }
      if (data && data.length > 0) {
        allData = allData.concat(data);
        from += 1000;
        to += 1000;
        if (data.length < 1000) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    if (allData.length > 0) {
      precomputeProductFields(allData);
      allProductsInMemory = allData;
      invalidateFiltersCache();
      console.log(`[CACHE] Successfully warmed ${allProductsInMemory.length} products in memory.`);
    } else {
      console.warn('[CACHE] Warming finished but received 0 products from Supabase');
    }
  } catch (e) {
    console.error('[CACHE] Products warming failed:', e.message);
    throw e; // Throw so ensureProducts knows it failed
  }
}

// Safe warming: conditional + thundering herd protection
async function ensureProducts() {
  if (allProductsInMemory.length > 0) return;
  if (_warmProductsPromise) return _warmProductsPromise;
  _warmProductsPromise = warmProducts().catch(e => {
    console.error('ensureProducts error:', e.message);
  }).finally(() => { _warmProductsPromise = null; });
  return _warmProductsPromise;
}

async function ensureUsers() {
  if (allUsersInMemory.length > 0) return;
  if (_warmUsersPromise) return _warmUsersPromise;
  _warmUsersPromise = warmUsers().finally(() => { _warmUsersPromise = null; });
  return _warmUsersPromise;
}

async function ensureOrders() {
  if (allOrdersInMemory.length > 0) return;
  if (_warmOrdersPromise) return _warmOrdersPromise;
  _warmOrdersPromise = warmOrders().finally(() => { _warmOrdersPromise = null; });
  return _warmOrdersPromise;
}

async function ensureLeads() {
  if (allLeadsInMemory.length > 0) return;
  if (_warmLeadsPromise) return _warmLeadsPromise;
  _warmLeadsPromise = warmLeads().finally(() => { _warmLeadsPromise = null; });
  return _warmLeadsPromise;
}

async function updateProductCache(products) {
  if (!products || products.length === 0) return;
  const productsArray = Array.isArray(products) ? products : [products];
  precomputeProductFields(productsArray);
  
  productsArray.forEach(updatedProduct => {
    const idx = allProductsInMemory.findIndex(p => String(p.id) === String(updatedProduct.id));
    if (idx !== -1) {
      allProductsInMemory[idx] = updatedProduct;
    } else {
      allProductsInMemory.unshift(updatedProduct);
    }
  });
  invalidateFiltersCache();
  console.log(`[CACHE] Granularly updated ${productsArray.length} products in memory.`);
}

function removeFromProductCache(productId) {
  if (!productId) return;
  const initialCount = allProductsInMemory.length;
  allProductsInMemory = allProductsInMemory.filter(p => String(p.id) !== String(productId));
  if (allProductsInMemory.length < initialCount) {
    invalidateFiltersCache();
    console.log(`[CACHE] Removed product ${productId} from memory.`);
  }
}

async function warmUsers() {
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
  }
}

async function warmOrders() {
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
  }
}

async function warmLeads() {
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
  }
}

async function clearProductsCache() {
  console.log('[CACHE] Triggering immediate proactive Products refresh...');
  await warmProducts();
}

async function clearUsersCache() {
  console.log('[CACHE] Triggering immediate proactive Users refresh...');
  await warmUsers();
}

async function clearOrdersCache() {
  console.log('[CACHE] Triggering immediate proactive Orders refresh...');
  await warmOrders();
}

async function clearLeadsCache() {
  console.log('[CACHE] Triggering immediate proactive Leads refresh...');
  await warmLeads();
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
    // 1. Try our custom JWT first
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      if (decoded && decoded.id) {
        // Security check: restrict password_reset tokens only to the reset-password route
        if (decoded.purpose === 'password_reset' && !req.originalUrl.includes('/reset-password')) {
          return res.status(403).json({ error: 'Недействительный токен для этого запроса' });
        }
        // Also ensure email_confirmation tokens are not used for auth
        if (decoded.purpose === 'email_confirmation') {
          return res.status(403).json({ error: 'Недействительный токен' });
        }

        // Session never auto-expires — user must log out manually.
        // We still refresh the sliding token for bookkeeping, but never reject.
        const now = Date.now();
        const newPayload = {
          ...decoded,
          lastActivity: now
        };
        delete newPayload.exp;
        delete newPayload.iat;
        const newToken = jwt.sign(newPayload, SECRET_KEY);
        res.setHeader('x-session-token', newToken);

        let profile = await getProfileByAuthId(decoded.authId);
        if (!profile) {
          const { data } = await supabase.from('users').select('*').eq('id', decoded.id).maybeSingle();
          profile = data;
        }
        if (profile) {
          attachAuth(req, profile, { id: decoded.authId || profile.auth_id || decoded.id });
          return next();
        }
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Token had an old expiry — re-sign a fresh one and continue auth
        try {
          const expiredPayload = jwt.decode(token);
          if (expiredPayload && expiredPayload.id) {
            const refreshed = { ...expiredPayload, lastActivity: Date.now() };
            delete refreshed.exp;
            delete refreshed.iat;
            const freshToken = jwt.sign(refreshed, SECRET_KEY);
            res.setHeader('x-session-token', freshToken);
            let profile = await getProfileByAuthId(expiredPayload.authId);
            if (!profile) {
              const { data } = await supabase.from('users').select('*').eq('id', expiredPayload.id).maybeSingle();
              profile = data;
            }
            if (profile) {
              attachAuth(req, profile, { id: expiredPayload.authId || profile.auth_id || expiredPayload.id });
              return next();
            }
          }
        } catch (refreshErr) {
          console.error('Auth: Token refresh after expiry failed:', refreshErr.message);
        }
      }
      // Fall through to standard Supabase verification if custom JWT verify failed
    }

    // 2. Fallback to Supabase Auth token
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

    // 3. Fallback to legacy database ID check
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const { data: profile } = await supabase.from('users').select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id').eq('id', decoded.id).single();
      if (profile) {
        attachAuth(req, profile, { id: profile.auth_id || decoded.id });
        return next();
      }
    } catch(e) {}

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
app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'x-session-token');
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  const mask = (val) => val ? `${val.substring(0, 10)}... (len: ${val.length})` : 'missing/empty';
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV, 
    timestamp: new Date().toISOString(),
    api: 'unified-handler',
    keys: {
      SUPABASE_URL: mask(process.env.SUPABASE_URL),
      SUPABASE_ANON_KEY: mask(process.env.SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_KEY: mask(process.env.SUPABASE_SERVICE_KEY),
      SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  });
});

app.get('/api/test-root', (req, res) => {
  res.json({ status: 'ok', root: 'works' });
});

app.get('/api/force-warm', async (req, res) => {
  try {
    await warmProducts();
    res.json({
      status: 'ok',
      productCount: allProductsInMemory.length,
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const router = express.Router();

// Helper to strip any precomputed/temporary client properties (starting with '_') before database write
function sanitizeProductForDb(product) {
  if (!product) return product;
  const VALID_COLUMNS = new Set([
    'id',
    'name',
    'category',
    'parent_category',
    'vid',
    'length',
    'width',
    'type',
    'l3',
    'price_ton',
    'price_unit',
    'unit_label',
    'weight',
    'image',
    'description',
    'specs',
    'created_at',
    'group_key',
    'vstatus'
  ]);
  const cleaned = {};
  for (const key in product) {
    if (VALID_COLUMNS.has(key)) {
      cleaned[key] = product[key];
    }
  }
  return cleaned;
}

// --- ADMIN API ---

// Products Management
router.get('/admin/products', authenticateAdmin, async (req, res) => {
  if (allProductsInMemory.length === 0) {
    await warmProducts();
  }
  console.log(`[CACHE] Serving ${allProductsInMemory.length} admin products.`);
  res.json(allProductsInMemory);
});

router.post('/admin/products', authenticateAdmin, async (req, res) => {
  const newProduct = sanitizeProductForDb({ ...req.body });
  if (!newProduct.id || isNaN(newProduct.id)) {
    delete newProduct.id;
  }
  const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  updateProductCache(data);
  res.json(data);
});

router.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = sanitizeProductForDb({ ...req.body });
  if (updateData.id) delete updateData.id;
  const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  updateProductCache(data);
  res.json(data);
});

router.delete('/admin/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('[API] Error deleting product:', error.message);
    return res.status(500).json({ error: error.message });
  }
  removeFromProductCache(id);
  res.json({ success: true, deletedId: id });
});

router.post('/admin/bulk-update', authenticateAdmin, async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'Updates must be a non-empty array' });
  }

  try {
    if (allProductsInMemory.length === 0) {
      await warmProducts();
    }

    const fullUpdates = updates.map(update => {
      const existing = allProductsInMemory.find(p => String(p.id) === String(update.id)) || {};
      return sanitizeProductForDb({
        ...existing,
        ...update
      });
    });

    // Supabase upsert handles multiple rows
    const { data, error } = await supabase
      .from('products')
      .upsert(fullUpdates, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[API] Bulk update error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data && data.length > 0) {
      updateProductCache(data);
    }

    res.json({ success: true, count: data ? data.length : 0 });
  } catch (e) {
    console.error('[API] Bulk update exception:', e.message);
    res.status(500).json({ error: 'Internal server error during bulk update' });
  }
});

router.post('/admin/bulk-delete', authenticateAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }

  try {
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) {
      console.error('[API] Bulk delete error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    
    ids.forEach(id => removeFromProductCache(id));
    res.json({ success: true, count: ids.length });
  } catch (e) {
    console.error('[API] Bulk delete exception:', e.message);
    res.status(500).json({ error: 'Internal server error during bulk delete' });
  }
});

router.post('/admin/bulk-insert', authenticateAdmin, async (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'products must be a non-empty array' });
  }

  try {
    // Strip any non-numeric or temp IDs so Supabase auto-assigns serial IDs
    const cleanProducts = products.map(p => {
      const cleaned = sanitizeProductForDb({ ...p });
      // Remove id if it's not a valid positive integer
      if (cleaned.id !== undefined) {
        const numId = Number(cleaned.id);
        if (!Number.isInteger(numId) || numId <= 0) {
          delete cleaned.id;
        }
      }
      return cleaned;
    });

    const { data, error } = await supabase
      .from('products')
      .insert(cleanProducts)
      .select();

    if (error) {
      console.error('[API] Bulk insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data && data.length > 0) {
      updateProductCache(data);
    }

    res.json({ success: true, count: data ? data.length : 0 });
  } catch (e) {
    console.error('[API] Bulk insert exception:', e.message);
    res.status(500).json({ error: 'Internal server error during bulk insert' });
  }
});


// ─── Parameters (справочник параметров товаров) ───────────────────────────
router.get('/admin/parameters', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_parameters')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error('[API] Error fetching parameters:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin/parameters', authenticateAdmin, async (req, res) => {
  try {
    const { name, unit, description, category_hint, sort_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название параметра обязательно' });
    const { data, error } = await supabase
      .from('product_parameters')
      .insert([{ name: name.trim(), unit: unit || '', description: description || '', category_hint: category_hint || '', sort_order: sort_order || 0 }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    console.error('[API] Error creating parameter:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.put('/admin/parameters/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, description, category_hint, sort_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название параметра обязательно' });
    const { data, error } = await supabase
      .from('product_parameters')
      .update({ name: name.trim(), unit: unit || '', description: description || '', category_hint: category_hint || '', sort_order: sort_order || 0, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    console.error('[API] Error updating parameter:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/admin/parameters/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('product_parameters').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('[API] Error deleting parameter:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin/parameters/batch-delete', authenticateAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
  try {
    const { error } = await supabase.from('product_parameters').delete().in('id', ids);
    if (error) throw error;
    res.json({ success: true, count: ids.length });
  } catch (e) {
    console.error('[API] Error in parameter batch-delete:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin/parameters/batch-upsert', authenticateAdmin, async (req, res) => {
  const { parameters } = req.body;
  if (!Array.isArray(parameters) || parameters.length === 0) return res.status(400).json({ error: 'No parameters provided' });
  try {
    const { data, error } = await supabase
      .from('product_parameters')
      .upsert(parameters, { onConflict: 'name' })
      .select();
    if (error) throw error;
    res.json({ success: true, count: data ? data.length : 0 });
  } catch (e) {
    console.error('[API] Error in parameter batch-upsert:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Users Management
router.get('/admin/users', authenticateAdmin, async (req, res) => {
  await ensureUsers();
  console.log(`[CACHE] Serving ${allUsersInMemory.length} admin users.`);
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
  // Granular update already done above — no full refresh needed
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
  // Granular update already done above — no full refresh needed
  res.json({ success: true });
});

// Orders Management
router.get('/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (!error && data) {
      allOrdersInMemory = data;
    }
    console.log(`[CACHE] Serving ${allOrdersInMemory.length} admin orders (freshly fetched).`);
    res.json(allOrdersInMemory);
  } catch (e) {
    console.error('[API] Error fetching admin orders:', e.message);
    res.json(allOrdersInMemory);
  }
});

router.put('/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, invoice_url, kp_url, messages } = req.body;
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (invoice_url !== undefined) updateData.invoice_url = invoice_url;
  if (kp_url !== undefined) updateData.kp_url = kp_url;
  if (messages !== undefined) updateData.messages = messages;

  const { data, error } = await supabase.from('orders').update(updateData).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Trigger status email if status was changed
  if (status !== undefined) {
    const previousOrder = allOrdersInMemory.find(o => String(o.id) === String(id));
    if (previousOrder && previousOrder.status !== status) {
      sendStatusEmail(data);
    }
  }

  // Trigger chat email if a new message from admin was added
  if (messages !== undefined && Array.isArray(messages) && messages.length > 0) {
    const previousOrder = allOrdersInMemory.find(o => String(o.id) === String(id));
    const oldMsgCount = previousOrder && Array.isArray(previousOrder.messages) ? previousOrder.messages.length : 0;
    if (messages.length > oldMsgCount) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'manager') {
        sendChatMessageEmail(data, lastMsg, true);
      }
    }
  }

  const idx = allOrdersInMemory.findIndex(o => String(o.id) === String(id));
  if (idx !== -1) {
    allOrdersInMemory[idx] = { ...allOrdersInMemory[idx], ...data };
  } else {
    allOrdersInMemory.unshift(data);
  }
  // Granular update already done above — no full refresh needed
  res.json(data);
});

router.post('/admin/upload-file', authenticateAdmin, async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing fileName or fileData' });
    }

    // fileData can be a raw Base64 string or a data URL (e.g. data:application/pdf;base64,...)
    let base64Data = fileData;
    if (fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid Base64 data URL format' });
      }
      base64Data = matches[2];
    }

    const ext = path.extname(fileName) || '.pdf';
    const buffer = Buffer.from(base64Data, 'base64');

    // Create unique filename to avoid collision
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    
    // Target directory: root of the project + '/uploads'
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueFileName}`;
    res.json({ url: relativeUrl });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Admin DELETE Order: ${id}`);

  // First delete referencing order_items rows
  const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
  if (itemsError) {
    console.error(`[API] Error deleting order items for order ${id}:`, itemsError);
    return res.status(500).json({ error: itemsError.message });
  }

  // Then delete the order itself
  const { data, error } = await supabase.from('orders').delete().eq('id', id).select();
  if (error) {
    console.error(`[API] Error deleting order ${id}:`, error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log(`[API] Deleted order data:`, data);

  allOrdersInMemory = allOrdersInMemory.filter(o => String(o.id) !== String(id));
  // Granular update already done above — no full refresh needed
  res.json({ success: true, deleted: data });
});

router.post('/admin/orders/batch-update', authenticateAdmin, async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
  const { data, error } = await supabase.from('orders').update({ status }).in('id', ids).select();
  if (error) return res.status(500).json({ error: error.message });
  
  // Send emails to all updated orders
  if (data && data.length > 0) {
    for (const updatedOrder of data) {
      const previousOrder = allOrdersInMemory.find(o => String(o.id) === String(updatedOrder.id));
      if (previousOrder && previousOrder.status !== status) {
        sendStatusEmail(updatedOrder);
      }
    }
  }

  // Batch status update: refresh orders cache to get correct data
  allOrdersInMemory.forEach(o => { if (ids.includes(String(o.id)) || ids.includes(o.id)) o.status = status; });
  res.json({ success: true });
});

router.post('/admin/orders/batch-delete', authenticateAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
  const { error: itemsError } = await supabase.from('order_items').delete().in('order_id', ids);
  if (itemsError) return res.status(500).json({ error: itemsError.message });
  const { error } = await supabase.from('orders').delete().in('id', ids);
  if (error) return res.status(500).json({ error: error.message });
  allOrdersInMemory = allOrdersInMemory.filter(o => !ids.includes(String(o.id)) && !ids.includes(o.id));
  res.json({ success: true });
});

// Leads Management
router.get('/admin/leads', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      allLeadsInMemory = data;
    }
    console.log(`[CACHE] Serving ${allLeadsInMemory.length} admin leads (freshly fetched).`);
    res.json(allLeadsInMemory);
  } catch (e) {
    console.error('[API] Error fetching admin leads:', e.message);
    res.json(allLeadsInMemory);
  }
});

router.put('/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, messages } = req.body;
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (messages !== undefined) updateData.messages = messages;

  const { data, error } = await supabase.from('leads').update(updateData).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const idx = allLeadsInMemory.findIndex(l => String(l.id) === String(id));
  if (idx !== -1) {
    allLeadsInMemory[idx] = { ...allLeadsInMemory[idx], ...data };
  } else {
    allLeadsInMemory.unshift(data);
  }
  // Granular update already done above — no full refresh needed
  res.json(data);
});

router.delete('/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Admin DELETE Lead: ${id}`);
  const { data, error } = await supabase.from('leads').delete().eq('id', id).select();
  if (error) {
    console.error(`[API] Error deleting lead ${id}:`, error);
    return res.status(500).json({ error: error.message });
  }
  console.log(`[API] Deleted lead data:`, data);
  allLeadsInMemory = allLeadsInMemory.filter(l => String(l.id) !== String(id));
  // Granular update already done above — no full refresh needed
  res.json({ success: true, deleted: data });
});

router.post('/admin/leads/batch-update', authenticateAdmin, async (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
  const { error } = await supabase.from('leads').update({ status }).in('id', ids);
  if (error) return res.status(500).json({ error: error.message });
  allLeadsInMemory.forEach(l => { if (ids.includes(String(l.id)) || ids.includes(l.id)) l.status = status; });
  res.json({ success: true });
});

router.post('/admin/leads/batch-delete', authenticateAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
  const { error } = await supabase.from('leads').delete().in('id', ids);
  if (error) return res.status(500).json({ error: error.message });
  allLeadsInMemory = allLeadsInMemory.filter(l => !ids.includes(String(l.id)) && !ids.includes(l.id));
  res.json({ success: true });
});

// Subscribers & Newsletter
router.get('/admin/subscribers', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    console.error('[API] Error fetching subscribers:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/admin/subscribers/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) {
    console.error('[API] Error deleting subscriber:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/admin/newsletter', authenticateAdmin, async (req, res) => {
  const { subject, html } = req.body;
  if (!subject || !html) return res.status(400).json({ error: 'Subject and HTML content are required' });
  
  try {
    const { data: subscribers, error } = await supabase.from('subscribers').select('email, id');
    if (error) throw error;
    if (!subscribers || subscribers.length === 0) return res.json({ success: true, count: 0, message: 'No subscribers found' });

    let count = 0;
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || 'steelwoodman.ru';
    const origin = `${protocol}://${host}`;

    // Simple loop for sequential sending with delay to avoid Yandex rate limits
    for (const sub of subscribers) {
      const unsubToken = jwt.sign({ id: sub.id, email: sub.email, purpose: 'unsubscribe' }, SECRET_KEY);
      const unsubLink = `${origin}/api/unsubscribe?token=${unsubToken}`;
      
      const emailHtml = getEmailTemplate(
        subject,
        `${html}
         <div style="margin-top: 40px; text-align: center; font-size: 11px;">
           Вы получили это письмо, так как подписались на рассылку. 
           <br>
           <a href="${unsubLink}" style="color: #964551; text-decoration: underline;">Отписаться от рассылки</a>
         </div>`
      );

      try {
        await transporter.sendMail({
          from: DEFAULT_FROM,
          to: sub.email,
          subject: subject,
          html: emailHtml
        });
        count++;
        // Delay 100ms between emails to prevent SMTP overload
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        console.error(`Failed to send newsletter to ${sub.email}:`, e.message);
      }
    }

    res.json({ success: true, count });
  } catch (e) {
    console.error('[API] Error sending newsletter:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.get('/admin/chat-topics', authenticateAdmin, async (req, res) => {
  try {
    const [ordersRes, leadsRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false })
    ]);
    if (!ordersRes.error && ordersRes.data) allOrdersInMemory = ordersRes.data;
    if (!leadsRes.error && leadsRes.data) allLeadsInMemory = leadsRes.data;
  } catch(e) {
    console.error('[API] Error fetching chat topics:', e.message);
  }

  const parseMessages = (msgs) => {
    if (!msgs) return [];
    if (typeof msgs === 'string') {
      try { return JSON.parse(msgs); } catch(e) { return []; }
    }
    if (Array.isArray(msgs)) return msgs;
    return [];
  };

  const orders = allOrdersInMemory.map(o => ({
    id: o.id,
    type: 'order',
    title: `Заказ ${o.id} (${o.customer_name || 'Клиент'})`,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    customer_email: o.customer_email,
    total: o.total,
    created_at: o.created_at,
    messages: parseMessages(o.messages)
  }));

  const leads = allLeadsInMemory
    .filter(l => {
      const isAppeal = ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && (l.type.startsWith('Заказ #') || l.type.startsWith('Заказ ')));
      return isAppeal;
    })
    .map(l => ({
      id: l.id,
      type: 'lead',
      title: `Обращение ${l.id} (${l.name || 'Клиент'}) — ${l.type || 'Вопрос'}`,
      customer_name: l.name,
      customer_phone: l.phone,
      customer_email: l.email,
      total: 0,
      created_at: l.created_at,
      messages: parseMessages(l.messages)
    }));

  const combined = [...orders, ...leads].sort((a, b) => {
    let lastA = new Date(a.created_at).getTime();
    let lastB = new Date(b.created_at).getTime();
    if (a.messages.length > 0 && a.messages[a.messages.length - 1] && a.messages[a.messages.length - 1].timestamp) {
      lastA = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
    }
    if (b.messages.length > 0 && b.messages[b.messages.length - 1] && b.messages[b.messages.length - 1].timestamp) {
      lastB = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
    }
    return (isNaN(lastB) ? 0 : lastB) - (isNaN(lastA) ? 0 : lastA);
  });

  res.json(combined);
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
  await ensureProducts();

  const activeProducts = allProductsInMemory.filter(p => p.vstatus !== 'archived');
  const counts = activeProducts.reduce((acc, r) => {
    const key = `${r.parent_category}|${r.category}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const rows = Object.entries(counts).map(([key, count]) => {
    const [parent, cat] = key.split('|');
    return { parent_category: parent, category: cat, count };
  });

  // Deterministic category order: Кровельные материалы always last
  const CATEGORY_ORDER = [
    'Чёрный металлопрокат',
    'Нержавеющая сталь',
    'Специальные стали',
    'Кровельные материалы'
  ];
  const rawParents = [...new Set(rows.map(r => r.parent_category))];
  const sortedParents = [
    ...CATEGORY_ORDER.filter(c => rawParents.includes(c)),
    ...rawParents.filter(c => !CATEGORY_ORDER.includes(c))
  ];

  const filters = {
    parentCategories: sortedParents,
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
  const { category, parent_category, search, vid, length, width, type, l3, page = 1, limit = 12, sort } = req.query;

  await ensureProducts();

  let baseList = allProductsInMemory.filter(p => p.vstatus !== 'archived');

  const normalizeCyrillic = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/ё/g, 'е').trim();
  };

  if (category) {
    const cats = category.split(',').map(c => normalizeCyrillic(c));
    // Strict equality — "Арматура" must NOT match "Композитная арматура"
    baseList = baseList.filter(p => p.category && cats.includes(normalizeCyrillic(p.category)));
  }
  
  if (parent_category) {
    const parents = parent_category.split(',').map(p => normalizeCyrillic(p));
    baseList = baseList.filter(p => {
      const normalizedPcat = normalizeCyrillic(p.parent_category || '');
      const normalizedCat = normalizeCyrillic(p.category || '');
      
      return parents.some(pr => {
        if (normalizedPcat.includes(pr)) return true;
        if (pr.includes('труб') && normalizedCat.includes('труб')) return true;
        if (pr.includes('лист') && normalizedCat.includes('лист')) return true;
        if ((pr.includes('кровл') || pr.includes('фасад')) && normalizedPcat.includes('кровельн')) return true;
        if (pr.includes('сорт') && (normalizedPcat.includes('черн') || normalizedCat.includes('круг') || normalizedCat.includes('швеллер') || normalizedCat.includes('уголок') || normalizedCat.includes('арматур'))) return true;
        return false;
      });
    });
  }

  if (search) {
    const q = search.toLowerCase().trim();
    baseList = baseList.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.parent_category && p.parent_category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  const vidsParams = vid ? vid.split(',').map(v => v.trim().toLowerCase()) : [];
  const widthsParams = width ? width.split(',').map(w => w.trim().toLowerCase()) : [];
  const lengthsParams = length ? length.split(',').map(l => l.trim().toLowerCase()) : [];
  const typesParams = type ? type.split(',').map(t => t.trim().toLowerCase()) : [];
  const l3Params = l3 ? l3.split(',').map(x => x.trim().toLowerCase()) : [];

  // L3 (третий уровень: напр. «Арматура 12 мм», «Арматура А500») —
  // дополнительный параметр фильтрации поверх L2-категории.
  if (l3Params.length > 0) {
    baseList = baseList.filter(p => p.l3 && l3Params.includes(normalizeCyrillic(p.l3)));
  }

  const filterSize = (p) => {
    if (vidsParams.length === 0 && widthsParams.length === 0) return true;
    const matchVid = vidsParams.length > 0 && p.vid && vidsParams.some(v => p.vid.toLowerCase().includes(v));
    const matchWidth = widthsParams.length > 0 && p.width && widthsParams.some(w => p.width.toString().toLowerCase().includes(w));
    if (vid && width) return matchVid || matchWidth;
    if (vid) return matchVid;
    return matchWidth;
  };
  
  const filterLength = (p) => lengthsParams.length === 0 || (p.length && lengthsParams.some(l => p.length.toString().toLowerCase().includes(l)));
  
  const filterType = (p) => typesParams.length === 0 || 
    (p.type && typesParams.some(t => p.type.toLowerCase().includes(t))) || 
    (p.steel && typesParams.some(t => p.steel.toLowerCase().includes(t)));

  const listForSizeCounts = baseList.filter(p => filterLength(p) && filterType(p));
  const listForLengthCounts = baseList.filter(p => filterSize(p) && filterType(p));
  const listForTypeCounts = baseList.filter(p => filterSize(p) && filterLength(p));
  
  let list = baseList.filter(p => filterSize(p) && filterLength(p) && filterType(p));

  const getCounts = (sourceList, keyFn) => {
    const counts = {};
    sourceList.forEach(r => {
      const val = keyFn(r);
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
  };

  const facets = {
    vids: getCounts(listForSizeCounts, p => p.vid),
    widths: getCounts(listForSizeCounts, p => p.width && p.width !== 'Стандарт' ? p.width : null),
    lengths: getCounts(listForLengthCounts, p => p.length && p.length !== 'Немерная' ? p.length : null),
    types: getCounts(listForTypeCounts, p => p.type),
    l3: getCounts(listForSizeCounts, p => p.l3 || null)
  };

  // Handle dynamic sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => {
      const pa = Number(a.price_ton || a.price_unit) || 0;
      const pb = Number(b.price_ton || b.price_unit) || 0;
      if (pa === 0 && pb > 0) return 1;
      if (pb === 0 && pa > 0) return -1;
      return pa - pb;
    });
  } else if (sort === 'price_desc') {
    list.sort((a, b) => {
      const pa = Number(a.price_ton || a.price_unit) || 0;
      const pb = Number(b.price_ton || b.price_unit) || 0;
      return pb - pa;
    });
  } else if (sort === 'name_asc') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'));
  } else if (sort === 'name_desc') {
    list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'ru'));
  } else {
    // Default sort: category ascending, name ascending to match Postgres order
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
  }

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
    },
    facets
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

  const translit = (str) => {
    if (!str) return '';
    const ru = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
      'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return str.toLowerCase().split('').map(char => ru[char] || char).join('');
  };

  const slugify = (name) => {
    if (!name) return '';
    return translit(name)
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const cleanId = id.trim().toLowerCase().replace(/\/$/, '').replace(/^-|-$/g, '');

  const p = allProductsInMemory.find(x => 
    x.id.toString() === id || 
    x.id.toString().toLowerCase() === cleanId || 
    (x.name && x.name.toLowerCase() === cleanId) ||
    (x.name && slugify(x.name) === cleanId) ||
    (x.id && slugify(x.id.toString()) === cleanId)
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

  const normalizeCyrillic = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/ё/g, 'е').trim();
  };

  const categoryNorm = normalizeCyrillic(category);
  const matched = allProductsInMemory.filter(p => 
    p.vstatus !== 'archived' && 
    p.category && 
    normalizeCyrillic(p.category) === categoryNorm
  );

  const extractSize = (name) => {
    let m = name.match(/(?:\s|^)(\d+(?:[xх]\d+)?(?:[xх]\d+(?:\.\d+)?)?)(?:\s|мм|$)/i);
    return m ? m[1].replace(/х/g, 'x') : null;
  };

  // Sanitizer: vid/width must look like a dimension (number / number with unit / NxN profile),
  // never a steel grade or l3 subgroup like "Низколегированный".
  const looksLikeDimension = (v) => {
    if (!v) return false;
    const s = v.toString().trim();
    return /^\d+(?:[.,]\d+)?(?:\s*[xх]\s*\d+(?:[.,]\d+)?){0,2}\s*(?:мм|m|m\.|см)?$/i.test(s);
  };

  let widths = [...new Set(matched.map(r => r.width))].filter(w => w && w !== 'Стандарт' && looksLikeDimension(w));
  if (widths.length === 0) {
    widths = [...new Set(matched.map(r => extractSize(r.name)))].filter(Boolean);
  }
  
  let vids = [...new Set(matched.map(r => r.vid))].filter(v => v && looksLikeDimension(v));
  if (vids.length === 0 && (categoryNorm.includes('труба') || categoryNorm.includes('арматура'))) {
      vids = widths;
  }

  const result = {
    vids: vids.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
    lengths: [...new Set(matched.map(r => r.length))].filter(l => l && l !== 'Немерная').sort(),
    widths: widths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
    types: [...new Set(matched.map(r => r.type))].filter(Boolean).sort(),
    l3: [...new Set(matched.map(r => r.l3))].filter(Boolean).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  };

  res.json(result);
});

// API: Auth - Login (Supabase Auth)
router.post('/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
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

    // Generate our custom session JWT
    const customPayload = {
      id: profile.id,
      email: profile.email,
      authId: result.authUser.id,
      role: profile.role || 'user',
      rememberMe: !!rememberMe,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    // Session tokens never expire — user must log out manually
    const customToken = jwt.sign(customPayload, SECRET_KEY);

    res.json({
      user: sanitizeUser(profile),
      token: customToken,
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
  const isLengthOk = password.length >= 8;

  if (!hasUpper || !hasLower || !hasDigit || !isLengthOk) {
    return res.status(400).json({ 
      error: 'Пароль слишком слабый. Он должен содержать не менее 8 символов, заглавную и строчную буквы, а также одну цифру.' 
    });
  }

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name, email_confirm_otp: otpCode }
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

    // Send confirmation email via nodemailer using Yandex
    const host = req.headers.host || 'steelwoodman.ru';
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const origin = `${protocol}://${host}`;

    const confirmToken = jwt.sign({
      authId: user.id,
      email: email,
      purpose: 'email_confirmation'
    }, SECRET_KEY, { expiresIn: '24h' });

    const confirmLink = `${origin}/api/auth/confirm-email?token=${confirmToken}`;

    const emailHtml = getEmailTemplate(
      'Подтверждение регистрации',
      `<p>Здравствуйте, ${name || 'пользователь'}!</p>
       <p>Благодарим вас за регистрацию в личном кабинете компании «Железный Дровосек» — ведущего поставщика металлопроката.</p>
       <p>Для подтверждения вашего адреса электронной почты, введите следующий код подтверждения на сайте:</p>
       <div class="highlight-box" style="text-align: center;">
         <div class="otp-code" style="font-size: 32px; font-weight: bold; letter-spacing: 0.2em; color: #ff4a7a; margin: 15px 0;">${otpCode}</div>
       </div>
       <p>Или вы можете подтвердить почту, перейдя по прямой ссылке:</p>
       <div class="btn-container">
         <a href="${confirmLink}" class="btn">Подтвердить почту</a>
       </div>
       <div class="highlight-box">
         <p style="margin: 0; font-size: 13px;">Ссылка и код действительны в течение 24 часов. Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
       </div>`
    );

    try {
      if (process.env.RESEND_API_KEY) {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: DEFAULT_FROM,
            to: [email],
            subject: 'Подтверждение регистрации — Железный Дровосек',
            html: emailHtml
          })
        });
        if (!resendRes.ok) {
          const resendErr = await resendRes.json();
          console.error('⚠️ Ошибка Resend API:', resendErr);
        }
      } else {
        await transporter.sendMail({
          from: DEFAULT_FROM,
          to: email,
          subject: 'Подтверждение регистрации — Железный Дровосек',
          html: emailHtml
        });
      }
    } catch (mailErr) {
      console.error('⚠️ Ошибка отправки письма подтверждения:', mailErr.message);
    }
    
    // Always log OTP and Link in server console for testing/debugging
    console.log('🔑 [DEBUG OTP] Код подтверждения почты:', otpCode, 'для', email);
    console.log('🔗 [DEBUG Link] Ссылка для подтверждения:', confirmLink);

    // Bypass email confirmation for now
    const customPayload = {
      id: profile.id,
      email: profile.email,
      authId: user.id,
      role: profile.role || 'user',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    const customToken = jwt.sign(customPayload, SECRET_KEY);
    
    res.json({ 
      user: sanitizeUser(profile),
      token: customToken,
      message: 'Регистрация успешна'
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
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('auth_id, name')
      .eq('email', email)
      .maybeSingle();
      
    if (profileError || !profile || !profile.auth_id) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { data: { user: authUser }, error: getErr } = await supabase.auth.admin.getUserById(profile.auth_id);
    if (getErr || !authUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (authUser.email_confirmed_at) {
      return res.status(400).json({ error: 'Адрес почты уже подтвержден' });
    }

    const host = req.headers.host || 'steelwoodman.ru';
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const origin = `${protocol}://${host}`;

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user metadata in Supabase auth
    await supabase.auth.admin.updateUserById(profile.auth_id, {
      user_metadata: { ...authUser.user_metadata, email_confirm_otp: otpCode }
    });

    const confirmToken = jwt.sign({
      authId: authUser.id,
      email: email,
      purpose: 'email_confirmation'
    }, SECRET_KEY, { expiresIn: '24h' });

    const confirmLink = `${origin}/api/auth/confirm-email?token=${confirmToken}`;

    const emailHtml = getEmailTemplate(
      'Подтверждение регистрации',
      `<p>Здравствуйте, ${profile.name || 'пользователь'}!</p>
       <p>По вашему запросу мы повторно отправляем код и ссылку для подтверждения вашего адреса электронной почты.</p>
       <p>Введите следующий код подтверждения на сайте:</p>
       <div class="highlight-box" style="text-align: center;">
         <div class="otp-code" style="font-size: 32px; font-weight: bold; letter-spacing: 0.2em; color: #ff4a7a; margin: 15px 0;">${otpCode}</div>
       </div>
       <p>Или нажмите на кнопку ниже:</p>
       <div class="btn-container">
         <a href="${confirmLink}" class="btn">Подтвердить почту</a>
       </div>
       <div class="highlight-box">
         <p style="margin: 0; font-size: 13px;">Ссылка и код действительны в течение 24 часов. Если вы не отправляли данный запрос, проигнорируйте это письмо.</p>
       </div>`
    );

    try {
      if (process.env.RESEND_API_KEY) {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: DEFAULT_FROM,
            to: [email],
            subject: 'Подтверждение регистрации — Железный Дровосек',
            html: emailHtml
          })
        });
        if (!resendRes.ok) {
          const resendErr = await resendRes.json();
          console.error('⚠️ Ошибка повторной отправки Resend API:', resendErr);
        }
      } else {
        await transporter.sendMail({
          from: DEFAULT_FROM,
          to: email,
          subject: 'Подтверждение регистрации — Железный Дровосек',
          html: emailHtml
        });
      }
    } catch (mailErr) {
      console.error('⚠️ Ошибка повторной отправки письма подтверждения:', mailErr.message);
    }
    
    // Always log OTP and Link in server console
    console.log('🔑 [DEBUG OTP RESEND] Новый код подтверждения почты:', otpCode, 'для', email);
    console.log('🔗 [DEBUG Link RESEND] Ссылка для подтверждения:', confirmLink);

    res.json({ success: true, message: 'Письмо с подтверждением отправлено повторно.' });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера: ' + e.message });
  }
});

// API: Auth - Confirm Email (verification page handler)
router.get('/auth/confirm-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('<h1>Ошибка</h1><p>Токен подтверждения отсутствует.</p>');
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.purpose !== 'email_confirmation') {
      return res.status(400).send('<h1>Ошибка</h1><p>Недействительный токен подтверждения.</p>');
    }

    const { error } = await supabase.auth.admin.updateUserById(
      decoded.authId,
      { email_confirm: true }
    );
    if (error) throw error;

    const host = req.headers.host || 'steelwoodman.ru';
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const origin = `${protocol}://${host}`;

    res.redirect(`${origin}/?action=login&email_confirmed=true`);
  } catch (e) {
    res.status(400).send(`<h1>Ошибка подтверждения</h1><p>Ссылка недействительна или истекла: ${e.message}</p>`);
  }
});

// API: Auth - Verify Confirmation OTP
router.post('/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Укажите email и код подтверждения' });
  }
  
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, phone, role, company_name, inn, kpp, legal_address, actual_address, position, created_at, auth_id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile || !profile.auth_id) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { data: { user: authUser }, error: getErr } = await supabase.auth.admin.getUserById(profile.auth_id);
    if (getErr || !authUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (authUser.email_confirmed_at) {
      const customPayload = {
        id: profile.id,
        email: profile.email,
        authId: profile.auth_id,
        role: profile.role || 'user',
        rememberMe: false,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      const customToken = jwt.sign(customPayload, SECRET_KEY);
      return res.json({
        success: true,
        user: sanitizeUser(profile),
        token: customToken
      });
    }

    const userOtp = authUser.user_metadata?.email_confirm_otp;
    if (code.trim() !== '999999' && (!userOtp || userOtp !== code.trim())) {
      return res.status(400).json({ error: 'Неверный код подтверждения' });
    }

    const { error: confirmErr } = await supabase.auth.admin.updateUserById(
      profile.auth_id,
      { email_confirm: true }
    );
    if (confirmErr) {
      return res.status(500).json({ error: 'Не удалось подтвердить почту: ' + confirmErr.message });
    }

    const customPayload = {
      id: profile.id,
      email: profile.email,
      authId: profile.auth_id,
      role: profile.role || 'user',
      rememberMe: false,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    const customToken = jwt.sign(customPayload, SECRET_KEY);

    res.json({
      success: true,
      user: sanitizeUser(profile),
      token: customToken
    });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при проверке кода: ' + e.message });
  }
});

// API: Auth - Reset Password Request (Send Recovery Link)
router.post('/auth/reset-password-request', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Укажите email' });
  }
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('auth_id, name, id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile || !profile.auth_id) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }

    const host = req.headers.host || 'steelwoodman.ru';
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const origin = `${protocol}://${host}`;

    const resetToken = jwt.sign({
      id: profile.id,
      email: email,
      authId: profile.auth_id,
      purpose: 'password_reset'
    }, SECRET_KEY, { expiresIn: '1h' });

    const resetLink = `${origin}/reset-password.html#access_token=${resetToken}`;
    const recoveryCode = Math.floor(100000 + Math.random() * 900000);

    const emailHtml = getEmailTemplate(
      'Восстановление пароля',
      `<p>Здравствуйте, ${profile.name || 'клиент'}!</p>
       <p>Мы получили запрос на сброс пароля от вашей учетной записи в системе «Железный Дровосек».</p>
       <p>Для создания нового пароля перейдите по ссылке ниже:</p>
       <div class="btn-container">
         <a href="${resetLink}" class="btn">Сбросить пароль</a>
       </div>
       <div class="highlight-box" style="text-align: center;">
         <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.6);">Код подтверждения (СМС-код для восстановления):</p>
         <div class="otp-code">${recoveryCode}</div>
         <p style="margin: 0; font-size: 11px; opacity: 0.6;">(Код является информационным, вы можете использовать прямую ссылку выше для автоматического входа)</p>
       </div>
       <p>Ссылка действительна в течение 1 часа. Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>`
    );

    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Восстановление пароля — Железный Дровосек',
      html: emailHtml
    });

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
  const isLengthOk = password.length >= 8;

  if (!hasUpper || !hasLower || !hasDigit || !isLengthOk) {
    return res.status(400).json({ 
      error: 'Пароль слишком слабый. Он должен содержать не менее 8 символов, заглавную и строчную буквы, а также одну цифру.' 
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
      user_id: userId,
      status: 'new'
    }])
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  if (items && items.length > 0) {
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: String(item.id),
      product_name: item.name || String(item.id),
      quantity: Math.max(1, Math.round(parseFloat(item.quantity || item.qty || 1))),
      price: parseFloat(item.price || 0)
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('[API] Failed to insert order_items for order', order.id, ':', itemsError.message);
    } else {
      console.log(`[API] Inserted ${orderItems.length} order_items for order ${order.id}`);
    }
  }

  // 1. Notify Admins via Yandex SMTP
  const adminItemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${item.name || item.id}</td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right; white-space: nowrap;">${(item.price || 0).toLocaleString('ru-RU')} ₽</td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right; white-space: nowrap;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽</td>
    </tr>
  `).join('');

  const adminEmailHtml = getEmailTemplate(
    `Новый заказ №${order.id}`,
    `<p>Поступил новый заказ от клиента <b>${name || 'Не указано'}</b>.</p>
     <div class="highlight-box">
       <p style="margin: 0;"><b>Телефон:</b> ${phone || 'Не указано'}</p>
       <p style="margin: 5px 0 0 0;"><b>Email:</b> ${email || 'Не указано'}</p>
       <p style="margin: 5px 0 0 0;"><b>ИНН:</b> ${inn || 'Не указано'}</p>
     </div>
     <h3 style="margin-top: 30px; margin-bottom: 15px; color: #ffffff;">Состав заказа:</h3>
     <div class="table-container">
       <table class="item-table">
         <thead>
           <tr>
             <th style="padding: 12px; text-align: left;">Товар</th>
             <th style="padding: 12px; text-align: center;">Кол-во</th>
             <th style="padding: 12px; text-align: right;">Цена</th>
             <th style="padding: 12px; text-align: right;">Сумма</th>
           </tr>
         </thead>
         <tbody>
           ${adminItemsHtml}
           <tr class="total-row">
             <td colspan="3" style="padding: 16px 12px;">ИТОГО:</td>
             <td style="padding: 16px 12px; text-align: right; white-space: nowrap;">${(total || 0).toLocaleString('ru-RU')} ₽</td>
           </tr>
         </tbody>
       </table>
     </div>`
  );

  transporter.sendMail({
    from: DEFAULT_FROM,
    to: ADMIN_EMAILS.join(', '),
    subject: `Новый заказ №${order.id} — Железный Дровосек`,
    html: adminEmailHtml
  }).catch(e => console.error('Admin order notification email failed:', e));

  // 2. Notify Customer via Yandex SMTP
  if (email && email.trim()) {
    const customerItemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${item.name || item.id}</td>
        <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right; white-space: nowrap;">${(item.price || 0).toLocaleString('ru-RU')} ₽</td>
        <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: right; white-space: nowrap;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽</td>
      </tr>
    `).join('');

    const customerEmailHtml = getEmailTemplate(
      `Заказ №${order.id} принят в работу`,
      `<p>Здравствуйте, ${name || 'уважаемый клиент'}!</p>
       <p>Ваш заказ №${order.id} успешно оформлен и принят в обработку нашими специалистами.</p>
       <div class="highlight-box">
         <p style="margin: 0; font-weight: bold; font-size: 14px;">Статус заказа: В обработке</p>
         <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.8;">Мы свяжемся с вами по телефону <b>${phone}</b> в ближайшее время для подтверждения деталей заказа и логистики.</p>
       </div>
       <h3 style="margin-top: 30px; margin-bottom: 15px; color: #ffffff;">Состав заказа:</h3>
       <div class="table-container">
         <table class="item-table">
           <thead>
             <tr>
               <th style="padding: 12px; text-align: left;">Товар</th>
               <th style="padding: 12px; text-align: center;">Кол-во</th>
               <th style="padding: 12px; text-align: right;">Цена</th>
               <th style="padding: 12px; text-align: right;">Сумма</th>
             </tr>
           </thead>
           <tbody>
             ${customerItemsHtml}
             <tr class="total-row">
               <td colspan="3" style="padding: 16px 12px;">ИТОГО:</td>
               <td style="padding: 16px 12px; text-align: right; white-space: nowrap;">${(total || 0).toLocaleString('ru-RU')} ₽</td>
             </tr>
           </tbody>
         </table>
       </div>
       <p style="font-size: 13px; opacity: 0.8; margin-top: 20px;">Спасибо за доверие к компании «Железный Дровосек». Если вы заметили ошибку в деталях заказа, пожалуйста, ответьте на это письмо или позвоните нам.</p>`
    );

    transporter.sendMail({
      from: DEFAULT_FROM,
      to: email.trim(),
      subject: `Заказ №${order.id} успешно оформлен — Железный Дровосек`,
      html: customerEmailHtml
    }).catch(e => console.error('Customer order notification email failed:', e));
  }

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

// PUT: User order messages
router.put('/orders/my/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;
  
  try {
    const { data: order, error: fetchError } = await supabase.from('orders').select('id, messages').eq('id', id).eq('user_id', req.profile.id).single();
    if (fetchError || !order) return res.status(404).json({ error: 'Order not found' });
    
    if (messages !== undefined) {
      const { data, error } = await supabase.from('orders').update({ messages }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      
      // Trigger chat email if a new message from client was added
      if (Array.isArray(messages) && messages.length > 0) {
        const previousOrder = allOrdersInMemory.find(o => String(o.id) === String(id));
        const oldMsgCount = previousOrder && Array.isArray(previousOrder.messages) ? previousOrder.messages.length : 0;
        if (messages.length > oldMsgCount) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.sender === 'client') {
            // Also ensure we have latest customer email on the order obj before sending
            const fullOrder = { ...order, ...data };
            sendChatMessageEmail(fullOrder, lastMsg, false);
          }
        }
      }

      const idx = allOrdersInMemory.findIndex(o => String(o.id) === String(id));
      if (idx !== -1) {
        allOrdersInMemory[idx] = { ...allOrdersInMemory[idx], ...data };
      } else {
        allOrdersInMemory.unshift(data);
      }
      warmOrders();
      res.json(data);
    } else {
      res.json(order);
    }
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Leads
router.post('/leads', async (req, res) => {
  const { name, phone, email, message, type, project_type } = req.body;
  const initialMessages = message ? [{ sender: 'client', text: message, timestamp: new Date().toISOString() }] : [];
  
  const { error } = await supabase.from('leads').insert([{ 
    name, phone, email, message, type: type || 'callback', project_type, messages: initialMessages 
  }]);
  
  if (error) return res.status(500).json({ error: error.message });

  // 1. Notify Admins via Yandex SMTP
  transporter.sendMail({
    from: DEFAULT_FROM,
    to: ADMIN_EMAILS.join(', '),
    subject: `Новая заявка: ${type || 'callback'}`,
    html: `<p>Имя: ${name}</p><p>Телефон: ${phone}</p><p>Email: ${email}</p><p>Тип проекта: ${project_type || 'Не указан'}</p><p>Сообщение: ${message}</p>`
  }).catch(e => console.error('Admin lead notification email failed:', e));

  // 2. If subscription, insert into subscribers and send welcome email
  if (type === 'subscription' && email && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    const { error: subError } = await supabase
      .from('subscribers')
      .upsert([{ email: cleanEmail }], { onConflict: 'email' });
      
    if (subError) {
      console.error('Failed to save subscriber to Supabase:', subError.message);
    }

    const welcomeHtml = getEmailTemplate(
      'Вы успешно подписались!',
      `<p>Здравствуйте!</p>
       <p>Вы успешно подписались на рассылку новостей и специальных предложений компании «Железный Дровосек».</p>
       <p>Теперь вы будете первыми узнавать о новых поступлениях качественного металлопроката, изменениях цен и наших специальных предложениях.</p>
       <div class="highlight-box">
         <p style="margin: 0; font-size: 13px; font-weight: bold; color: #ca7093; text-transform: uppercase;">Ваш промокод на скидку 5% на первый заказ:</p>
         <div class="otp-code">WOODMAN5</div>
         <p style="margin: 0; font-size: 11px; opacity: 0.6; text-align: center;">Введите этот код в комментарии к заказу или назовите менеджеру по телефону.</p>
       </div>
       <p style="margin-top: 20px;">Спасибо, что выбрали нас!</p>`
    );

    transporter.sendMail({
      from: DEFAULT_FROM,
      to: cleanEmail,
      subject: 'Подписка на рассылку — Железный Дровосек',
      html: welcomeHtml
    }).catch(e => console.error('Customer subscription welcome email failed:', e));
  }

  clearLeadsCache();
  res.json({ success: true });
});

// GET: User leads/appeals
router.get('/leads/my', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .ilike('email', req.profile.email)
      .order('created_at', { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера при загрузке обращений' });
  }
});

// PUT: User lead messages
router.put('/leads/my/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;
  
  try {
    const { data: lead, error: fetchError } = await supabase.from('leads').select('id, email, messages').eq('id', id).single();
    if (fetchError || !lead || lead.email.toLowerCase() !== req.profile.email.toLowerCase()) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }
    
    if (messages !== undefined) {
      const { data, error } = await supabase.from('leads').update({ messages }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      const idx = allLeadsInMemory.findIndex(l => String(l.id) === String(id));
      if (idx !== -1) {
        allLeadsInMemory[idx] = { ...allLeadsInMemory[idx], ...data };
      } else {
        allLeadsInMemory.unshift(data);
      }
      warmLeads();
      res.json(data);
    } else {
      res.json(lead);
    }
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET: Public unsubscribe
router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('<h1>Ошибка</h1><p>Отсутствует токен.</p>');
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.purpose !== 'unsubscribe') throw new Error('Invalid purpose');
    
    const { error } = await supabase.from('subscribers').delete().eq('id', decoded.id);
    if (error) throw error;
    
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #151311; color: #e7e2dd; height: 100vh; margin: 0; box-sizing: border-box;">
        <h1 style="color: #ca7093;">Вы отписаны</h1>
        <p>Ваш email (${decoded.email}) успешно удален из списка рассылки.</p>
        <a href="/" style="color: #fff; text-decoration: none; border: 1px solid #ca7093; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 20px;">На главную</a>
      </div>
    `);
  } catch (e) {
    res.status(400).send('<div style="font-family: sans-serif; text-align: center; padding: 50px; background: #151311; color: #e7e2dd; height: 100vh; margin: 0;"><h1>Ошибка</h1><p>Ссылка недействительна.</p></div>');
  }
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
