const State = require('../models/State');

/**
 * @desc    Get all states
 * @route   GET /api/states
 * @access  Public
 */
const getStates = async (req, res) => {
  try {
    const { includeComingSoon } = req.query;
    
    const query = { isActive: true };
    
    // By default, include coming soon states
    // If explicitly set to false, exclude them
    if (includeComingSoon === 'false') {
      query.isComingSoon = false;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await State.countDocuments(query);
    const states = await State.find(query)
      .sort({ isComingSoon: 1, order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      count: states.length,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      states,
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch states',
    });
  }
};

/**
 * @desc    Get single state by slug
 * @route   GET /api/states/:slug
 * @access  Public
 */
const getStateBySlug = async (req, res) => {
  try {
    const state = await State.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select('-__v');

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found',
      });
    }

    res.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state',
    });
  }
};

/**
 * @desc    Get destinations within a state
 * @route   GET /api/states/:slug/destinations
 * @access  Public
 */
const getStateDestinations = async (req, res) => {
  try {
    const Destination = require('../models/Destination');
    
    const state = await State.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found',
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Destination.countDocuments({
      stateName: state.name,
      isActive: true,
    });
    const destinations = await Destination.find({
      stateName: state.name,
      isActive: true,
    })
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      state: state.name,
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
    console.error('Error fetching state destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations',
    });
  }
};

/**
 * @desc    Get packages within a state
 * @route   GET /api/states/:slug/packages
 * @access  Public
 */
const getStatePackages = async (req, res) => {
  try {
    const Package = require('../models/Package');
    
    const state = await State.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'State not found',
      });
    }
    const { destination, type } = req.query;
    const query = {
      stateName: state.name,
      isActive: true,
    };
    if (destination) {
      query.primaryDestination = new RegExp(destination, 'i');
    }
    if (type) {
      query.type = type;
    }

    const pageNum = Number(req.query.page) || 1;
    const limitNum = Number(req.query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Package.countDocuments(query);
    const packages = await Package.find(query)
      .sort({ primaryDestination: 1, type: 1, price: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    res.json({
      success: true,
      state: state.name,
      count: packages.length,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
      packages,
    });
  } catch (error) {
    console.error('Error fetching state packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
    });
  }
};

module.exports = {
  getStates,
  getStateBySlug,
  getStateDestinations,
  getStatePackages,
};
