const Hotel = require('../models/Hotel');

// @desc    Get all hotels (with optional filters)
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res) => {
  try {
    const { destination, packageType } = req.query;
    let query = { isActive: true };

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (packageType) {
      query.packageType = packageType;
    }

    // 1. Fetch from Local DB (Manual setup from Admin Panel)
    const localHotels = await Hotel.find(query).sort({ createdAt: -1 });

    // 2. Fetch from OTA API if link is provided
    let otaHotels = [];
    if (process.env.OTA_API_LINK) {
      try {
        const otaUrl = new URL(process.env.OTA_API_LINK);
        // Pass filters to OTA API if supported, otherwise filter locally
        if (destination) otaUrl.searchParams.append('city', destination);
        
        const response = await fetch(otaUrl.toString(), {
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const rawOtaData = await response.json();
          
          // Map OTA data to our Hotel schema format
          // Note: Specific mapping depends on the client's API structure
          const mappedHotels = (Array.isArray(rawOtaData) ? rawOtaData : [rawOtaData]).map(item => ({
            _id: `ota_${item.id || Math.random().toString(36).substr(2, 9)}`,
            name: item.name || item.hotel_name,
            destination: item.city || item.destination || destination || 'Puri',
            location: item.address || item.location || 'See OTA Details',
            packageType: item.tier ? [item.tier] : (packageType ? [packageType] : ['Standard']),
            images: item.photos || item.images || [],
            amenities: item.facilities || item.amenities || [],
            description: item.summary || item.description || '',
            rating: item.star_rating || item.rating || 4,
            isActive: true,
            isOTA: true // Flag to distinguish OTA hotels if needed
          }));

          // Filter by packageType (tier) if the API didn't do it
          otaHotels = mappedHotels.filter(hotel => 
            !packageType || hotel.packageType.includes(packageType)
          );
        }
      } catch (otaError) {
        console.error('OTA API Fetch Error:', otaError.message);
        // Silent fail for OTA - we still want to return local hotels
      }
    }

    // Combine both results
    const allHotels = [...localHotels, ...otaHotels];
    
    res.json(allHotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const { 
      name, 
      destination, 
      location, 
      packageType, 
      images, 
      amenities, 
      description, 
      rating,
      otaApiLink 
    } = req.body;

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
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Admin (Protected)
const updateHotel = async (req, res) => {
  try {
    const { 
      name, 
      destination, 
      location, 
      packageType, 
      images, 
      amenities, 
      description, 
      rating, 
      isActive,
      otaApiLink 
    } = req.body;

    const hotel = await Hotel.findById(req.params.id);

    if (hotel) {
      hotel.name = name || hotel.name;
      hotel.destination = destination || hotel.destination;
      hotel.location = location || hotel.location;
      hotel.packageType = packageType || hotel.packageType;
      hotel.images = images || hotel.images;
      hotel.amenities = amenities || hotel.amenities;
      hotel.description = description || hotel.description;
      hotel.rating = rating !== undefined ? rating : hotel.rating;
      hotel.isActive = isActive !== undefined ? isActive : hotel.isActive;
      hotel.otaApiLink = otaApiLink !== undefined ? otaApiLink : hotel.otaApiLink;

      const updatedHotel = await hotel.save();
      res.json(updatedHotel);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (error) {
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

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
