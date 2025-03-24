import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedDiamondTrophySVGProps {
  className?: string;
  autoPlay?: boolean;
  onAnimationComplete?: () => void;
  animationRef?: React.RefObject<{ play: () => void }>;
}

const AnimatedDiamondTrophySVG: React.FC<AnimatedDiamondTrophySVGProps> = ({ 
  className, 
  autoPlay = true,
  onAnimationComplete,
  animationRef
}) => {
  const controls = useAnimation();
  
  // trigger animation manually
  const playAnimation = React.useCallback(() => {
    controls.set("initial");

    setTimeout(() => {
      controls.start("animate").then(() => {
        onAnimationComplete?.();
      });
    }, 50);
  }, [controls, onAnimationComplete]);

  React.useImperativeHandle(
    animationRef,
    () => ({
      play: playAnimation
    }),
    [playAnimation]
  );

  React.useEffect(() => {
    if (autoPlay) {
      playAnimation();
    }
  }, [autoPlay, playAnimation]);


  const container = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const flyInFromLeft = {
    initial: { x: -80, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      } 
    }
  };

  const flyInFromRight = {
    initial: { x: 80, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      } 
    }
  };

  const flyInFromTop = {
    initial: { y: -50, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      } 
    }
  };

  const riseFromBottom = {
    initial: { y: 50, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      } 
    }
  };

  const centerReveal = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 150, 
        damping: 15,
        delay: 0.3
      } 
    }
  };

  const glowEffect = {
    initial: { filter: "brightness(0.6)" },
    animate: { 
      filter: "brightness(1.2)", 
      transition: { 
        delay: 1.2,
        duration: 0.8, 
        yoyo: Infinity, 
        repeatDelay: 1.5 
      } 
    }
  };

  return (
    <motion.svg
      className={`h-20 w-20 flex-no-shrink cursor-pointer ${className || ''}`}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      onClick={playAnimation}
      variants={container}
      initial="initial"
      animate={controls}
    >

      <motion.path 
        variants={flyInFromTop}
        fill="#10ebe4" 
        d="M158.6 41l34.5 69.1L239.2 41z" 
      />
      <motion.path 
        variants={flyInFromTop}
        fill="#10ebe4" 
        d="M272.8 41l46.1 69.1L353.4 41z" 
      />
      

      <motion.path 
        variants={flyInFromLeft}
        fill="#04c6c0" 
        d="M256 48.22L208.8 119h94.4z" 
      />
      <motion.path 
        variants={flyInFromLeft}
        fill="#04b6b0" 
        d="M142.1 48.36L83.22 119h94.18z" 
      />
      <motion.path 
        variants={flyInFromRight}
        fill="#04a6a0" 
        d="M369.9 48.36L334.6 119h94.2z" 
      />
      

      <motion.g variants={centerReveal}>
        <motion.g variants={glowEffect}>
          <path fill="#049690" d="M80.82 137L196.8 311H249l-63.4-174z" />
          <path fill="#048680" d="M204.9 137L256 277.7 307.1 137z" />
          <path fill="#047670" d="M326.4 137L263 311h52.2l116-174z" />
        </motion.g>
      </motion.g>
      

      <motion.path 
        variants={riseFromBottom}
        fill="#046660" 
        d="M201 329v46h110v-46z" 
      />
      <motion.path 
        variants={riseFromBottom}
        fill="#045650" 
        d="M133.2 393l-53.69 94H432.5l-53.7-94H183z" 
      />
      <motion.path 
        variants={riseFromBottom}
        fill="#044640" 
        d="M160 439h192v18H160z" 
      />
    </motion.svg>
  );
};

export { AnimatedDiamondTrophySVG, type AnimatedDiamondTrophySVGProps };
export default AnimatedDiamondTrophySVG; 