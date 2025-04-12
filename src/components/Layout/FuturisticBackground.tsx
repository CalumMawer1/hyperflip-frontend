import React, { useEffect, useState } from 'react';
import '../CoinFlip/style/CoinFlipStyle.css';
import '../CoinFlip/style/scrollbar.css';

const FuturisticBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <div className="futuristic-background">
        <div className="top-glow"></div>
        <div className="floating-particles"></div>
        <div className="glow-circle"></div>
        <div className="glow-circle"></div>
        <div className="glow-circle glow-circle-accent"></div>
        <div className="cyber-circuit"></div>
      </div>
      {children}
    </div>
  );
};

export default FuturisticBackground;
