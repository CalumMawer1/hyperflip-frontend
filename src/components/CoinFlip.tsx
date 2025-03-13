import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useWatchContractEvent } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';

type BetHistoryItem = {
  result: 'win' | 'lose';
  amount: number;
  timestamp: number;
};

const BetHistory = ({ history }: { history: BetHistoryItem[] }) => {
  console.log('BetHistory render:', history);
  
  if (!history || history.length === 0) {
    return (
      <div className="w-full bg-gray-800/50 p-4 rounded-lg mb-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Recent Flips</h3>
        <p className="text-gray-400">No bets yet. Make your first bet!</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg mb-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3 text-center">Recent Flips</h3>
      <div className="flex justify-center space-x-2">
        {history.map((bet, index) => (
          <div
            key={index}
            className={`flex flex-col items-center p-2 rounded-lg min-w-[80px] ${
              bet.result === 'win' ? 'bg-green-600/20' : 'bg-red-600/20'
            }`}
          >
            <span className="text-2xl mb-1">
              {bet.result === 'win' ? 'H' : 'T'}
            </span>
            <span className="text-sm text-gray-300">{bet.amount} HYPE</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Coin = ({ isFlipping, result, selectedChoice = 0 }: { isFlipping: boolean; result: 'win' | 'lose' | null; selectedChoice?: 0 | 1 }) => {
  return (
    <div className="relative w-32 h-32 mb-8 mx-auto">
      <motion.div
        className={`w-full h-full rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-green-500 ${
          isFlipping ? 'bg-black' : 'bg-black'
        }`}
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
          {!isFlipping && result === 'win' && (
            <span className="text-4xl font-bold text-green-500">H</span>
          )}
          {!isFlipping && result === 'lose' && (
            <span className="text-4xl font-bold text-green-500">T</span>
          )}
          {(isFlipping || !result) && (
            <>
              {isFlipping ? (
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
                    <span className="text-4xl font-bold text-green-500">H</span>
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
                    <span className="text-4xl font-bold text-green-500">T</span>
                  </motion.div>
                </>
              ) : (
                <span className="text-4xl font-bold text-green-500">
                  {selectedChoice === 0 ? 'H' : 'T'}
                </span>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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

  // Save bet history to localStorage whenever it changes
  useEffect(() => {
    console.log('Bet history changed:', betHistory);
    localStorage.setItem('betHistory', JSON.stringify(betHistory));
  }, [betHistory]);

  // Handle hydration mismatch and load bet history
  useEffect(() => {
    setMounted(true);
    
    // Load bet history first
    try {
      const savedHistory = localStorage.getItem('betHistory');
      console.log('Loading saved history from localStorage:', savedHistory);
      
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
      
      // Update bet history here as well
      const newBet: BetHistoryItem = {
        result: playerWon ? 'win' : 'lose',
        amount: Number(amount) / 1e18,
        timestamp: Date.now()
      };
      
      setBetHistory(prev => {
        const newHistory = [newBet, ...prev].slice(0, 10);
        localStorage.setItem('betHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [betDetails, gameResult, pendingBet, lastProcessedBet, isResetting, lastResetTime, betHistory]);

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
        
        // Set game result
        setGameResult(won ? 'win' : 'lose');
        
        // Immediately refetch bet details to ensure we have the latest data
        refetchBetDetails().then(() => {
          if (betDetails) {
            const [amount] = betDetails;
            console.log('Creating new bet history item with amount:', amount.toString());
            
            const newBet: BetHistoryItem = {
              result: won ? 'win' : 'lose',
              amount: Number(amount) / 1e18,
              timestamp: Date.now()
            };
            console.log('New bet history item:', newBet);
            
            setBetHistory(prev => {
              console.log('Previous bet history:', prev);
              const newHistory = [newBet, ...prev].slice(0, 10);
              console.log('New bet history after update:', newHistory);
              
              // Save to localStorage
              try {
                localStorage.setItem('betHistory', JSON.stringify(newHistory));
                console.log('Successfully saved bet history to localStorage');
              } catch (error) {
                console.error('Error saving bet history to localStorage:', error);
              }
              
              return newHistory;
            });
            
            // Update last processed bet
            const [, , placedAt] = betDetails;
            setLastProcessedBet(placedAt);
          } else {
            console.warn('betDetails still not available after refetch');
          }
        }).catch(error => {
          console.error('Error refetching bet details:', error);
        });
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
      const result = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeBet',
        args: [selectedChoice],
        value: parseEther(selectedAmount.toString()),
      });
      console.log('Bet transaction submitted', result);
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

  const CoinSelector = () => (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        onClick={() => setSelectedChoice(0)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          selectedChoice === 0
            ? 'bg-yellow-500 text-black'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Heads
      </button>
      <button
        onClick={() => setSelectedChoice(1)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          selectedChoice === 1
            ? 'bg-yellow-500 text-black'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        Tails
      </button>
    </div>
  );

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
      <div className="w-full max-w-md">
        <BetHistory history={betHistory} />
        <div className="p-6 rounded-lg shadow-lg bg-gray-800">
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
                <Coin isFlipping={false} result={gameResult} selectedChoice={selectedChoice} />
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
              <Coin isFlipping={true} result={null} selectedChoice={selectedChoice} />
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
              <Coin isFlipping={isFlipping} result={null} selectedChoice={selectedChoice} />
              <CoinSelector />
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
    </div>
  );
}