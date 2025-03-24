import React from 'react';
import { useGame } from '../../providers/GameProvider';
import Coin from './Coin';


interface CoinSelectorProps {
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}


const CoinSelector: React.FC<CoinSelectorProps> = ({isSelected, onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-full font-semibold transition-all text-white w-full ${
      isSelected
        ? 'bg-[#04e6e0]/80 text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
        : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);


export default function BettingView() {
  const {
    selectedChoice,
    setSelectedChoice,
    selectedAmount,
    setSelectedAmount,
    isFlipping,
    gameResult,
    allowedBetAmounts,
    isWhitelisted,
    hasUsedFreeBet,
    onPlaceBet,
    onClaimFreeBet,
    isBetPending,
    isFreeBetPending,
    isReceiptLoading,
    isSettlePending,
    isConnected,
    betTxHash,
    pendingBet,
  } = useGame();

  return (
    <div className="flex flex-col items-center justify-start space-y-0 pt-0 w-full max-w-md mx-auto">
      {/* Coin Display */}
      <div className={`-mt-0 mb-0 ${!isFlipping ? "hover-animation" : ""}`} style={{ transformStyle: 'preserve-3d', zIndex: "-1" }}>
        <Coin
          isFlipping={false}
          result={gameResult}
          selectedChoice={selectedChoice}
        />
      </div>
      
      <div className="space-y-5 w-full">
        {/* Choice Selection */}
        <div className="w-full flex items-center justify-around">
        <div className="flex flex-col justify-center gap-2 w-2/3">
          <div className="flex flex-row justify-start gap-3">
            <CoinSelector
              isSelected={selectedChoice === 0}
              onClick={() => setSelectedChoice(0)}
              disabled={isFlipping || !isConnected}
            >
              Heads
            </CoinSelector>
            <CoinSelector
              isSelected={selectedChoice === 1}
              onClick={() => setSelectedChoice(1)}
              disabled={isFlipping || !isConnected}
            >
              Tails
            </CoinSelector>
          </div>
        </div>
        </div>

        {/* Free Bet Button */}
        {hasUsedFreeBet === false && isWhitelisted === true && !isFlipping && (
          <button
            onClick={onClaimFreeBet}
            disabled={
              isFlipping || 
              isFreeBetPending || 
              isReceiptLoading || 
              isBetPending || 
              isSettlePending || 
              (pendingBet?.hasBet === true)
            }
            className="w-full px-4 py-3 bg-green-600/90 text-white rounded-full font-bold hover:bg-green-500 transition-all flex 
            items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(22,163,74,0.4)]"
          >
            <span className="flex items-center">
              {isFreeBetPending ? (
                <>
                  <span className="animate-pulse mr-2 w-3 h-3 rounded-full bg-white"></span>
                  Processing Free Bet...
                </>
              ) : isFlipping ? (
                'Placing Free Bet...'
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
          <h3 className="text-[#04e6e0] font-medium mb-2 text-sm glow-text">SELECT AMOUNT</h3>
          <div className="grid grid-cols-2 gap-3 w-full">
            {allowedBetAmounts.map((amount) => (
              <button
                key={amount.toString()}
                onClick={() => setSelectedAmount(Number(amount) / 1e18)}
                className={`px-4 py-3 rounded-full transition-all text-white ${
                  selectedAmount === Number(amount) / 1e18
                    ? 'bg-[#04e6e0]/80 text-black font-bold shadow-[0_0_15px_rgba(4,230,224,0.4)]'
                    : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
                } ${
                  isFlipping || !isConnected
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={isFlipping || !isConnected}
              >
                {`${Number(amount) / 1e18} HYPE`}
              </button>
            ))}
          </div>
        </div>
        
        {/* Place Bet Button */}
        <button
          onClick={onPlaceBet}
          disabled={
            isFlipping || 
            !isConnected || 
            !selectedAmount || 
            isBetPending || 
            isFreeBetPending || 
            isReceiptLoading || 
            isSettlePending ||
            (pendingBet?.hasBet === true)
          }
          className={`w-full py-4 px-6 rounded-full text-lg font-bold transition-all ${
            isFlipping || !isConnected || !selectedAmount || isBetPending
              ? 'bg-gray-800/60 text-gray-400 cursor-not-allowed border border-gray-700/50'
              : 'bg-[#04e6e0]/80 hover:bg-[#04e6e0] text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
          }`}
        >
          {isBetPending && !betTxHash ? (
            <span className="flex items-center justify-center">
              <span className="animate-pulse mr-2 w-3 h-3 rounded-full bg-white"></span>
              Processing...
            </span>
          ) : isFlipping ? (
            'Flipping...'
          ) : (
            'Place Bet'
          )}
        </button>
      </div>
    </div>
  );
}