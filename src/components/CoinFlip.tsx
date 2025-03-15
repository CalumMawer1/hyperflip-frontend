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
  const [lastProcessedBet, setLastProcessedBet] = useState<string | null>(null);
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
  const [showFreeBetModal, setShowFreeBetModal] = useState<boolean>(true);

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
    
    // Check if we need to force a reset (coming from profile page)
    if (typeof window !== 'undefined') {
      const forceReset = sessionStorage.getItem('force_reset') === 'true';
      
      if (forceReset) {
        console.log('Force reset detected, resetting game state completely');
        
        // CRITICAL: Reset ALL game state variables to initial values
        setGameResult(null);
        setSelectedAmount(0);
        setIsFlipping(false);
        setPendingBet(null);
        setPendingBetAmount(null);
        setCurrentBetAmount(null);
        setLastProcessedBet(null);
        setIsResetting(false);
        setLastResetTime(Math.floor(Date.now() / 1000));
        
        // Clear ALL game state from localStorage
        localStorage.removeItem('gameState');
        localStorage.removeItem('gameResult');
        localStorage.removeItem('lastProcessedBet');
        localStorage.removeItem('pendingBetAmount');
        localStorage.removeItem('currentBetAmount');
        
        // Clear the reset flags
        sessionStorage.removeItem('force_reset');
        sessionStorage.removeItem('reset_timestamp');
        
        console.log('Game state completely reset');
      }
      
      // IMPORTANT: We're skipping loading stored game state to ensure a fresh start
      // This prevents the "You won X HYPE" screen from appearing on initial load
      
      // Initialize leaderboard data structure if none exists
      const LEADERBOARD_STORAGE_KEY = 'hyperflip_leaderboard_data';
      const storedDataString = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      
      if (!storedDataString) {
        console.log('No leaderboard data found, initializing empty array');
        // Initialize with empty array
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify([]));
      }
    }
    
    // Load bet history
    if (address) {
      // Load bet history
      try {
        // Use the user's wallet address as part of the key
        const storageKey = `betHistory_${address.toLowerCase()}`;
        const savedHistory = localStorage.getItem(storageKey);
        console.log('Loading saved history from localStorage for address:', address);
        
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          console.log('Parsed history:', parsedHistory);
          
          if (Array.isArray(parsedHistory)) {
            // Only set history if it's different from current state or empty
            // This prevents duplicate entries when navigating back from profile
            setBetHistory(prevHistory => {
              // If we already have history and it matches the first item, don't update
              if (prevHistory.length > 0 && parsedHistory.length > 0 && 
                  JSON.stringify(prevHistory[0]) === JSON.stringify(parsedHistory[0])) {
                console.log('History already loaded, skipping update');
                return prevHistory;
              }
              console.log('Setting bet history from localStorage:', parsedHistory);
              return parsedHistory;
            });
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

  // Add a contract read to check if the user has used their free bet
  const { data: hasUsedFreeBetContract, refetch: refetchUsedFreeBet } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasUsedFreeBet',
    args: address ? [address] : undefined,
  });

  // Add a contract read to check if the user is whitelisted for a free bet
  const { data: isWhitelistedForFreeBet, refetch: refetchWhitelisted } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isWhitelistedForFreeBet',
    args: address ? [address] : undefined,
  });

  // Check for existing settled bets on mount
  useEffect(() => {
    // ALWAYS skip this check to ensure we start on betting interface
    return;
    
    // The code below is disabled to prevent showing win/loss screen on initial load
    /*
    // Skip if we're resetting or already have a game result
    if (isResetting || gameResult !== null) {
      return;
    }

    // Only check bet details if we have them and there's no pending bet
    if (betDetails && !pendingBet?.hasBet) {
      const [amount, blockNumber, placedAt, isSettled, playerWon] = betDetails;
      
      // Only process if this is a settled bet
      if (isSettled) {
        console.log('Found settled bet on mount:', playerWon ? 'WIN' : 'LOSE');
        setGameResult(playerWon ? 'win' : 'lose');
        setLastProcessedBet(placedAt.toString());
      }
    }
    */
  }, [betDetails, gameResult, isResetting, pendingBet, lastResetTime]);

  // Check for free bet eligibility
  useEffect(() => {
    if (!address || !isConnected || !mounted) return;

    // Check if user is eligible for a free bet
    const checkFreeBetEligibility = async () => {
      try {
        console.log('Checking free bet eligibility for address:', address);
        
        // Set initial state to not eligible to prevent flash
        setIsEligibleForFreeBet(false);
        
        // IMPORTANT: First check if this is a new wallet connection
        // If we just connected, we should show the free bet popup
        const isNewConnection = sessionStorage.getItem(`wallet_connected_${address.toLowerCase()}`) !== 'true';
        if (isNewConnection) {
          console.log('New wallet connection detected, checking free bet eligibility');
          sessionStorage.setItem(`wallet_connected_${address.toLowerCase()}`, 'true');
          
          // Clear any dismissed flags to ensure the modal shows up for new connections
          localStorage.removeItem(`freeBet_modal_dismissed_${address.toLowerCase()}`);
          setShowFreeBetModal(true);
        }
        
        // IMPORTANT: First check contract conditions - BOTH must be true:
        // 1. User must be whitelisted for free bet
        // 2. User must NOT have used their free bet
        const isWhitelisted = Boolean(isWhitelistedForFreeBet);
        const hasUsed = Boolean(hasUsedFreeBetContract);
        
        console.log('Contract checks:', { 
          isWhitelisted, 
          hasUsed,
          isWhitelistedRaw: isWhitelistedForFreeBet,
          hasUsedRaw: hasUsedFreeBetContract
        });
        
        if (!isWhitelisted) {
          console.log('User is not whitelisted for a free bet');
          setIsEligibleForFreeBet(false);
          setHasUsedFreeBet(true);
          return;
        }
        
        if (hasUsed) {
          console.log('Contract indicates user has already used their free bet');
          setIsEligibleForFreeBet(false);
          setHasUsedFreeBet(true);
          
          // Also update localStorage to match contract state
          const storageKey = `freeBet_used_${address.toLowerCase()}`;
          localStorage.setItem(storageKey, 'true');
          localStorage.removeItem(`freeBet_eligible_${address.toLowerCase()}`);
          return;
        }
        
        // If we get here, the user is whitelisted and hasn't used their free bet
        console.log('User is eligible for a free bet (whitelisted and not used)');
        setIsEligibleForFreeBet(true);
        setHasUsedFreeBet(false);
        setShowFreeBetModal(true);
        
        // Store eligibility in localStorage to persist across refreshes
        localStorage.setItem(`freeBet_eligible_${address.toLowerCase()}`, 'true');
      } catch (error) {
        console.error('Error checking free bet eligibility:', error);
        setIsEligibleForFreeBet(false);
      }
    };
    
    // Run the check with a delay to ensure contract data is loaded
    const timer = setTimeout(() => {
      checkFreeBetEligibility();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [address, isConnected, mounted, hasUsedFreeBetContract, isWhitelistedForFreeBet]);

  // Show free bet modal if eligible
  useEffect(() => {
    if (isEligibleForFreeBet && !hasUsedFreeBet && !gameResult && !pendingBet?.hasBet) {
      // Show free bet modal after a short delay
      const timer = setTimeout(() => {
        console.log('Showing free bet modal');
        // Set a small amount for the free bet (0.05 HYPE)
        setSelectedAmount(0.25);
        // Do NOT mark as used yet - only mark when they actually place the bet
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isEligibleForFreeBet, hasUsedFreeBet, gameResult, pendingBet]);

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

    // Check if we're navigating back from profile - if so, skip processing
    const isNavigatingBack = sessionStorage.getItem('navigating_from_game') === 'true';
    if (isNavigatingBack) {
      console.log('Detected navigation back from profile, skipping bet processing');
      sessionStorage.removeItem('navigating_from_game');
      return;
    }

    const [amount, blockNumber, placedAt, isSettled, playerWon] = betDetails;
    console.log('Checking historical bet details:', { 
      amount: amount.toString(), 
      blockNumber: blockNumber.toString(), 
      placedAt: placedAt.toString(), 
      isSettled, 
      playerWon,
      lastProcessedBet,
      lastResetTime,
      currentTime: Math.floor(Date.now() / 1000),
      currentBetHistory: betHistory
    });
    
    // Only process if this is a new, settled bet after our last reset
    if (
      isSettled && 
      (!lastProcessedBet || placedAt.toString() !== lastProcessedBet) &&
      Number(placedAt) > lastResetTime
    ) {
      console.log('Setting game result from historical bet:', playerWon ? 'WIN' : 'LOSE');
      setGameResult(playerWon ? 'win' : 'lose');
      setLastProcessedBet(placedAt.toString());
      
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
        // Check if this bet is already in history to prevent duplicates
        const isDuplicate = prev.some(bet => 
          Math.abs(bet.amount - Number(amount) / 1e18) < 0.01 && 
          bet.result === (playerWon ? 'win' : 'lose') &&
          Date.now() - bet.timestamp < 60000
        );
        
        if (isDuplicate) {
          console.log('Detected duplicate bet, skipping history update');
          return prev;
        }
        
        const newHistory = [newBet, ...prev].slice(0, 10);
        console.log('New bet history after update:', newHistory);
        
        // Save to localStorage with address-specific key
        try {
          const storageKey = `betHistory_${address.toLowerCase()}`;
          localStorage.setItem(storageKey, JSON.stringify(newHistory));
          console.log('Successfully saved bet history to localStorage for address:', address);
          
          // Update profile data
          updateLeaderboardData(address, Number(amount) / 1e18, playerWon);
          console.log('Updated profile data for historical bet:', { address, amount: Number(amount) / 1e18, won: playerWon });
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
        
        // ALWAYS set a valid pendingBetAmount to prevent "You won null" issue
        setPendingBetAmount(displayAmount);
        
        // Also store in localStorage as a backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('pendingBetAmount', displayAmount.toString());
          console.log('Stored pendingBetAmount in localStorage:', displayAmount);
        }
        
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
              
              // Update profile data
              updateLeaderboardData(address, displayAmount, won);
              console.log('Updated profile data for bet:', { address, amount: displayAmount, won });
            }
          } catch (error) {
            console.error('Error saving bet history to localStorage:', error);
          }
          
          return newHistory;
        });
        
        // Reset state
        setCurrentBetAmount(null);
        // Don't reset pendingBetAmount here, as it's needed for the win message
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

  // After a free bet is placed, update the usage status
  useEffect(() => {
    if (isPlaceBetSuccess) {
      // Update free bet status directly
      if (address) {
        const storageKey = `freeBet_used_${address.toLowerCase()}`;
        localStorage.setItem(storageKey, 'true');
        setHasUsedFreeBet(true);
        setIsEligibleForFreeBet(false);
        
        // Also remove the eligibility flag
        localStorage.removeItem(`freeBet_eligible_${address.toLowerCase()}`);
      }
    }
  }, [isPlaceBetSuccess, address]);

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

  // Check for dismissed modal flag
  useEffect(() => {
    if (!address) return;
    
    // Check if this is a new wallet connection in this session
    const isNewConnection = sessionStorage.getItem(`wallet_connected_${address.toLowerCase()}`) !== 'true';
    
    if (isNewConnection) {
      // For new connections, always show the modal if eligible
      console.log('New wallet connection detected, showing free bet modal if eligible');
      sessionStorage.setItem(`wallet_connected_${address.toLowerCase()}`, 'true');
      
      // Clear any dismissed flags
      localStorage.removeItem(`freeBet_modal_dismissed_${address.toLowerCase()}`);
      setShowFreeBetModal(true);
    } else {
      // For existing connections, check if the modal was dismissed
      const modalDismissed = localStorage.getItem(`freeBet_modal_dismissed_${address.toLowerCase()}`) === 'true';
      if (modalDismissed) {
        console.log('Modal was previously dismissed, hiding it');
        setShowFreeBetModal(false);
      } else {
        setShowFreeBetModal(true);
      }
    }
  }, [address]);

  // Clear session storage on component unmount
  useEffect(() => {
    return () => {
      if (address) {
        // Clear the session storage when the component unmounts
        sessionStorage.removeItem(`wallet_connected_${address.toLowerCase()}`);
      }
    };
  }, [address]);

  // This function can be called from the console for testing
  // Just type in the browser console: window.resetFreeBetStatus()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use type assertion to avoid TypeScript error
      (window as any).resetFreeBetStatus = () => {
        if (!address) {
          console.log('No wallet connected, cannot reset free bet status');
          return;
        }
        
        console.log('Resetting free bet status for address:', address);
        
        // Clear all free bet related storage
        localStorage.removeItem(`freeBet_used_${address.toLowerCase()}`);
        localStorage.removeItem(`freeBet_eligible_${address.toLowerCase()}`);
        localStorage.removeItem(`freeBet_modal_dismissed_${address.toLowerCase()}`);
        sessionStorage.removeItem(`wallet_connected_${address.toLowerCase()}`);
        
        // Reset state
        setIsEligibleForFreeBet(true);
        setHasUsedFreeBet(false);
        setShowFreeBetModal(true);
        
        console.log('Free bet status reset complete. Refresh the page to see the changes.');
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // Use type assertion to avoid TypeScript error
        (window as any).resetFreeBetStatus = undefined;
      }
    };
  }, [address]);

  // Always clear pendingBetAmount from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any stored pendingBetAmount to prevent "You won null" issue
      localStorage.removeItem('pendingBetAmount');
    }
  }, []);

  // Add a safety check to load pendingBetAmount from localStorage if it's null when gameResult is set
  useEffect(() => {
    if (gameResult && pendingBetAmount === null && typeof window !== 'undefined') {
      // Try to load from localStorage
      const storedAmount = localStorage.getItem('pendingBetAmount');
      if (storedAmount) {
        const amount = parseFloat(storedAmount);
        console.log('Loaded pendingBetAmount from localStorage:', amount);
        setPendingBetAmount(amount);
      } else {
        // Fallback to a default value to prevent "You won null"
        console.log('No pendingBetAmount found in localStorage, using default value');
        setPendingBetAmount(0.25); // Default to smallest bet amount
      }
    }
  }, [gameResult, pendingBetAmount]);

  // CRITICAL: Always reset game state on initial component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('INITIAL MOUNT: Forcing complete game state reset');
      
      // Reset ALL game state variables to initial values
      setGameResult(null);
      setSelectedAmount(0);
      setIsFlipping(false);
      setPendingBet(null);
      setPendingBetAmount(null);
      setCurrentBetAmount(null);
      setLastProcessedBet(null);
      setIsResetting(false);
      setLastResetTime(Math.floor(Date.now() / 1000));
      
      // Clear ALL game state from localStorage
      localStorage.removeItem('gameState');
      localStorage.removeItem('gameResult');
      localStorage.removeItem('lastProcessedBet');
      localStorage.removeItem('pendingBetAmount');
      localStorage.removeItem('currentBetAmount');
      
      console.log('Initial game state reset complete');
    }
  }, []); // Empty dependency array means this runs once on mount

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

  // Handle "Play Again" button click
  const handlePlayAgain = () => {
    console.log('Play Again clicked - resetting game state completely');
    
    // COMPLETE RESET: Reset ALL game state variables to initial values
    setGameResult(null);
    setSelectedAmount(0);
    setIsFlipping(false);
    setPendingBet(null);
    setPendingBetAmount(null);
    setCurrentBetAmount(null);
    setLastProcessedBet(null);
    setIsResetting(false);
    setLastResetTime(Math.floor(Date.now() / 1000));
    
    // Clear ALL game state from localStorage
    localStorage.removeItem('gameState');
    localStorage.removeItem('gameResult');
    localStorage.removeItem('lastProcessedBet');
    localStorage.removeItem('pendingBetAmount');
    localStorage.removeItem('currentBetAmount');
    
    console.log('Game state completely reset for Play Again');
  };

  const handleFreeBet = async () => {
    if (!address || !isConnected) {
      console.log('Wallet not connected');
      return;
    }
    
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
      
      // Mark free bet as used in localStorage
      const storageKey = `freeBet_used_${address.toLowerCase()}`;
      localStorage.setItem(storageKey, 'true');
      setHasUsedFreeBet(true);
      setIsEligibleForFreeBet(false);
      console.log('Marked free bet as used for address:', address);
      
      // Call the contract to place the free bet
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeFreeBet',
        args: [selectedChoice],
      });
      
      console.log('Free bet placed successfully');
      
      // Update the pending bet state
      await refetchPendingBet();
      
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
    
    // Even if the modal is dismissed, we still want to show the banner
    if (!isEligibleForFreeBet || hasUsedFreeBet || !address) return null;
    
    return (
      <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center w-full">
        <p className="font-bold text-lg">🎉 You're eligible for a free bet! 🎉</p>
        <p className="text-sm mt-1 mb-3">Welcome to HyperFlip! You're eligible for a free 0.25 HYPE bet on us!</p>
        <p className="text-sm italic">Select Heads or Tails, then click the green "Claim Free 0.25 HYPE Bet" button below.</p>
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

  // Update profile data when a bet is settled
  const updateLeaderboardData = async (address: string, amount: number, playerWon: boolean) => {
    if (!address) return;
    
    try {
      // Get existing profile data from localStorage
      const PROFILE_STORAGE_KEY = `hyperflip_profile_${address.toLowerCase()}`;
      let profileData = {
        address: address.toLowerCase(),
        totalBets: 0,
        totalWagered: 0,
        totalProfit: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      };
      
      try {
        const storedData = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedData) {
          profileData = JSON.parse(storedData);
        }
      } catch (e) {
        console.error('Error reading profile data from localStorage:', e);
      }
      
      console.log('Current profile data:', profileData);
      
      const normalizedAmount = Number(amount);
      
      // Update player stats
      profileData.totalBets += 1;
      profileData.totalWagered += normalizedAmount;
      
      // Update profit
      if (playerWon) {
        profileData.totalProfit += normalizedAmount;
        profileData.wins += 1;
      } else {
        profileData.totalProfit -= normalizedAmount;
        profileData.losses += 1;
      }
      
      // Calculate win rate
      const totalGames = profileData.wins + profileData.losses;
      profileData.winRate = totalGames > 0 ? Math.round((profileData.wins / totalGames) * 100) : 0;
      
      console.log('Updated profile data:', profileData);
      
      // Save updated data to localStorage
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      console.log('Saved updated profile data to localStorage');
      
      // Also call the API to record the bet (for future database implementation)
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: address.toLowerCase(),
            betAmount: amount,
            playerWon
          })
        });
        
        if (!response.ok) {
          console.warn('API call failed, but localStorage was updated');
        }
      } catch (apiError) {
        console.warn('API call failed, but localStorage was updated:', apiError);
      }
    } catch (error) {
      console.error('Error updating profile data:', error);
    }
  };

  // Handle navigation to profile
  const handleLeaderboardClick = (e: React.MouseEvent) => {
    // Store current game state in localStorage
    localStorage.setItem('gameState', JSON.stringify({
      gameResult,
      selectedAmount,
      isFlipping,
      pendingBet,
      lastProcessedBet,
      lastResetTime
    }));
    
    // Set a flag to indicate we're navigating to prevent duplicate processing
    sessionStorage.setItem('navigating_from_game', 'true');
    
    // Let the navigation proceed
  };

  // Place a bet
  const handlePlaceBet = async () => {
    if (!address || !isConnected) {
      console.log('Wallet not connected');
      return;
    }
    
    if (selectedAmount <= 0) {
      console.log('No amount selected');
      return;
    }
    
    try {
      setIsFlipping(true);
      
      // Convert choice to boolean (0 = heads = false, 1 = tails = true)
      const choiceAsBool = selectedChoice === 1;
      
      // Store the choice for later reference
      setLastPlacedChoice(choiceAsBool);
      
      // Store the bet amount for display in the result screen
      setCurrentBetAmount(selectedAmount);
      setPendingBetAmount(selectedAmount);
      
      // Always use regular bet - free bets are handled by the dedicated button
      console.log('Using regular bet');
      // Call the contract to place the bet
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeBet',
        args: [selectedChoice], // Use selectedChoice directly which is already 0 or 1
        value: parseEther(selectedAmount.toString())
      });
      
      console.log('Bet placed successfully');
      
      // Update the pending bet state
      await refetchPendingBet();
      
    } catch (error) {
      console.error('Error placing bet:', error);
      setIsFlipping(false);
      // Clear pending bet amount on error
      setPendingBetAmount(null);
    }
  };

  // Modify the Place Bet Button to show "Place Free Bet" when appropriate
  // Place Bet Button
  const renderPlaceBetButton = () => {
    // Determine if this is a free bet (0.25 HYPE and eligible)
    const isFreeBet = isEligibleForFreeBet && !hasUsedFreeBet && selectedAmount === 0.25;
    
    return (
      <button
        onClick={handlePlaceBet}
        disabled={isFlipping || !isConnected || !selectedAmount}
        className={`w-full max-w-xs mt-4 py-3 px-6 rounded-lg text-lg font-bold transition-all ${
          isFlipping || !isConnected || !selectedAmount
            ? 'bg-gray-600 cursor-not-allowed'
            : isFreeBet 
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-[#04e6e0] hover:bg-[#04e6e0]/80 text-black'
        }`}
      >
        {isFlipping ? 'Flipping...' : isFreeBet ? 'Place Free Bet' : 'Place Bet'}
      </button>
    );
  };

  // Add a FreeBetModal component
  const FreeBetModal = () => {
    // Only show if eligible and the modal is not dismissed
    if (!isEligibleForFreeBet || hasUsedFreeBet || gameResult || pendingBet?.hasBet || !address || !showFreeBetModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
        <div className="bg-black border-2 border-[#04e6e0] p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#04e6e0] mb-4">🎉 Free Bet Offer! 🎉</h2>
          <p className="text-white mb-2">Welcome to HyperFlip! You're eligible for a free 0.25 HYPE bet on us!</p>
          <p className="text-white mb-6 text-sm italic">Select Heads or Tails, then click the green "Claim Free Bet" button below the coin.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => {
                // Just hide the modal, user will use the dedicated free bet button
                setShowFreeBetModal(false);
                // Store the dismissed state in localStorage
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
                // Just hide the modal without marking the free bet as used
                setShowFreeBetModal(false);
                
                // Store the dismissed state in localStorage
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
      
      {/* Free Bet Modal */}
      <FreeBetModal />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#04e6e0]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="logo-text text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#04e6e0] to-[#03a8a3] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)]">
              HyperFlip
            </h1>
            <Link 
              href="/profile" 
              onClick={handleLeaderboardClick}
              className="text-[#04e6e0] hover:text-[#04e6e0]/80 transition-colors"
            >
              Profile
            </Link>
          </div>
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-2xl mx-auto px-4 pt-24 pb-8">
        {/* Show confetti on win */}
        {gameResult === 'win' && <Confetti {...confettiConfig} />}

        {/* Bet History - Always visible */}
        <div className="w-full">
          <BetHistory history={betHistory} />
        </div>

        {/* Free Bet Banner - Show when eligible */}
        <FreeBetBanner />

        {/* Game State Conditional Rendering */}
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

              {/* Free Bet Button - Only show if eligible */}
              {isEligibleForFreeBet && !hasUsedFreeBet && !isFlipping && isConnected && (
                <button
                  onClick={handleFreeBet}
                  disabled={isFlipping || !isConnected}
                  className="mt-4 w-full max-w-xs px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    {isFlipping ? 'Placing Free Bet...' : 'Claim Free 0.25 HYPE Bet'} <span className="ml-2 text-xs bg-white text-green-600 px-1 rounded">FREE</span>
                  </span>
                </button>
              )}

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
                    {`${Number(amount) / 1e18} HYPE`}
                  </button>
                ))}
              </div>
              
              {/* Place Bet Button */}
              <button
                onClick={handlePlaceBet}
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