import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useWatchContractEvent } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

const Coin = ({ isFlipping, result }: { isFlipping: boolean; result: 'win' | 'lose' | null }) => {
  return (
    <div className="relative w-32 h-32 mb-8 mx-auto">
      <motion.div
        className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center text-4xl shadow-lg"
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
        {!isFlipping && result === 'win' && "😺"}
        {!isFlipping && result === 'lose' && "😿"}
        {(isFlipping || !result) && "🪙"}
      </motion.div>
    </div>
  );
};

export function CoinFlip() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [allowedBets, setAllowedBets] = useState<number[]>([]);
  const [lastProcessedBet, setLastProcessedBet] = useState<bigint | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<number>(0);
  const [pendingBet, setPendingBet] = useState<{
    hasBet: boolean;
    targetBlock: number;
    currentBlock: number;
  } | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Contract configuration
  const CONTRACT_CONFIG = {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
  } as const;

  // Contract writes
  const { writeContract: placeBet, data: placeBetHash } = useWriteContract();
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
      setAllowedBets(allowedBetAmounts.map(n => Number(n) / 1e18));
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
    if (!betDetails || gameResult || isResetting || pendingBet?.hasBet) {
      console.log('Skipping bet details processing:', { 
        hasBetDetails: !!betDetails, 
        gameResult, 
        isResetting,
        hasPendingBet: pendingBet?.hasBet,
        currentTime: Math.floor(Date.now() / 1000),
        lastResetTime
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
      currentTime: Math.floor(Date.now() / 1000)
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
    }
  }, [betDetails, gameResult, pendingBet, lastProcessedBet, isResetting, lastResetTime]);

  // Watch for bet events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'BetPlaced',
    onLogs(logs) {
      const [log] = logs;
      if (log && log.args.player === address) {
        console.log('Bet placed event received:', log.args);
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
        console.log('Bet settled event received for current player:', log.args);
        const won = Boolean(log.args.won);
        console.log('Game result from event:', won ? 'WIN' : 'LOSE');
        
        // Clear states
        setPendingBet(null);
        setIsFlipping(false);
        
        // Set game result and update last processed bet
        setGameResult(won ? 'win' : 'lose');
        
        // Update last processed bet if we have the details
        if (betDetails) {
          const [, , placedAt] = betDetails;
          setLastProcessedBet(placedAt);
        }
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

  const handleBet = async () => {
    if (!selectedAmount) return;
    
    try {
      setIsFlipping(true);
      console.log('Placing bet...');
      await placeBet({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeBet',
        value: parseEther(selectedAmount.toString()),
      });
      console.log('Bet transaction submitted');
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
    
    // Clear all state immediately
    setGameResult(null);
    setSelectedAmount(0);
    setIsFlipping(false);
    setPendingBet(null);
    setLastProcessedBet(null);
    
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

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gray-800">
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gray-800">
        <div className="flex justify-end mb-4">
          <ConnectButton />
        </div>

        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-xl">Connect your wallet to start playing!</p>
          </div>
        ) : gameResult !== null ? (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center py-8"
            >
              <Coin isFlipping={false} result={gameResult} />
              <h2 className="text-6xl font-bold mb-6">
                {gameResult === 'win' ? '🎉 You Won! 🎉' : '😢 You Lost 😢'}
              </h2>
              <button
                onClick={handlePlayAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
              >
                Play Again
              </button>
            </motion.div>
          </AnimatePresence>
        ) : pendingBet?.hasBet ? (
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold mb-4">Pending Bet</h2>
            <Coin isFlipping={true} result={null} />
            <p className="mb-4">
              Target Block: {pendingBet.targetBlock}
              <br />
              Current Block: {pendingBet.currentBlock}
            </p>
            <button
              onClick={handleSettle}
              disabled={isSettleBetLoading || isFlipping}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors ${
                (isSettleBetLoading || isFlipping) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isSettleBetLoading || isFlipping ? 'Revealing...' : 'Reveal Result'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">Choose Your Bet</h2>
            <Coin isFlipping={isFlipping} result={null} />
            <div className="grid grid-cols-2 gap-4">
              {allowedBets.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-4 rounded-lg transition-colors ${
                    selectedAmount === amount
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {amount} HYPE
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={handleBet}
                disabled={!selectedAmount || isPlaceBetLoading || isFlipping}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors ${
                  (!selectedAmount || isPlaceBetLoading || isFlipping) &&
                  'opacity-50 cursor-not-allowed'
                }`}
              >
                {isPlaceBetLoading || isFlipping ? 'Flipping...' : 'Flip Coin'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}