import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHotel, FaMapMarkerAlt, FaStar, FaCheck, FaWifi, FaSwimmingPool, FaUtensils, FaSpa } from 'react-icons/fa';
import { sonnerToast as toast } from '@/components/ui/feedback';
import BookingModal from '@/components/BookingModal';
import HotelDetailsModal from '@/components/HotelDetailsModal';
import { fetchPackageById } from '@/services/packageService';

const HotelSelection = () => {
  const { bookingId, packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [viewingHotel, setViewingHotel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const initialTravelers = location.state?.travelers || 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        let destination = 'Puri';
        let packageType = 'Premium';
        if (bookingId) {
          // flow for existing booking (legacy or admin)
          const bookingRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!bookingRes.ok) throw new Error('Failed to fetch booking details');
          const bookingData = await bookingRes.json();
          setBooking(bookingData.booking);
          const pkgId = bookingData.booking.packageId;
          const pkgData = await fetchPackageById(pkgId);
          setPackageDetails(pkgData);
          // Use stateName if available, as Admin now saves hotels by State
          destination = pkgData.stateName || pkgData.primaryDestination || pkgData.destination?.name || destination;
          packageType = pkgData.type || packageType;
        } else if (packageId) {
          // Flow: Package -> Hotel Selection -> Booking
          const pkgData = await fetchPackageById(packageId);
          setPackageDetails(pkgData);
          // Use stateName if available
          destination = pkgData.stateName || pkgData.primaryDestination || pkgData.destination?.name || destination;
          packageType = pkgData.type || packageType;
        }
        // 3. Fetch Hotels for this destination and package type
        const hotelsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/hotels?destination=${destination}&packageType=${packageType}&isActive=true`
        );
        const hotelsData = await hotelsRes.json();
        
        // If no hotels found, depending on flow
        if (!hotelsData || hotelsData.length === 0) {
          if (bookingId) {
            toast.info('No hotel options available for this package. Proceeding to confirmation.');
            navigate(`/booking-success?id=${bookingId}`);
          } else {
            setError('No hotel options are available for this destination and package tier. Please contact support or choose another package.');
          }
          setLoading(false);
          return;
        }

        setHotels(hotelsData);
        
      } catch (err) {
        console.error(err);
        setError('Could not load booking or hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, packageId, navigate, token]);

  const handleSelect = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleDeselect = () => {
    setSelectedHotel(null);
  };

  const openHotelDetails = (hotel) => {
    setViewingHotel(hotel);
    setShowDetailsModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedHotel) {
      toast.error('Please select a hotel to continue');
      return;
    }
    
    if (packageId) {
      // New flow: open booking form
      setShowBookingModal(true);
      return;
    }

    try {
      setSubmitting(true);

      // --- OTA API Integration Flow ---
      if (selectedHotel.otaApiLink) {
        toast.info(`Connecting to OTA Booking Engine: ${selectedHotel.name}...`);
        
        // Simulating the OTA Processing Time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulating the OTA API Call
        console.log('Calling OTA API:', selectedHotel.otaApiLink);
        
        // We simulate a successful booking via the OTA link
        toast.success(`Booking confirmed automatically via OTA for ${selectedHotel.name}!`);
        
        // For OTA flow, we might still want to record it in our backend
        // but since we don't have a specific requirement for that yet,
        // we'll proceed to the success page.
        
        // If we need to notify our backend about the OTA booking:
        const otaPayload = {
          selectedHotels: [{
            city: selectedHotel.destination,
            hotelId: selectedHotel._id,
            hotelName: selectedHotel.name,
            isOTA: true,
            otaLink: selectedHotel.otaApiLink
          }]
        };

        if (bookingId) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/hotels`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(otaPayload)
          });
        }

        navigate(`/booking-success?id=${bookingId || 'OTA_BOOKING'}`);
        return;
      }
      // --- End OTA API Integration Flow ---
      
      const payload = {
        selectedHotels: [{
          city: selectedHotel.destination,
          hotelId: selectedHotel._id,
          hotelName: selectedHotel.name
        }]
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/hotels`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save hotel selection');

      toast.success('Hotel selected successfully!');
      navigate(`/booking-success?id=${bookingId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading hotels...</p>
      </div>
    );
  }
  // Error State
  if (error) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
            >
              Go Back to Package
            </button>
          </div>
        </div>
      </div>
    );
  }

  const destination = hotels[0]?.destination || 'Your Destination';

  return (
    <div className="min-h-screen pt-20 pb-32 bg-gradient-to-b from-orange-50 via-white to-orange-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 py-12 mb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Select Your Hotel in {destination}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base">
              <span className="flex items-center gap-2">
                <FaHotel className="text-white/70" />
                {booking?.packageName || packageDetails?.name}
              </span>
              <span className="hidden md:inline">•</span>
              {bookingId && (
                <span className="font-mono bg-white/20 px-3 py-1 rounded-full text-sm">
                  Booking #{bookingId?.slice(-8).toUpperCase()}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-8 text-lg"
        >
          Choose your preferred accommodation from {hotels.length} available option{hotels.length > 1 ? 's' : ''}
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, index) => (
            <motion.div 
              key={hotel._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px -12px rgba(234, 88, 12, 0.25)' }}
              className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedHotel?._id === hotel._id 
                  ? 'ring-4 ring-orange-500 shadow-xl shadow-orange-200' 
                  : 'shadow-lg hover:shadow-xl border border-gray-100'
              }`}
              onClick={() => openHotelDetails(hotel)}
            >
              {/* Image */}
              <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {/* Package Tier Ribbon */}
                {(booking?.packageName || packageDetails?.name) && (
                  <div className="absolute top-0 left-0 overflow-hidden w-24 h-24 z-10 pointer-events-none">
                    <div className={`absolute top-4 -left-8 w-32 py-1 -rotate-45 text-center text-xs font-bold text-white shadow-sm uppercase tracking-wider ${
                      (booking?.packageName || packageDetails?.name).toLowerCase().includes('pro') ? 'bg-red-600' :
                      (booking?.packageName || packageDetails?.name).toLowerCase().includes('premium') ? 'bg-amber-500' :
                      (booking?.packageName || packageDetails?.name).toLowerCase().includes('lite') ? 'bg-sky-500' :
                      'bg-orange-600'
                    }`}>
                      {(booking?.packageName || packageDetails?.name).toLowerCase().includes('pro') ? 'PRO' :
                       (booking?.packageName || packageDetails?.name).toLowerCase().includes('premium') ? 'PREMIUM' :
                       (booking?.packageName || packageDetails?.name).toLowerCase().includes('lite') ? 'LITE' :
                       (booking?.packageName || packageDetails?.name).split(' ')[0]}
                    </div>
                  </div>
                )}

                {hotel.images && hotel.images[0] ? (
                  <img 
                    src={hotel.images[0]} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${hotel.images && hotel.images[0] ? 'hidden' : ''}`}>
                  <FaHotel size={48} />
                  <span className="mt-2 text-sm">No image</span>
                </div>
                
                {/* Selected Badge */}
                {selectedHotel?._id === hotel._id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-orange-600 text-white p-3 rounded-full shadow-lg"
                  >
                    <FaCheck size={16} />
                  </motion.div>
                )}

                {/* Rating Badge */}
                {hotel.rating > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium">
                    <FaStar className="text-yellow-400" />
                    {hotel.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{hotel.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                  <FaMapMarkerAlt className="text-orange-500 shrink-0" />
                  <span className="line-clamp-1">{hotel.location}</span>
                </p>

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.slice(0, 4).map((am, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium"
                      >
                        {am}
                      </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{hotel.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {hotel.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                )}
              </div>

              {/* Selection Indicator */}
              <div className={`px-5 py-3 border-t transition-colors ${
                selectedHotel?._id === hotel._id 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-50 text-gray-500'
              }`}>
                <p className="text-sm font-medium text-center">
                  {selectedHotel?._id === hotel._id ? '✓ Selected' : 'Click to Select'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              {selectedHotel ? (
                <>
                  <p className="text-sm text-gray-500">Your selection</p>
                  <p className="font-bold text-gray-900">{selectedHotel.name}</p>
                </>
              ) : (
                <p className="text-gray-500">Please select a hotel to continue</p>
              )}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={submitting || !selectedHotel}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                !selectedHotel
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 shadow-lg hover:shadow-xl hover:shadow-orange-200'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Confirming...
                </>
              ) : (
                <>
                  Confirm & Continue
                  <span className="text-white/80">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Hotel Details Modal */}
      <HotelDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        hotel={viewingHotel}
        isSelected={selectedHotel?._id === viewingHotel?._id}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        packageType={booking?.packageName || packageDetails?.name}
      />

      {/* Booking Modal */}
      {packageDetails && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          pkg={packageDetails}
          user={user}
          token={token}
          initialTravelers={initialTravelers}
          selectedHotel={selectedHotel}
        />
      )}
    </div>
  );
};

export default HotelSelection;
