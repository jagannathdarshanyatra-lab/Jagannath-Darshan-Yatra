import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/Logo_Jagannath_Darshan_Yatra.webp";
import "./IntroAnimation.css";

const IntroAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Animation Variants
  const containerVariants = {
    exit: {
      y: "-100%",
      transition: { duration: 0.6, ease: [0.9, 0, 0.1, 1] }
    }
  };

  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -10 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        delay: 0.4,
        type: "spring",
        stiffness: 260,
        damping: 20 
      }
    }
  };

  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { delay: 0.8, duration: 0.5 }
    }
  };

  const lineVariants = {
    initial: { width: 0 },
    animate: { 
      width: "100%", 
      transition: { delay: 1, duration: 0.8, ease: "easeInOut" }
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
          {/* Background Decorative Shapes */}
          <motion.div 
            className="shape-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="shape-2"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="intro-container">
            {/* White Portal Reveal */}
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
                <img src={logo} alt="Logo" className="premium-logo" />
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
