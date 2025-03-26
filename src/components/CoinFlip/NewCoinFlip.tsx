import "./style/CoinFlipStyle.css"
import "./style/scrollbar.css"
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { GameProvider, useGame } from '../../providers/GameProvider';
import BettingView from './BettingView';
import CombinedFlipView from './CombinedFlipView';
import BetHistory from './BetHistory';
import FreeBetModal from './FreeBetModal';
import ConfettiComponent from './ConfettiComponent';
import StatusToast from './StatusToast';
import Navbar from "../Layout/Navbar";
import FuturisticBackground from '../Layout/FuturisticBackground';

const STORAGE_KEY = 'recorded_bets';


export function getRecordedBets() {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      console.error('Error reading recorded bets from storage:', e);
      return new Set();
    }
  }
  
  export function recordBet(betId: string) {
    if (typeof window === 'undefined') return;
    try {
      const recorded = getRecordedBets();
      recorded.add(betId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...recorded]));
    } catch (e) {
      console.error('Error saving recorded bet to storage:', e);
    }
  }
  
  export function isBetRecorded(betId: string) {
    return getRecordedBets().has(betId);
  }


function GameView() {
  const { currentView } = useGame();
  
  switch (currentView) {
    case 'result':
    case 'revealing':
      return <CombinedFlipView />;

    case 'betting':
    default:
      return <BettingView />;
  }
}


function NewCoinFlip() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
      <GameProvider address={address} isConnected={isConnected}>
        <FuturisticBackground>
          {mounted && <StatusToast />}

          {mounted && <FreeBetModal />}

          <Navbar />

          <div className="min-h-screen text-white overflow-y-hidden overflow-x-hidden">
            {/* Main Content */}
            <div className="flex flex-col pt-24">
              {mounted && <ConfettiWinEffect />}
              
              <div className="relative w-full h-[calc(100vh-7rem)]">
                
                {/* GameView */}
                <div className="w-full max-w-7xl mx-auto px-4 h-full flex justify-center items-start pt-20">
                  {mounted && <GameView />}
                </div>
                
                {/* BetHistory */}
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 h-[calc(100vh-7rem)] w-96">
                  {mounted && <BetHistory />}
                </div>
              </div>
            </div>

          </div>
        </FuturisticBackground>
      </GameProvider>
  );
}

function ConfettiWinEffect() {
  const { gameResult } = useGame();
  
  if (gameResult === 'win') {
    return <ConfettiComponent />;
  }
  return null;
}

export default NewCoinFlip;
