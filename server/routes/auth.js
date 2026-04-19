const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').isLength({ min: 2 }).trim().escape(),
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
], authController.login);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.post('/google', authController.googleLogin);

module.exports = router;
