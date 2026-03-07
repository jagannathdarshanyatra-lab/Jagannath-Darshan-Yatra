import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sonnerToast as toast } from "@/components/ui/feedback";
import { motion } from "framer-motion";
import {
  Star, Clock, Users, Check, X, ChevronDown, ChevronUp,
  Phone, MessageCircle, Calendar, Utensils, Hotel, Car, Shield, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import BookingConsentModal from "@/components/BookingConsentModal";
import GuestRestrictionModal from "@/components/GuestRestrictionModal";
import { fetchPackageById } from "@/services/packageService";
import { useSettings } from "@/context/SettingsContext";

const PackageDetail = () => {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState(1);
  const [travelers, setTravelers] = useState(2);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadPackage = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from API
        const packageData = await fetchPackageById(id);
        // Parse hotelDetails if it arrives as a JSON string
        if (packageData.hotelDetails && typeof packageData.hotelDetails === 'string') {
          try {
            packageData.hotelDetails = JSON.parse(packageData.hotelDetails);
          } catch {
            packageData.hotelDetails = [];
          }
        }
        // Map roomType back to type for hotelDetails display, and fix corrupted hotel names
        if (Array.isArray(packageData.hotelDetails)) {
          packageData.hotelDetails = packageData.hotelDetails.map(h => {
            let hotelName = h.hotel;
            // Fix corrupted data: if hotel field contains a JSON string, extract the real name
            if (typeof hotelName === 'string' && hotelName.trim().startsWith('[')) {
              try {
                const parsed = JSON.parse(hotelName);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].hotel) {
                  hotelName = parsed[0].hotel;
                }
              } catch {
                // keep original
              }
            }
            return {
              ...h,
              hotel: hotelName,
              type: h.roomType || h.type
            };
          });
        }
        setPkg(packageData);
      } catch (err) {
        setError('Package not found or server error');
        setPkg(null);
      } finally {
        setLoading(false);
      }
    };
    loadPackage();
  }, [id]);

  const handleBookNow = () => {
    if (!user || !token) {
      toast.info('Please login to book this package');
      // Redirect to login page with return URL
      navigate('/login', { state: { from: `/packages/${id}` } });
      return;
    }
    // Show consent modal before proceeding
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    // Navigate to hotel selection after consent
    navigate(`/packages/${id}/hotels`, { state: { travelers } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Package Not Found</h1>
          <Link to="/packages">
            <Button>View All Packages</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper to format price - handles numbers and text (e.g., "Contact for pricing")
  const formatPrice = (price) => {
    if (price == null) return 'Contact for pricing';
    if (typeof price === 'number') return `₹ ${price.toLocaleString()}`;
    if (!isNaN(price)) return `₹ ${Number(price).toLocaleString()}`;
    return price; // Return text as-is (e.g., "Contact for pricing")
  };

  const isNumericPrice = (price) => {
    return price != null && !isNaN(price);
  };

  // Parse group size to get max included travelers (e.g., "1-2" → 2, "2-4" → 4)
  const parseMaxGroupSize = (groupSize) => {
    if (!groupSize) return 1;
    const match = groupSize.match(/(\d+)\s*[-–]\s*(\d+)/); // Match "1-2" or "2 - 4"
    if (match) return parseInt(match[2], 10);
    const single = groupSize.match(/(\d+)/);
    if (single) return parseInt(single[1], 10);
    return 1;
  };

  const numericPrice = isNumericPrice(pkg.price) ? Number(pkg.price) : null;
  const numericOriginalPrice = isNumericPrice(pkg.originalPrice) ? Number(pkg.originalPrice) : null;
  
  // No more extra traveler fee
  const maxIncludedTravelers = parseMaxGroupSize(pkg.groupSize);
  const calculateTotalPrice = () => {
    if (!numericPrice) return null;
    return numericPrice;
  };
  
  // Calculate total at original price
  const calculateOriginalTotal = () => {
    if (!numericOriginalPrice) return null;
    return numericOriginalPrice;
  };
  
  const totalPrice = calculateTotalPrice();
  const totalOriginalPrice = calculateOriginalTotal();
  const savings = (totalOriginalPrice && totalPrice && totalOriginalPrice > totalPrice) ? (totalOriginalPrice - totalPrice) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />

      <main className="pt-24 md:pt-32 overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/packages" className="hover:text-orange-600 transition-colors">Packages</Link>
            <span>/</span>
            <Link to={`/packages?state=odisha`} className="hover:text-orange-600 transition-colors">
              {pkg.stateName || "Odisha"}
            </Link>
            <span>/</span>
            <Link to={`/packages?state=odisha&destination=${pkg.primaryDestination}`} className="hover:text-orange-600 transition-colors">
              {pkg.primaryDestination}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{pkg.name}</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-8 sm:mb-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-3xl overflow-hidden mb-4 shadow-2xl relative group">
                <img
                  src={pkg.images[selectedImage]}
                  alt={pkg.name}
                  className="w-full h-56 sm:h-80 md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {pkg.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 rounded-xl overflow-hidden border-2 w-24 h-24 transition-all ${
                      selectedImage === i ? "border-orange-500 scale-105 shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Package Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-center"
            >
              <div className="flex items-center gap-3 mb-6">
                 <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
                  pkg.type === "Elite" ? "bg-gray-900 text-amber-400" :
                  pkg.type === "Pro" ? "bg-orange-100 text-orange-600" :
                  "bg-green-100 text-green-600"
                }`}>
                  {pkg.type} Tier
                </span>
                <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span className="font-bold text-gray-900">{pkg.rating}</span>
                  <span className="text-gray-400 text-sm">({pkg.reviews} reviews)</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {pkg.name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Duration</div>
                    <div className="font-medium text-gray-900">{pkg.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Group Size</div>
                    <div className="font-medium text-gray-900">{pkg.groupSize}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {pkg.description}
              </p>

              {/* Price Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg sm:shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-8">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Starting from</div>
                    {settings?.website?.showPrices ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">{formatPrice(pkg.price)}</span>
                        {numericOriginalPrice && (
                          <span className="text-lg text-gray-400 line-through">₹ {numericOriginalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Contact for Price
                      </div>
                    )}
                    {savings && savings > 0 && settings?.website?.showPrices && (
                      <div className="text-green-600 font-medium text-sm mt-2 flex items-center gap-1">
                        <Check className="w-4 h-4" /> You save ₹ {savings.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Travelers Counter */}
                   <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl w-fit">
                      <button
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        -
                      </button>
                      <div className="text-center min-w-[2.5rem]">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">Guests</div>
                        <div className="font-bold text-gray-900 text-base">{travelers}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (travelers >= maxIncludedTravelers) {
                            setShowRestrictionModal(true);
                          } else {
                            setTravelers(travelers + 1);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        +
                      </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    size="xl" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 sm:h-14 text-base sm:text-lg font-medium shadow-orange-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleBookNow}
                    disabled={!settings?.website?.bookingEnabled}
                  >
                    {!settings?.website?.bookingEnabled ? (
                      'Booking Disabled'
                    ) : totalPrice && settings?.website?.showPrices ? (
                      <>
                        <span className="sm:hidden">Book for ₹ {totalPrice.toLocaleString()}</span>
                        <span className="hidden sm:inline">Request Booking for ₹ {totalPrice.toLocaleString()}</span>
                      </>
                    ) : (
                      'Request Booking'
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                     <Button 
                      variant="outline" 
                      className="h-12 rounded-xl border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                      onClick={() => {
                        window.location.href = "tel:+919556006338";
                      }}
                    >
                      <Phone className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Call Expert</span><span className="sm:hidden">Call</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 rounded-xl border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      onClick={() => window.open("https://wa.me/919556006338", "_blank")}
                    >
                      <MessageCircle className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">WhatsApp</span><span className="sm:hidden">Chat</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Tabs Section */}
        <section className="bg-white py-20 border-t border-gray-100">
           <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                 {/* Main Content */}
                 <div className="md:col-span-2 space-y-12">
                    
                    {/* Itinerary */}
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                           <Calendar className="w-5 h-5 text-orange-600" />
                         </div>
                         Tour Itinerary
                      </h2>
                      <div className="space-y-6">
                        {pkg.itinerary.map((day, index) => (
                           <motion.div
                            key={day.day}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                              expandedDay === day.day ? "border-orange-200 bg-orange-50/30 ring-4 ring-orange-50" : "border-gray-100 bg-white hover:border-orange-100"
                            }`}
                          >
                            <button
                              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                              className="w-full flex items-center justify-between p-6 text-left"
                            >
                              <div className="flex items-center gap-4">
                                <span className={`text-4xl font-serif font-bold opacity-20 ${expandedDay === day.day ? "text-orange-600" : "text-gray-400"}`}>
                                  {String(day.day).padStart(2, '0')}
                                </span>
                                <div>
                                  <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">Day {day.day}</div>
                                  <h3 className="font-medium text-lg text-gray-900">{day.title}</h3>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                expandedDay === day.day ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                              }`}>
                                {expandedDay === day.day ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>
                            {expandedDay === day.day && (
                              <div className="px-4 sm:px-6 pb-6 sm:pl-20 border-t border-orange-100/50 pt-4">
                                <ul className="space-y-3">
                                  {day.activities.map((activity, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                           </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div>
                       <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                           <Hotel className="w-5 h-5 text-orange-600" />
                         </div>
                         Where You'll Stay
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                         {pkg.hotelDetails.map((hotel, i) => (
                            <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                               <div className="text-xs uppercase font-bold text-gray-400 mb-2">{hotel.city}</div>
                               <div className="font-serif text-xl font-bold text-gray-900 mb-2">{hotel.hotel}</div>
                               <div className="inline-block px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-600 border border-gray-100">
                                  {hotel.nights} Nights • {hotel.type}
                               </div>
                            </div>
                         ))}
                      </div>
                    </div>

                 </div>

                 {/* Sidebar Info */}
                 <div className="space-y-8">
                     <div className="bg-gray-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full translate-x-10 -translate-y-10 blur-3xl" />
                        
                        <h3 className="font-serif text-2xl font-bold mb-6 relative z-10">Package Inclusions</h3>
                        <ul className="space-y-4 relative z-10">
                           {pkg.included.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                 <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                 <span className="text-gray-300 text-sm">{item}</span>
                              </li>
                           ))}
                        </ul>

                         <div className="h-px w-full bg-gray-800 my-8" />
                         
                         <h3 className="font-serif text-xl font-bold mb-4 text-red-200">Exclusions</h3>
                          <ul className="space-y-3 relative z-10">
                           {pkg.excluded.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 opacity-70">
                                 <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                 <span className="text-gray-400 text-sm">{item}</span>
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-orange-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-orange-100">
                        <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Additional Info</h3>
                        <div className="space-y-6">
                           <div>
                              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                                 <Utensils className="w-4 h-4 text-orange-600" /> Food Plan
                              </div>
                              <p className="text-sm text-gray-600">{pkg.foodPlan}</p>
                           </div>
                            <div>
                              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                                 <Car className="w-4 h-4 text-orange-600" /> Transportation
                              </div>
                              <p className="text-sm text-gray-600">{pkg.pickupDrop}</p>
                           </div>
                        </div>
                     </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 bg-orange-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Explore Odisha?
            </h2>
            <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
              Don't miss out on this incredible journey. Secure your spot today.
            </p>
             <Button 
                variant="outline"
                size="xl" 
                className="bg-white text-orange-600 hover:bg-orange-50 border-none h-14 px-8 rounded-xl text-lg shadow-xl"
                onClick={handleBookNow}
              >
                Book This Package
              </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingConsentModal 
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
        packageName={pkg.name}
      />

      <GuestRestrictionModal
        isOpen={showRestrictionModal}
        onClose={() => setShowRestrictionModal(false)} 
        maxGuests={maxIncludedTravelers}
        packageTier={`${pkg.type} Tier`}
      />
    </div>
  );
};

export default PackageDetail;
