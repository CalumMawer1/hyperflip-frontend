import React, { useState } from 'react';
import { StdTailsSVG, StdHeadsSVG } from './CoinSVG';
import { motion, AnimatePresence } from 'framer-motion';
import { useBetHistory } from '../../providers/BetHistoryContext';
import './style/scrollbar.css';
import { getRelativeTimeString } from '../../utils/helpers';


interface FormattedHistoryItem {
  result: 'win' | 'lose';
  amount: number;
  timestamp: number;
  choice: boolean;  // true = Tails, false = Heads
  isFree: boolean;
}

const BetHistory = () => {
  const [isVisible, setIsVisible] = useState(true);
  // Get bet history directly from context - will auto-update when new bets are added
  const { betHistory, isLoading } = useBetHistory();

  // normalize bet amounts to exact UI button amounts
  const normalizeAmount = (amount: number): number => {
    if (amount >= 0.24 && amount < 0.26) return 0.25;
    if (amount >= 0.48 && amount < 0.52) return 0.5;
    if (amount >= 0.97 && amount < 1.03) return 1;
    if (amount >= 1.94 && amount < 2.06) return 2;
    return Math.round(amount); 
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Format history items for display
  const formattedHistory: FormattedHistoryItem[] = betHistory.map((bet) => {
    // Debug the incoming bet data
    console.log("[BetHistory] Formatting bet for display:", {
      playerChoice: bet.playerChoice,
      result: bet.result,
      playerWon: bet.playerWon,
      amount: bet.amountInHype
    });
    
    return {
      result: bet.playerWon ? 'win' : 'lose',
      amount: normalizeAmount(parseFloat(bet.amountInHype)),
      timestamp: bet.placedAt.getTime(),
      choice: bet.playerChoice === 'Tails', // true if Tails, false if Heads
      isFree: bet.isFreeBet
    };
  });

  return (
    <div className="h-full w-full relative">
      <motion.div 
        className="relative w-full h-full"
        initial={{ x: '100%' }}
        animate={{ x: isVisible ? "-10%" : '110%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        {/* Fixed Header */}
        <div className="history-title w-full pb-3 mb-1 text-xl font-bold text-[#FEFCE1] flex items-center justify-between">
          <div className="flex items-center">
            <motion.div 
              className="toggle-icon mr-2 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVisibility}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-[#04e6e0]" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </motion.div>
            <span className="font-title text-[#F5FEFD]">Recent Flips</span>
          </div>
          <div className="title-underline absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/70 to-transparent"></div>
        </div>
        
        {/* Scrollable Items Container */}
        <div 
          className="font-primary history-content overflow-y-auto custom-scrollbar p-3 shadow-inner shadow-black/20" 
          style={{ height: 'calc(100% - 3rem)' }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-[#04e6e0] font-semibold flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] mr-2 animate-pulse"></div>
                Loading history...
                <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] ml-2 animate-pulse"></div>
              </div>
            </div>
          ) : formattedHistory && formattedHistory.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {formattedHistory.map((bet: FormattedHistoryItem, index: number) => (
                <div
                  key={`bet-${bet.timestamp}-${index}`}
                  className={`flip-history-item relative group flex items-center p-4 rounded-xl transition-all ${
                    bet.result === 'win' 
                      ? 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/15 shadow-md shadow-[#04e6e0]/20 hover:shadow-lg hover:shadow-[#04e6e0]/30' 
                      : 'bg-red-600/10 hover:bg-red-600/15 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30'
                  }`}
                >
                  <div className={`history-item-glow absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                    bet.result === 'win' ? 'win-glow' : 'lose-glow'
                  }`}></div>
                  
                  <div className="mr-3 flex-shrink-0 relative z-10 flex items-center justify-center w-10 h-10">
                    {bet.choice ? 
                      <StdTailsSVG className="w-full h-full object-contain" /> : 
                      <StdHeadsSVG className="w-full h-full object-contain" />
                    }
                  </div>
                  
                  <div className="flex flex-col relative z-10">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-white">
                        {bet.amount} HYPE on {bet.choice ? 'Tails' : 'Heads'}
                      </span>
                      {bet.isFree && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                          FREE
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1">
                      {getRelativeTimeString(bet.timestamp)}
                    </span>
                  </div>
                  
                  <div className="ml-auto relative z-10">
                    {bet.result === 'win' ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[#04e6e0] font-bold text-lg">
                          +{bet.amount} HYPE
                        </span>
                        <span className="text-xs text-[#04e6e0]/70">Winner!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-red-400 font-bold text-lg">
                          -{bet.amount} HYPE
                        </span>
                        <span className="text-xs text-red-400/70">Try again!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 opacity-30 flex items-center justify-center">
                  <StdHeadsSVG className="w-full h-full object-contain" />
                </div>
                <p className="text-gray-400 text-sm">No bet history yet.</p>
                <p className="text-gray-500 text-xs mt-2">Place a bet to see your history here!</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {!isVisible && (
          <motion.div 
            className="toggle-tab fixed top-1/2 right-0 -translate-y-1/2 cursor-pointer z-20"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: -15, opacity: 1 }}
            exit={{ x: 0, opacity: 0 }}
            whileHover={{ x: -20 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVisibility}
          >
            <div className="bg-[#04e6e0]/20 backdrop-blur-sm rounded-l-md p-2 border-t border-l border-b border-[#04e6e0]/30">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-[#04e6e0]" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BetHistory;
