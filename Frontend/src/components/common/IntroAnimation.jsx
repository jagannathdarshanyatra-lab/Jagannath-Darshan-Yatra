import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/Logo_Jagannath_Darshan_Yatra.webp";
import "./IntroAnimation.css";

const IntroAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total duration 6 seconds: 5.4s display + 0.6s exit animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, 5400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Animation Variants
  const containerVariants = {
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } // Custom cubic-bezier for buttery smooth reveal
    }
  };

  const logoVariants = {
    initial: { scale: 0, opacity: 0, rotate: -3 },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        delay: 0.6,
        type: "spring",
        stiffness: 80, // Very relaxed for "liquid" feel
        damping: 20 
      }
    }
  };

  const textVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { delay: 1.2, duration: 1, ease: "easeOut" }
    }
  };

  const lineVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { 
      width: "100%", 
      opacity: 1,
      transition: { delay: 1.8, duration: 1.2, ease: "easeInOut" }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-premium-overlay"
          variants={containerVariants}
          exit="exit"
          style={{ willChange: "opacity, transform" }}
        >
          {/* Background Decorative Shapes - Simplified for zero lag */}
          <motion.div 
            className="shape-circle-large"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
          />
          <motion.div 
            className="shape-circle-small"
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "transform, opacity" }}
          />

          <div className="intro-container">
            {/* White Portal Reveal - Removed shadow for smoothness */}
            <motion.div 
              className="white-portal-smooth"
              variants={circleVariants}
              initial="initial"
              animate="animate"
              style={{ willChange: "transform, opacity" }}
            />

            <div className="intro-main-content">
              <motion.div
                className="logo-wrapper"
                variants={logoVariants}
                initial="initial"
                animate="animate"
                style={{ willChange: "transform, opacity" }}
              >
                <img src={logo} alt="Logo" className="premium-logo" loading="eager" />
              </motion.div>
              
              <div className="text-wrapper" style={{ backfaceVisibility: "hidden" }}>
                <motion.div
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  className="welcome-box"
                >
                  <span className="welcome-tag">Welcome to</span>
                  <h1 className="main-title">
                    Jagannath Darshan <span className="highlight">Yatra</span>
                  </h1>
                  <motion.div 
                    className="accent-line-smooth"
                    variants={lineVariants}
                    initial="initial"
                    animate="animate"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
