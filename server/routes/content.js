const express = require('express');
const router = express.Router();
const cc = require('../controllers/contentController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for submissions to prevent spam
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many submissions from this IP, please try again after an hour.' },
});

// ─── Public Endpoints ──────────────────────────────────────────
router.get('/:type(project|news|achievement|research)', cc.getApprovedContent);

// ─── Authenticated Endpoints ───────────────────────────────────
router.post('/upload', authenticateToken, uploadLimiter, cc.uploadContent);

// ─── Admin + Super Admin Endpoints ─────────────────────────────
router.get('/pending/all', authenticateToken, requireRole('admin', 'super_admin'), cc.getPendingContent);
router.post('/approve/:id', authenticateToken, requireRole('admin', 'super_admin'), cc.approveContent);
router.post('/reject/:id', authenticateToken, requireRole('admin', 'super_admin'), cc.rejectContent);
router.delete('/:id', authenticateToken, cc.deleteContent);
router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), cc.updateContent);

module.exports = router;
