const Booking = require('../models/Booking');
const { calculateRefund, isValidTransition } = require('../utils/refundCalculator');

const createBooking = async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      packageImage, 
      travelers,
      totalTravelers,
      travellerDetails,
      tripDate,
      totalPrice,
      destination,
      contactPhone,
      specialRequests,
      selectedHotels,
      // Manual/Admin fields
      contactName,
      contactEmail,
      status,
      paymentStatus,
      paymentMethod,
      paymentId,
    } = req.body;

    if (!packageId || !packageName || !totalPrice || !tripDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required booking details',
      });
    }

    // For admin-created bookings, don't set user field (it's not a valid ObjectId)
    // For regular users, link booking to their account
    const isAdmin = req.user.role === 'admin';
    
    const bookingData = {
      packageId,
      packageName,
      packageImage: packageImage || '',
      travelers,
      totalTravelers: totalTravelers || null,
      travellerDetails: travellerDetails || [],
      tripDate,
      totalPrice,
      destination,
      contactPhone,
      specialRequests,
      selectedHotels: selectedHotels || [],
      contactName: contactName || req.user.name,
      contactEmail: contactEmail || req.user.email,
    };

    // Only set user field for regular users (admin _id is 'admin', not a valid ObjectId)
    if (!isAdmin) {
      bookingData.user = req.user._id;
    }

    // Allow Admin to override defaults
    if (req.user.role === 'admin') {
      if (status) bookingData.status = status;
      if (paymentStatus) bookingData.paymentStatus = paymentStatus;
      if (paymentMethod) bookingData.paymentMethod = paymentMethod;
      if (paymentId) bookingData.paymentId = paymentId;
      
      // If admin provided explicit contact details, prioritize them
      if (contactName) bookingData.contactName = contactName;
      if (contactEmail) bookingData.contactEmail = contactEmail;
    }

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};


const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const count = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email') // Populate user details for admin view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count, // Total count of bookings
      pages: Math.ceil(count / limit),
      page,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};


const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      if (booking.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(401).json({
            success: false,
            error: 'Not authorized to view this booking'
         });
      }

      res.json({
        success: true,
        booking,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Update booking with selected hotels
// @route   PUT /api/bookings/:id/hotels
// @access  Private
const updateBookingHotels = async (req, res) => {
  try {
    const { selectedHotels } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      if (booking.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this booking'
        });
      }

      booking.selectedHotels = selectedHotels;
      const updatedBooking = await booking.save();

      res.json({
        success: true,
        booking: updatedBooking,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Update booking status (Admin only) - with transition validation
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Validate status transition
    if (status && !isValidTransition(booking.status, status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from '${booking.status}' to '${status}'`,
      });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    const updatedBooking = await booking.save();
    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get refund preview for a booking (no side effects)
// @route   GET /api/bookings/:id/refund-preview
// @access  Private
const getRefundPreview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Authorization: owner or admin
    if (booking.user?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Can only preview refund for pending/confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a booking with status '${booking.status}'`,
      });
    }

    const refundInfo = calculateRefund(booking.totalPrice, booking.tripDate);

    res.json({
      success: true,
      refundPreview: {
        ...refundInfo,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        tripDate: booking.tripDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    User requests cancellation (status → cancellation_requested)
// @route   PUT /api/bookings/:id/request-cancel
// @access  Private (booking owner)
const requestCancellation = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Only the booking owner can request cancellation
    if (booking.user?.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to cancel this booking' });
    }

    // Validate transition
    if (!isValidTransition(booking.status, 'cancellation_requested')) {
      return res.status(400).json({
        success: false,
        error: `Cannot request cancellation for a booking with status '${booking.status}'`,
      });
    }

    // Calculate refund preview
    const refundInfo = calculateRefund(booking.totalPrice, booking.tripDate);

    // Update booking
    booking.status = 'cancellation_requested';
    booking.cancellationReason = reason || 'No reason provided';
    booking.cancelledBy = 'user';
    booking.cancellationRequestedAt = new Date();
    booking.refundAmount = refundInfo.refundAmount;
    booking.refundPercentage = refundInfo.refundPercentage;
    booking.isReadByAdmin = false; // Mark as unread so admin notices

    if (booking.paymentStatus === 'paid' && refundInfo.refundAmount > 0) {
      booking.refundStatus = 'pending';
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Cancellation request submitted. Our team will review and process your refund.',
      booking: updatedBooking,
      refundPreview: refundInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Admin approves cancellation (status → cancelled, triggers refund)
// @route   PUT /api/bookings/:id/approve-cancel
// @access  Private/Admin
const approveCancellation = async (req, res) => {
  try {
    const { adminNotes, overrideRefundAmount } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Only cancellation_requested or pending/confirmed (admin direct cancel) allowed
    if (!['cancellation_requested', 'pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel a booking with status '${booking.status}'`,
      });
    }

    // Recalculate refund (or use admin override)
    const refundInfo = calculateRefund(booking.totalPrice, booking.tripDate);
    const finalRefundAmount = (overrideRefundAmount !== undefined && overrideRefundAmount !== null)
      ? Number(overrideRefundAmount)
      : refundInfo.refundAmount;
    const finalRefundPercentage = booking.totalPrice > 0
      ? Math.round((finalRefundAmount / booking.totalPrice) * 100)
      : 0;

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    if (!booking.cancelledBy) booking.cancelledBy = 'admin';
    if (!booking.cancellationReason) booking.cancellationReason = 'Cancelled by admin';
    if (adminNotes) booking.adminNotes = adminNotes;
    booking.refundAmount = finalRefundAmount;
    booking.refundPercentage = finalRefundPercentage;

    // Set refund status based on payment
    if (booking.paymentStatus === 'paid' && finalRefundAmount > 0) {
      booking.refundStatus = 'pending';
      booking.paymentStatus = (finalRefundAmount < booking.totalPrice) ? 'partially_refunded' : 'refunded';
    } else if (finalRefundAmount === 0) {
      booking.refundStatus = 'none';
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Cancellation approved successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Admin rejects cancellation (status → back to confirmed/pending)
// @route   PUT /api/bookings/:id/reject-cancel
// @access  Private/Admin
const rejectCancellation = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status !== 'cancellation_requested') {
      return res.status(400).json({
        success: false,
        error: 'This booking does not have a pending cancellation request',
      });
    }

    // Restore to confirmed (if was previously confirmed/paid) or pending
    booking.status = (booking.paymentStatus === 'paid') ? 'confirmed' : 'pending';
    booking.cancellationReason = null;
    booking.cancelledBy = null;
    booking.cancellationRequestedAt = null;
    booking.refundAmount = 0;
    booking.refundPercentage = 0;
    booking.refundStatus = 'none';
    if (adminNotes) booking.adminNotes = adminNotes;

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Cancellation request rejected. Booking restored.',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Delete booking (soft-archive: only allowed for admins)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    await booking.deleteOne();
    res.json({ success: true, message: 'Booking removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const { generateInvoicePdf, getBookingId } = require('../utils/invoiceGenerator');

// @desc    Download invoice PDF
// @route   GET /api/bookings/:id/invoice
// @access  Public (Secured by ID)
const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf(booking);
    
    // Set response headers for download
    const filename = `Jagannath_Darshan_Invoice_${getBookingId(booking)}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate invoice' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingHotels,
  updateBookingStatus,
  getRefundPreview,
  requestCancellation,
  approveCancellation,
  rejectCancellation,
  deleteBooking,
  downloadInvoice,
};
