const Booking = require('../models/Booking');
const otaResponseNormalizer = require('../utils/otaResponseNormalizer');

/**
 * @desc    Receive and persist a booking confirmation from OTA provider
 * @route   POST /api/ota/webhook/booking
 * @access  OTA Provider (protected by webhook auth middleware)
 */
const handleBookingConfirmation = async (req, res) => {
  try {
    const rawPayload = req.body;

    console.log('[OTA Webhook] Incoming booking confirmation:', JSON.stringify(rawPayload, null, 2));

    // 1. Normalize OTA payload → our Booking schema
    const normalizedData = otaResponseNormalizer.normalizeBooking(rawPayload);

    if (!normalizedData) {
      console.error('[OTA Webhook] Failed to normalize booking payload');
      return res.status(400).json({
        success: false,
        error: 'Invalid booking payload: could not normalize data',
      });
    }

    // 2. Idempotency check - prevent duplicate bookings
    if (normalizedData.otaBookingId) {
      const existingBooking = await Booking.findOne({ otaBookingId: normalizedData.otaBookingId });
      if (existingBooking) {
        console.log(`[OTA Webhook] Duplicate booking detected: ${normalizedData.otaBookingId} - returning existing`);
        return res.status(200).json({
          success: true,
          message: 'Booking already exists (idempotent)',
          booking: existingBooking,
        });
      }
    }

    // 3. Store the raw payload for debugging
    normalizedData.otaRawPayload = rawPayload;

    // 4. Save to database
    const booking = await Booking.create(normalizedData);

    console.log(`[OTA Webhook] Booking saved successfully: ${booking._id} (OTA Ref: ${normalizedData.otaBookingId})`);

    res.status(201).json({
      success: true,
      message: 'Booking confirmation received and saved',
      booking,
    });
  } catch (error) {
    console.error('[OTA Webhook] Error processing booking confirmation:', error);

    // Log the raw payload so devs can manually investigate
    console.error('[OTA Webhook] Raw payload was:', JSON.stringify(req.body, null, 2));

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process booking confirmation',
    });
  }
};

/**
 * @desc    Receive a booking cancellation notification from OTA provider
 * @route   POST /api/ota/webhook/cancellation
 * @access  OTA Provider (protected by webhook auth middleware)
 */
const handleBookingCancellation = async (req, res) => {
  try {
    const rawPayload = req.body;

    console.log('[OTA Webhook] Incoming cancellation notification:', JSON.stringify(rawPayload, null, 2));

    // Extract the OTA booking ID from common field names
    const otaBookingId = rawPayload.booking_id || rawPayload.bookingId || rawPayload.reservation_id || rawPayload.id;

    if (!otaBookingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking identifier in cancellation payload',
      });
    }

    // Find the matching booking in our DB
    const booking = await Booking.findOne({ otaBookingId: String(otaBookingId) });

    if (!booking) {
      console.warn(`[OTA Webhook] Cancellation for unknown OTA booking: ${otaBookingId}`);
      return res.status(404).json({
        success: false,
        error: `No booking found with OTA reference: ${otaBookingId}`,
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = 'admin'; // OTA-initiated cancellations treated as admin-side
    booking.cancellationReason = rawPayload.cancellation_reason || rawPayload.reason || 'Cancelled via OTA provider';
    booking.adminNotes = `Cancelled by OTA provider. Raw data: ${JSON.stringify(rawPayload)}`;

    const updatedBooking = await booking.save();

    console.log(`[OTA Webhook] Booking ${booking._id} cancelled via OTA (Ref: ${otaBookingId})`);

    res.status(200).json({
      success: true,
      message: 'Cancellation processed successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('[OTA Webhook] Error processing cancellation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process cancellation',
    });
  }
};

/**
 * @desc    Health check endpoint for OTA provider to verify connectivity
 * @route   GET /api/ota/webhook/health
 * @access  Public (no auth needed)
 */
const handleWebhookHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bharat Darshan OTA Webhook is active',
    timestamp: new Date().toISOString(),
    endpoints: {
      booking: 'POST /api/ota/webhook/booking',
      cancellation: 'POST /api/ota/webhook/cancellation',
      health: 'GET /api/ota/webhook/health',
    },
  });
};

module.exports = {
  handleBookingConfirmation,
  handleBookingCancellation,
  handleWebhookHealth,
};
