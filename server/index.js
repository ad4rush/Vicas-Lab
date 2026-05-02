  require('dotenv').config();
  const path = require('path');
  const fs = require('fs');
  const express = require('express');
  const helmet = require('helmet');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const rateLimit = require('express-rate-limit');

  const authRoutes = require('./routes/auth');
  const galleryRoutes = require('./routes/gallery');
  const contentRoutes = require('./routes/content');
  const btpRoutes = require('./routes/btp');
  const uploadRoutes = require('./routes/uploadRoutes');
  const { initDb } = require('./db');
  const { initCronJobs } = require('./cron');
  const admin = require('firebase-admin');

  // Initialize Firebase Admin
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountJson || serviceAccountPath) {
    let serviceAccount;
    try {
      if (serviceAccountJson) {
        serviceAccount = JSON.parse(serviceAccountJson);
      } else {
        serviceAccount = require(path.isAbsolute(serviceAccountPath) ? serviceAccountPath : path.join(__dirname, serviceAccountPath));
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'vicas-hub.firebasestorage.app',
      });
      console.log('Firebase Admin initialized with Storage');
    } catch (err) {
      console.error('Failed to initialize Firebase Admin:', err.message);
    }
  } else {
    console.warn('Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH set. Firebase Admin not initialized.');
  }

  const PORT = process.env.PORT || 4000;
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';

  // ensure data dir exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  initDb();
  initCronJobs();

  const app = express();
  app.set('trust proxy', 1); // Trust Nginx reverse proxy (for rate-limiter + correct client IP)

  // Manual security headers (replaces Helmet which forces COEP/CSP on v6.x)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    next();
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:3000',
    'https://vicas-lab.vercel.app',
    ...FRONTEND_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  ];

  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many requests, please try again later.' },
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/btp', btpRoutes);
  app.use('/api/upload', uploadRoutes);

  app.get('/', (req, res) => res.json({ ok: true }));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log(`Auth server listening on port ${PORT}`);
  });
