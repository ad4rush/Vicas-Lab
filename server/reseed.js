/**
 * reseed.js — Wipe ALL existing content_items and re-seed fresh data.
 * Usage: node reseed.js (from the server/ directory)
 */
require('dotenv').config();
const { getDb, initDb } = require('./db');

async function reseed() {
  await initDb();
  const db = await getDb();
  try {
    const count = await db.get("SELECT COUNT(*) as cnt FROM content_items");
    console.log(`Deleting ${count.cnt} existing content items…`);
    await db.run("DELETE FROM content_items");
    console.log('✅ All content items deleted. Now run: node seed.js');
  } catch (err) {
    console.error('Reseed failed:', err);
  } finally {
    await db.close();
  }
}

reseed();
