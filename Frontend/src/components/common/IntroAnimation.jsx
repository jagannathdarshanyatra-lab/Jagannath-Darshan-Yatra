import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import introVideo from "../../assets/Jagannath_darshan_yatra_Intro.mp4";
import "./IntroAnimation.css";

const IntroAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleVideoEnd = () => {
    setIsVisible(false);
    // Give time for the AnimatePresence exit animation to finish
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-video-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <video
            src={introVideo}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="intro-video-element"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
