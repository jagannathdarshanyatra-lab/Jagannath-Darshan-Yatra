const express = require('express');
const router = express.Router();

const {
  getPackages,
  getPackageById,
  getPackageBySlug,
  getPackagesByDestinationName,
  getAllPackagesAdmin,
  createPackage,
  updatePackage,
  deletePackage,
  getPendingPackages,
  approvePackage,
  rejectPackage,
} = require('../controllers/packageController');

const { protectAdmin, requireSuperAdmin } = require('../middleware/adminAuthMiddleware');
const { upload } = require('../utils/imageUpload');

// Configure multer fields for package images
const packageUploadFields = upload.fields([
  { name: 'image', maxCount: 1 },           // Main package thumbnail
  { name: 'locationImage', maxCount: 1 },   // Location/destination image
  { name: 'heroImages', maxCount: 3 },      // Banner carousel images
  { name: 'images', maxCount: 10 },         // Gallery images
]);

// ========================
// PUBLIC ROUTES
// ========================

// @route   GET /api/packages
// @desc    Get all packages (with optional filters, active & approved only)
// @access  Public
router.get('/', getPackages);

// @route   GET /api/packages/slug/:slug
// @desc    Get package by slug
// @access  Public
router.get('/slug/:slug', getPackageBySlug);

// @route   GET /api/packages/destination/:dest
// @desc    Get packages by destination name
// @access  Public
router.get('/destination/:dest', getPackagesByDestinationName);

// ========================
// ADMIN ROUTES (Protected)
// ========================

// @route   GET /api/packages/admin/all
// @desc    Get all packages for admin (including inactive & all approval statuses)
// @access  Private (Admin)
router.get('/admin/all', protectAdmin, getAllPackagesAdmin);

// @route   GET /api/packages/admin/pending
// @desc    Get pending packages for SuperAdmin approval
// @access  Private (SuperAdmin)
router.get('/admin/pending', requireSuperAdmin, getPendingPackages);

// @route   POST /api/packages
// @desc    Create a new package
// @access  Private (Admin)
router.post('/', protectAdmin, packageUploadFields, createPackage);

// @route   PUT /api/packages/:id
// @desc    Update a package
// @access  Private (Admin)
router.put('/:id', protectAdmin, packageUploadFields, updatePackage);

// @route   PATCH /api/packages/:id/approve
// @desc    Approve a package
// @access  Private (SuperAdmin)
router.patch('/:id/approve', requireSuperAdmin, approvePackage);

// @route   PATCH /api/packages/:id/reject
// @desc    Reject a package
// @access  Private (SuperAdmin)
router.patch('/:id/reject', requireSuperAdmin, rejectPackage);

// @route   DELETE /api/packages/:id
// @desc    Delete a package (soft delete by default, ?hardDelete=true for permanent)
// @access  Private (Admin)
router.delete('/:id', protectAdmin, deletePackage);

// ========================
// PUBLIC BY ID (must be last to avoid conflicts)
// ========================

// @route   GET /api/packages/:id
// @desc    Get package by ID (MongoDB or legacy ID)
// @access  Public
router.get('/:id', getPackageById);

module.exports = router;
