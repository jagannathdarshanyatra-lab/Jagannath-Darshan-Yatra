import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/forms";
import { Play, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero1.webp";
import hero2 from "@/assets/hero2.webp";

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [hero1, hero2];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={heroImages[currentImageIndex]}
            src={heroImages[currentImageIndex]}
            alt="Puri spiritual journey"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/80 z-[1]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 sm:pt-32 pb-16 sm:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6"
          >
            Welcome to Sacred Odisha
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6"
          >
            Start Your Journey
            <span className="block text-gradient bg-gradient-to-r from-amber-300 via-primary to-amber-400 bg-clip-text text-transparent">
              From Odisha
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 sm:mb-10"
          >
            Experience the divine charm of Jagannath Temple, serene beaches of Puri, 
            and the architectural marvel of Konark. Your spiritual journey begins here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/packages">
              <Button variant="hero" size="xl" className="min-w-[200px]">
                Explore Packages
              </Button>
            </Link>
            <Button
              variant="heroOutline"
              size="xl"
              className="min-w-[200px] gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Video
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          >
            {[
              { number: "3000+", label: "Happy Travelers" },
              { number: "10+", label: "Tour Packages" },
              { number: "100%", label: "Satisfaction" },
              { number: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-4xl font-bold text-primary-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center text-primary-foreground/70"
          >
            <span className="text-sm mb-2">Scroll to Explore</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
