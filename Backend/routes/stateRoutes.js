const express = require('express');
const router = express.Router();
const { setCache } = require('../middleware/cacheMiddleware');
const {
  getStates,
  getStateBySlug,
  getStateDestinations,
  getStatePackages,
} = require('../controllers/stateController');

// GET /api/states - Get all states
router.get('/', setCache(3600), getStates);

// GET /api/states/:slug - Get single state by slug
router.get('/:slug', setCache(3600), getStateBySlug);

// GET /api/states/:slug/destinations - Get destinations within a state
router.get('/:slug/destinations', setCache(3600), getStateDestinations);

// GET /api/states/:slug/packages - Get packages within a state
router.get('/:slug/packages', setCache(3600), getStatePackages);

module.exports = router;
