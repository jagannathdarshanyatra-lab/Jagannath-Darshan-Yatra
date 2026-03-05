const Package = require('../models/Package');

/**
 * @desc    Get all packages with optional filters
 * @route   GET /api/packages
 * @access  Public
 * @query   destination, type, minPrice, maxPrice, sort
 */
const getPackages = async (req, res) => {
  try {
    const {
      destination,
      state,
      type,
      minPrice,
      maxPrice,
      sort = 'price',
      limit,
    } = req.query;

    // Build query
    const query = { isActive: true, approvalStatus: 'approved' };

    if (state) {
      query.stateName = new RegExp(`^${state}$`, 'i');
    }

    if (destination) {
      query.primaryDestination = new RegExp(destination, 'i');
    }

    if (type) {
      query.type = type;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'price':
        sortQuery = { price: 1 };
        break;
      case 'price-desc':
        sortQuery = { price: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1 };
        break;
      case 'name':
        sortQuery = { name: 1 };
        break;
      default:
        sortQuery = { price: 1 };
    }

    let packagesQuery = Package.find(query)
      .sort(sortQuery)
      .select('-__v');

    if (limit) {
      packagesQuery = packagesQuery.limit(Number(limit));
    }

    const packages = await packagesQuery;

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
    });
  }
};

/**
 * @desc    Get single package by ID (MongoDB ObjectId or legacy ID)
 * @route   GET /api/packages/:id
 * @access  Public
 */
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    let pkg;

    // Check if it's a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      pkg = await Package.findOne({ _id: id, isActive: true, approvalStatus: 'approved' }).select('-__v');
    }

    // If not found by ObjectId, try legacy ID
    if (!pkg) {
      pkg = await Package.findOne({ legacyId: Number(id), isActive: true, approvalStatus: 'approved' }).select('-__v');
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    res.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch package',
    });
  }
};

/**
 * @desc    Get package by slug
 * @route   GET /api/packages/slug/:slug
 * @access  Public
 */
const getPackageBySlug = async (req, res) => {
  try {
    const pkg = await Package.findOne({
      slug: req.params.slug,
      isActive: true,
      approvalStatus: 'approved',
    }).select('-__v');

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    res.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch package',
    });
  }
};

/**
 * @desc    Get packages by destination name
 * @route   GET /api/packages/destination/:dest
 * @access  Public
 */
const getPackagesByDestinationName = async (req, res) => {
  try {
    const packages = await Package.find({
      primaryDestination: new RegExp(`^${req.params.dest}$`, 'i'),
      isActive: true,
      approvalStatus: 'approved',
    })
      .sort({ type: 1, price: 1 })
      .select('-__v');

    res.json({
      success: true,
      destination: req.params.dest,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
    });
  }
};

/**
 * @desc    Get all packages for admin (including inactive)
 * @route   GET /api/packages/admin/all
 * @access  Private (Admin)
 */
const getAllPackagesAdmin = async (req, res) => {
  try {
    const packages = await Package.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
    });
  }
};

/**
 * @desc    Create a new package
 * @route   POST /api/packages
 * @access  Private (Admin)
 */
const createPackage = async (req, res) => {
  try {
    const { processUploadedFiles } = require('../utils/imageUpload');
    
    // Parse body fields (may be JSON strings from FormData)
    const parseField = (field) => {
      if (!field) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return field;
    };

    // Process uploaded images
    const uploadedImages = await processUploadedFiles(req.files || {}, {
      image: 'packages/main',
      locationImage: 'packages/location',
      heroImages: 'packages/hero',
      images: 'packages/gallery',
    });

    // Parse itinerary from string format
    const parseItinerary = (itineraryData) => {
      if (!itineraryData) return [];
      
      // If it's already an array of objects
      if (Array.isArray(itineraryData) && typeof itineraryData[0] === 'object') {
        return itineraryData;
      }
      
      // If it's an array of strings (day descriptions)
      const itineraryStrings = Array.isArray(itineraryData) ? itineraryData : itineraryData.split('\n').filter(Boolean);
      
      return itineraryStrings.map((item, index) => {
        // Handle "Day X: Title" format
        const match = item.match(/^Day\s*\d*:?\s*(.+)$/i);
        return {
          day: index + 1,
          title: match ? match[1].trim() : item.trim(),
          activities: [],
        };
      });
    };

    // Parse comma-separated string to array
    const parseCommaSeparated = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split(',').map(s => s.trim()).filter(Boolean);
    };

    // Parse hotel details - handle string or array format
    const parseHotelDetails = (data) => {
      if (!data) return [];
      
      // If already an array of objects with proper structure
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].city) {
        return data;
      }
      
      // If it's a string, try JSON parse FIRST before treating as plain text
      if (typeof data === 'string') {
        const trimmed = data.trim();
        if (!trimmed) return [];
        
        // Try to parse as JSON first (admin form sends JSON.stringify)
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
          // If parsed to a single object, wrap in array
          if (typeof parsed === 'object' && parsed !== null) {
            return [parsed];
          }
        } catch {
          // Not JSON - treat as a plain text hotel name (e.g. "4 Star Hotel")
        }
        
        // Plain string fallback - create a default entry
        return [{
          city: 'Default',
          hotel: trimmed,
          nights: 1,
          roomType: 'Standard Room',
        }];
      }
      
      return [];
    };

    // Build package data
    const packageData = {
      name: req.body.name || req.body.packageName,
      primaryDestination: req.body.primaryDestination || req.body.specificDestination,
      stateName: req.body.stateName || req.body.destination || 'Odisha',
      type: req.body.type || req.body.tier,
      duration: req.body.duration,
      groupSize: req.body.groupSize,
      price: Number(req.body.price),
      originalPrice: Number(req.body.originalPrice) || Number(req.body.price) * 1.2,
      description: req.body.description || `Experience the best of ${req.body.primaryDestination || req.body.specificDestination}`,
      highlights: parseCommaSeparated(parseField(req.body.highlights)),
      included: parseCommaSeparated(parseField(req.body.included)),
      excluded: parseCommaSeparated(parseField(req.body.excluded)),
      itinerary: parseItinerary(parseField(req.body.itinerary)),
      hotelDetails: parseHotelDetails(req.body.hotelDetails),
      foodPlan: req.body.foodPlan || '',
      pickupDrop: req.body.pickupDrop || '',
      facilities: parseCommaSeparated(parseField(req.body.facilities)),
      locations: parseCommaSeparated(parseField(req.body.locations)),
      rating: Number(req.body.rating) || 4.5,
      reviews: Number(req.body.reviews) || 0,
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
      approvalStatus: req.admin && req.admin.role === 'superadmin' ? 'approved' : 'pending',
    };

    // Add uploaded images
    if (uploadedImages.image) {
      packageData.image = uploadedImages.image;
    } else {
      // Provide a default placeholder image to satisfy the required field
      packageData.image = 'https://placehold.co/800x600/f97316/white?text=Package+Image';
    }
    if (uploadedImages.locationImage) {
      packageData.locationImage = uploadedImages.locationImage;
    }
    if (uploadedImages.heroImages && uploadedImages.heroImages.length > 0) {
      packageData.heroImages = uploadedImages.heroImages;
    }
    if (uploadedImages.images && uploadedImages.images.length > 0) {
      packageData.images = uploadedImages.images;
    }

    // Create the package
    const pkg = await Package.create(packageData);

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: pkg,
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create package',
    });
  }
};

/**
 * @desc    Update a package
 * @route   PUT /api/packages/:id
 * @access  Private (Admin)
 */
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { processUploadedFiles } = require('../utils/imageUpload');
    const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

    // Find existing package
    const existingPkg = await Package.findById(id);
    if (!existingPkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    // Parse body fields
    const parseField = (field) => {
      if (!field) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return field;
    };

    // Parse comma-separated string to array
    const parseCommaSeparated = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return str.split(',').map(s => s.trim()).filter(Boolean);
    };

    // Parse itinerary
    const parseItinerary = (itineraryData) => {
      if (!itineraryData) return existingPkg.itinerary;
      
      if (Array.isArray(itineraryData) && itineraryData.length > 0 && typeof itineraryData[0] === 'object') {
        return itineraryData;
      }
      
      const itineraryStrings = Array.isArray(itineraryData) ? itineraryData : itineraryData.split('\n').filter(Boolean);
      
      return itineraryStrings.map((item, index) => {
        const match = item.match(/^Day\s*\d*:?\s*(.+)$/i);
        return {
          day: index + 1,
          title: match ? match[1].trim() : item.trim(),
          activities: [],
        };
      });
    };

    // Parse hotel details - handle string or array format
    const parseHotelDetails = (data) => {
      if (!data) return undefined;
      
      // If already an array of objects with proper structure
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].city) {
        return data;
      }
      
      // If it's a string, try JSON parse FIRST before treating as plain text
      if (typeof data === 'string') {
        const trimmed = data.trim();
        if (!trimmed) return undefined;
        
        // Try to parse as JSON first (admin form sends JSON.stringify)
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
          // If parsed to a single object, wrap in array
          if (typeof parsed === 'object' && parsed !== null) {
            return [parsed];
          }
        } catch {
          // Not JSON - treat as a plain text hotel name (e.g. "4 Star Hotel")
        }
        
        // Plain string fallback - create a default entry
        return [{
          city: 'Default',
          hotel: trimmed,
          nights: 1,
          roomType: 'Standard Room',
        }];
      }
      
      return undefined;
    };

    // Process new uploaded images
    const uploadedImages = await processUploadedFiles(req.files || {}, {
      image: 'packages/main',
      locationImage: 'packages/location',
      heroImages: 'packages/hero',
      images: 'packages/gallery',
    });

    // Build update data
    const updateData = {};

    // Only update fields that are provided
    if (req.body.name || req.body.packageName) {
      updateData.name = req.body.name || req.body.packageName;
    }
    if (req.body.primaryDestination || req.body.specificDestination) {
      updateData.primaryDestination = req.body.primaryDestination || req.body.specificDestination;
    }
    if (req.body.stateName || req.body.destination) {
      updateData.stateName = req.body.stateName || req.body.destination;
    }
    if (req.body.type || req.body.tier) {
      updateData.type = req.body.type || req.body.tier;
    }
    if (req.body.duration) {
      updateData.duration = req.body.duration;
    }
    if (req.body.groupSize) {
      updateData.groupSize = req.body.groupSize;
    }
    if (req.body.price) {
      updateData.price = Number(req.body.price);
    }
    if (req.body.originalPrice) {
      updateData.originalPrice = Number(req.body.originalPrice);
    }
    if (req.body.description) {
      updateData.description = req.body.description;
    }
    if (req.body.highlights) {
      updateData.highlights = parseCommaSeparated(parseField(req.body.highlights));
    }
    if (req.body.included) {
      updateData.included = parseCommaSeparated(parseField(req.body.included));
    }
    if (req.body.excluded) {
      updateData.excluded = parseCommaSeparated(parseField(req.body.excluded));
    }
    if (req.body.itinerary) {
      updateData.itinerary = parseItinerary(parseField(req.body.itinerary));
    }
    if (req.body.hotelDetails !== undefined) {
      const parsedHotelDetails = parseHotelDetails(req.body.hotelDetails);
      if (parsedHotelDetails) {
        updateData.hotelDetails = parsedHotelDetails;
      }
    }
    if (req.body.foodPlan !== undefined) {
      updateData.foodPlan = req.body.foodPlan;
    }
    if (req.body.pickupDrop !== undefined) {
      updateData.pickupDrop = req.body.pickupDrop;
    }
    if (req.body.facilities) {
      updateData.facilities = parseCommaSeparated(parseField(req.body.facilities));
    }
    if (req.body.locations) {
      updateData.locations = parseCommaSeparated(parseField(req.body.locations));
    }
    if (req.body.isActive !== undefined) {
      updateData.isActive = req.body.isActive !== 'false' && req.body.isActive !== false;
    }

    // Handle image updates
    if (uploadedImages.image) {
      // Delete old image from Cloudinary if it exists
      if (existingPkg.image) {
        const oldPublicId = getPublicIdFromUrl(existingPkg.image);
        if (oldPublicId) {
          try {
            await deleteImage(oldPublicId);
          } catch (e) {
            console.warn('Could not delete old main image:', e.message);
          }
        }
      }
      updateData.image = uploadedImages.image;
    }

    // Handle location image update
    if (uploadedImages.locationImage) {
      if (existingPkg.locationImage) {
        const oldPublicId = getPublicIdFromUrl(existingPkg.locationImage);
        if (oldPublicId) {
          try {
            await deleteImage(oldPublicId);
          } catch (e) {
            console.warn('Could not delete old location image:', e.message);
          }
        }
      }
      updateData.locationImage = uploadedImages.locationImage;
    }

    // Handle hero images update
    if (uploadedImages.heroImages && uploadedImages.heroImages.length > 0) {
      // Delete old hero images if they exist
      if (existingPkg.heroImages && existingPkg.heroImages.length > 0) {
        for (const imgUrl of existingPkg.heroImages) {
          const oldPublicId = getPublicIdFromUrl(imgUrl);
          if (oldPublicId) {
            try {
              await deleteImage(oldPublicId);
            } catch (e) {
              console.warn('Could not delete old hero image:', e.message);
            }
          }
        }
      }
      updateData.heroImages = uploadedImages.heroImages;
    }

    if (uploadedImages.images && uploadedImages.images.length > 0) {
      // Optionally delete old gallery images
      // For now, we'll replace them
      updateData.images = uploadedImages.images;
    }

    // Update the package
    const updatedPkg = await Package.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Package updated successfully',
      package: updatedPkg,
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update package',
    });
  }
};

/**
 * @desc    Delete a package (soft delete by default)
 * @route   DELETE /api/packages/:id
 * @access  Private (Admin)
 */
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    const pkg = await Package.findById(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    if (hardDelete === 'true') {
      // Hard delete - remove from database
      const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
      
      // Delete images from Cloudinary
      if (pkg.image) {
        const publicId = getPublicIdFromUrl(pkg.image);
        if (publicId) {
          try {
            await deleteImage(publicId);
          } catch (e) {
            console.warn('Could not delete main image:', e.message);
          }
        }
      }
      
      // Delete gallery images
      if (pkg.images && pkg.images.length > 0) {
        for (const imageUrl of pkg.images) {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            try {
              await deleteImage(publicId);
            } catch (e) {
              console.warn('Could not delete gallery image:', e.message);
            }
          }
        }
      }

      await Package.findByIdAndDelete(id);
      
      res.json({
        success: true,
        message: 'Package permanently deleted',
      });
    } else {
      // Soft delete - set isActive to false
      pkg.isActive = false;
      await pkg.save();

      res.json({
        success: true,
        message: 'Package deactivated successfully',
      });
    }
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete package',
    });
  }
};

/**
 * @desc    Get pending packages for SuperAdmin approval
 * @route   GET /api/packages/admin/pending
 * @access  Private (SuperAdmin)
 */
const getPendingPackages = async (req, res) => {
  try {
    const packages = await Package.find({ approvalStatus: 'pending' })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching pending packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending packages',
    });
  }
};

/**
 * @desc    Approve a package
 * @route   PATCH /api/packages/:id/approve
 * @access  Private (SuperAdmin)
 */
const approvePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    pkg.approvalStatus = 'approved';
    await pkg.save();

    res.json({
      success: true,
      message: 'Package approved successfully',
      package: pkg,
    });
  } catch (error) {
    console.error('Error approving package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve package',
    });
  }
};

/**
 * @desc    Reject a package
 * @route   PATCH /api/packages/:id/reject
 * @access  Private (SuperAdmin)
 */
const rejectPackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: 'Package not found',
      });
    }

    pkg.approvalStatus = 'rejected';
    await pkg.save();

    res.json({
      success: true,
      message: 'Package rejected',
      package: pkg,
    });
  } catch (error) {
    console.error('Error rejecting package:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject package',
    });
  }
};

module.exports = {
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
};
