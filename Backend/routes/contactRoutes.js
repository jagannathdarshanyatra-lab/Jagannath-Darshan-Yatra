const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

const { contactLimiter } = require('../middleware/rateLimiter');

// Public route - user contact form submission
router.post('/', contactLimiter, submitContactForm);

// Admin-protected routes
router.get('/admin/all', protectAdmin, getAllInquiries);
router.get('/admin/:id', protectAdmin, getInquiryById);
router.put('/admin/:id/status', protectAdmin, updateInquiryStatus);
router.delete('/admin/:id', protectAdmin, deleteInquiry);

module.exports = router;
