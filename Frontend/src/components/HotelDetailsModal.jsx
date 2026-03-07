import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Check, Wifi, Coffee, Wind, Tv, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaHotel, FaSwimmingPool, FaUtensils, FaSpa } from 'react-icons/fa';

const HotelDetailsModal = ({ 
  isOpen, 
  onClose, 
  hotel, 
  isSelected, 
  onSelect, 
  onDeselect,
  packageType 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [hotel?._id, hotel?.id, isOpen]);

  if (!hotel) return null;

  const images = hotel.images || [];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const amenityIcons = {
// ... existing icons ...
    'Wifi': <Wifi className="w-4 h-4" />,
    'Free Wifi': <Wifi className="w-4 h-4" />,
    'Swimming Pool': <FaSwimmingPool className="w-4 h-4" />,
    'Pool': <FaSwimmingPool className="w-4 h-4" />,
    'Restaurant': <FaUtensils className="w-4 h-4" />,
    'Dining': <FaUtensils className="w-4 h-4" />,
    'Food': <FaUtensils className="w-4 h-4" />,
    'Spa': <FaSpa className="w-4 h-4" />,
    'Air Conditioning': <Wind className="w-4 h-4" />,
    'AC': <Wind className="w-4 h-4" />,
    'TV': <Tv className="w-4 h-4" />,
    'Television': <Tv className="w-4 h-4" />,
    'Breakfast': <Coffee className="w-4 h-4" />,
    'Free Breakfast': <Coffee className="w-4 h-4" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Image Area */}
            <div className="relative h-64 sm:h-80 shrink-0 bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeIndex}
                  src={images[activeIndex] || '/placeholder.svg'} 
                  alt={`${hotel.name} - image ${activeIndex + 1}`} 
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x600/f97316/white?text=No+Image';
                  }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/40 transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/40 transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Package Tier Badge */}
              {packageType && (
                <div className="absolute top-4 left-4 z-20">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider ${
                    packageType.toLowerCase().includes('pro') ? 'bg-red-600' :
                    packageType.toLowerCase().includes('premium') ? 'bg-amber-500' :
                    packageType.toLowerCase().includes('lite') ? 'bg-sky-500' :
                    packageType.toLowerCase().includes('standard') ? 'bg-green-600' :
                    'bg-orange-600'
                  }`}>
                    {packageType}
                  </span>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
              
              {/* Hotel basic info on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{hotel.name}</h2>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">{hotel.location || hotel.destination}</span>
                  </div>
                  {hotel.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold">{hotel.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {/* Thumbnails Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 -mt-2 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeIndex === idx 
                          ? 'border-orange-500 scale-105 shadow-md' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {activeIndex === idx && (
                        <div className="absolute inset-0 bg-orange-500/10" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Description */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                   About the Hotel
                </h3>
                <p className="text-gray-600 leading-relaxed italic">
                  "{hotel.description || 'Experience comfort and luxury at our carefully selected accommodation. We ensure high standards of service to make your stay memorable.'}"
                </p>
              </section>

              {/* Amenities */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities & Facilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {hotel.amenities && hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50 group hover:bg-orange-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        {amenityIcons[amenity] || <Check className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trust Section */}
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">Verified by Jagannath Darshan Yatra</p>
                  <p className="text-xs text-green-700 mt-0.5">This hotel meets our quality standards for cleanliness, safety, and service excellence.</p>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              
              {isSelected ? (
                <button
                  onClick={() => {
                    onDeselect(hotel);
                    onClose();
                  }}
                  className="flex-[2] py-4 px-6 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Deselect Hotel
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSelect(hotel);
                    onClose();
                  }}
                  className="flex-[2] py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Select This Hotel
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelDetailsModal;
