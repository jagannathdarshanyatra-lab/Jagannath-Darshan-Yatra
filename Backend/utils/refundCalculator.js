/**
 * Refund Calculator Utility
 * Implements the cancellation refund policy:
 *   30+ days before trip → 100% refund
 *   15-29 days → 75% refund
 *   7-14 days → 50% refund
 *   < 7 days → 0% refund
 */

/**
 * Calculate refund amount based on days until trip
 * @param {Number} totalPrice - Total booking price
 * @param {Date|String} tripDate - The scheduled trip date
 * @returns {Object} { refundPercentage, refundAmount, daysUntilTrip }
 */
const calculateRefund = (totalPrice, tripDate) => {
  const now = new Date();
  const trip = new Date(tripDate);
  const diffMs = trip.getTime() - now.getTime();
  const daysUntilTrip = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let refundPercentage = 0;

  if (daysUntilTrip >= 20) {
    refundPercentage = 100;
  } else if (daysUntilTrip >= 15) {
    refundPercentage = 85;
  } else if (daysUntilTrip >= 7) {
    refundPercentage = 70;
  } else if (daysUntilTrip >= 2) {
    refundPercentage = 50;
  }
  // < 2 days = 0% refund

  const refundAmount = Math.round(totalPrice * (refundPercentage / 100));

  return {
    refundPercentage,
    refundAmount,
    daysUntilTrip,
  };
};

/**
 * Valid status transitions map
 * Defines which statuses can transition to which other statuses
 */
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancellation_requested', 'cancelled'],
  confirmed: ['completed', 'cancellation_requested', 'cancelled'],
  cancellation_requested: ['cancelled', 'confirmed'], // Admin can approve (→cancelled) or reject (→confirmed)
  cancelled: [], // Terminal state - cannot transition out
  completed: [], // Terminal state - cannot transition out
};

/**
 * Check if a status transition is valid
 * @param {String} currentStatus - Current booking status
 * @param {String} newStatus - Requested new status
 * @returns {Boolean}
 */
const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true; // No change is always valid
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
};

module.exports = {
  calculateRefund,
  isValidTransition,
  VALID_TRANSITIONS,
};
