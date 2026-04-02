require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const compression= require('compression');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const cookieParser = require('cookie-parser');
const connectDB  = require('./config/db');

const app = express();

// ── DATABASE ────────────────────────────────────────────
connectDB();

// ── SECURITY & MIDDLEWARE ───────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // relaxed for admin panel
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3001',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}));

// ── RATE LIMITING ───────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests' } });
const strictLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { success: false, message: 'Too many submissions' } });

app.use('/api/', apiLimiter);
app.use('/api/reservations', strictLimiter);
app.use('/api/contact', strictLimiter);

// ── STATIC FILES ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, 'public')));

// ── API ROUTES ──────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/menu',         require('./routes/menu'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/locations',    require('./routes/locations'));

// ── ADMIN PANEL (Server-Side HTML) ─────────────────────
app.use('/admin', require('./routes/adminPanel'));

// ── HEALTH CHECK ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── ROOT ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Aurum Ristorante API', version: '1.0.0', docs: '/admin' });
});

// ── 404 ─────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'File too large' });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── START ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍽  Aurum Ristorante API`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Admin:  http://localhost:${PORT}/admin`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Env:    ${process.env.NODE_ENV}\n`);
});

module.exports = app;
