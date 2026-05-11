/**
 * Package API Service
 * Handles all package, destination, and booking related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In-memory cache for packages
const cache = {
  packages: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all destinations
 */
export const fetchDestinations = async () => {
  const response = await fetch(`${API_URL}/api/destinations`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch destinations');
  }
  return data.destinations;
};

/**
 * Fetch destination by slug
 */
export const fetchDestinationBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/api/destinations/${slug}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch destination');
  }
  return data.destination;
};

/**
 * Fetch all packages with optional filters
 * @param {Object} filters - Optional filters { destination, type, minPrice, maxPrice, sort, limit }
 */
export const fetchPackages = async (filters = {}) => {
  // Use cache if no filters are applied and cache is valid
  const hasFilters = Object.keys(filters).length > 0;
  if (!hasFilters && cache.packages && (Date.now() - cache.timestamp < CACHE_DURATION)) {
    return cache.packages;
  }

  const params = new URLSearchParams();
  
  if (filters.destination) params.append('destination', filters.destination);
  if (filters.type) params.append('type', filters.type);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.limit) params.append('limit', filters.limit);
  
  const queryString = params.toString();
  const url = `${API_URL}/api/packages${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch packages');
  }

  // Update cache if no filters were applied
  if (!hasFilters) {
    cache.packages = data.packages;
    cache.timestamp = Date.now();
  }

  return data.packages;
};

/**
 * Fetch package by ID (supports both MongoDB ObjectId and legacy numeric ID)
 */
export const fetchPackageById = async (id) => {
  const response = await fetch(`${API_URL}/api/packages/${id}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch package');
  }
  return data.package;
};

/**
 * Fetch package by slug
 */
export const fetchPackageBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/api/packages/slug/${slug}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch package');
  }
  return data.package;
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData, token) => {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to create booking');
  }
  return data.booking;
};

/**
 * Create a Razorpay order
 */
export const createPaymentOrder = async (amount, bookingId, token) => {
  const response = await fetch(`${API_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, bookingId }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to create payment order');
  }
  return data;
};

/**
 * Verify Razorpay payment
 */
export const verifyPayment = async (paymentData, token) => {
  const response = await fetch(`${API_URL}/api/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Payment verification failed');
  }
  return data;
};

/**
 * Get Razorpay public key
 */
export const getRazorpayKey = async () => {
  const response = await fetch(`${API_URL}/api/payments/key`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to get payment key');
  }
  return data.key;
};

/**
 * Get refund preview for a booking (no side effects)
 */
export const getRefundPreview = async (bookingId, token) => {
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}/refund-preview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to get refund preview');
  }
  return data.refundPreview;
};

/**
 * Request cancellation for a booking
 */
export const requestCancellation = async (bookingId, reason, token) => {
  const response = await fetch(`${API_URL}/api/bookings/${bookingId}/request-cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to submit cancellation request');
  }
  return data;
};

