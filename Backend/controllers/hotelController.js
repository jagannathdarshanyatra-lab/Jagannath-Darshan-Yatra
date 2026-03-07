const Hotel = require('../models/Hotel');
const otaProvider = require('../utils/otaProviders/otaProvider');

// @desc    Get all hotels (with optional filters)
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res) => {
  try {
    const { destination, packageType } = req.query;
    let query = { isActive: true, approvalStatus: 'approved' };

    if (destination) {
      // Search in both destination and location fields for maximum flexibility
      // This handles cases where a hotel is tagged with a city name in location but state name in destination
      query.$or = [
        { destination: { $regex: destination, $options: 'i' } },
        { location: { $regex: destination, $options: 'i' } }
      ];
    }

    if (packageType) {
      // Direct regex match for array fields in Mongoose finds any element in the array that matches
      // This is more robust than $in with nested regexes
      query.packageType = new RegExp(`^${packageType}$`, 'i');
    }

    // 1. Fetch from Local DB
    const localHotels = await Hotel.find(query).sort({ createdAt: -1 });

    // 2. Fetch from OTA API
    let otaHotels = [];
    if (process.env.OTA_CLIENT_ID) {
      otaHotels = await otaProvider.getHotels({ destination, packageType });
    }

    const allHotels = [...localHotels, ...otaHotels];
    
    res.json(allHotels);
  } catch (error) {
    console.error('getHotels Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching hotels' 
    });
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (hotel) {
      res.json(hotel);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Admin (Protected)
const createHotel = async (req, res) => {
  try {
    const { processUploadedFiles } = require('../utils/imageUpload');
    
    // Parse body fields if sent as FormData
    const name = req.body.name;
    const destination = req.body.destination;
    const location = req.body.location;
    const packageType = Array.isArray(req.body.packageType) ? req.body.packageType : 
                      (typeof req.body.packageType === 'string' ? req.body.packageType.split(',') : req.body.packageType);
    const amenities = Array.isArray(req.body.amenities) ? req.body.amenities :
                     (typeof req.body.amenities === 'string' ? req.body.amenities.split(',').map(a => a.trim()) : []);
    const description = req.body.description;
    const rating = Number(req.body.rating) || 0;
    const otaApiLink = req.body.otaApiLink;

    // Process uploaded images
    const uploadedFiles = await processUploadedFiles(req.files || {}, {
      images: 'hotels',
    });

    const images = Array.isArray(uploadedFiles.images) ? uploadedFiles.images : (uploadedFiles.images ? [uploadedFiles.images] : []);

    const hotel = new Hotel({
      name,
      destination,
      location,
      packageType,
      images,
      amenities,
      description,
      rating,
      otaApiLink,
      approvalStatus: req.admin && req.admin.role === 'superadmin' ? 'approved' : 'pending',
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    console.error('createHotel Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Admin (Protected)
const updateHotel = async (req, res) => {
  try {
    const { processUploadedFiles } = require('../utils/imageUpload');
    
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Process new uploaded images
    const uploadedFiles = await processUploadedFiles(req.files || {}, {
      images: 'hotels',
    });

    // Handle images: combine existing (non-deleted) with new uploads
    let finalImages = [];
    
    // If we have existing images passed back as a JSON string or array
    if (req.body.existingImages) {
      finalImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : 
                   (typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : []);
    } else {
      // Fallback: if no existingImages field, maybe they didn't change the gallery?
      // But usually in FormData we explicitly send what's kept.
      // Let's assume if it's missing, we keep existing ones that aren't replaced.
      // However, the standard way with our frontend change will be to send existingImages.
    }

    // Add new uploads
    if (uploadedFiles.images) {
      const newImages = Array.isArray(uploadedFiles.images) ? uploadedFiles.images : [uploadedFiles.images];
      finalImages = [...finalImages, ...newImages];
    }

    // If finalImages is empty and no new uploads, keep current if not explicitly cleared
    if (finalImages.length === 0 && !req.body.existingImages && (!req.files || !req.files.images)) {
      finalImages = hotel.images;
    }

    hotel.name = req.body.name || hotel.name;
    hotel.destination = req.body.destination || hotel.destination;
    hotel.location = req.body.location || hotel.location;
    
    if (req.body.packageType) {
      hotel.packageType = Array.isArray(req.body.packageType) ? req.body.packageType : req.body.packageType.split(',');
    }
    
    hotel.images = finalImages;
    
    if (req.body.amenities) {
      hotel.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : req.body.amenities.split(',').map(a => a.trim());
    }
    
    hotel.description = req.body.description !== undefined ? req.body.description : hotel.description;
    hotel.rating = req.body.rating !== undefined ? Number(req.body.rating) : hotel.rating;
    hotel.isActive = req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : hotel.isActive;
    hotel.otaApiLink = req.body.otaApiLink !== undefined ? req.body.otaApiLink : hotel.otaApiLink;

    const updatedHotel = await hotel.save();
    res.json(updatedHotel);
  } catch (error) {
    console.error('updateHotel Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Admin (Protected)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      await hotel.deleteOne();
      res.json({ message: 'Hotel removed' });
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all hotels for admin (including inactive, all approval statuses)
// @route   GET /api/hotels/admin/all
// @access  Admin (Protected)
const getAllHotelsAdmin = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error('getAllHotelsAdmin Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hotels',
    });
  }
};

// @desc    Get pending hotels for SuperAdmin approval
// @route   GET /api/hotels/admin/pending
// @access  Private (SuperAdmin)
const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ approvalStatus: 'pending' })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    console.error('Error fetching pending hotels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending hotels',
    });
  }
};

// @desc    Approve a hotel
// @route   PATCH /api/hotels/:id/approve
// @access  Private (SuperAdmin)
const approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found',
      });
    }

    hotel.approvalStatus = 'approved';
    await hotel.save();

    res.json({
      success: true,
      message: 'Hotel approved successfully',
      hotel,
    });
  } catch (error) {
    console.error('Error approving hotel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve hotel',
    });
  }
};

// @desc    Reject a hotel
// @route   PATCH /api/hotels/:id/reject
// @access  Private (SuperAdmin)
const rejectHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found',
      });
    }

    hotel.approvalStatus = 'rejected';
    await hotel.save();

    res.json({
      success: true,
      message: 'Hotel rejected',
      hotel,
    });
  } catch (error) {
    console.error('Error rejecting hotel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject hotel',
    });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getAllHotelsAdmin,
  getPendingHotels,
  approveHotel,
  rejectHotel,
};
