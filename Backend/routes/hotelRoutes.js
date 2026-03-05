const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getAllHotelsAdmin,
  getPendingHotels,
  approveHotel,
  rejectHotel,
} = require('../controllers/hotelController');
const { protect, admin } = require('../middleware/authMiddleware');

const { validateOtaRequest } = require('../middleware/otaRequestMiddleware');

const { protectAdmin, requireSuperAdmin } = require('../middleware/adminAuthMiddleware');
const { upload } = require('../utils/imageUpload');

// Configure multer field for hotel images
const hotelUploadField = upload.fields([
  { name: 'images', maxCount: 10 }
]);

// ========================
// ADMIN ROUTES (must come before /:id to avoid conflicts)
// ========================
router.get('/admin/all', protectAdmin, getAllHotelsAdmin);
router.get('/admin/pending', requireSuperAdmin, getPendingHotels);

// Public routes for fetching (only approved)
router.get('/', validateOtaRequest, getHotels);

// Admin CRUD routes
router.post('/', protectAdmin, hotelUploadField, createHotel);
router.put('/:id', protectAdmin, hotelUploadField, updateHotel);
router.patch('/:id/approve', requireSuperAdmin, approveHotel);
router.patch('/:id/reject', requireSuperAdmin, rejectHotel);
router.delete('/:id', protectAdmin, deleteHotel);

// Public by ID (must be last)
router.get('/:id', getHotelById);

module.exports = router;
