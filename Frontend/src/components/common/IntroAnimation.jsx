import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/Logo_Jagannath_Darshan_Yatra.webp";
import "./IntroAnimation.css";

const IntroAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total duration ~7 seconds: 6.4s display + 0.6s exit animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, 6400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Animation Variants - Using simple ease for maximum performance
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
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  const logoVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.8,
        duration: 1,
        ease: "backOut"
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { delay: 1.5, duration: 1 }
    }
  };

  const lineVariants = {
    initial: { width: 0 },
    animate: { 
      width: "100%", 
      transition: { delay: 2, duration: 1.5, ease: "easeInOut" }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-premium-overlay"
          variants={containerVariants}
          exit="exit"
        >
          {/* Background Decorative Shapes - Simplified to Opacity Only */}
          <motion.div 
            className="shape-1"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="shape-2"
            animate={{ opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="intro-container">
            {/* White Portal Reveal - Shadow Removed in CSS */}
            <motion.div 
              className="white-portal"
              variants={circleVariants}
              initial="initial"
              animate="animate"
            />

            <div className="intro-main-content">
              <motion.div
                className="logo-wrapper"
                variants={logoVariants}
                initial="initial"
                animate="animate"
              >
                <img src={logo} alt="Logo" className="premium-logo" loading="eager" />
              </motion.div>
              
              <div className="text-wrapper">
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
                    className="accent-line"
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
