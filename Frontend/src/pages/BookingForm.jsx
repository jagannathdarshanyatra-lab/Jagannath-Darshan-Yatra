import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Phone, MessageSquare, CreditCard, Shield, Loader2, Check, Info, X, User, ChevronDown } from 'lucide-react';
import { FaHotel } from 'react-icons/fa';
import { Button } from '@/components/ui/forms';
import { sonnerToast as toast } from '@/components/ui/feedback';
import { createBooking, createPaymentOrder, verifyPayment, getRazorpayKey } from '@/services/packageService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GuestRestrictionModal from '@/components/GuestRestrictionModal';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pkg, travelers: initialTravelers = 2, selectedHotel = null } = location.state || {};

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const [tripDate, setTripDate] = useState('');
  const [travelers, setTravelers] = useState(initialTravelers);
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  // Traveller details: array of { name, gender, age }
  const [travellerDetails, setTravellerDetails] = useState(
    Array.from({ length: initialTravelers }, () => ({ name: '', gender: 'Male', age: '' }))
  );

  // Sync travellerDetails array length with travelers count
  useEffect(() => {
    setTravellerDetails(prev => {
      if (travelers > prev.length) {
        return [...prev, ...Array.from({ length: travelers - prev.length }, () => ({ name: '', gender: 'Male', age: '' }))];
      }
      return prev.slice(0, travelers);
    });
  }, [travelers]);

  // If no package data, redirect back
  useEffect(() => {
    if (!pkg) {
      toast.error('No package selected. Please go back and select a package.');
      navigate('/packages');
    }
  }, [pkg, navigate]);

  // Helper to parse group size
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

  // Count adults (age >= 10 or age not filled yet counts as adult)
  const adultCount = travellerDetails.filter(t => {
    const age = parseInt(t.age, 10);
    return isNaN(age) || age >= 10;
  }).length;

  const childCount = travelers - adultCount;

  // No more extra traveler fee
  const calculateTotal = (basePrice) => {
    if (!basePrice) return 0;
    return basePrice;
  };
  
  const totalPrice = calculateTotal(numericPrice);
  const totalOriginalPrice = calculateTotal(numericOriginalPrice);
  const savings = (totalOriginalPrice > totalPrice) ? (totalOriginalPrice - totalPrice) : 0;

  const discountPercentage = (totalOriginalPrice > totalPrice && totalOriginalPrice > 0)
    ? Math.round(((totalOriginalPrice - totalPrice) / totalOriginalPrice) * 100)
    : 0;

  // Get minimum date (7 days from now)
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Update a single traveller's field
  const updateTraveller = (index, field, value) => {
    setTravellerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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

    // Validate traveller details
    for (let i = 0; i < travellerDetails.length; i++) {
      const t = travellerDetails[i];
      if (!t.name.trim()) {
        toast.error(`Please enter the name for Traveller ${i + 1}`);
        return;
      }
      if (!t.age || isNaN(parseInt(t.age, 10)) || parseInt(t.age, 10) < 0) {
        toast.error(`Please enter a valid age for Traveller ${i + 1}`);
        return;
      }
    }

    if (!user || !token) {
      toast.info('Please login to book this package');
      navigate('/login', { state: { from: `/packages/${pkg._id || pkg.legacyId}` } });
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        packageId: pkg.legacyId || pkg._id,
        packageName: pkg.name,
        packageImage: pkg.image,
        destination: pkg.primaryDestination,
        travelers: adultCount,
        totalTravelers: travelers,
        travellerDetails: travellerDetails.map(t => ({
          name: t.name,
          gender: t.gender,
          age: parseInt(t.age, 10),
          isChild: parseInt(t.age, 10) < 10,
        })),
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

      try {
        const razorpayKey = await getRazorpayKey();

        if (!razorpayKey) {
          toast.info('Payment gateway is not configured. Booking saved successfully!');
          window.location.href = `/bookings/${booking._id}/select-hotels`;
          return;
        }

        const orderData = await createPaymentOrder(totalPrice, booking._id, token);

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
        if (paymentError.message.includes('not configured')) {
          toast.info('Booking saved! Our team will contact you for payment.');
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

  if (!pkg) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      <main className="pt-20 md:pt-32 pb-8">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/packages" className="hover:text-orange-600 transition-colors">Packages</Link>
            <span>/</span>
            <Link to={`/packages/${pkg._id || pkg.legacyId}`} className="hover:text-orange-600 transition-colors">{pkg.name}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Booking</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Book Your Trip</h1>
            <p className="text-gray-500 mt-2">{pkg.name}</p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start gap-6 lg:gap-12">
            
            {/* Left Column Wrapper: Groups Summary and Trust Info for Desktop */}
            <div className="contents lg:flex lg:flex-col lg:gap-6">
              
              {/* Top Info (Always at the top) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 order-1"
              >
                {/* Package Summary */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex gap-3 sm:gap-4">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold ${
                      pkg.type === 'Elite' ? 'bg-gray-900 text-amber-400' :
                      pkg.type === 'Pro' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {pkg.type} Tier
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold mt-1 text-gray-900 leading-tight">{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {pkg.duration}
                    </div>
                  </div>
                </div>

                {/* Selected Hotel */}
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
              </motion.div>

              {/* Trust Info (Stacks BELOW Action on mobile, but stays with summary on desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6 order-3 lg:order-2"
              >
                {/* Package Inclusions */}
                {pkg.included && pkg.included.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
              </motion.div>
            </div>

            {/* Right Column: Form (Action - High priority on mobile) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 order-2"
            >
              {/* Trip Date */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
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

                {/* Number of Travelers */}
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
                  {childCount > 0 && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {adultCount} adult{adultCount !== 1 ? 's' : ''} + {childCount} child{childCount !== 1 ? 'ren' : ''} (under 10 yrs - not counted in pricing)
                    </p>
                  )}
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

              {/* Traveller Details Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-serif text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-600" />
                  Traveller Details
                </h4>
                <p className="text-xs text-gray-500 mb-5">Fill in details for all {travelers} traveller{travelers !== 1 ? 's' : ''}. Children under 10 years are not counted in pricing.</p>

                <div className="space-y-4">
                  {travellerDetails.map((traveller, index) => {
                    const age = parseInt(traveller.age, 10);
                    const isChild = !isNaN(age) && age < 10;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl border p-3 sm:p-4 space-y-3 transition-colors ${
                          isChild
                            ? 'border-blue-200 bg-blue-50/50'
                            : 'border-gray-200 bg-gray-50/30'
                        }`}
                      >
                        {/* Row Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">
                            Traveller {index + 1}
                          </span>
                          {isChild && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                              <Info className="w-3 h-3" /> Child - Not counted in pricing
                            </span>
                          )}
                          {!isChild && traveller.age && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                              Adult
                            </span>
                          )}
                        </div>

                        {/* Inputs Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Name */}
                          <div>
                            <label className="block text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Full Name *</label>
                            <input
                              type="text"
                              placeholder="Enter name"
                              value={traveller.name}
                              onChange={(e) => updateTraveller(index, 'name', e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                            />
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Gender *</label>
                            <div className="relative">
                              <select
                                value={traveller.gender}
                                onChange={(e) => updateTraveller(index, 'gender', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm appearance-none bg-white pr-8"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Age */}
                          <div>
                            <label className="block text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Age *</label>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              placeholder="Age"
                              value={traveller.age}
                              onChange={(e) => updateTraveller(index, 'age', e.target.value)}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Price Summary</h4>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {/* Original Price */}
                  {totalOriginalPrice > totalPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original Price (for {maxIncludedTravelers} pax)</span>
                      <span className="text-gray-400 line-through font-medium">₹{numericOriginalPrice.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Current Price */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {totalOriginalPrice > totalPrice ? 'Discounted Price' : 'Base Price'} (for {maxIncludedTravelers} pax)
                    </span>
                    <span className="font-medium text-green-600">₹{numericPrice.toLocaleString()}</span>
                  </div>

                  {/* Extra Adults */}
                  {adultCount > maxIncludedTravelers && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Extra Adults ({adultCount - maxIncludedTravelers})</span>
                      <span className="font-medium">₹{(totalPrice - numericPrice).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Children info */}
                  {childCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Children under 10 ({childCount})</span>
                      <span className="font-medium text-blue-600">Free</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-200" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total</span>
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

              {/* Submit Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-2xl text-lg sm:text-xl font-bold shadow-xl shadow-orange-100 transition-all duration-300"
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
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      
      <GuestRestrictionModal
        isOpen={showRestrictionModal}
        onClose={() => setShowRestrictionModal(false)}
        maxGuests={maxIncludedTravelers}
        packageTier={`${pkg.type} Tier`}
      />
    </div>
  );
};

export default BookingForm;
