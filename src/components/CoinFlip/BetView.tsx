import React, { useEffect, useState } from 'react';

interface CoinSelectorProps {
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({
    isSelected,
    onClick,
    disabled,
    children 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-full transition-all text-white w-full ${
      isSelected
        ? 'bg-[#04e6e0]/80 text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
        : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

interface BetViewProps {
  selectedChoice: number | null;
  setSelectedChoice: (choice: number) => void;
  selectedAmount: number | null;
  setSelectedAmount: (amount: number) => void;
  isConnected: boolean;
  isPlacingBet: boolean;
  allowedBetAmounts: number[];
  canClaimFreeBet: boolean;
  onPlaceBet: (choice: number, amount: string) => void;
  onClaimFreeBet: (choice: number) => void;
}

export default function BetView({
  selectedChoice,
  setSelectedChoice,
  selectedAmount,
  setSelectedAmount,
  isConnected,
  isPlacingBet,
  allowedBetAmounts,
  canClaimFreeBet,
  onPlaceBet,
  onClaimFreeBet,
}: BetViewProps
) {
  const [canPlaceBet, setCanPlaceBet] = useState(false);

  useEffect(() => {
    if (isPlacingBet) {
      setCanPlaceBet(false);
    } else {
      setCanPlaceBet(isConnected && selectedChoice !== null && selectedAmount !== null);
    }
  }, [isPlacingBet, isConnected, selectedChoice, selectedAmount]);
  
  
  // Handlers
  const handlePlaceBet = () => {
    if (canPlaceBet && selectedChoice !== null && selectedAmount !== null) {
      onPlaceBet(selectedChoice, selectedAmount.toString());
    }
  };
  
  const handleClaimFreeBet = () => {
    if (canClaimFreeBet && selectedChoice !== null) {
      onClaimFreeBet(selectedChoice);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="w-full flex items-center justify-around">
        <div className="flex flex-col justify-center gap-2 w-2/3">
          <div className="flex flex-row justify-start gap-3 font-primary">
            <CoinSelector
              key="heads-selector"
              isSelected={selectedChoice === 0}
              onClick={() => setSelectedChoice(0)}
              disabled={isPlacingBet || !isConnected}
            >
              HEADS
            </CoinSelector>
            <CoinSelector
              key="tails-selector"
              isSelected={selectedChoice === 1}
              onClick={() => setSelectedChoice(1)}
              disabled={isPlacingBet || !isConnected}
            >
              TAILS
            </CoinSelector>
          </div>
        </div>
      </div>

      {/* Free Bet Button */}
      {canClaimFreeBet && (
        <button
          onClick={handleClaimFreeBet}
          disabled={isPlacingBet || !isConnected || selectedChoice === null}
          className="w-full px-4 py-3 bg-green-600/90 text-white rounded-full font-bold hover:bg-green-500 transition-all flex 
          items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(22,163,74,0.4)]"
        >
          <span className="fixed flex items-center font-primary">
            {isPlacingBet ? (
              <>
                <span className="animate-pulse mr-2 w-3 h-3 rounded-full bg-white"></span>
                Processing Free Bet...
              </>
            ) : (
              <>
                Claim Free 0.25 HYPE Bet
                <span className="ml-2 text-xs bg-white text-green-600 px-1 rounded">
                  FREE
                </span>
              </>
            )}
          </span>
        </button>
      )}

      {/* Bet Amount Section */}
      <div>
        <h3 className="text-green font-medium mb-2 text-sm glow-text font-primary">SELECT AMOUNT</h3>
        <div className="grid grid-cols-2 gap-3 w-full font-primary">
          {allowedBetAmounts.map((amount) => (
            <button
              key={amount.toString()}
              onClick={() => setSelectedAmount(amount)}
              className={`px-4 py-3 rounded-full transition-all text-white ${
                selectedAmount === amount
                  ? 'bg-[#04e6e0]/80 text-black font-bold shadow-[0_0_15px_rgba(4,230,224,0.4)]'
                  : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
              } ${
                isPlacingBet || !isConnected
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isPlacingBet || !isConnected}
            >
              {`${amount} HYPE`}
            </button>
          ))}
        </div>
      </div>
      
      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet}
        className={`w-full font-primary py-4 px-6 rounded-full text-lg font-bold transition-all ${
          !canPlaceBet
            ? 'bg-gray-800/60 text-gray-400 cursor-not-allowed border border-gray-700/50'
            : 'bg-[#04e6e0]/80 hover:bg-[#04e6e0] text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
        }`}
      >
        {isPlacingBet ? (
          <span className="flex font-primary items-center justify-center text-white">
            <span className="animate-pulse mr-2 w-3 h-3 rounded-full bg-white"></span>
            Processing...
          </span>
        ) : (
          <span className="text-white">
            Flip!
          </span>
        )}
      </button>
    </div>
  );
} 