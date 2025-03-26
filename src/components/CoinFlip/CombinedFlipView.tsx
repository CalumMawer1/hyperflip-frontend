import React, { useEffect, useState } from 'react';
import { useGame } from '../../providers/GameProvider';
import Coin from './Coin';

export default function CombinedFlipView() {
  const {
    isFlipping,
    gameResult,
    selectedChoice,
    pendingBet,
    pendingBetAmount,
    onRevealResults,
    onPlayAgain,
    isSettlePending,
    isReceiptLoading,
    isBetPending,
    isFreeBetPending,
    settleIsRejected,
  } = useGame();

  const [showResult, setShowResult] = useState<boolean>(false);
  const [resultDisplay, setResultDisplay] = useState<number | null>(null); // 0: heads, 1: tails

  const remainingBlocks =
    pendingBet?.currentBlock &&
    pendingBet?.targetBlock &&
    pendingBet.currentBlock < pendingBet.targetBlock
      ? pendingBet.targetBlock - pendingBet.currentBlock
      : 0;
  const canReveal =
    pendingBet?.currentBlock &&
    pendingBet?.targetBlock &&
    pendingBet.currentBlock >= pendingBet.targetBlock;

  // Log state changes for debugging.
  useEffect(() => {
    console.log('[CombinedFlipView] gameResult:', gameResult, 
                'selectedChoice:', selectedChoice, 
                'isFlipping:', isFlipping);
  }, [gameResult, selectedChoice, isFlipping]);

  // determine what it landed on when 
  useEffect(() => {
    if (gameResult) {
      const landedOn = gameResult === 'win' ? (selectedChoice ?? 0) : 1 - (selectedChoice ?? 0);
      console.log('[CombinedFlipView] Computed landedOn:', landedOn);
      setResultDisplay(landedOn);
      if (!isFlipping) {
        setShowResult(true);
        console.log('[CombinedFlipView] Setting showResult to true (gameResult exists, not spinning)');
      }
    } else {
      console.log('[CombinedFlipView] gameResult is null, resetting resultDisplay and showResult');
      setResultDisplay(null);
      setShowResult(false);
    }
  }, [gameResult, selectedChoice, isFlipping]);

  // Ensure that if there is no gameResult (and not spinning) we hide the result UI.
  useEffect(() => {
    if (!isFlipping && !gameResult) {
      console.log('[CombinedFlipView] Not flipping and no gameResult => showResult set to false');
      setShowResult(false);
    }
  }, [isFlipping, gameResult]);

  // Callback from the Coin component when its landing animation completes.
  const handleSpinningComplete = () => {
    console.log('[CombinedFlipView] handleSpinningComplete called, resultDisplay:', resultDisplay);
    if (resultDisplay !== null) {
      setShowResult(true);
      console.log('[CombinedFlipView] showResult set to true via handleSpinningComplete');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto -mt-16">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#04e6e0]/10 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

      {/* Coin Section */}
      <div className="-translate-y-10">
        <Coin
          isFlipping={isFlipping}
          result={resultDisplay}
          side={selectedChoice ?? 0}
          onSpinningComplete={handleSpinningComplete}
        />
      </div>

      {!showResult ? (
        <div className="w-full space-y-6">
          <div className="mb-3 text-3xl font-medium text-[#04e6e0] text-center relative">
            <span className="relative z-10">Your bet: {pendingBetAmount} HYPE</span>
            <div className="absolute -inset-4 bg-[#04e6e0]/5 blur-md rounded-full -z-10"></div>
          </div>
          <div className="w-full max-w-md mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-right text-gray-400">Current Block:</div>
              <div className="text-left font-mono text-white">{pendingBet?.currentBlock?.toString()}</div>
              <div className="text-right text-gray-400">Target Block:</div>
              <div className="text-left font-mono text-white">{pendingBet?.targetBlock?.toString()}</div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#04e6e0]/30 to-transparent my-4"></div>
            <div className="text-center">
              {remainingBlocks > 0 ? (
                <div className="inline-flex items-center text-[#04e6e0]">
                  <div className="animate-pulse mr-2 w-2 h-2 rounded-full bg-[#04e6e0]"></div>
                  <span>Waiting for {remainingBlocks} more blocks...</span>
                  <div className="animate-pulse ml-2 w-2 h-2 rounded-full bg-[#04e6e0]"></div>
                </div>
              ) : pendingBet?.targetBlock ? (
                <div className="text-[#04e6e0] font-semibold flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] mr-2 animate-pulse"></div>
                  Are you ready?
                  <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] ml-2 animate-pulse"></div>
                </div>
              ) : null}
            </div>
          </div>
          {settleIsRejected && (
            <div className="w-full max-w-md mb-4">
              <div className="text-center px-3 py-2">
                <div className="inline-flex items-center justify-center mb-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-amber-400 font-medium text-sm">Settlement Required</span>
                </div>
                <p className="text-white/70 text-xs mb-3 max-w-xs mx-auto">
                  You need to settle your bet to reveal results and claim winnings.
                </p>
                <button 
                  onClick={onRevealResults}
                  className="bg-amber-500/80 hover:bg-amber-500 text-white text-xs font-medium py-1.5 px-6 rounded-full transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          {!settleIsRejected && (
            <div className="relative w-full max-w-xs flex justify-center mx-auto">
              {canReveal && (
                <div className="absolute -inset-2 bg-[#04e6e0]/20 blur-xl rounded-full -z-10"></div>
              )}
              <button
                onClick={onRevealResults}
                disabled={
                  isSettlePending ||
                  remainingBlocks > 0 ||
                  isReceiptLoading || 
                  isBetPending || 
                  isFreeBetPending
                }
                className={`relative w-full py-4 rounded-full font-bold transition-all ${
                  isSettlePending || !canReveal
                    ? 'bg-gray-800/40 cursor-not-allowed text-gray-400 border border-gray-700/50'
                    : 'bg-[#04e6e0] hover:bg-[#04e6e0]/90 text-black'
                }`}
              >
                {isSettlePending ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-pulse mr-2 w-3 h-3 rounded-full bg-white"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    {canReveal && (
                      <span className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span className="absolute h-full w-full rounded-full bg-[#04e6e0]/30"></span>
                      </span>
                    )}
                    <span className="relative z-10">Flip!</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5 text-center relative">
          <h2 className="text-2xl font-semibold text-[#04e6e0] glow-text mb-6">
            It Landed on:{' '}
            <span className={gameResult === 'win' ? 'text-green-500' : 'text-red-500'}>
              {resultDisplay === 0 ? 'Heads' : 'Tails'}
            </span>
          </h2>
          <h2
            className={`text-3xl font-bold ${
              gameResult === 'win' ? 'text-[#04e6e0] glow-text' : 'text-red-500'
            }`}
          >
            {gameResult === 'win'
              ? `You Won ${pendingBetAmount} HYPE!`
              : 'You Lost'}
          </h2>
          <button
            onClick={onPlayAgain}
            className={`relative px-10 py-4 rounded-full font-bold transition-all ${
              isReceiptLoading || isBetPending || isSettlePending || isFreeBetPending
                ? 'bg-gray-800/60 cursor-not-allowed text-gray-400 border border-gray-700'
                : gameResult === 'win'
                ? 'bg-[#04e6e0]/80 hover:bg-[#04e6e0] text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
                : 'bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]'
            }`}
            disabled={isReceiptLoading || isBetPending || isSettlePending || isFreeBetPending}
          >
            {gameResult === 'win' ? 'Keep Flipping!' : 'Double or Nothing?'}
          </button>
        </div>
      )}
    </div>
  );
}
