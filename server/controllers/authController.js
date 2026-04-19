require('dotenv').config();
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const { getDb } = require('../db');

const ACCESS_EXP = '15m';
const REFRESH_EXP = '7d';
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret';

// Fixed Super Admin emails
const SUPER_ADMIN_EMAILS = [
  'anuj@iiitd.ac.in',
  'anujgrover@iiitd.ac.in',
  'aditya22037@iiitd.ac.in',
  'anish22075@iiitd.ac.in',
  'adarsh22024@iiitd.ac.in',
  'akshat22053@iiitd.ac.in'
];

function assignRole(email) {
  if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
    return 'super_admin';
  }
  // All other users get default 'user' role
  return 'user';
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;

  const db = await getDb();
  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const role = assignRole(email);
    await db.run('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', id, name, email, password_hash, role);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    await db.close();
  }
}

function signAccess(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

function signRefresh(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    // store refresh token (rotation)
    await db.run('UPDATE users SET refresh_token = ? WHERE id = ?', refreshToken, user.id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    await db.close();
  }
}

async function refresh(req, res) {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', payload.sub);
    if (!user || !user.refresh_token) {
      await db.close();
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (user.refresh_token !== token) {
      await db.close();
      return res.status(401).json({ error: 'Stale refresh token' });
    }

    // rotate
    const newRefresh = signRefresh(user);
    await db.run('UPDATE users SET refresh_token = ? WHERE id = ?', newRefresh, user.id);

    const accessToken = signAccess(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    };
    res.cookie('refreshToken', newRefresh, cookieOptions);
    await db.close();
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.json({ ok: true });
  }

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const db = await getDb();
    await db.run('UPDATE users SET refresh_token = NULL WHERE id = ?', payload.sub);
    await db.close();
  } catch (err) {
    console.warn('Failed to clear refresh token:', err.message);
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ ok: true });
}

async function me(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    // return basic user info
    res.json({ id: payload.sub, name: payload.name, email: payload.email, role: payload.role });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(credential);
    const { email, name, uid: googleId } = decodedToken;

    const db = await getDb();
    try {
      // Check if user exists
      let user = await db.get('SELECT * FROM users WHERE email = ?', email);
      
      if (!user) {
        // Create new user with assigned role
        const id = uuidv4();
        const role = assignRole(email);
        await db.run(
          'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
          id, name, email, '', role // Empty password_hash for Google auth users
        );
        user = { id, name, email, role };
      } else {
        // Sync role for super admins (in case they were registered before being added to list)
        const correctRole = assignRole(email);
        if (correctRole === 'super_admin' && user.role !== 'super_admin') {
          await db.run("UPDATE users SET role = 'super_admin' WHERE id = ?", user.id);
          user.role = 'super_admin';
        }
      }

      // Generate tokens
      const accessToken = signAccess(user);
      const refreshToken = signRefresh(user);

      // Store refresh token
      await db.run('UPDATE users SET refresh_token = ? WHERE id = ?', refreshToken, user.id);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      };

      res.cookie('refreshToken', refreshToken, cookieOptions);
      res.json({ accessToken });
    } finally {
      await db.close();
    }
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}

module.exports = { register, login, refresh, logout, me, googleLogin };
