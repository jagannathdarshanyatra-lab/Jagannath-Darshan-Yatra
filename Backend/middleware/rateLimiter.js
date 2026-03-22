const rateLimit = require('express-rate-limit');

/**
 * Stricter rate limiter for auth routes (login, register, reset-password)
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after an hour',
  },
});

/**
 * Rate limiter for contact form submissions
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many contact form submissions, please try again after an hour',
  },
});

module.exports = {
  authLimiter,
  contactLimiter,
};
