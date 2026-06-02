const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const apiHandler = require('./api/[...slug].js');
const port = process.env.PORT || 3000;

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

// Unified API handler
app.use('/api', apiHandler);

// Static file serving
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

// ============================================================
// PAGE ROUTES
// ============================================================
const pageRoutes = [
  { path: '/calculator', file: 'calculator.html' },
  { path: '/certificates', file: 'certificates.html' },
  { path: '/catalog', file: 'catalog.html' },
  { path: '/services', file: 'services.html' },
  { path: '/about', file: 'about.html' },
  { path: '/contacts', file: 'contacts.html' },
  { path: '/news', file: 'news.html' },
  { path: '/cart', file: 'cart.html' },
  { path: '/cabinet', file: 'cabinet.html' },
  { path: '/product', file: 'product.html' },
  { path: '/reset-password', file: 'reset-password.html' },
  { path: '/admin', file: 'admin.html' },
];

pageRoutes.forEach(({ path: routePath, file }) => {
  app.get(`${routePath}/`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

const newsArticles = [
  { slug: 'trends-2026', file: 'news_trends_2026.html' },
  { slug: 'sheets-2026', file: 'news_sheets_2026.html' },
  { slug: 'market-adaptation', file: 'news_market_adaptation.html' }
];

newsArticles.forEach(({ slug, file }) => {
  app.get(`/news/${slug}/`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
  app.get(`/news/${slug}`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

const certs = ['certificate_carbon', 'certificate_eco', 'certificate_pipes', 'certificate_stainless', 'certificate_view'];
certs.forEach(cert => {
  app.get(`/certificates/${cert}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${cert}.html`));
  });
});

// All /api routes are handled by the unified API handler mounted earlier.

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
    console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
    console.log(`API available at http://localhost:${port}/api/products`);
  });
}

module.exports = app;
