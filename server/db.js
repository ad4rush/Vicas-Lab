const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Fixed Super Admin emails — these always get super_admin role
const SUPER_ADMIN_EMAILS = [
  'anuj@iiitd.ac.in',
  'anujgrover@iiitd.ac.in',
  'aditya22037@iiitd.ac.in',
  'anish22075@iiitd.ac.in',
  'adarsh22024@iiitd.ac.in',
  'akshat22053@iiitd.ac.in',
];

/**
 * Creates a compatibility wrapper for the LibSQL client
 * to match the 'sqlite' package API used in the project.
 */
function createDbWrapper(client) {
  return {
    exec: async (sql) => {
      // exec in 'sqlite' usually handles multiple statements
      // LibSQL executeMultiple is better for this
      return await client.executeMultiple(sql);
    },
    run: async (sql, ...params) => {
      // LibSQL uses :param or ? but we need to handle positional params
      return await client.execute({ sql, args: params });
    },
    get: async (sql, ...params) => {
      const rs = await client.execute({ sql, args: params });
      return rs.rows[0] ? { ...rs.rows[0] } : undefined;
    },
    all: async (sql, ...params) => {
      const rs = await client.execute({ sql, args: params });
      return rs.rows.map(row => ({ ...row }));
    },
    close: async () => {
      return await client.close();
    }
  };
}

async function initDb() {
  if (!url) {
    console.warn('TURSO_DATABASE_URL not set. Skipping initDb.');
    return;
  }

  const client = createClient({ url, authToken });
  const db = createDbWrapper(client);

  console.log('Initializing Turso Database...');

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
  await client.close();
}

async function getDb() {
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not defined in environment variables');
  }
  const client = createClient({ url, authToken });
  const db = createDbWrapper(client);
  // PRAGMA foreign_keys = ON is usually default in LibSQL, but can be set
  try {
    await client.execute('PRAGMA foreign_keys = ON');
  } catch (e) { /* ignore if not supported */ }
  return db;
}

module.exports = { initDb, getDb };

