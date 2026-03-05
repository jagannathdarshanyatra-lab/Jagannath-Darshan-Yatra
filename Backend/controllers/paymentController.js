const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { sendBookingConfirmationEmail } = require('../utils/mailHelper');

// Initialize Razorpay only if credentials are available
// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (err) {
    console.error('❌ Razorpay initialization failed:', err.message);
  }
} else {
  console.log('⚠️  Razorpay not initialized - set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
}

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Protected
 */
const createOrder = async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: 'Payment gateway not configured. Please set up Razorpay credentials.',
        demo: true,
      });
    }

    const { amount, bookingId, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
      });
    }

    // Amount should be in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `booking_${bookingId || Date.now()}`,
      notes: {
        bookingId: bookingId || '',
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    // If bookingId provided, update booking with order ID
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        orderId: order.id,
      });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order',
    });
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Protected
 */
const verifyPayment = async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        error: 'Payment gateway not configured. Please set up Razorpay credentials.',
        demo: true,
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment details',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed - Invalid signature',
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update booking with payment details
    if (bookingId) {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentId: razorpay_payment_id,
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentMethod: payment.method || 'razorpay',
          paymentDetails: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            method: payment.method,
            bank: payment.bank,
            wallet: payment.wallet,
            vpa: payment.vpa,
            email: payment.email,
            contact: payment.contact,
            fee: payment.fee,
            tax: payment.tax,
            captured: payment.captured,
            created_at: payment.created_at,
          },
        },
        { new: true }
      );

      // Fire-and-forget booking confirmation email
      sendBookingConfirmationEmail(booking).catch(err => 
        console.error('[Email] Background error:', err.message)
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        booking,
      });
    } else {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          method: payment.method,
        },
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed',
    });
  }
};

/**
 * @desc    Get payment status for a booking
 * @route   GET /api/payments/:bookingId
 * @access  Protected
 */
const getPaymentStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    res.json({
      success: true,
      payment: {
        status: booking.paymentStatus,
        paymentId: booking.paymentId,
        orderId: booking.orderId,
        method: booking.paymentMethod,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status',
    });
  }
};

/**
 * @desc    Process refund via Razorpay for a cancelled booking
 * @route   POST /api/bookings/:id/process-refund
 * @access  Private/Admin
 */
const processRefund = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Only cancelled bookings can be refunded
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Only cancelled bookings can be refunded',
      });
    }

    // Check if already refunded
    if (booking.refundStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Refund has already been processed for this booking',
      });
    }

    // Check if there's an amount to refund
    if (!booking.refundAmount || booking.refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No refund amount to process (refund amount is 0)',
      });
    }

    // Check if payment was made
    if (!booking.paymentId) {
      // No payment was made - just mark as completed
      booking.refundStatus = 'completed';
      booking.refundProcessedAt = new Date();
      await booking.save();
      return res.json({
        success: true,
        message: 'No payment was made for this booking. Refund marked as completed.',
        booking,
      });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      // Razorpay not configured - mark refund as pending for manual processing
      booking.refundStatus = 'pending';
      await booking.save();
      return res.json({
        success: true,
        message: 'Razorpay not configured. Refund marked as pending for manual processing.',
        booking,
      });
    }

    // Process refund via Razorpay
    try {
      booking.refundStatus = 'processing';
      await booking.save();

      const refundAmountInPaise = Math.round(booking.refundAmount * 100);
      const refund = await razorpay.payments.refund(booking.paymentId, {
        amount: refundAmountInPaise,
        notes: {
          bookingId: booking._id.toString(),
          reason: booking.cancellationReason || 'Booking cancelled',
        },
      });

      // Update booking with refund details
      booking.refundId = refund.id;
      booking.refundStatus = 'completed';
      booking.refundProcessedAt = new Date();
      booking.paymentStatus = (booking.refundAmount < booking.totalPrice) ? 'partially_refunded' : 'refunded';
      await booking.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        booking,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      });
    } catch (razorpayError) {
      // Refund failed - update status
      booking.refundStatus = 'failed';
      await booking.save();
      
      console.error('Razorpay refund error:', razorpayError);
      return res.status(500).json({
        success: false,
        error: `Razorpay refund failed: ${razorpayError.message}`,
        booking,
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, error: 'Failed to process refund' });
  }
};

/**
 * @desc    Get Razorpay key for frontend
 * @route   GET /api/payments/key
 * @access  Public
 */
const getRazorpayKey = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getRazorpayKey,
  processRefund,
};

