const express = require('express');
const router = express.Router();
const {
  handleBookingConfirmation,
  handleBookingCancellation,
  handleWebhookHealth,
} = require('../controllers/otaWebhookController');
const { verifyOtaWebhook } = require('../middleware/otaWebhookAuth');

// Health check — no auth required (for OTA provider to test connectivity)
router.get('/health', handleWebhookHealth);

// Booking confirmation — protected by OTA webhook auth
router.post('/booking', verifyOtaWebhook, handleBookingConfirmation);

// Cancellation notification — protected by OTA webhook auth
router.post('/cancellation', verifyOtaWebhook, handleBookingCancellation);

module.exports = router;
