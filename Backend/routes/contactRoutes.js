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

// Public route - user contact form submission
router.post('/', submitContactForm);

// Admin-protected routes
router.get('/admin/all', protectAdmin, getAllInquiries);
router.get('/admin/:id', protectAdmin, getInquiryById);
router.put('/admin/:id/status', protectAdmin, updateInquiryStatus);
router.delete('/admin/:id', protectAdmin, deleteInquiry);

module.exports = router;
