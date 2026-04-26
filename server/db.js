const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.sqlite');

// Fixed Super Admin emails — these always get super_admin role
const SUPER_ADMIN_EMAILS = [
  'anuj@iiitd.ac.in',
  'anujgrover@iiitd.ac.in',
  'aditya22037@iiitd.ac.in',
  'anish22075@iiitd.ac.in',
  'adarsh22024@iiitd.ac.in',
  'akshat22053@iiitd.ac.in',
];

async function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  // Core tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      refresh_token TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pending_photos (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      file_name TEXT,
      file_path TEXT,
      category TEXT,
      status TEXT DEFAULT 'pending',
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      title TEXT,
      description TEXT,
      uploaded_by TEXT NOT NULL,
      uploader_name TEXT,
      uploader_email TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      cover_photo_id TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS album_photos (
      album_id TEXT NOT NULL,
      photo_id TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (album_id, photo_id),
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
      FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT,
      user_name TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS content_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      storage_path TEXT,
      metadata TEXT,
      uploaded_by TEXT NOT NULL,
      uploader_name TEXT,
      uploader_email TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS btp_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      is_public BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS btp_members (
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES btp_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS btp_reports (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      report_text TEXT,
      report_file_url TEXT,
      is_public BOOLEAN DEFAULT 0,
      uploaded_by TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES btp_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS btp_invites (
      token TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      email TEXT NOT NULL,
      inviter_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES btp_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (inviter_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS btp_comments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES btp_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migrate old role names to new ones
  try {
    await db.run("UPDATE users SET role = 'admin' WHERE role = 'super_user'");
    await db.run("UPDATE users SET role = 'super_admin' WHERE role = 'super_super_user'");
  } catch (err) { /* ignore */ }

  // Add missing columns if they don't exist
  try {
    await db.run("ALTER TABLE btp_projects ADD COLUMN is_public BOOLEAN DEFAULT 0");
  } catch (err) { /* ignore if exists */ }

  // Ensure super admin emails always have super_admin role
  for (const email of SUPER_ADMIN_EMAILS) {
    await db.run("UPDATE users SET role = 'super_admin' WHERE LOWER(email) = ? AND role != 'super_admin'", email.toLowerCase());
  }

  console.log('Database initialized, roles synced');
  await db.close();
}

async function getDb() {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  await db.run('PRAGMA foreign_keys = ON');
  return db;
}

module.exports = { initDb, getDb };
