const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
