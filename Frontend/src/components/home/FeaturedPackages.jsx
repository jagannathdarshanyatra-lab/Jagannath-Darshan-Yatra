import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/forms";
import { Star, ArrowRight, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchPackages } from "@/services/packageService";


const FeaturedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const data = await fetchPackages();
        const relevantPackages = data.filter(p => 
          ["Puri", "Bhubaneswar"].includes(p.primaryDestination)
        );
        const elitePkg = relevantPackages.find(p => p.type === "Elite");
        const standardPkg = relevantPackages.find(p => p.type === "Standard");
        const proPkg = relevantPackages.find(p => p.type === "Pro");
        const premiumPkg = relevantPackages.find(p => p.type === "Premium");
        const sortedPackages = [elitePkg, standardPkg, proPkg, premiumPkg].filter(Boolean);
        
        if (sortedPackages.length === 0 && data.length > 0) {
          setPackages(data.slice(0, 4)); // Increased slice to handle more tiers
        } else {
          setPackages(sortedPackages);
        }
      } catch (err) {
        console.error('Error loading featured packages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };  
    loadPackages();
  }, []);
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </section>
    );
  }
  if (error || packages.length === 0) {
    return null; 
  }

  return (
    <section className="py-24 bg-gradient-to-b from-orange-50/30 via-white to-orange-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200">
            Curated Experiences
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Discover Our Exclusive Packages
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Handpicked packages designed to give you the best of India's spiritual heritage, natural beauty, and cultural richness.
          </p>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, index) => {
            const isElite = pkg.type === "Elite";
            const isPro = pkg.type === "Pro";
            
            // Get the main image - handle both array and single image
            const mainImage = Array.isArray(pkg.images) && pkg.images.length > 0 
              ? pkg.images[0] 
              : (pkg.image || '/placeholder.svg');
            // Get locations array or construct from primaryDestination
            const locations = pkg.locations || [pkg.primaryDestination];
            // Get highlights or facilities
            const features = pkg.highlights || pkg.facilities || [];
            
            return (
              <motion.div
                key={pkg._id || pkg.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group rounded-3xl transition-all duration-300 h-full flex flex-col overflow-hidden bg-white text-gray-900 shadow-lg hover:shadow-2xl border border-gray-100"
              >
                {/* Image Section */}
                <div className="h-64 w-full overflow-hidden relative">
                    <img 
                        src={mainImage} 
                        alt={pkg.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                    {/* Badge Overlay */}
                     <div className="absolute top-4 left-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                        isElite ? "bg-amber-500/90 text-white" : 
                        pkg.type === "Standard" ? "bg-indigo-500/90 text-white" :
                        isPro ? "bg-blue-500/90 text-white" : 
                        "bg-emerald-500/90 text-white"
                        }`}>
                        {pkg.type}
                        </span>
                    </div>
                     {/* Rating Overlay */}
                     <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                        <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span className="text-gray-900">{pkg.rating || 4.5}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-7 flex flex-col flex-grow">
 
                     <div className="mb-4">
                        {/* Title */}
                        <h3 className="text-2xl font-serif font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                        {pkg.name}
                        </h3>
                        {/* Duration & Group Size */}
                        <div className="flex items-center gap-5 text-sm mt-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-orange-500" />
                            {pkg.duration}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-orange-500" />
                            {pkg.groupSize}
                        </div>
                        </div>

                        {/* Locations */}
                        <div className="flex items-start gap-2 text-sm mb-5">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span className="text-gray-600 line-clamp-1">
                            {(() => {
                                const locs = (pkg.locations && pkg.locations.length > 0) 
                                    ? pkg.locations 
                                    : [pkg.primaryDestination || "Odisha"];
                                const locText = locs.join(" → ");
                                return locText.includes("Odisha") ? locText : `${locText}, Odisha`;
                            })()}
                        </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                    {features.slice(0, 3).map((feature, i) => (
                        <span 
                        key={i} 
                        className="text-xs px-3 py-1 rounded-full font-medium bg-gray-50 text-gray-600 border border-gray-200"
                        >
                        {feature}
                        </span>
                    ))}
                    {features.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-400 font-medium">+{features.length - 3} more</span>
                    )}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-auto px-7 pb-8">
                    <Link to={`/packages?state=odisha&destination=${pkg.primaryDestination}`}>
                    <Button 
                        className="w-full py-6 rounded-xl text-base font-bold shadow-sm hover:shadow-md transition-all bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                    >
                        View Details
                    </Button>
                    </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All */}
        <div className="text-center mt-16">
          <Link to="/packages">
             <Button variant="outline" className="group text-gray-600 hover:text-orange-600 font-medium inline-flex items-center gap-2 transition-all px-8 py-6 rounded-full border-gray-300 hover:border-orange-500 hover:bg-orange-50">
               View All Packages <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPackages;
