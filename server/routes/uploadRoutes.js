const express = require('express');
const { generatePresignedUrl } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/presign', authenticateToken, generatePresignedUrl);

module.exports = router;
