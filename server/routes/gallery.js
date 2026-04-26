const express = require('express');
const router = express.Router();
const gc = require('../controllers/galleryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ─── Public Endpoints ──────────────────────────────────────────
router.get('/photos', gc.getApprovedPhotos);
router.get('/albums', gc.getAlbums);
router.get('/albums/:id/photos', gc.getAlbumPhotos);

// ─── Authenticated Endpoints ───────────────────────────────────
router.post('/upload', authenticateToken, gc.uploadPhoto);
router.post('/request-admin', authenticateToken, gc.requestAdminAccess);

// ─── Admin + Super Admin Endpoints ─────────────────────────────
router.get('/pending', authenticateToken, requireRole('admin', 'super_admin'), gc.getPendingPhotos);
router.post('/approve/:id', authenticateToken, requireRole('admin', 'super_admin'), gc.approvePhoto);
router.post('/reject/:id', authenticateToken, requireRole('admin', 'super_admin'), gc.rejectPhoto);
router.delete('/photos/:id', authenticateToken, gc.deletePhoto);
router.put('/photos/:id', authenticateToken, requireRole('admin', 'super_admin'), gc.updatePhoto);
router.post('/albums', authenticateToken, requireRole('super_admin'), gc.createAlbum);
router.put('/albums/:id', authenticateToken, requireRole('super_admin'), gc.updateAlbum);
router.delete('/albums/:id', authenticateToken, requireRole('super_admin'), gc.deleteAlbum);
router.post('/albums/:id/photos', authenticateToken, requireRole('super_admin'), gc.addPhotoToAlbum);
router.delete('/albums/:id/photos/:photoId', authenticateToken, requireRole('super_admin'), gc.removePhotoFromAlbum);
router.put('/albums/:id/cover', authenticateToken, requireRole('super_admin'), gc.setAlbumCover);

// ─── Super Admin Only Endpoints ────────────────────────────────
router.get('/admin-requests', authenticateToken, requireRole('super_admin'), gc.getAdminRequests);
router.put('/admin-requests/:id', authenticateToken, requireRole('super_admin'), gc.handleAdminRequest);
router.get('/users', authenticateToken, requireRole('super_admin'), gc.getAllUsers);
router.put('/users/:userId/role', authenticateToken, requireRole('super_admin'), gc.updateUserRole);
router.delete('/users/:userId', authenticateToken, requireRole('super_admin'), gc.deleteUser);

module.exports = router;
