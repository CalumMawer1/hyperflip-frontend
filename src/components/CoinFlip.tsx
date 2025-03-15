import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useWatchContractEvent } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';
import Confetti from 'react-confetti';
import Image from 'next/image';
import Link from 'next/link';

// Add CSS for the futuristic background
const backgroundStyles = `
  .futuristic-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #000, #001a1a);
    z-index: -1;
    overflow: hidden;
  }
  
  .futuristic-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 35%, rgba(4, 230, 224, 0.15) 0%, transparent 25%),
      radial-gradient(circle at 80% 10%, rgba(4, 230, 224, 0.1) 0%, transparent 20%);
  }
  
  .grid-lines {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: 
      linear-gradient(rgba(4, 230, 224, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(4, 230, 224, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: perspective(500px) rotateX(60deg);
    animation: gridMove 60s linear infinite;
    opacity: 0.4;
  }
  
  .glow-circle {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(4, 230, 224, 0.2) 0%, transparent 70%);
    filter: blur(20px);
    opacity: 0.5;
    animation: pulse 10s ease-in-out infinite;
  }
  
  .glow-circle:nth-child(1) {
    top: 20%;
    left: 70%;
    animation-delay: 0s;
  }
  
  .glow-circle:nth-child(2) {
    top: 60%;
    left: 30%;
    width: 200px;
    height: 200px;
    animation-delay: -5s;
  }
  
  @keyframes gridMove {
    0% {
      transform: perspective(500px) rotateX(60deg) translateY(0);
    }
    100% {
      transform: perspective(500px) rotateX(60deg) translateY(50px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }
`;

type BetHistoryItem = {
  result: 'win' | 'lose';
  amount: number;
  timestamp: number;
  isFree?: boolean;
  choice: boolean; // false for heads, true for tails (matching contract)
};

// Cat coin SVG component for reuse
const CatCoinSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className}>
    {/* Coin background */}
    <circle cx="100" cy="100" r="95" fill="#000000" />
    
    {/* H letter */}
    <text
      x="100"
      y="115"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#04e6e0"
      fontSize="120"
      fontWeight="bold"
      fontFamily="Arial"
    >
      H
    </text>
  </svg>
);

// Cat tail SVG component for the tails side
const TailCoinSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className}>
    {/* Coin background */}
    <circle cx="100" cy="100" r="95" fill="#000000" />
    
    {/* T letter */}
    <text
      x="100"
      y="115"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#04e6e0"
      fontSize="120"
      fontWeight="bold"
      fontFamily="Arial"
    >
      T
    </text>
  </svg>
);

const BetHistory = ({ history }: { history: BetHistoryItem[] }) => {
  console.log('BetHistory render:', history);
  
  if (!history || history.length === 0) {
    return (
      <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-4 rounded-lg mb-6 text-center">
        <h3 className="text-lg font-semibold mb-2 text-[#04e6e0]">Recent Flips</h3>
        <p className="text-gray-400">No bets yet. Make your first bet!</p>
      </div>
    );
  }

  // Function to normalize bet amounts to exact UI button amounts
  const normalizeAmount = (amount: number): number => {
    // Map contract amounts to exact UI button amounts
    if (amount >= 0.24 && amount < 0.26) return 0.25;
    if (amount >= 0.48 && amount < 0.52) return 0.5;
    if (amount >= 0.97 && amount < 1.03) return 1;
    if (amount >= 1.94 && amount < 2.06) return 2;
    return Math.round(amount); // Round to nearest whole number
  };

  return (
    <div className="w-full bg-black border border-[#04e6e0]/20 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center text-[#04e6e0]">Recent Flips</h3>
      <div className="flex justify-start space-x-2 overflow-x-auto pb-2 px-2 scrollbar-thin scrollbar-thumb-[#04e6e0]/30 scrollbar-track-transparent">
        {history.map((bet, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col items-center p-3 rounded-lg min-w-[90px] ${
                bet.result === 'win' ? 'bg-[#04e6e0]/10 border border-[#04e6e0]/30' : 'bg-red-600/20 border border-red-600/30'
              } ${index === 0 ? 'ml-1' : ''} ${index === history.length - 1 ? 'mr-1' : ''}`}
            >
              <div className="mb-2 h-8 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                  {bet.choice ? <TailCoinSVG className="w-8 h-8" /> : <CatCoinSVG className="w-8 h-8" />}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-[#04e6e0]">
                  {normalizeAmount(bet.amount)} HYPE
                </span>
                {bet.isFree && <span className="text-xs block text-green-400">(Free)</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Coin = ({ isFlipping, result, selectedChoice = 0 }: { isFlipping: boolean; result: 'win' | 'lose' | null; selectedChoice?: 0 | 1 }) => {
  // Convert numeric choice to boolean to match contract (0 = heads/false, 1 = tails/true)
  const choiceAsBool = selectedChoice === 1;
  
  // Only show red border for losses, use theme color for everything else (including null result and wins)
  const borderColorClass = result === 'lose' ? 'border-red-600' : 'border-[#04e6e0]';
  
  // Cat coin for heads
  const CatCoin = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[200px] h-[200px] flex items-center justify-center relative overflow-hidden rounded-full">
        <CatCoinSVG className="w-full h-full" />
      </div>
    </div>
  );
  
  // Tail coin for tails
  const TailCoin = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[95%] h-[95%] flex items-center justify-center relative overflow-hidden">
        <TailCoinSVG className="w-full h-full" />
      </div>
    </div>
  );
  
  return (
    <div className="relative w-32 h-32 mb-2 mx-auto">
      <motion.div
        className={`w-full h-full rounded-full flex items-center justify-center text-4xl shadow-lg border-4 ${borderColorClass} bg-black`}
        animate={{
          rotateX: isFlipping ? [0, 720, 1440, 2160, 2880] : 0,
          scale: isFlipping ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: isFlipping ? 2 : 0.5,
          repeat: isFlipping ? Infinity : 0,
          ease: "linear"
        }}
      >
        <div className="flex flex-col items-center justify-center w-full h-full relative">
          {!isFlipping && result !== null && (
            <>
              {choiceAsBool === false ? (
                <CatCoin />
              ) : (
                <TailCoin />
              )}
            </>
          )}
          {isFlipping && (
            <>
              <motion.div
                className="absolute w-full h-full flex items-center justify-center"
                animate={{
                  opacity: isFlipping ? [1, 0, 1, 0, 1] : 1,
                }}
                transition={{
                  duration: isFlipping ? 2 : 0.5,
                  repeat: isFlipping ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <CatCoin />
              </motion.div>
              <motion.div
                className="absolute w-full h-full flex items-center justify-center"
                animate={{
                  opacity: isFlipping ? [0, 1, 0, 1, 0] : 0,
                }}
                transition={{
                  duration: isFlipping ? 2 : 0.5,
                  repeat: isFlipping ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <TailCoin />
              </motion.div>
            </>
          )}
          {!isFlipping && result === null && (
            <>
              {choiceAsBool === false ? (
                <CatCoin />
              ) : (
                <TailCoin />
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface CoinSelectorProps {
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

const CoinSelector = ({ isSelected, onClick, disabled, children }: CoinSelectorProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-lg font-semibold transition-all text-white ${
      isSelected
        ? 'bg-[#04e6e0] text-black'
        : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

export function CoinFlip() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<0 | 1>(0); // 0 for heads, 1 for tails
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [allowedBets, setAllowedBets] = useState<number[]>([]);
  const [lastProcessedBet, setLastProcessedBet] = useState<bigint | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [pendingBet, setPendingBet] = useState<{
    hasBet: boolean;
    targetBlock: number;
    currentBlock: number;
  } | null>(null);
  const [isEligibleForFreeBet, setIsEligibleForFreeBet] = useState<boolean>(false);
  const [hasUsedFreeBet, setHasUsedFreeBet] = useState<boolean>(false);
  const [originalBetAmounts, setOriginalBetAmounts] = useState<Record<string, number>>({});
  const [currentBetAmount, setCurrentBetAmount] = useState<number | null>(null);
  const [pendingBetAmount, setPendingBetAmount] = useState<number | null>(null);
  const [lastPlacedChoice, setLastPlacedChoice] = useState<boolean | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Add the background styles to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = backgroundStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Save bet history to localStorage whenever it changes
  useEffect(() => {
    if (!address || !betHistory.length) return;
    
    console.log('Saving bet history to localStorage:', betHistory);
    
    // Use the user's wallet address as part of the key to keep histories separate for different users
    const storageKey = `betHistory_${address.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(betHistory));
  }, [betHistory, address]);

  // Handle hydration mismatch and load bet history
  useEffect(() => {
    setMounted(true);
    
    // Only load history if we have an address
    if (address) {
      // Load bet history first
      try {
        // Use the user's wallet address as part of the key
        const storageKey = `betHistory_${address.toLowerCase()}`;
        const savedHistory = localStorage.getItem(storageKey);
        console.log('Loading saved history from localStorage for address:', address);
        
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          console.log('Parsed history:', parsedHistory);
          
          if (Array.isArray(parsedHistory)) {
            console.log('Setting bet history from localStorage:', parsedHistory);
            setBetHistory(parsedHistory);
          } else {
            console.log('Saved history is not an array, initializing empty history');
            setBetHistory([]);
          }
        } else {
          console.log('No saved history found, initializing empty history');
          setBetHistory([]);
        }
      } catch (error) {
        console.error('Error loading bet history:', error);
        setBetHistory([]);
      }
    }
    
    // Reset game state on mount
    setGameResult(null);
    setSelectedAmount(0);
    setIsFlipping(false);
    setPendingBet(null);
    setLastProcessedBet(null);
    setIsResetting(false);
    setLastResetTime(Math.floor(Date.now() / 1000));
    
    // Clear any game state from localStorage
    localStorage.removeItem('lastProcessedBet');
    localStorage.removeItem('gameResult');
  }, [address]);

  // Get allowed bet amounts
  const { data: allowedBetAmounts } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllowedBetAmounts',
  });

  // Check for pending bets
  const { data: hasPendingBet, refetch: refetchPendingBet } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasPendingBet',
    args: address ? [address] : undefined,
  });

  // Get bet details
  const { data: betDetails, refetch: refetchBetDetails } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBetDetails',
    args: address ? [address] : undefined,
  });

  // Check for existing settled bets on mount
  useEffect(() => {
    // Skip if we're resetting or already have a game result
    if (isResetting || gameResult !== null) {
      return;
    }

    // Only check bet details if we have them and there's no pending bet
    if (betDetails && !pendingBet?.hasBet) {
      const [amount, blockNumber, placedAt, isSettled, playerWon] = betDetails;
      console.log('Checking initial bet state:', {
        amount: amount.toString(),
        blockNumber: blockNumber.toString(),
        placedAt: placedAt.toString(),
        isSettled,
        playerWon,
        isResetting,
        gameResult,
        lastResetTime
      });
      
      if (isSettled && Number(placedAt) > lastResetTime) {
        console.log('Found settled bet on mount:', playerWon ? 'WIN' : 'LOSE');
        setGameResult(playerWon ? 'win' : 'lose');
        setLastProcessedBet(placedAt);
      }
    }
  }, [betDetails, gameResult, isResetting, pendingBet, lastResetTime]);

  // Check if user is eligible for a free bet
  const { data: freeBetEligibility, refetch: refetchFreeBetEligibility } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isWhitelistedForFreeBet',
    args: address ? [address] : undefined,
  });

  // Check if user has already used their free bet
  const { data: usedFreeBet, refetch: refetchUsedFreeBet } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasUsedFreeBet',
    args: address ? [address] : undefined,
  });

  // Update eligibility state when data changes
  useEffect(() => {
    console.log('Free bet whitelist check:', { address, freeBetEligibility });
    console.log('Has used free bet check:', { address, usedFreeBet });
    
    if (freeBetEligibility !== undefined) {
      setIsEligibleForFreeBet(!!freeBetEligibility);
    }
    
    if (usedFreeBet !== undefined) {
      setHasUsedFreeBet(!!usedFreeBet);
    }
  }, [freeBetEligibility, usedFreeBet, address]);

  // Refetch free bet eligibility and usage periodically
  useEffect(() => {
    if (isConnected && address) {
      // Initial check
      refetchFreeBetEligibility();
      refetchUsedFreeBet();
      
      const interval = setInterval(() => {
        refetchFreeBetEligibility();
        refetchUsedFreeBet();
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refetchFreeBetEligibility, refetchUsedFreeBet]);

  // Contract writes
  const { writeContract, data: placeBetHash } = useWriteContract();
  const { writeContract: settleBet, data: settleBetHash } = useWriteContract();

  // Watch transaction status
  const { isLoading: isPlaceBetLoading, isSuccess: isPlaceBetSuccess } = useWaitForTransactionReceipt({
    hash: placeBetHash,
  });

  const { isLoading: isSettleBetLoading, isSuccess: isSettleBetSuccess } = useWaitForTransactionReceipt({
    hash: settleBetHash,
  });

  // Stop flipping animation when transaction is successful
  useEffect(() => {
    if (isPlaceBetSuccess) {
      setIsFlipping(false);
      refetchPendingBet();
    }
  }, [isPlaceBetSuccess, refetchPendingBet]);

  // Stop flipping animation when settle is successful
  useEffect(() => {
    if (isSettleBetSuccess) {
      console.log('Settle transaction confirmed, waiting for event...');
      setIsFlipping(false);
      
      // Force immediate refetch of contract state
      refetchPendingBet();
      refetchBetDetails();
    }
  }, [isSettleBetSuccess, refetchPendingBet, refetchBetDetails]);

  // Update allowed bets when contract data changes
  useEffect(() => {
    if (allowedBetAmounts) {
      // Convert bigint array to number array
      const amounts = Array.from(allowedBetAmounts).map(n => BigInt(n));
      setAllowedBets(amounts as unknown as number[]);
    }
  }, [allowedBetAmounts]);

  // Refetch pending bet status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingBet?.hasBet && !gameResult) {  // Only refetch if there's no game result
        refetchPendingBet();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [pendingBet?.hasBet, refetchPendingBet, gameResult]);

  // Update pending bet status
  useEffect(() => {
    if (!hasPendingBet) return;

    const [hasBet, targetBlock, currentBlock] = hasPendingBet;
    console.log('Pending bet status:', { hasBet, targetBlock, currentBlock });
    
    setPendingBet({ 
      hasBet, 
      targetBlock: Number(targetBlock), 
      currentBlock: Number(currentBlock) 
    });
    
    // If bet was just settled (hasBet is false) and we don't have a result yet
    if (!hasBet && !gameResult) {
      setIsFlipping(false);
    }
  }, [hasPendingBet, gameResult]);

  // Handle bet result - now only processes historical bets
  useEffect(() => {
    if (!betDetails || gameResult || isResetting || pendingBet?.hasBet || !address) {
      console.log('Skipping bet details processing:', { 
        hasBetDetails: !!betDetails, 
        gameResult, 
        isResetting,
        hasPendingBet: pendingBet?.hasBet,
        hasAddress: !!address,
        currentTime: Math.floor(Date.now() / 1000),
        lastResetTime,
        betHistory
      });
      return;
    }

    const [amount, blockNumber, placedAt, isSettled, playerWon] = betDetails;
    console.log('Checking historical bet details:', { 
      amount: amount.toString(), 
      blockNumber: blockNumber.toString(), 
      placedAt: placedAt.toString(), 
      isSettled, 
      playerWon,
      lastProcessedBet: lastProcessedBet?.toString(),
      lastResetTime,
      currentTime: Math.floor(Date.now() / 1000),
      currentBetHistory: betHistory
    });
    
    // Only process if this is a new, settled bet after our last reset
    if (
      isSettled && 
      (!lastProcessedBet || placedAt !== lastProcessedBet) &&
      Number(placedAt) > lastResetTime
    ) {
      console.log('Setting game result from historical bet:', playerWon ? 'WIN' : 'LOSE');
      setGameResult(playerWon ? 'win' : 'lose');
      setLastProcessedBet(placedAt);
      
      // Convert numeric choice to boolean (false for heads, true for tails)
      const choiceAsBool = selectedChoice === 1;
      console.log('Using current choice for historical bet:', { selectedChoice, choiceAsBool });
      
      // Update bet history here as well
      const newBet: BetHistoryItem = {
        result: playerWon ? 'win' : 'lose',
        amount: Number(amount) / 1e18,
        timestamp: Date.now(),
        // We don't know the choice for historical bets, so we'll use the current choice as a best guess
        choice: choiceAsBool
      };
      
      setBetHistory(prev => {
        const newHistory = [newBet, ...prev].slice(0, 10);
        console.log('New bet history after update:', newHistory);
        
        // Save to localStorage with address-specific key
        try {
          const storageKey = `betHistory_${address.toLowerCase()}`;
          localStorage.setItem(storageKey, JSON.stringify(newHistory));
          console.log('Successfully saved bet history to localStorage for address:', address);
        } catch (error) {
          console.error('Error saving bet history to localStorage:', error);
        }
        
        return newHistory;
      });
    }
  }, [betDetails, gameResult, pendingBet, lastProcessedBet, isResetting, lastResetTime, betHistory, selectedChoice, address]);

  // Watch for bet events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'BetPlaced',
    onLogs(logs) {
      const [log] = logs;
      if (log && log.args.player === address) {
        console.log('Bet placed event received:', log.args);
        
        // Store the original bet amount for later use in history
        const betAmount = Number(log.args.amount) / 1e18;
        const blockNumber = Number(log.args.blockNumber);
        
        setOriginalBetAmounts(prev => ({
          ...prev,
          [blockNumber.toString()]: betAmount
        }));
        
        // Store the current choice for later use when the bet is settled
        const choiceAsBool = selectedChoice === 1;
        console.log('Storing choice for later use:', { selectedChoice, choiceAsBool });
        setLastPlacedChoice(choiceAsBool);
        
        setIsFlipping(false);
        setSelectedAmount(0);
        refetchPendingBet();
      }
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'BetSettled',
    onLogs(logs) {
      console.log('BetSettled event logs received:', logs);
      const [log] = logs;
      if (log && log.args.player === address) {
        console.log('Bet settled event received:', log.args);
        
        // Extract event data
        const contractAmount = Number(log.args.amount) / 1e18;
        const won = Boolean(log.args.won);
        
        console.log('Contract amount from event:', contractAmount);
        console.log('Won from event:', won);
        console.log('Current selectedChoice:', selectedChoice);
        console.log('Last placed choice:', lastPlacedChoice);
        
        // ALWAYS use the exact UI button amounts
        let displayAmount: number;
        let isFree = false;
        
        // Determine which button amount this corresponds to
        if (contractAmount >= 0.24 && contractAmount < 0.26) {
          displayAmount = 0.25;
          // Free bet detection
          isFree = contractAmount < 0.25;
        }
        else if (contractAmount >= 0.48 && contractAmount < 0.52) displayAmount = 0.5;
        else if (contractAmount >= 0.97 && contractAmount < 1.03) displayAmount = 1;
        else if (contractAmount >= 1.94 && contractAmount < 2.06) displayAmount = 2;
        else displayAmount = Math.round(contractAmount); // Round to nearest whole number
        
        console.log('Using exact UI button amount for history:', displayAmount);
        
        // Set game result
        setGameResult(won ? 'win' : 'lose');
        setIsFlipping(false);
        
        // Use the stored choice if available, otherwise fallback to selectedChoice
        const choiceAsBool = lastPlacedChoice !== null ? lastPlacedChoice : selectedChoice === 1;
        console.log('Using choice for bet history:', { selectedChoice, lastPlacedChoice, choiceAsBool });
        
        // Store the display amount for the win message
        setPendingBetAmount(displayAmount);
        
        // Create bet history item
        const newBet: BetHistoryItem = {
          result: won ? 'win' : 'lose',
          amount: displayAmount,
          timestamp: Date.now(),
          isFree: isFree,
          choice: choiceAsBool
        };
        
        setBetHistory(prev => {
          console.log('Previous bet history:', prev);
          const newHistory = [newBet, ...prev].slice(0, 10);
          console.log('New bet history after update:', newHistory);
          
          // Save to localStorage with address-specific key
          try {
            // Make sure address is defined before using it
            if (address) {
              const storageKey = `betHistory_${address.toLowerCase()}`;
              localStorage.setItem(storageKey, JSON.stringify(newHistory));
              console.log('Successfully saved bet history to localStorage for address:', address);
            }
          } catch (error) {
            console.error('Error saving bet history to localStorage:', error);
          }
          
          return newHistory;
        });
        
        // Reset state
        setCurrentBetAmount(null);
        setPendingBetAmount(null);
        setPendingBet(null);
        setLastPlacedChoice(null); // Clear the stored choice
      }
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'BetRefunded',
    onLogs(logs) {
      console.log('BetRefunded event logs received:', logs);
      const [log] = logs;
      if (log && log.args.player === address) {
        console.log('Bet refunded event received:', log.args);
        setIsFlipping(false);
        setGameResult(null);
        setPendingBet(null);
        refetchPendingBet();
        alert(`Bet refunded: ${log.args.reason}`);
      }
    },
  });

  // After a free bet is placed, refetch the usage status
  useEffect(() => {
    if (isPlaceBetSuccess) {
      refetchUsedFreeBet();
    }
  }, [isPlaceBetSuccess, refetchUsedFreeBet]);

  // Update window size on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBet = async () => {
    if (!selectedAmount) return;
    try {
      setIsFlipping(true);
      console.log('Placing bet with amount:', selectedAmount);
      
      // Store the exact amount the user selected
      setPendingBetAmount(selectedAmount);
      console.log('Stored pending bet amount:', selectedAmount);
      
      // Store the current choice for later use when the bet is settled
      const choiceAsBool = selectedChoice === 1;
      console.log('Storing choice for later use:', { selectedChoice, choiceAsBool });
      setLastPlacedChoice(choiceAsBool);
      
      // The contract expects uint8 (0 for heads, 1 for tails)
      // selectedChoice is already 0 or 1, so we can use it directly
      console.log('Placing bet with choice:', selectedChoice);
      
      // Check if eligible for free bet and hasn't used it yet
      if (isEligibleForFreeBet && !hasUsedFreeBet && selectedAmount === 0.25) {
        console.log('Using free bet');
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'placeFreeBet',
          args: [selectedChoice],
        });
      } else {
        console.log('Using regular bet');
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'placeBet',
          args: [selectedChoice],
          value: parseEther(selectedAmount.toString()),
        });
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      setIsFlipping(false);
    }
  };

  const handleSettle = async () => {
    try {
      setIsFlipping(true);
      console.log('Starting settle transaction...');
      
      // Clear any existing game result before settling
      setGameResult(null);
      
      await settleBet({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'settleBet',
      });
      
      console.log('Settle transaction submitted, waiting for confirmation...');
    } catch (error) {
      console.error('Error settling bet:', error);
      setIsFlipping(false);
    }
  };

  const handlePlayAgain = async () => {
    console.log('Resetting game state');
    
    // Set resetting flag to prevent processing old bet details
    setIsResetting(true);
    
    // Update reset timestamp first
    const currentTime = Math.floor(Date.now() / 1000);
    setLastResetTime(currentTime);
    console.log('Setting reset time to:', currentTime);
    
    // Clear game state but preserve bet history
    setGameResult(null);
    setSelectedAmount(0);
    setIsFlipping(false);
    setPendingBet(null);
    setLastProcessedBet(null);
    setCurrentBetAmount(null);
    setPendingBetAmount(null);
    setLastPlacedChoice(null); // Reset the stored choice
    
    try {
      // Force refetch of all contract state
      await Promise.all([
        refetchPendingBet(),
        refetchBetDetails()
      ]);
      
      // Longer delay to ensure state updates have propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear resetting flag after everything is done
      setIsResetting(false);
      console.log('Game state reset complete');
    } catch (error) {
      console.error('Error resetting game state:', error);
      // Clear resetting flag even on error
      setIsResetting(false);
    }
  };

  const handleFreeBet = async () => {
    try {
      setIsFlipping(true);
      console.log('Placing free bet...');
      
      // Store the free bet amount (always 0.25)
      setPendingBetAmount(0.25);
      console.log('Stored pending free bet amount: 0.25');
      
      // Store the current choice for later use when the bet is settled
      const choiceAsBool = selectedChoice === 1;
      console.log('Storing choice for free bet:', { selectedChoice, choiceAsBool });
      setLastPlacedChoice(choiceAsBool);
      
      const result = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeFreeBet',
        args: [selectedChoice],
      });
      console.log('Free bet transaction submitted', result);
      
      // Immediately refetch to update the UI
      refetchUsedFreeBet();
      
      // Also refetch pending bet status
      refetchPendingBet();
    } catch (error) {
      console.error('Error placing free bet:', error);
      setIsFlipping(false);
      // Clear pending bet amount on error
      setPendingBetAmount(null);
    }
  };

  // Add this component for the free bet banner
  const FreeBetBanner = () => {
    console.log('Rendering FreeBetBanner, isEligibleForFreeBet:', isEligibleForFreeBet, 'hasUsedFreeBet:', hasUsedFreeBet);
    
    if (!isEligibleForFreeBet || hasUsedFreeBet) return null;
    
    return (
      <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center animate-pulse w-full">
        <p className="font-bold text-lg">ðŸŽ‰ You're eligible for a free bet! ðŸŽ‰</p>
        <p className="text-sm mt-1">Click the green button below to use your free 0.25 HYPE bet</p>
      </div>
    );
  };

  // Update confetti settings for a more exciting effect
  const confettiConfig = {
    width: windowSize.width,
    height: windowSize.height,
    recycle: false,
    numberOfPieces: 800,
    gravity: 0.3,
    colors: ['#FFD700', '#FFA500', '#FF4500', '#9370DB', '#00BFFF', '#32CD32'],
    tweenDuration: 5000
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
        <div className="futuristic-background">
          <div className="grid-lines"></div>
          <div className="glow-circle"></div>
          <div className="glow-circle"></div>
        </div>
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-black border border-[#04e6e0]/20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="futuristic-background">
        <div className="grid-lines"></div>
        <div className="glow-circle"></div>
        <div className="glow-circle"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="logo-text text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#04e6e0] to-[#03a8a3] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)]">
          HyperFlip
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <Link href="/leaderboard" className="text-[#04e6e0] hover:text-white transition-colors font-semibold text-lg">
          Leaderboard
        </Link>
      </div>

      {/* X Logo Link */}
      <a 
        href="https://x.com/HyperFlipEVM" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute bottom-6 left-6 z-10 hover:opacity-80 transition-opacity"
        aria-label="Follow us on X"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="#04e6e0"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Wallet Connect */}
      <div className="absolute top-6 right-6 z-10">
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-2xl mx-auto px-4 pt-24 pb-8">
        {/* Show confetti on win */}
        {gameResult === 'win' && <Confetti {...confettiConfig} />}

        {/* Bet History - Always visible */}
        <div className="w-full">
          <BetHistory history={betHistory} />
        </div>

        {gameResult ? (
          // Win/Loss Screen
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48">
                <Coin isFlipping={isFlipping} result={gameResult} selectedChoice={selectedChoice} />
              </div>
              <div className="space-y-4">
                <h2 className={`text-3xl font-bold ${gameResult === 'win' ? 'text-[#04e6e0]' : 'text-red-500'}`}>
                  {gameResult === 'win' ? `You Won ${pendingBetAmount} HYPE!` : 'You Lost'}
                </h2>
                <button
                  onClick={handlePlayAgain}
                  className="px-8 py-3 bg-[#04e6e0] text-black rounded-lg font-bold hover:bg-[#04e6e0]/80 transition-all"
                >
                  {gameResult === 'win' ? 'Keep Flipping!' : 'Double or Nothing?'}
                </button>
              </div>
            </div>
          </div>
        ) : pendingBet?.hasBet ? (
          // Reveal Results Page
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48">
                <Coin isFlipping={isFlipping} result={gameResult} selectedChoice={selectedChoice} />
              </div>
              <div className="space-y-4">
                <div className="text-gray-300 space-y-2">
                  <p>Current Block: {pendingBet?.currentBlock}</p>
                  <p>Target Block: {pendingBet?.targetBlock}</p>
                  <p className="text-sm text-gray-400">
                    {pendingBet?.currentBlock && pendingBet?.targetBlock && pendingBet.currentBlock < pendingBet.targetBlock
                      ? `Waiting for ${pendingBet.targetBlock - pendingBet.currentBlock} more blocks...`
                      : 'Ready to reveal!'}
                  </p>
                </div>
                <button
                  onClick={handleSettle}
                  disabled={isFlipping || (!!pendingBet?.currentBlock && !!pendingBet?.targetBlock && pendingBet.currentBlock < pendingBet.targetBlock)}
                  className={`px-8 py-3 rounded-lg font-bold transition-all ${
                    isFlipping || (!!pendingBet?.currentBlock && !!pendingBet?.targetBlock && pendingBet.currentBlock < pendingBet.targetBlock)
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#04e6e0] hover:bg-[#04e6e0]/80 text-black'
                  }`}
                >
                  {isFlipping ? 'Revealing...' : 'Reveal Results'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Betting Interface
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="flex flex-col items-center space-y-1">
              {/* Coin Display */}
              <div className="relative w-48 h-48">
                <Coin isFlipping={isFlipping} result={gameResult} selectedChoice={selectedChoice} />
              </div>

              {/* Choice Selection */}
              <div className="flex justify-center gap-3 w-full max-w-xs">
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

              {/* Bet Amount Selection */}
              <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-xs">
                {allowedBets.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(Number(amount) / 1e18)}
                    className={`px-4 py-2 rounded-lg transition-all text-white ${
                      selectedAmount === Number(amount) / 1e18
                        ? 'bg-[#04e6e0] text-black font-bold'
                        : 'bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 text-white'
                    } ${isFlipping || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isFlipping || !isConnected}
                  >
                    {Number(amount) / 1e18} HYPE
                  </button>
                ))}
              </div>

              {/* Place Bet Button */}
              <button
                onClick={handleBet}
                disabled={isFlipping || !isConnected || !selectedAmount}
                className={`w-full max-w-xs mt-4 py-3 px-6 rounded-lg text-lg font-bold transition-all ${
                  isFlipping || !isConnected || !selectedAmount
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#04e6e0] hover:bg-[#04e6e0]/80 text-black'
                }`}
              >
                {isFlipping ? 'Flipping...' : 'Place Bet'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>
        {backgroundStyles}
      </style>
    </div>
  );
}