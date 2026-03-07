import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Phone, MessageSquare, CreditCard, Shield, Loader2, Check, Info } from 'lucide-react';
import { FaHotel } from 'react-icons/fa';
import { Button } from '@/components/ui/forms';
import { sonnerToast as toast } from '@/components/ui/feedback';
import { createBooking, createPaymentOrder, verifyPayment, getRazorpayKey } from '@/services/packageService';
import GuestRestrictionModal from '@/components/GuestRestrictionModal';

const BookingModal = ({ isOpen, onClose, pkg, user, token, initialTravelers = 2, selectedHotel = null }) => {
  const navigate = useNavigate();
  const [tripDate, setTripDate] = useState('');
  const [travelers, setTravelers] = useState(initialTravelers);
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  // Helper to parse group size - duplicated from PackageDetail to ensure consistency
  const parseMaxGroupSize = (groupSize) => {
    if (!groupSize) return 1;
    const match = groupSize.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (match) return parseInt(match[2], 10);
    const single = groupSize.match(/(\d+)/);
    if (single) return parseInt(single[1], 10);
    return 1;
  };

  const numericPrice = Number(pkg?.price) || 0;
  const numericOriginalPrice = (pkg?.originalPrice && !isNaN(pkg.originalPrice)) ? Number(pkg.originalPrice) : 0;
  const maxIncludedTravelers = parseMaxGroupSize(pkg?.groupSize);

  // No more extra traveler fee
  const calculateTotal = (basePrice) => {
    if (!basePrice) return 0;
    return basePrice;
  };
  
  const totalPrice = calculateTotal(numericPrice);
  const totalOriginalPrice = calculateTotal(numericOriginalPrice);
  const savings = (totalOriginalPrice > totalPrice) ? (totalOriginalPrice - totalPrice) : 0;

  // Get minimum date (7 days from now) - Local time aware
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    if (!tripDate) {
      toast.error('Please select a trip date');
      return;
    }
    if (!contactPhone || contactPhone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!user || !token) {
      toast.info('Please login to book this package');
      onClose();
      navigate('/login', { state: { from: `/packages/${pkg._id || pkg.legacyId}` } });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create booking
      const bookingData = {
        packageId: pkg.legacyId || pkg._id,
        packageName: pkg.name,
        packageImage: pkg.image,
        destination: pkg.primaryDestination,
        travelers,
        tripDate: new Date(tripDate).toISOString(),
        totalPrice,
        contactPhone,
        specialRequests,
        selectedHotels: selectedHotel ? [{
          city: selectedHotel.destination,
          hotelId: selectedHotel._id,
          hotelName: selectedHotel.name
        }] : [],
      };

      const booking = await createBooking(bookingData, token);
      toast.success('Booking created! Proceeding to payment...');

      // Step 2: Create payment order
      try {
        const razorpayKey = await getRazorpayKey();
        
        // Check if Razorpay is properly configured
        if (!razorpayKey) {
          toast.info('Payment gateway is not configured. Booking saved successfully!');
          onClose();
          // Redirect to hotel selection page first
          window.location.href = `/bookings/${booking._id}/select-hotels`;
          return;
        }

        const orderData = await createPaymentOrder(totalPrice, booking._id, token);

        // Step 3: Load Razorpay and process payment
        const options = {
          key: orderData.key,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'Jagannath Darshan Yatra',
          description: `Booking for ${pkg.name}`,
          order_id: orderData.order.id,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id,
              }, token);
              
              toast.success('Payment successful! Your booking is confirmed.');
              onClose();
              // Redirect based on whether hotel was already selected
              if (selectedHotel) {
                window.location.href = `/booking-success?id=${booking._id}`;
              } else {
                window.location.href = `/bookings/${booking._id}/select-hotels`;
              }
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: contactPhone,
          },
          theme: {
            color: '#EA580C',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (paymentError) {
        // Payment gateway not configured - just save booking
        if (paymentError.message.includes('not configured')) {
          toast.info('Booking saved! Our team will contact you for payment.');
          onClose();
        } else {
          throw paymentError;
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const discountPercentage = (totalOriginalPrice > totalPrice && totalOriginalPrice > 0) 
    ? Math.round(((totalOriginalPrice - totalPrice) / totalOriginalPrice) * 100) 
    : 0;

  if (!isOpen || !pkg) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">Book Your Trip</h2>
              <p className="text-sm text-gray-500 mt-1">{pkg.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid md:grid-cols-2">
              {/* Left Column: Info & Trust */}
              <div className="bg-gray-50/50 p-6 sm:p-8 space-y-8 border-r border-gray-100">
                {/* Package Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      pkg.type === 'Elite' ? 'bg-gray-900 text-amber-400' :
                      pkg.type === 'Pro' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {pkg.type} Tier
                    </span>
                    <h3 className="font-serif text-lg font-bold mt-1 text-gray-900">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {pkg.duration}
                    </div>
                  </div>
                </div>

                {/* Selected Hotel info if available */}
                {selectedHotel && (
                  <div className="bg-green-50 rounded-2xl p-5 border border-green-100 flex gap-4">
                     <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FaHotel className="text-green-600 text-xl" />
                     </div>
                     <div>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-1">Accommodation Confirmed</p>
                        <h4 className="font-bold text-gray-900">{selectedHotel.name}</h4>
                        <p className="text-sm text-gray-500">{selectedHotel.destination}</p>
                     </div>
                  </div>
                )}

                {/* What's Included */}
                {pkg.included && pkg.included.length > 0 && (
                  <div>
                    <h4 className="font-serif text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      Package Inclusions
                    </h4>
                    <ul className="grid grid-cols-1 gap-3">
                      {pkg.included.slice(0, 6).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why Book with Us */}
                <div className="bg-orange-600 text-white rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-2xl" />
                  <h4 className="font-serif text-lg font-bold mb-4 relative z-10">Why book with us?</h4>
                  <ul className="space-y-3 relative z-10">
                    <li className="flex items-center gap-3 text-sm text-orange-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                      Instant Booking Confirmation
                    </li>
                    <li className="flex items-center gap-3 text-sm text-orange-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                      Verified Quality Accommodations
                    </li>
                    <li className="flex items-center gap-3 text-sm text-orange-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                      24/7 On-Trip Support
                    </li>
                    <li className="flex items-center gap-3 text-sm text-orange-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                      Transparent Dynamic Pricing
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="p-6 sm:p-8 space-y-8">

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Trip Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Trip Date
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
                <p className="text-[10px] text-orange-600 font-bold mt-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Info className="w-3 h-3" /> Minimum 7 days advance booking required
                </p>
              </div>

              {/* Travelers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Travelers
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{travelers}</span>
                  <button
                    onClick={() => {
                      if (travelers >= maxIncludedTravelers) {
                        setShowRestrictionModal(true);
                      } else {
                        setTravelers(travelers + 1);
                      }
                    }}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Special Requests (Optional)
                </label>
                <textarea
                  placeholder="Any special requirements or requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              {/* Original Price - shown with strikethrough when there's a discount */}
              {totalOriginalPrice > totalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Price (for {maxIncludedTravelers} pax)</span>
                  <span className="text-gray-400 line-through font-medium">₹{numericOriginalPrice.toLocaleString()}</span>
                </div>
              )}
              
              {/* Discounted/Current Price */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {totalOriginalPrice > totalPrice ? 'Discounted Price' : 'Base Price'} (for {maxIncludedTravelers} pax)
                </span>
                <span className="font-medium text-green-600">₹{numericPrice.toLocaleString()}</span>
              </div>
              
              {/* Extra Travelers charge */}
              {travelers > maxIncludedTravelers && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra Travelers ({travelers - maxIncludedTravelers})</span>
                  <span className="font-medium">₹{(totalPrice - numericPrice).toLocaleString()}</span>
                </div>
              )}
              
              <div className="h-px bg-gray-200" />
               
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">₹{totalPrice.toLocaleString()}</span>
                  {totalOriginalPrice > totalPrice && (
                    <span className="text-gray-400 line-through text-sm font-normal">
                      ₹{totalOriginalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {savings > 0 && (
                <div className="flex justify-end text-sm text-green-600 font-medium">
                  ✓ You save ₹{savings.toLocaleString()} <span className="ml-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs"> {discountPercentage}% OFF</span>
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure payment powered by Razorpay</span>
            </div>
          </div>
          </div>
        </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 font-medium">Grand Total</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                  {totalOriginalPrice > totalPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{totalOriginalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-end">
                {savings > 0 && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-1">
                    Saved ₹{savings.toLocaleString()} ({discountPercentage}% OFF)
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3 text-green-500" />
                  Secure Checkout
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-2xl text-xl font-bold shadow-xl shadow-orange-100 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 mr-3" />
                  Confirm & Pay ₹{totalPrice.toLocaleString()}
                </>
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              Payments are processed securely via Razorpay
            </p>
          </div>
        </motion.div>
      </motion.div>
      <GuestRestrictionModal
        isOpen={showRestrictionModal}
        onClose={() => setShowRestrictionModal(false)}
        maxGuests={maxIncludedTravelers}
        packageTier={`${pkg.type} Tier`}
      />
    </AnimatePresence>
  );
};

export default BookingModal;
