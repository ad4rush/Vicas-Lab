const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { getDb } = require('../db');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'gallery');

// Helper: save image locally and return URL
async function saveImageLocally(base64Data, fileName) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  const uniqueName = `${uuidv4()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await fs.writeFile(filePath, buffer);

  // URL will be served via Express static: /uploads/gallery/filename
  const publicUrl = `/uploads/gallery/${uniqueName}`;
  return { publicUrl, storagePath: filePath };
}

// Helper: delete local file
async function deleteLocalFile(storagePath) {
  try {
    await fs.unlink(storagePath);
  } catch (err) {
    console.warn('Failed to delete file:', storagePath, err.message);
  }
}

// ─── Photo Endpoints ───────────────────────────────────────────

// Upload photo
async function uploadPhoto(req, res) {
  const { fileName, fileData, imageData, title, description, imageUrl: clientImageUrl } = req.body;
  const user = req.user;

  // Accept both fileData and imageData (frontend sends imageData as fallback)
  const base64Data = fileData || imageData;
  const imgFileName = fileName || 'upload.jpg';

  if (!clientImageUrl && !base64Data) {
    return res.status(400).json({ error: 'Image file or URL is required' });
  }

  const db = await getDb();
  try {
    let publicUrl = clientImageUrl || null;
    let storagePath = null;

    if (!clientImageUrl && base64Data) {
      const saved = await saveImageLocally(base64Data, imgFileName);
      publicUrl = saved.publicUrl;
      storagePath = saved.storagePath;
    }

    const photoId = uuidv4();
    const isPrivileged = user.role === 'admin' || user.role === 'super_admin';
    const status = isPrivileged ? 'approved' : 'pending';

    await db.run(
      `INSERT INTO photos (id, image_url, storage_path, title, description, uploaded_by, uploader_name, uploader_email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      photoId, publicUrl, storagePath, title || null, description || null,
      user.sub, user.name, user.email, status
    );

    const message = isPrivileged
      ? 'Photo uploaded successfully'
      : 'Photo submitted for approval';

    res.json({ ok: true, message, photoId, status });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    await db.close();
  }
}

// Get all approved photos (public)
async function getApprovedPhotos(req, res) {
  const db = await getDb();
  try {
    const photos = await db.all(
      `SELECT id, image_url, title, description, uploader_name, uploader_email, created_at
       FROM photos WHERE status = 'approved' ORDER BY created_at DESC`
    );
    res.json({ photos });
  } catch (err) {
    console.error('Get photos error:', err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  } finally {
    await db.close();
  }
}

// Get pending photos (admin+)
async function getPendingPhotos(req, res) {
  const db = await getDb();
  try {
    const photos = await db.all(
      `SELECT id, image_url, title, description, uploader_name, uploader_email, created_at
       FROM photos WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json({ photos });
  } catch (err) {
    console.error('Get pending photos error:', err);
    res.status(500).json({ error: 'Failed to fetch pending photos' });
  } finally {
    await db.close();
  }
}

// Approve photo (admin+)
async function approvePhoto(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const photo = await db.get('SELECT * FROM photos WHERE id = ?', id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.status !== 'pending') return res.status(400).json({ error: 'Photo already reviewed' });

    await db.run(
      "UPDATE photos SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id
    );
    res.json({ ok: true, message: 'Photo approved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve photo' });
  } finally {
    await db.close();
  }
}

// Reject photo (admin+)
async function rejectPhoto(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const photo = await db.get('SELECT * FROM photos WHERE id = ?', id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.status !== 'pending') return res.status(400).json({ error: 'Photo already reviewed' });

    await deleteLocalFile(photo.storage_path);

    await db.run(
      "UPDATE photos SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?", id
    );
    res.json({ ok: true, message: 'Photo rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Failed to reject photo' });
  } finally {
    await db.close();
  }
}

// Delete photo (admin+)
async function deletePhoto(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const photo = await db.get('SELECT * FROM photos WHERE id = ?', id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.sub !== photo.uploaded_by) {
      return res.status(403).json({ error: 'Unauthorized to delete this photo' });
    }

    await deleteLocalFile(photo.storage_path);

    await db.run('DELETE FROM album_photos WHERE photo_id = ?', id);
    await db.run('DELETE FROM photos WHERE id = ?', id);

    res.json({ ok: true, message: 'Photo deleted' });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  } finally {
    await db.close();
  }
}

// Update photo metadata (admin+)
async function updatePhoto(req, res) {
  const { id } = req.params;
  const { title, description } = req.body;
  const db = await getDb();
  try {
    const photo = await db.get('SELECT * FROM photos WHERE id = ?', id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    await db.run(
      'UPDATE photos SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      title !== undefined ? title : photo.title,
      description !== undefined ? description : photo.description,
      id
    );
    res.json({ ok: true, message: 'Photo updated' });
  } catch (err) {
    console.error('Update photo error:', err);
    res.status(500).json({ error: 'Failed to update photo' });
  } finally {
    await db.close();
  }
}

// ─── Album Endpoints ───────────────────────────────────────────

async function createAlbum(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Album name is required' });

  const db = await getDb();
  try {
    const albumId = uuidv4();
    await db.run(
      'INSERT INTO albums (id, name, description, created_by) VALUES (?, ?, ?, ?)',
      albumId, name, description || null, req.user.sub
    );
    res.json({ ok: true, albumId, message: 'Album created' });
  } catch (err) {
    console.error('Create album error:', err);
    res.status(500).json({ error: 'Failed to create album' });
  } finally {
    await db.close();
  }
}

async function updateAlbum(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;
  const db = await getDb();
  
  try {
    const album = await db.get('SELECT * FROM albums WHERE id = ?', id);
    if (!album) return res.status(404).json({ error: 'Album not found' });

    await db.run(
      'UPDATE albums SET name = ?, description = ? WHERE id = ?',
      name !== undefined ? name : album.name,
      description !== undefined ? description : album.description,
      id
    );
    res.json({ ok: true, message: 'Album updated' });
  } catch (err) {
    console.error('Update album error:', err);
    res.status(500).json({ error: 'Failed to update album' });
  } finally {
    await db.close();
  }
}

async function getAlbums(req, res) {
  const db = await getDb();
  try {
    const albums = await db.all(`
      SELECT a.*, 
        (SELECT COUNT(*) FROM album_photos ap WHERE ap.album_id = a.id) as photo_count,
        (SELECT p.image_url FROM photos p JOIN album_photos ap2 ON p.id = ap2.photo_id WHERE ap2.album_id = a.id LIMIT 1) as cover_url
      FROM albums a ORDER BY a.created_at DESC
    `);
    res.json({ albums });
  } catch (err) {
    console.error('Get albums error:', err);
    res.status(500).json({ error: 'Failed to fetch albums' });
  } finally {
    await db.close();
  }
}

async function getAlbumPhotos(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    const album = await db.get('SELECT * FROM albums WHERE id = ?', id);
    if (!album) return res.status(404).json({ error: 'Album not found' });

    const photos = await db.all(`
      SELECT p.id, p.image_url, p.title, p.description, p.uploader_name, p.created_at
      FROM photos p
      JOIN album_photos ap ON p.id = ap.photo_id
      WHERE ap.album_id = ? AND p.status = 'approved'
      ORDER BY ap.added_at DESC
    `, id);
    res.json({ album, photos });
  } catch (err) {
    console.error('Get album photos error:', err);
    res.status(500).json({ error: 'Failed to fetch album photos' });
  } finally {
    await db.close();
  }
}

async function addPhotoToAlbum(req, res) {
  const { id } = req.params;
  const { photoId } = req.body;
  if (!photoId) return res.status(400).json({ error: 'photoId is required' });

  const db = await getDb();
  try {
    const album = await db.get('SELECT id FROM albums WHERE id = ?', id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    const photo = await db.get('SELECT id FROM photos WHERE id = ?', photoId);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    const existing = await db.get('SELECT * FROM album_photos WHERE album_id = ? AND photo_id = ?', id, photoId);
    if (existing) return res.status(400).json({ error: 'Photo already in album' });

    await db.run('INSERT INTO album_photos (album_id, photo_id) VALUES (?, ?)', id, photoId);
    res.json({ ok: true, message: 'Photo added to album' });
  } catch (err) {
    console.error('Add to album error:', err);
    res.status(500).json({ error: 'Failed to add photo to album' });
  } finally {
    await db.close();
  }
}

async function removePhotoFromAlbum(req, res) {
  const { id, photoId } = req.params;
  const db = await getDb();
  try {
    await db.run('DELETE FROM album_photos WHERE album_id = ? AND photo_id = ?', id, photoId);
    res.json({ ok: true, message: 'Photo removed from album' });
  } catch (err) {
    console.error('Remove from album error:', err);
    res.status(500).json({ error: 'Failed to remove photo from album' });
  } finally {
    await db.close();
  }
}

async function deleteAlbum(req, res) {
  const { id } = req.params;
  const db = await getDb();
  try {
    await db.run('DELETE FROM album_photos WHERE album_id = ?', id);
    await db.run('DELETE FROM albums WHERE id = ?', id);
    res.json({ ok: true, message: 'Album deleted' });
  } catch (err) {
    console.error('Delete album error:', err);
    res.status(500).json({ error: 'Failed to delete album' });
  } finally {
    await db.close();
  }
}

// ─── Admin Request Endpoints ───────────────────────────────────

async function requestAdminAccess(req, res) {
  const user = req.user;
  if (user.role !== 'user') {
    return res.status(400).json({ error: 'You already have elevated privileges' });
  }

  const db = await getDb();
  try {
    const existing = await db.get(
      "SELECT id FROM admin_requests WHERE user_id = ? AND status = 'pending'", user.sub
    );
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending admin request' });
    }

    const requestId = uuidv4();
    await db.run(
      'INSERT INTO admin_requests (id, user_id, user_email, user_name) VALUES (?, ?, ?, ?)',
      requestId, user.sub, user.email, user.name
    );
    res.json({ ok: true, message: 'Admin access request submitted' });
  } catch (err) {
    console.error('Admin request error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  } finally {
    await db.close();
  }
}

async function getAdminRequests(req, res) {
  const db = await getDb();
  try {
    const requests = await db.all(
      "SELECT * FROM admin_requests ORDER BY created_at DESC"
    );
    res.json({ requests });
  } catch (err) {
    console.error('Get admin requests error:', err);
    res.status(500).json({ error: 'Failed to fetch admin requests' });
  } finally {
    await db.close();
  }
}

async function handleAdminRequest(req, res) {
  const { id } = req.params;
  const { action } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
  }

  const db = await getDb();
  try {
    const request = await db.get('SELECT * FROM admin_requests WHERE id = ?', id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Request already handled' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db.run(
      'UPDATE admin_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
      newStatus, req.user.sub, id
    );

    if (action === 'approve') {
      await db.run("UPDATE users SET role = 'admin' WHERE id = ?", request.user_id);
    }

    res.json({ ok: true, message: `Admin request ${newStatus}` });
  } catch (err) {
    console.error('Handle admin request error:', err);
    res.status(500).json({ error: 'Failed to handle request' });
  } finally {
    await db.close();
  }
}

// ─── User Management Endpoints ─────────────────────────────────

async function getAllUsers(req, res) {
  const db = await getDb();
  try {
    const users = await db.all(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    await db.close();
  }
}

async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;
  const currentUser = req.user;

  const validRoles = ['user', 'admin', 'super_admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Can only set user, admin, or super_admin.' });
  }

  if (userId === currentUser.sub) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  const db = await getDb();
  try {
    const targetUser = await db.get('SELECT role FROM users WHERE id = ?', userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot change a Super Admin\'s role' });
    }

    await db.run('UPDATE users SET role = ? WHERE id = ?', role, userId);
    res.json({ ok: true, message: 'User role updated' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  } finally {
    await db.close();
  }
}

async function deleteUser(req, res) {
  const { userId } = req.params;
  const currentUser = req.user;

  if (userId === currentUser.sub) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const db = await getDb();
  try {
    const targetUser = await db.get('SELECT role FROM users WHERE id = ?', userId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete a Super Admin account' });
    }

    await db.run('DELETE FROM users WHERE id = ?', userId);
    res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    await db.close();
  }
}

async function setAlbumCover(req, res) {
  const { id } = req.params;
  const { cover_photo_id } = req.body;
  
  if (!cover_photo_id) return res.status(400).json({ error: 'cover_photo_id is required' });

  const db = await getDb();
  try {
    const album = await db.get('SELECT id FROM albums WHERE id = ?', id);
    if (!album) return res.status(404).json({ error: 'Album not found' });

    // Ensure the photo exists
    const photo = await db.get('SELECT id FROM photos WHERE id = ?', cover_photo_id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    await db.run('UPDATE albums SET cover_photo_id = ? WHERE id = ?', cover_photo_id, id);
    res.json({ ok: true, message: 'Album cover updated' });
  } catch (err) {
    console.error('Set album cover error:', err);
    res.status(500).json({ error: 'Failed to update album cover' });
  } finally {
    await db.close();
  }
}

module.exports = {
  uploadPhoto,
  getApprovedPhotos,
  getPendingPhotos,
  approvePhoto,
  rejectPhoto,
  deletePhoto,
  updatePhoto,
  createAlbum,
  updateAlbum,
  getAlbums,
  getAlbumPhotos,
  addPhotoToAlbum,
  removePhotoFromAlbum,
  deleteAlbum,
  requestAdminAccess,
  getAdminRequests,
  handleAdminRequest,
  getAllUsers,
  updateUserRole,
  deleteUser,
  setAlbumCover,
};
