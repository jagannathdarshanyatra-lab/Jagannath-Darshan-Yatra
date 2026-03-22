const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuthMiddleware');
const {
  getAllFaqs,
  getAllFaqsAdmin,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs
} = require('../controllers/faqController');

const { setCache } = require('../middleware/cacheMiddleware');

// Public route - get active FAQs
router.get('/', setCache(3600), getAllFaqs);

// Admin routes - protected
router.get('/admin/all', protectAdmin, getAllFaqsAdmin);
router.get('/:id', protectAdmin, getFaqById);
router.post('/', protectAdmin, createFaq);
router.put('/reorder', protectAdmin, reorderFaqs);
router.put('/:id', protectAdmin, updateFaq);
router.delete('/:id', protectAdmin, deleteFaq);

module.exports = router;