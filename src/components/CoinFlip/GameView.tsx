import React from 'react';
import Coin from './Coin';
import FlipView from "./FlipView";
import ResultView from "./ResultView";
import BetView from "./BetView";
import { useGameState } from '../../providers/GameStateProvider';


export default function GameView() {
  const {
    // Core state
    view,
    choice,
    amount,

    // UI controls
    isLoading,
    betIsPending,
    resultIsPending,

    // Results
    settledBetResult,
    placeBetError,

    // Methods
    setChoice,
    setAmount,
    placeBet,
    placeFreeBet,
    playAgain,
    

    // Additional states
    canClaimFreeBet,
    isConnected
  } = useGameState();

  console.log("[NewGameView] Game state:", {
    view,
    choice,
    amount,
    isLoading,
    betIsPending,
    resultIsPending,
    settledBetResult,
    placeBetError,
    canClaimFreeBet,
    isConnected
  });
  

  // Determine which view to render based on game state from hook
  const renderGameView = () => {
    if (view === 'RESULT') {
      return (
        <ResultView
          gameResult={settledBetResult?.playerWon === true ? "win" : "lose"}
          resultDisplay={settledBetResult?.landedOn ?? 0}
          betAmount={settledBetResult?.amount ?? 0}
          onPlayAgain={playAgain}
        />
      );
    }
    
    if (view === 'FLIPPING') {
      return (
        <FlipView
          pendingBetAmount={amount ?? 0}
        />
      );
    }
    
    // Default view (betting)
    return (
      <BetView
        selectedChoice={choice}
        setSelectedChoice={setChoice}
        selectedAmount={amount}
        setSelectedAmount={setAmount}
        isConnected={isConnected}
        isPlacingBet={isLoading}
        allowedBetAmounts={[0.25, 0.5, 1, 2]}
        canClaimFreeBet={canClaimFreeBet}
        onPlaceBet={placeBet}
        onClaimFreeBet={placeFreeBet}
      />
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto -mt-16">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#04e6e0]/10 rounded-full blur-[100px] 
      pointer-events-none opacity-50"></div>

      <div className="-translate-y-10">
        <Coin
          key="game-coin"
          isFlipping={view === 'FLIPPING'}
          result={settledBetResult ? settledBetResult.landedOn : null}
          side={choice ?? 0}
        />
      </div>

      {renderGameView()}
    </div>
  );
}
