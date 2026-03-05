const mongoose = require('mongoose');

// Counter schema for auto-incrementing booking numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Made optional for manual bookings
    },
    contactName: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    packageId: {
      type: String, 
      required: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true, 
    },
    packageImage: {
      type: String,
      required: true,
    },
    travelers: {
      type: Number,
      required: true,
      default: 1,
    },
    totalTravelers: {
      type: Number,
      default: null,
    },
    travellerDetails: [{
      name: { type: String },
      gender: { type: String, enum: ['Male', 'Female', 'Other'] },
      age: { type: Number },
      isChild: { type: Boolean, default: false },
    }],
    bookingDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    tripDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancellation_requested', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    contactPhone: {
        type: String,
    },
    specialRequests: {
      type: String,
    },
    // Payment Gateway Fields
    paymentId: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'card', 'netbanking', 'wallet', 'bank_transfer', 'cash', null],
      default: null,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Pricing Details
    basePrice: {
      type: Number,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    // Hotel Selection
    selectedHotels: [{
      city: { type: String, required: true },
      hotelId: { type: String, required: true },
      hotelName: { type: String, required: true },
    }],
    isReadByAdmin: {
      type: Boolean,
      default: false
    },
    // --- Cancellation & Refund Fields ---
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', null],
      default: null,
    },
    cancellationRequestedAt: {
      type: Date,
      default: null,
    },
    // Refund tracking
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundPercentage: {
      type: Number,
      default: 0,
    },
    refundId: {
      type: String,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    refundProcessedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    // --- OTA Integration Fields ---
    source: {
      type: String,
      enum: ['direct', 'ota'],
      default: 'direct',
    },
    otaBookingId: {
      type: String,
      default: null,
      sparse: true, // Allows multiple nulls but enforces uniqueness for non-null values
    },
    otaProvider: {
      type: String,
      default: null,
    },
    otaRawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for TUR-formatted booking ID
bookingSchema.virtual('bookingId').get(function () {
  if (this.bookingNumber) {
    return `TUR${String(this.bookingNumber).padStart(3, '0')}`;
  }
  return this._id.toString().substring(0, 8);
});

// Auto-increment bookingNumber before saving
bookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingNumber) {
    try {
      const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
      const count = await BookingModel.countDocuments();
      
      if (count === 0) {
        const counter = await Counter.findByIdAndUpdate(
          'bookingNumber',
          { seq: 1 },
          { new: true, upsert: true }
        );
        this.bookingNumber = 1;
      } else {
        const counter = await Counter.findByIdAndUpdate(
          'bookingNumber',
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        this.bookingNumber = counter.seq;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

