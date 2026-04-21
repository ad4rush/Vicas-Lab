const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { getDb } = require('../db');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'content');
const PDF_DIR = path.join(__dirname, '..', 'uploads', 'pdfs');

// Helper: save any file locally and return URL
async function saveFileLocally(base64Data, fileName, dir, mimeRegex) {
  if (!base64Data) return { publicUrl: null, storagePath: null };

  await fs.mkdir(dir, { recursive: true });
  const cleanBase64 = base64Data.replace(new RegExp(`^data:${mimeRegex};base64,`), '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  const uniqueName = `${uuidv4()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(dir, uniqueName);
  await fs.writeFile(filePath, buffer);

  const folder = dir === PDF_DIR ? 'pdfs' : 'content';
  const publicUrl = `/uploads/${folder}/${uniqueName}`;
  return { publicUrl, storagePath: filePath };
}

// Helper: delete local file
async function deleteLocalFile(storagePath) {
  if (!storagePath) return;
  try { await fs.unlink(storagePath); } catch (err) {
    console.warn('Failed to delete file:', storagePath, err.message);
  }
}

// ─── Content Endpoints ─────────────────────────────────────────

async function uploadContent(req, res) {
  const { type, title, description, fileName, fileData, pdfName, pdfData, metadata } = req.body;
  const user = req.user;

  if (!type || !['project', 'news', 'achievement'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing content type' });
  }
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const db = await getDb();
  try {
    let publicUrl = null, storagePath = null;
    let pdfUrl = null, pdfStoragePath = null;

    if (fileData && fileName) {
      const saved = await saveFileLocally(fileData, fileName, UPLOAD_DIR, 'image\\/\\w+');
      publicUrl = saved.publicUrl;
      storagePath = saved.storagePath;
    }

    if (pdfData && pdfName) {
      const savedPdf = await saveFileLocally(pdfData, pdfName, PDF_DIR, 'application\\/pdf');
      pdfUrl = savedPdf.publicUrl;
      pdfStoragePath = savedPdf.storagePath;
    }

    const contentId = uuidv4();
    const status = 'approved';

    // Merge pdfUrl + externalLink into metadata
    const enrichedMeta = {
      ...(metadata || {}),
      ...(pdfUrl ? { pdfUrl, pdfStoragePath } : {}),
    };
    const metaString = JSON.stringify(enrichedMeta);

    await db.run(
      `INSERT INTO content_items (id, type, title, description, image_url, storage_path, metadata, uploaded_by, uploader_name, uploader_email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      contentId, type, title, description || null, publicUrl, storagePath, metaString,
      user.sub, user.name, user.email, status
    );

    res.json({ ok: true, message: `${type} published successfully`, contentId, status });
  } catch (err) {
    console.error('Upload content error:', err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    await db.close();
  }
}

async function getApprovedContent(req, res) {
  const { type } = req.params;
  const db = await getDb();
  try {
    const items = await db.all(
      `SELECT id, type, title, description, image_url, metadata, uploader_name, created_at
       FROM content_items
       WHERE status = 'approved' AND type = ?
       ORDER BY created_at DESC`,
      type
    );
    res.json({ items });
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  } finally {
    await db.close();
  }
}

async function getPendingContent(req, res) {
  const db = await getDb();
  try {
    const items = await db.all(
      `SELECT id, type, title, description, image_url, metadata, uploader_name, uploader_email, created_at
       FROM content_items WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json({ items });
  } catch (err) {
    console.error('Get pending content error:', err);
    res.status(500).json({ error: 'Failed to fetch pending content' });
  } finally {
    await db.close();
  }
}

async function approveContent(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM content_items WHERE id = ?', id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.status !== 'pending') return res.status(400).json({ error: 'Item already reviewed' });

    await db.run("UPDATE content_items SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
    res.json({ ok: true, message: 'Item approved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve item' });
  } finally {
    await db.close();
  }
}

async function rejectContent(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM content_items WHERE id = ?', id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.status !== 'pending') return res.status(400).json({ error: 'Item already reviewed' });

    if (item.storage_path) await deleteLocalFile(item.storage_path);
    try {
      const m = JSON.parse(item.metadata || '{}');
      if (m.pdfStoragePath) await deleteLocalFile(m.pdfStoragePath);
    } catch (_) {}

    await db.run("UPDATE content_items SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id);
    res.json({ ok: true, message: 'Item rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Failed to reject item' });
  } finally {
    await db.close();
  }
}

async function deleteContent(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM content_items WHERE id = ?', id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.sub !== item.uploaded_by) {
      return res.status(403).json({ error: 'Unauthorized to delete this item' });
    }

    if (item.storage_path) await deleteLocalFile(item.storage_path);
    try {
      const m = JSON.parse(item.metadata || '{}');
      if (m.pdfStoragePath) await deleteLocalFile(m.pdfStoragePath);
    } catch (_) {}

    await db.run('DELETE FROM content_items WHERE id = ?', id);
    res.json({ ok: true, message: 'Item deleted' });
  } catch (err) {
    console.error('Delete content error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  } finally {
    await db.close();
  }
}

async function updateContent(req, res) {
  const { id } = req.params;
  const { title, description, metadata } = req.body;
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM content_items WHERE id = ?', id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const newMetadata = metadata !== undefined ? JSON.stringify(metadata) : item.metadata;

    await db.run(
      'UPDATE content_items SET title = ?, description = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      title !== undefined ? title : item.title,
      description !== undefined ? description : item.description,
      newMetadata, id
    );
    res.json({ ok: true, message: 'Item updated' });
  } catch (err) {
    console.error('Update content error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  } finally {
    await db.close();
  }
}

module.exports = {
  uploadContent,
  getApprovedContent,
  getPendingContent,
  approveContent,
  rejectContent,
  deleteContent,
  updateContent,
};
