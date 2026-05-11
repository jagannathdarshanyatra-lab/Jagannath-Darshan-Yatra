const express = require('express');
const router = express.Router();
const { getDashboardStats, getNotifications, markNotificationAsRead, trackVisit } = require('../controllers/dashboardController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

// Public route for tracking visits
router.post('/track-visit', trackVisit);

// Admin protected routes
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/notifications', protectAdmin, getNotifications);
router.put('/notifications/:id/read', protectAdmin, markNotificationAsRead);

module.exports = router;

