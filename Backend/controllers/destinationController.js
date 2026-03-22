const Destination = require('../models/Destination');
const Package = require('../models/Package');
const { uploadSingleImage } = require('../utils/imageUpload');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

/**
 * @desc    Get all active destinations
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Destination.countDocuments({ isActive: true });
    const destinations = await Destination.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      count: destinations.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      destinations,
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations',
    });
  }
};

/**
 * @desc    Get all destinations for admin (including inactive)
 * @route   GET /api/destinations/admin/all
 * @access  Private/Admin
 */
const getAllDestinationsAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Destination.countDocuments();
    const destinations = await Destination.find()
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      count: destinations.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      destinations,
    });
  } catch (error) {
    console.error('Error fetching destinations for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations',
    });
  }
};

/**
 * @desc    Get destination by slug
 * @route   GET /api/destinations/:slug
 * @access  Public
 */
const getDestinationBySlug = async (req, res) => {
  try {
    const destination = await Destination.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select('-__v');

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found',
      });
    }

    res.json({
      success: true,
      destination,
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destination',
    });
  }
};

/**
 * @desc    Get destination by ID
 * @route   GET /api/destinations/id/:id
 * @access  Public
 */
const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id).select('-__v');

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found',
      });
    }

    res.json({
      success: true,
      destination,
    });
  } catch (error) {
    console.error('Error fetching destination by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destination',
    });
  }
};

/**
 * @desc    Get packages by destination slug
 * @route   GET /api/destinations/:slug/packages
 * @access  Public
 */
const getPackagesByDestination = async (req, res) => {
  try {
    const destination = await Destination.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found',
      });
    }

    const packages = await Package.find({
      primaryDestination: destination.name,
      isActive: true,
    })
      .sort({ type: 1, price: 1 })
      .select('-__v');

    res.json({
      success: true,
      destination: destination.name,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages by destination:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
    });
  }
};

/**
 * @desc    Create a new destination
 * @route   POST /api/destinations
 * @access  Private/Admin
 */
const createDestination = async (req, res) => {
  try {
    const {
      name,
      description,
      tags,
      tagline,
      location,
      bestTime,
      mustVisit,
      travelTips,
      isActive,
      order,
      stateName,
    } = req.body;

    // Check if destination with same name exists
    const existingDestination = await Destination.findOne({ name });
    if (existingDestination) {
      return res.status(400).json({
        success: false,
        error: 'Destination with this name already exists',
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Upload hero image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadSingleImage(req.file, 'destinations');
    } else if (req.body.image) {
      // If image URL is provided directly (for existing images)
      imageUrl = req.body.image;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Destination image is required',
      });
    }

    // Parse array fields if they're strings
    const parseTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    const parseMustVisit = mustVisit
      ? typeof mustVisit === 'string'
        ? mustVisit.split(',').map((item) => item.trim()).filter(Boolean)
        : mustVisit
      : [];
    const parseTravelTips = travelTips
      ? typeof travelTips === 'string'
        ? travelTips.split(',').map((item) => item.trim()).filter(Boolean)
        : travelTips
      : [];

    const destination = await Destination.create({
      name,
      slug,
      image: imageUrl,
      description: description || '',
      tags: parseTags,
      tagline: tagline || '',
      location: location || '',
      bestTime: bestTime || '',
      mustVisit: parseMustVisit,
      travelTips: parseTravelTips,
      isActive: isActive === 'true' || isActive === true,
      order: parseInt(order) || 0,
      stateName: stateName || 'Odisha',
    });

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      destination,
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create destination',
    });
  }
};

/**
 * @desc    Update a destination
 * @route   PUT /api/destinations/:id
 * @access  Private/Admin
 */
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      tags,
      tagline,
      location,
      bestTime,
      mustVisit,
      travelTips,
      isActive,
      order,
      stateName,
    } = req.body;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found',
      });
    }

    // If name is being changed, check for duplicates and update slug
    if (name && name !== destination.name) {
      const existingDestination = await Destination.findOne({ name, _id: { $ne: id } });
      if (existingDestination) {
        return res.status(400).json({
          success: false,
          error: 'Destination with this name already exists',
        });
      }
      destination.name = name;
      destination.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (destination.image) {
        const publicId = getPublicIdFromUrl(destination.image);
        if (publicId) {
          await deleteImage(publicId).catch((err) =>
            console.error('Error deleting old image:', err)
          );
        }
      }
      // Upload new image
      destination.image = await uploadSingleImage(req.file, 'destinations');
    } else if (req.body.image) {
      destination.image = req.body.image;
    }

    // Update other fields
    if (description !== undefined) destination.description = description;
    if (tagline !== undefined) destination.tagline = tagline;
    if (location !== undefined) destination.location = location;
    if (bestTime !== undefined) destination.bestTime = bestTime;
    if (stateName !== undefined) destination.stateName = stateName;

    // Parse and update array fields
    if (tags !== undefined) {
      destination.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (mustVisit !== undefined) {
      destination.mustVisit =
        typeof mustVisit === 'string'
          ? mustVisit.split(',').map((item) => item.trim()).filter(Boolean)
          : mustVisit;
    }
    if (travelTips !== undefined) {
      destination.travelTips =
        typeof travelTips === 'string'
          ? travelTips.split(',').map((item) => item.trim()).filter(Boolean)
          : travelTips;
    }

    // Update boolean and number fields
    if (isActive !== undefined) {
      destination.isActive = isActive === 'true' || isActive === true;
    }
    if (order !== undefined) {
      destination.order = parseInt(order) || 0;
    }

    await destination.save();

    res.json({
      success: true,
      message: 'Destination updated successfully',
      destination,
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update destination',
    });
  }
};

/**
 * @desc    Delete a destination
 * @route   DELETE /api/destinations/:id
 * @access  Private/Admin
 */
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found',
      });
    }

    if (hardDelete === 'true') {
      // Delete image from Cloudinary
      if (destination.image) {
        const publicId = getPublicIdFromUrl(destination.image);
        if (publicId) {
          await deleteImage(publicId).catch((err) =>
            console.error('Error deleting image:', err)
          );
        }
      }
      // Permanently delete from database
      await Destination.findByIdAndDelete(id);
      res.json({
        success: true,
        message: 'Destination permanently deleted',
      });
    } else {
      // Soft delete - just set isActive to false
      destination.isActive = false;
      await destination.save();
      res.json({
        success: true,
        message: 'Destination deactivated successfully',
      });
    }
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete destination',
    });
  }
};

module.exports = {
  getDestinations,
  getAllDestinationsAdmin,
  getDestinationBySlug,
  getDestinationById,
  getPackagesByDestination,
  createDestination,
  updateDestination,
  deleteDestination,
};
