const express = require('express');
const router = express.Router();
const { upload } = require('../utils/imageUpload');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

const {
  getDestinations,
  getAllDestinationsAdmin,
  getDestinationBySlug,
  getDestinationById,
  getPackagesByDestination,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');

// ============================================
// ADMIN ROUTES (Protected) - Must come before parameterized routes
// ============================================

// @route   GET /api/destinations/admin/all
// @desc    Get all destinations for admin (including inactive)
// @access  Private/Admin
router.get('/admin/all', protectAdmin, getAllDestinationsAdmin);

// @route   GET /api/destinations/id/:id
// @desc    Get destination by ID
// @access  Private/Admin
router.get('/id/:id', protectAdmin, getDestinationById);

// @route   POST /api/destinations
// @desc    Create a new destination
// @access  Private/Admin
router.post('/', protectAdmin, upload.single('heroImage'), createDestination);

// @route   PUT /api/destinations/:id
// @desc    Update a destination
// @access  Private/Admin
router.put('/:id', protectAdmin, upload.single('heroImage'), updateDestination);

// @route   DELETE /api/destinations/:id
// @desc    Delete a destination (soft or hard delete)
// @access  Private/Admin
router.delete('/:id', protectAdmin, deleteDestination);

const { setCache } = require('../middleware/cacheMiddleware');

// ============================================
// ADMIN ROUTES (Protected) - Must come before parameterized routes
// ============================================
// ... admin routes ...
// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/destinations
// @desc    Get all active destinations
// @access  Public
router.get('/', setCache(3600), getDestinations);

// @route   GET /api/destinations/:slug
// @desc    Get destination by slug
// @access  Public
router.get('/:slug', setCache(3600), getDestinationBySlug);

// @route   GET /api/destinations/:slug/packages
// @desc    Get packages by destination
// @access  Public
router.get('/:slug/packages', setCache(3600), getPackagesByDestination);

module.exports = router;
