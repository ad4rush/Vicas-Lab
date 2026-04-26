const express = require('express');
const router = express.Router();
const btp = require('../controllers/btpController');
const { authenticateToken } = require('../middleware/auth');

// All BTP endpoints require authentication
router.post('/register', authenticateToken, btp.createProject);
router.get('/my-projects', authenticateToken, btp.getMyProjects);
router.post('/accept-invite', authenticateToken, btp.acceptInvite);
router.post('/:id/members', authenticateToken, btp.addMember);
router.post('/:id/reports', authenticateToken, btp.uploadReport);
router.get('/:id', authenticateToken, btp.getProjectReports);
router.put('/:id/privacy', authenticateToken, btp.toggleProjectPrivacy);

module.exports = router;
