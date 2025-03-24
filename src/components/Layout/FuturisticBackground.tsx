import React from 'react';
import '../CoinFlip/style/CoinFlipStyle.css';
import '../CoinFlip/style/scrollbar.css';

const FuturisticBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen text-white overflow-hidden">
      <div className="futuristic-background">
        <div className="grid-lines"></div>
        <div className="glow-circle"></div>
        <div className="glow-circle"></div>
      </div>
      {children}
    </div>
  );
};

export default FuturisticBackground; 