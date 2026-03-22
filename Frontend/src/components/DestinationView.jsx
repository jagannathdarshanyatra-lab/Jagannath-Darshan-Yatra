import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/forms";
import { useSettings } from "@/context/SettingsContext";

// Static descriptions for destinations
const DESTINATION_INFO = {
  Puri: {
    slogan: "The Land of Lord Jagannath",
    description: "Puri is not just a destination; it's an emotion. Known as 'Srikshetra', it is one of the four Char Dham pilgrimage sites in India, drawing millions of devotees primarily for the world-famous Rath Yatra. Beyond its spiritual aura, Puri boasts golden sandy beaches that stretch for miles, offering spectacular sunrises and a lively atmosphere. Explore the artisan village of Raghurajpur to witness traditional Pattachitra art, or indulge in the unique culinary delight of the Mahaprasad at the temple. Whether you seek spiritual solace or a relaxing beach holiday, Puri offers a timeless experience.",
  },
  Bhubaneswar: {
    slogan: "The Temple City of India",
    description: "Bhubaneswar, the capital of Odisha, is a captivating blend of ancient history and modern dynamism. Known as the 'Temple City', it was once home to over 7,000 temples, with hundreds still standing today, including the majestic Lingaraj Temple and the exquisitely carved Mukteswar Temple. The city is also a gateway to the Buddhist heritage at Dhauli and the Jain caves of Udayagiri and Khandagiri. With its smart city infrastructure, lush parks, and vibrant cultural scene, Bhubaneswar offers a unique journey through time.",
  },
  Konark: {
    slogan: "Where Stone Speaks",
    description: "Konark is the site of the 13th-century Sun Temple, a UNESCO World Heritage Site that is a masterpiece of Kalinga architecture. Designed as a colossal chariot of the Sun God, Surya, with 24 giant wheels and drawn by seven horses, the temple is an engineering marvel. The intricate carvings on its walls depict scenes from daily life, war, and romance, earning it the phrase 'Here the language of stone surpasses the language of human'. A short distance away lies the pristine Chandrabhaga Beach, perfect for witnessing the sun rising from the sea.",
  },
  Chilika: {
    slogan: "Asia's Largest Brackish Water Lagoon",
    description: "Chilika Lake is a biodiversity hotspot and the largest brackish water lagoon in Asia. It is a wintering ground for migratory birds from as far as the Caspian Sea, Lake Baikal, and Russia. The lagoon is also home to the endangered Irrawaddy dolphins, which can be spotted frolicking near Satapada. From the spiritual Kalijai Island to the bird sanctuary at Nalabana, Chilika offers a serene escape into nature's lap, best explored on a boat as the sun dips below the horizon.",
  },
  Gopalpur: {
    slogan: "A Coastal Retreat of Colonial Charm",
    description: "Gopalpur-on-Sea is a historic beach town that exudes a nostalgic colonial charm. Once a bustling port, it is now a tranquil retreat known for its lighthouse, crumbling warehouses, and serene coastline. Unlike the crowded beaches elsewhere, Gopalpur offers peace and solitude, making it perfect for long walks, introspection, and watching the fishermen at work. Nearby, the Taptapani hot springs and the Tampara Lake offer delightful day excursions.",
  },
  Similipal: {
    slogan: "The Roar of the Wild",
    description: "Similipal National Park is a vast expanse of lush green forests, rolling hills, and cascading waterfalls. A designated tiger reserve and part of the UNESCO World Network of Biosphere Reserves, it is home to the Royal Bengal Tiger, Asian Elephant, and melanistic tigers. The park's landscape is dotted with stunning waterfalls like Barehipani and Joranda. For nature lovers and adventure enthusiasts, a safari through the dense sal forests of Similipal is an unforgettable experience."
  }
};

const DestinationView = ({ destination, packages, allPackages, onBack, stateName = "Odisha", stateSlug = "odisha" }) => {
  const { settings } = useSettings();
  // 1. Gather Images for Banner - prioritize heroImages from packages
  const heroImagesFromPackages = packages.flatMap(p => p.heroImages || []).filter(Boolean);
  const allImages = packages.flatMap(p => p.images || [p.image]).filter(Boolean);
  const uniqueImages = [...new Set(allImages)];
  
  // Use heroImages if available, otherwise fallback to first 3 unique images
  const bannerImages = heroImagesFromPackages.length > 0 
    ? [...new Set(heroImagesFromPackages)].slice(0, 3)
    : uniqueImages.slice(0, 3); 
  
  // Location image for "About" section - prioritize locationImage from first package
  const locationImageFromPackage = packages.find(p => p.locationImage)?.locationImage;
  const aboutSectionImage = locationImageFromPackage || bannerImages[0] || uniqueImages[0];
  
  // Gallery images
  const galleryImages = uniqueImages.length > 3 ? uniqueImages : uniqueImages; 
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-slide banner
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000); // 3 seconds
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  // "More Like This" - Recommendations (excluding current destination)
  const otherDestinations = [...new Set(allPackages.map(p => p.primaryDestination))]
    .filter(d => d !== destination)
    .slice(0, 4); // Take top 4

  const destInfo = DESTINATION_INFO[destination] || {};
  const description = destInfo.description || `Explore the amazing travel packages and experiences in ${destination}.`;
  const slogan = destInfo.slogan || "Discover the Unexplored";

  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // Scroll to Packages section
  const scrollToPackages = () => {
    document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* 1. Banner Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-gray-900">
        {bannerImages.length > 0 && (
          <AnimatePresence initial={false}>
            <motion.img
              key={bannerImages[currentBannerIndex]}
              src={bannerImages[currentBannerIndex]}
              alt={`${destination} Banner ${currentBannerIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </AnimatePresence>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 flex flex-col items-center justify-center text-center p-4">
           {/* Navigation Back Button (Floating) */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="bg-white/20 backdrop-blur border-white/40 text-white hover:bg-white/40 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

           <motion.div
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="max-w-4xl"
           >
             <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
               {destination}
             </h1>
             <p className="text-xl md:text-3xl text-white/90 font-light tracking-wide mb-8 font-serif italic">
               "{slogan}"
             </p>
             <div className="flex justify-center gap-4">
                <Button 
                  onClick={scrollToPackages}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  View Packages
                </Button>
             </div>
           </motion.div>
        </div>
        
        {/* Banner dots */}
        {bannerImages.length > 1 && (
         <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentBannerIndex ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        )}
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* 2. Description Section */}
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="w-full md:w-1/2 space-y-6 text-left">
                <div>
                   <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Discover {destination}</span>
                   <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                     About <span className="text-primary">{destination}</span>
                   </h2>
                </div>
                <div className="w-20 h-1.5 bg-primary rounded-full" />
                <p className="text-lg text-gray-600 leading-relaxed text-justify">
                  {description}
                </p>
             </div>
             
             {/* Visual element for description side */}
             <div className="w-full md:w-1/2 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500">
                <img src={aboutSectionImage} alt={`About ${destination}`} className="w-full h-full object-cover" />
             </div>
          </div>
        </section>

        {/* 3. Packages Section */}
        <section id="packages-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Available Packages</h2>
              <p className="text-muted-foreground">Curated tours for {destination}</p>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
              {["All", "Lite", "Standard", "Pro", "Premium", "Elite"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${
                    activeCategory === cat 
                      ? "bg-primary text-white shadow-md transform scale-105" 
                      : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages
              .filter(pkg => activeCategory === "All" || pkg.type === activeCategory)
              .sort((a, b) => {
                const order = { "Lite": 1, "Standard": 2, "Pro": 3, "Premium": 4, "Elite": 5 };
                return (order[a.type] || 6) - (order[b.type] || 6);
              })
              .map((pkg, index) => {
                const isElite = pkg.type === "Elite";
                const packageId = pkg._id || pkg.id; // Support both MongoDB _id and legacy id
                return (
                  <motion.div
                    key={packageId}
                    layout // Add layout prop for smooth reordering animations
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border flex flex-col relative ${
                      isElite 
                        ? "bg-[#0a0a0a] border-amber-500/50 text-white" 
                        : "bg-white border-gray-100 text-gray-900"
                    }`}
                  >
                    {isElite && (
                       <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10" />
                    )}

                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute top-4 right-4 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                        isElite ? "bg-amber-500 text-black" : "bg-white/95 text-gray-900"
                      }`}>
                        {pkg.type}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className={`font-serif text-xl font-bold mb-1 line-clamp-1 ${isElite ? "text-amber-50" : "text-gray-900"}`}>
                            {pkg.name}
                          </h3>
                          <div className={`flex items-center gap-1 text-sm ${isElite ? "text-gray-400" : "text-muted-foreground"}`}>
                            <Clock className="w-3 h-3" />
                            {pkg.duration}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {settings?.website?.showPrices ? (
                            <>
                              <span className={`block text-2xl font-bold ${isElite ? "text-amber-400" : "text-primary"}`}>
                                {typeof pkg.price === 'number' || !isNaN(pkg.price) 
                                  ? `₹${(Number(pkg.price) / 1000).toFixed(1)}k`
                                  : pkg.price || 'Contact'
                                }
                              </span>
                              {(typeof pkg.price === 'number' || !isNaN(pkg.price)) && (
                                <span className={`text-xs line-through ${isElite ? "text-gray-600" : "text-muted-foreground"}`}>
                                  ₹{(Math.round(Number(pkg.price) / 0.6) / 1000).toFixed(1)}k
                                </span>
                              )}
                            </>
                          ) : (
                            <span className={`block text-sm font-bold ${isElite ? "text-amber-400" : "text-primary"}`}>
                              Check Details
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6 flex-1">
                        {(pkg.highlights || []).slice(0, 3).map((h, i) => (
                          <div key={i} className={`flex items-center gap-2 text-sm ${isElite ? "text-gray-300" : "text-gray-600"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isElite ? "bg-amber-500" : "bg-primary/60"}`} />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>

                      <Link to={`/packages/${packageId}`} className="block mt-auto">
                        <Button className={`w-full rounded-xl py-6 font-medium text-base transition-all ${
                          isElite 
                            ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black border-none" 
                            : "group-hover:bg-primary group-hover:text-white"
                        }`}>
                          View Details 
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
            })}
          </div>
        </section>

        {/* 4. Gallery Section */}
        {galleryImages.length > 0 && (
          <section>
            <div className="mb-10 text-left">
               <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">{destination} Gallery</h2>
               <div className="w-16 h-1 bg-primary rounded-full" />
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
               {galleryImages.map((img, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in relative group"
                    onClick={() => setSelectedImage(img)}
                 >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-auto hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                 </motion.div>
               ))}
            </div>
          </section>
        )}

        {/* 5. More Like This (Other Destinations) */}
        {otherDestinations.length > 0 && (
          <section className="pt-8 border-t border-gray-100">
             <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Explore More Destinations</h2>
                <Link to={`/packages?state=${stateSlug}`} onClick={onBack} className="text-primary font-medium hover:underline flex items-center">
                   View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {otherDestinations.map((dest, idx) => {
                  // Find a cover image for this destination
                  const destPkg = allPackages.find(p => p.primaryDestination === dest);
                  const cover = destPkg?.image || bannerImages[0];
                  
                  return (
                    <motion.div
                      key={dest}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer"
                      // Depending on parent usage, we might need a way to navigate. 
                      // Using Link with search param is easiest if we want to stay on Packages page
                    >
                       <Link to={`/packages?state=${stateSlug}&destination=${dest}`}>
                          <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-3 shadow-md">
                             <img src={cover} alt={dest} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                             <div className="absolute bottom-4 left-4">
                                <h3 className="text-white font-bold text-xl font-serif">{dest}</h3>
                             </div>
                          </div>
                      </Link>
                    </motion.div>
                  );
                })}
             </div>
          </section>
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
             <button 
               className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20"
               onClick={() => setSelectedImage(null)}
             >
               <X className="w-6 h-6" />
             </button>
             <img src={selectedImage} alt="Full view" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationView;
