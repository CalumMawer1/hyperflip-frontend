"use client"
import "./style/CoinFlipStyle.css"
import "./style/scrollbar.css"
import { useState, useEffect } from 'react';
import { GameStateProvider, useGameState } from '../../providers/GameStateProvider';
import BetHistory from './BetHistory';
import ConfettiComponent from './ConfettiComponent';
import StatusToast from './StatusToast';
import Navbar from "../Layout/Navbar";
import FuturisticBackground from '../Layout/FuturisticBackground';
import GameView from "./GameView";

function GameLayout() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return (
      <GameStateProvider>
        <FuturisticBackground>
          {mounted && <StatusToast />}

          {/* {mounted && <FreeBetModal />} */}

          <Navbar />

          <div>
            {/* Main Content */}
            <div className="flex flex-col pt-10">
              {mounted && <ConfettiWinEffect />}
              
              <div className="relative w-full h-[calc(100vh-7rem)]">
                
                {/* GameView */}
                <div className="w-full max-w-7xl mx-auto px-4 h-full flex justify-center items-start pt-20">
                  {mounted && <GameView />}
                </div>
                
                {/* BetHistory - Only render desktop version in the layout */}
                {!isMobile && (
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 h-[calc(100vh-7rem)] w-96 pointer-events-none">
                    <div className="pointer-events-auto h-full">
                      {mounted && <BetHistory />}
                    </div>
                  </div>
                )}
                
                {/* Mobile BetHistory is positioned fixed in the component itself */}
                {isMobile && mounted && <BetHistory />}
              </div>
            </div>

          </div>
        </FuturisticBackground>
      </GameStateProvider>
  );
}

function ConfettiWinEffect() {
  const { settledBetResult } = useGameState();
  
  if (settledBetResult?.playerWon) {
    return <ConfettiComponent />;
  }
  return null;
}

export default GameLayout;
