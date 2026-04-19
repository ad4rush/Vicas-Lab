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
  const { initDb } = require('./db');
  const admin = require('firebase-admin');

  // Initialize Firebase Admin
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const serviceAccount = require(path.isAbsolute(serviceAccountPath) ? serviceAccountPath : path.join(__dirname, serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'vicas-hub.firebasestorage.app',
    });
    console.log('Firebase Admin initialized with Storage');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set, Firebase Admin not initialized');
  }

  const PORT = process.env.PORT || 4000;
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

  // ensure data dir exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  initDb();

  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  app.use(cors({
    origin: FRONTEND_ORIGIN,
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

  app.get('/', (req, res) => res.json({ ok: true }));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log(`Auth server listening on port ${PORT}`);
  });
