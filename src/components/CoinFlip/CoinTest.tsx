import React, { useState, useEffect } from 'react';
import Coin from './Coin';

export default function CoinTest() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [side, setSide] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFlip = () => {
    // Clear previous result
    setResult(null);
    
    // Start flipping
    setIsFlipping(true);
  };

  const handleStop = (landOn: number) => {
    // Set the result to the selected side
    setResult(landOn);
    
    // Stop flipping after the landing animation completes
    setIsFlipping(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Controls */}
        <div className="bg-gray-800/50 p-6 rounded-lg space-y-4">
          <h2 className="text-2xl font-bold text-[#04e6e0] mb-4">Coin Test Controls</h2>
          
          {/* Side Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Initial Side</label>
            <div className="flex gap-4">
              <button
                onClick={() => setSide(0)}
                disabled={isFlipping}
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                  side === 0
                    ? 'bg-[#04e6e0]/80 text-black'
                    : 'bg-[#04e6e0]/10 text-white hover:bg-[#04e6e0]/20'
                } ${isFlipping ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Heads
              </button>
              <button
                onClick={() => setSide(1)}
                disabled={isFlipping}
                className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
                  side === 1
                    ? 'bg-[#04e6e0]/80 text-black'
                    : 'bg-[#04e6e0]/10 text-white hover:bg-[#04e6e0]/20'
                } ${isFlipping ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Tails
              </button>
            </div>
          </div>

          {/* Flip Button */}
          <button
            onClick={handleFlip}
            disabled={isFlipping && result === null}
            className={`w-full py-3 px-4 rounded-full font-bold transition-all ${
              isFlipping && result === null
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#04e6e0] hover:bg-[#04e6e0]/90 text-black'
            }`}
          >
            {isFlipping && result === null ? 'Flipping...' : 'Start Flipping'}
          </button>

          {/* Landing Controls (only shown when flipping) */}
          {isFlipping && result === null && (
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg space-y-2">
              <p className="text-sm text-gray-300 font-medium">Choose where to land:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleStop(0)}
                  className="flex-1 py-2 px-3 rounded-full bg-green-500/80 hover:bg-green-500 text-white text-sm font-semibold transition-all"
                >
                  Land on Heads
                </button>
                <button
                  onClick={() => handleStop(1)}
                  className="flex-1 py-2 px-3 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all"
                >
                  Land on Tails
                </button>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result !== null && !isFlipping && (
            <div className="text-center font-semibold text-[#04e6e0]">
              Landed on: {result === 0 ? 'Heads' : 'Tails'}
            </div>
          )}
        </div>

        {/* Coin Display */}
        <div className="bg-gray-800/30 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300 mb-4">Coin Preview</h3>
          <Coin
            isFlipping={isFlipping}
            result={result}
            side={side}
            onSpinningComplete={() => {}}
          />
        </div>

        {/* Debug Info */}
        <div className="bg-gray-900/50 p-4 rounded-lg text-xs text-gray-400 font-mono">
          <div>isFlipping: {isFlipping ? 'true' : 'false'}</div>
          <div>initialSide: {side} ({side === 0 ? 'Heads' : 'Tails'})</div>
          <div>result: {result === null ? 'null' : `${result} (${result === 0 ? 'Heads' : 'Tails'})`}</div>
        </div>
      </div>
    </div>
  );
} 
