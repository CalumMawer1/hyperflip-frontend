import React from 'react';
import { useGame } from '../../providers/GameProvider';


const FreeBetModal= () => {
    const { 
      isWhitelisted,
      hasUsedFreeBet,
      gameResult,
      pendingBet,
      showFreeBetModal,
      setShowFreeBetModal,
      address
    } = useGame();
  
    const isEligibleForFreeBet = !!(isWhitelisted && !hasUsedFreeBet);
    if (!isEligibleForFreeBet || hasUsedFreeBet || gameResult || pendingBet?.hasBet || !showFreeBetModal) {
      return null;
    }
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
        <div className="bg-black border-2 border-[#04e6e0] p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#04e6e0] mb-4">🎉 Free Bet Offer! 🎉</h2>
          <p className="text-white mb-2">Welcome to HyperFlip! You're eligible for a free 0.25 HYPE bet on us!</p>
          <p className="text-white mb-6 text-sm italic">Select Heads or Tails, then click the green "Claim Free Bet" button below the coin.</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setShowFreeBetModal(false);
                if (address) {
                  localStorage.setItem(`freeBet_modal_dismissed_${address.toLowerCase()}`, 'true');
                }
              }}
              className="px-6 py-2 bg-[#04e6e0] text-black rounded-lg font-bold hover:bg-[#04e6e0]/80 transition-all"
            >
              Got It
            </button>
            <button
              onClick={() => {
                console.log('Skipping free bet for now');
                setShowFreeBetModal(false);
                if (address) {
                  localStorage.setItem(`freeBet_modal_dismissed_${address.toLowerCase()}`, 'true');
                }
              }}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  };

export default FreeBetModal;
