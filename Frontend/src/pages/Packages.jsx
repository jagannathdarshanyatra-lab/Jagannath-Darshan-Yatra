import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Users, MapPin, ArrowRight, Filter, Search, Lock, ChevronLeft, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/forms";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/ExperienceHero.webp";

import { states, getStateBySlug, getActiveStates, getComingSoonStates } from "@/data/states";
import { fetchPackages } from "@/services/packageService";
import DestinationView from "@/components/DestinationView";

const optimizeImageUrl = (url, width = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedState = searchParams.get("state") || "odisha";
  const selectedDestination = searchParams.get("destination");
  
  // Package data from API
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch packages from API
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const data = await fetchPackages();
        setAllPackages(data);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  // Scroll to top when navigation changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedState, selectedDestination]);

  // Get unique destinations from actual data for the selected state
  const getDestinationsForState = (stateName) => {
    const statePackages = allPackages.filter(pkg => 
      (pkg.stateName || pkg.state || "Odisha").toLowerCase() === stateName.toLowerCase()
    );
    return [...new Set(statePackages.map(pkg => pkg.primaryDestination))];
  };

  // Filter packages based on state and destination
  const filteredPackages = allPackages.filter((pkg) => {
    const pkgState = pkg.stateName || pkg.state || "Odisha";
    
    if (selectedState && selectedDestination) {
      return pkgState.toLowerCase() === selectedState.toLowerCase() && 
             pkg.primaryDestination === selectedDestination;
    }
    if (selectedState) {
      return pkgState.toLowerCase() === selectedState.toLowerCase();
    }
    if (selectedDestination) {
      return pkg.primaryDestination === selectedDestination;
    }
    return true;
  });

  // Handle navigation
  const handleStateClick = (stateSlug) => {
    setSearchParams({ state: stateSlug });
  };

  const handleDestinationClick = (destination) => {
    const params = { destination };
    if (selectedState) {
      params.state = selectedState;
    }
    setSearchParams(params);
  };

  const handleBackToStates = () => {
    setSearchParams({});
  };

  const handleBackToDestinations = () => {
    if (selectedState) {
      setSearchParams({ state: selectedState });
    } else {
      setSearchParams({});
    }
  };

  // Get current state data
  const currentState = selectedState ? getStateBySlug(selectedState) : null;
  const currentDestinations = selectedState ? getDestinationsForState(selectedState) : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 md:pt-32">
          <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading packages...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 md:pt-32">
        {/* {selectedDestination ? (
          <DestinationView 
            destination={selectedDestination}
            packages={filteredPackages}
            allPackages={allPackages}
            onBack={handleBackToDestinations}
            stateName={currentState?.name || "Odisha"}
            stateSlug={selectedState || "odisha"}
          />
        ) : selectedState && currentState ? (
          <>
            <section className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={currentState.image || heroImage}
                alt={`${currentState.name} Travel Packages`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 to-foreground/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                    {currentState.name}
                  </h1>
                  <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto px-4">
                    {currentState.slogan}
                  </p>
                </motion.div>
              </div>
            </section>

            <div className="py-16 bg-[#FAF9F6] min-h-[60vh]">
              <div className="container mx-auto px-4">
                <button
                  onClick={handleBackToStates}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-8 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to All States</span>
                </button>

                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
                    Explore Destinations in {currentState.name}
                  </h2>
                  <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    {currentState.description}
                  </p>
                </div>

                {currentDestinations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No packages available for this state yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-6">
                    {currentDestinations.map((dest, index) => {
                      const destPkgs = allPackages.filter(p => p.primaryDestination === dest);
                      const locationImg = destPkgs.find(p => p.locationImage)?.locationImage;
                      const coverImage = locationImg || destPkgs[0]?.image || destPkgs[0]?.images?.[0] || heroImage;
                      
                      return (
                        <motion.div
                          key={dest}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative h-[350px] sm:h-[400px] lg:h-[450px] w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                          onClick={() => handleDestinationClick(dest)}
                        >
                          <img 
                            src={optimizeImageUrl(coverImage)} 
                            alt={dest} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                              <ArrowRight className="w-6 h-6 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="font-serif text-3xl font-bold text-white mb-2">{dest}</h3>
                            <p className="text-white/80 mb-6 font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {destPkgs.length} Packages Available
                            </p>
                            
                            <Button className="w-full bg-white text-black hover:bg-primary hover:text-white border-none rounded-xl font-bold">
                              View Packages
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <section className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={heroImage}
                alt="Travel Packages"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 to-foreground/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                    Travel Packages
                  </h1>
                  <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto px-4">
                    Curated experiences for every budget and travel style
                  </p>
                </motion.div>
              </div>
            </section>

            <div className="py-16 bg-[#FAF9F6] min-h-[60vh]">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Select Your Destination</h2>
                  <p className="text-gray-600 mt-4">Choose a state to explore our handcrafted travel packages</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {states.map((state, index) => {
                    const stateDestinations = getDestinationsForState(state.name);
                    const statePkgs = allPackages.filter(p => 
                      (p.stateName || p.state || "").toLowerCase() === state.name.toLowerCase()
                    );
                    const isActive = statePkgs.length > 0;
                    
                    if (isActive) {
                      return (
                        <motion.div
                          key={state.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                          onClick={() => handleStateClick(state.slug)}
                        >
                          <img 
                            src={state.image || heroImage} 
                            alt={state.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                              <ArrowRight className="w-6 h-6 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="font-serif text-3xl font-bold text-white mb-2">{state.name}</h3>
                            <p className="text-white/70 text-sm mb-2">{state.slogan}</p>
                            <p className="text-white/80 mb-6 font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {stateDestinations.length} Destinations • {statePkgs.length} Packages
                            </p>
                            
                            <Button className="w-full bg-white text-black hover:bg-primary hover:text-white border-none rounded-xl font-bold">
                              Explore {state.name}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    } else {
                      return (
                        <motion.div
                          key={`coming-${state.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="relative h-[450px] rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8 group hover:border-primary/30 hover:bg-gray-100 transition-all cursor-default"
                        >
                          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Lock className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="font-serif text-2xl font-bold text-gray-400 mb-3">{state.name}</h3>
                          <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                            Coming Soon
                          </span>
                          <p className="mt-4 text-xs text-gray-400 max-w-[80%]">
                            We are working on adding exciting packages for {state.name}.
                          </p>
                        </motion.div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </>
        )} */}

        {/* Level 3: Destination View (state + destination selected) */}
        {selectedDestination ? (
          <DestinationView 
            destination={selectedDestination}
            packages={filteredPackages}
            allPackages={allPackages}
            onBack={handleBackToDestinations}
            stateName={currentState?.name || "Odisha"}
            stateSlug={selectedState || "odisha"}
          />
        ) : (
          <>
            {/* Level 2: Destinations within State */}
            {/* Hero Banner for State */}
            <section className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={currentState?.image || heroImage}
                alt={`${currentState?.name} Travel Packages`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 to-foreground/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                    {currentState?.name}
                  </h1>
                  <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto px-4">
                    {currentState?.slogan}
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Destinations Grid */}
            <div className="py-16 bg-[#FAF9F6] min-h-[60vh]">
              <div className="container mx-auto px-4">
                {/* Back Button - Commented out as we are locking to Odisha */}
                {/* 
                <button
                  onClick={handleBackToStates}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-8 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to All States</span>
                </button>
                */}

                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
                    Explore Destinations in {currentState?.name}
                  </h2>
                  <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    {currentState?.description}
                  </p>
                </div>

                {currentDestinations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No packages available for this state yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-6">
                    {currentDestinations.map((dest, index) => {
                      const destPkgs = allPackages.filter(p => p.primaryDestination === dest);
                      // Prioritize locationImage for destination card, fallback to main image
                      const locationImg = destPkgs.find(p => p.locationImage)?.locationImage;
                      const coverImage = locationImg || destPkgs[0]?.image || destPkgs[0]?.images?.[0] || heroImage;
                      
                      return (
                        <motion.div
                          key={dest}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative h-[350px] sm:h-[400px] lg:h-[450px] w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.33%-1rem)] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
                          onClick={() => handleDestinationClick(dest)}
                        >
                          <img 
                            src={optimizeImageUrl(coverImage)} 
                            alt={dest} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                              <ArrowRight className="w-6 h-6 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="font-serif text-3xl font-bold text-white mb-2">{dest}</h3>
                            <p className="text-white/80 mb-6 font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {destPkgs.length} Packages Available
                            </p>
                            
                            <Button className="w-full bg-white text-black hover:bg-primary hover:text-white border-none rounded-xl font-bold">
                              View Packages
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Packages;
