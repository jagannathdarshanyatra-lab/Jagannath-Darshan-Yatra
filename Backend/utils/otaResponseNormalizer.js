/**
 * OTA Response Normalizer
 * Ensuring that third-party data maps predictably to our internal schema.
 */
class OTAResponseNormalizer {
  /**
   * Normalize items to match local Hotel schema
   */
  normalizeHotels(rawData) {
    if (!rawData) return [];
    
    // Supporting both single object and array responses
    const items = Array.isArray(rawData) ? rawData : (rawData.hotels || [rawData]);
    
    return items.map(item => ({
      _id: `ota_${item.id || Math.random().toString(36).substr(2, 9)}`,
      name: item.name || item.hotel_name || 'Generic Hotel',
      destination: item.city || item.destination || 'Unspecified',
      location: item.address || item.location || '',
      packageType: this._normalizeTier(item.tier, item.package_type),
      images: item.photos || item.images || [],
      amenities: item.facilities || item.amenities || [],
      description: item.summary || item.description || '',
      rating: parseFloat(item.star_rating || item.rating || 0),
      isActive: true,
      isOTA: true,
      otaApiLink: item.booking_url || item.url || ''
    }));
  }

  /**
   * Normalize an OTA booking payload to match local Booking schema.
   * Handles various field naming conventions from different OTA providers.
   * @param {Object} rawData - Raw booking payload from OTA webhook
   * @returns {Object|null} Normalized booking data, or null if critical fields are missing
   */
  normalizeBooking(rawData) {
    if (!rawData) return null;

    // Extract fields with fallbacks for different OTA naming conventions
    const packageName = rawData.package_name || rawData.packageName || rawData.room_type || rawData.roomType || 'OTA Booking';
    const destination = rawData.destination || rawData.city || rawData.hotel_city || rawData.location || 'Via OTA';
    const totalPrice = parseFloat(rawData.total_amount || rawData.totalAmount || rawData.amount || rawData.price || 0);
    const tripDate = rawData.check_in_date || rawData.checkInDate || rawData.travel_date || rawData.travelDate || rawData.arrival_date;

    // Validate minimum required fields
    if (!totalPrice && !tripDate) {
      console.warn('[OTA Normalizer] Missing critical fields: totalPrice and tripDate');
      return null;
    }

    return {
      // Core booking fields
      packageId: rawData.package_id || rawData.packageId || rawData.room_type_id || `ota_${rawData.booking_id || rawData.bookingId || Date.now()}`,
      packageName,
      packageImage: rawData.package_image || rawData.packageImage || rawData.hotel_image || rawData.image || '',
      destination,
      travelers: parseInt(rawData.guests || rawData.travelers || rawData.guest_count || rawData.pax || 1),
      tripDate: new Date(tripDate || Date.now()),
      totalPrice,

      // Contact details
      contactName: rawData.guest_name || rawData.guestName || rawData.customer_name || rawData.name || 'OTA Guest',
      contactEmail: rawData.guest_email || rawData.guestEmail || rawData.customer_email || rawData.email || '',
      contactPhone: rawData.guest_phone || rawData.guestPhone || rawData.customer_phone || rawData.phone || rawData.mobile || '',
      specialRequests: rawData.special_requests || rawData.specialRequests || rawData.remarks || rawData.notes || '',

      // Status mapping
      status: this._normalizeBookingStatus(rawData.booking_status || rawData.bookingStatus || rawData.status),
      paymentStatus: this._normalizePaymentStatus(rawData.payment_status || rawData.paymentStatus),
      paymentMethod: rawData.payment_method || rawData.paymentMethod || null,
      paymentId: rawData.payment_id || rawData.paymentId || rawData.transaction_id || null,

      // Hotel details  
      selectedHotels: rawData.hotel_name ? [{
        city: destination,
        hotelId: rawData.hotel_id || rawData.hotelId || `ota_hotel_${Date.now()}`,
        hotelName: rawData.hotel_name || rawData.hotelName || 'OTA Hotel',
      }] : [],

      // OTA tracking fields
      source: 'ota',
      otaBookingId: String(rawData.booking_id || rawData.bookingId || rawData.reservation_id || rawData.id || ''),
      otaProvider: rawData.provider || rawData.ota_name || rawData.source || 'bookingjini',
    };
  }

  /**
   * Map OTA booking status to our internal status enum
   */
  _normalizeBookingStatus(status) {
    if (!status) return 'pending';
    const statusMap = {
      'confirmed': 'confirmed',
      'approve': 'confirmed',
      'approved': 'confirmed',
      'booked': 'confirmed',
      'pending': 'pending',
      'new': 'pending',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'completed': 'completed',
      'checked_out': 'completed',
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  /**
   * Map OTA payment status to our internal payment status enum
   */
  _normalizePaymentStatus(status) {
    if (!status) return 'pending';
    const statusMap = {
      'paid': 'paid',
      'completed': 'paid',
      'success': 'paid',
      'partial': 'partial',
      'partially_paid': 'partial',
      'pending': 'pending',
      'unpaid': 'pending',
      'refunded': 'refunded',
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  _normalizeTier(tier, altTier) {
    const val = tier || altTier || 'Standard';
    return Array.isArray(val) ? val : [val];
  }

  /**
   * Create standardized error response as requested by Bookingjini
   */
  createErrorResponse(message, code = 500, details = null) {
    return {
      success: false,
      error: {
        message,
        code: this._mapErrorCode(code),
        details: details || {}
      },
      timestamp: new Date().toISOString()
    };
  }

  _mapErrorCode(status) {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR'
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}

module.exports = new OTAResponseNormalizer();
