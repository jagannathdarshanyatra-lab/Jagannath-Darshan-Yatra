const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    // Legacy ID for backward compatibility with frontend
    legacyId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    primaryDestination: {
      type: String,
      required: [true, 'Primary destination is required'],
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },
    stateName: {
      type: String,
      default: 'Odisha',
    },
    type: {
      type: String,
      enum: ['Lite', 'Standard', 'Elite', 'Pro', 'Premium'],
      required: [true, 'Package type is required'],
    },
    variant: {
      type: String,
      enum: ['lite', 'standard', 'elite', 'pro', 'premium'],
      lowercase: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    groupSize: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed, // Can be Number or String (e.g., "Contact for pricing")
      required: [true, 'Price is required'],
    },
    originalPrice: {
      type: mongoose.Schema.Types.Mixed, // Can be Number or String
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Main image is required'],
    },
    // Location image - represents the destination (Puri, Bhubaneswar)
    // Also used in "About" section on destination page
    locationImage: {
      type: String,
    },
    // Hero images for destination page banner carousel (max 3)
    heroImages: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
    locations: [{
      type: String,
    }],
    highlights: [{
      type: String,
    }],
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    facilities: [{
      type: String,
    }],
    itinerary: [{
      day: {
        type: Number,
      },
      title: {
        type: String,
      },
      activities: [{
        type: String,
      }],
    }],
    included: [{
      type: String,
    }],
    excluded: [{
      type: String,
    }],
    hotelDetails: [{
      city: { type: String },
      hotel: { type: String },
      nights: { type: Number },
      roomType: { type: String },
    }],
    foodPlan: {
      type: String,
      default: '',
    },
    pickupDrop: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
packageSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    const baseSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Add timestamp suffix to ensure uniqueness
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  // Set variant from type
  if (this.isModified('type')) {
    this.variant = this.type.toLowerCase();
  }
  next();
});

// Indexes for faster queries (slug and legacyId already indexed via unique: true)
packageSchema.index({ destination: 1 });
packageSchema.index({ primaryDestination: 1 });
packageSchema.index({ type: 1 });
packageSchema.index({ isActive: 1 });
packageSchema.index({ approvalStatus: 1 });
packageSchema.index({ price: 1 });

module.exports = mongoose.model('Package', packageSchema);
