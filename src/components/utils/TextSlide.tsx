import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';



const TextSlide = ({ text ='', fontSize = '', color = 'text-white', letterSpacing = 'tracking-wide', 
  underlineOffset = '-bottom-2', outerIsHovered = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const delay = 0.02;
  const duration = 0.15;

  const containerVariants = {
    initial: {
      transition: { staggerChildren: delay, staggerDirection: -1 },
    },
    animate: {
      transition: { staggerChildren: delay, staggerDirection: 1 },
    },
  };

  const letterVariants = {
    initial: { y: 0 },
    animate: { y: '-50%' },
  };

  const underlineVariants = {
    initial: { width: 0 },
    animate: { width: textWidth },
  };

  const letters = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [text]);

  useEffect(() => {
    controls.start(isHovered || outerIsHovered ? "animate" : "initial");
  }, [isHovered, controls, outerIsHovered]);

  

  return (
    <div className={` relative inline-block ${fontSize} ${color} `}>
      <motion.div
        ref={textRef}
        variants={containerVariants}
        initial="initial"
        animate={controls}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-row items-center"
      >
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`relative overflow-hidden h-[1.2em] ${letterSpacing} ${letter === ' ' ? 'w-[0.3em]' : 'w-auto'}`}
          >
            <motion.div
              variants={letterVariants}
              transition={{ duration, ease: 'easeInOut' }}
              className="relative h-[200%]"
            >
              <span className="block h-1/2 text-white">
                {letter === ' ' ? '\u00A0' : letter}
              </span>
              <span className="block h-1/2 text-[#04e6e0]">
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            </motion.div>
          </div>
        ))}
      </motion.div>
      <motion.div
        variants={underlineVariants}
        initial="initial"
        animate={controls}
        transition={{ duration: duration + letters.length * delay, ease: 'easeOut' }}
        className={`absolute ${underlineOffset} left-0 h-[2px] bg-gradient-to-r from-[#04e6e0]/80 to-[#8b5cf6]/80 pointer-events-none`}
      />
    </div>
  );
};

export default TextSlide;

