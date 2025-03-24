import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useContractHandler } from '../hooks/useContractHandler';
import { Address } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';


const STORAGE_KEY = 'recorded_bets';

// Move the localStorage functions to a separate utility file
export function getRecordedBets() {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      console.error('Error reading recorded bets from storage:', e);
      return new Set();
    }
  }
  
  export function recordBet(betId: string) {
    if (typeof window === 'undefined') return;
    try {
      const recorded = getRecordedBets();
      recorded.add(betId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...recorded]));
    } catch (e) {
      console.error('Error saving recorded bet to storage:', e);
    }
  }
  
  export function isBetRecorded(betId: string) {
    return getRecordedBets().has(betId);
  }

  export function roundBet(betAmount: bigint | number): number {
    let displayAmount = typeof betAmount === 'bigint' 
      ? Number(betAmount) / 1e18 
      : betAmount;
      
    // round to standard values
    if (displayAmount >= 0.24 && displayAmount < 0.26) displayAmount = 0.25;
    else if (displayAmount >= 0.48 && displayAmount < 0.52) displayAmount = 0.5;
    else if (displayAmount >= 0.97 && displayAmount < 1.03) displayAmount = 1;
    else if (displayAmount >= 1.94 && displayAmount < 2.06) displayAmount = 2;
    else displayAmount = Math.round(displayAmount);
      
    return displayAmount;
  }

// Define types for the context value
interface GameContextType {
  currentView: string;
  selectedChoice: number;
  selectedAmount: number;
  isFlipping: boolean;
  gameResult: string | null;
  showFreeBetModal: boolean;
  isConnected: boolean;
  address: Address | undefined;
  
  setCurrentView: (view: string) => void;
  setSelectedChoice: (choice: number) => void;
  setSelectedAmount: (amount: number) => void;
  setIsFlipping: (isFlipping: boolean) => void;
  setGameResult: (result: string | null) => void;
  setShowFreeBetModal: (show: boolean) => void;
  
  // contract data
  allowedBetAmounts: any[];
  pendingBet: any;
  betDetails: any;
  betHistory: any[];
  isWhitelisted: boolean | null;
  hasUsedFreeBet: boolean | null;
  
  // transaction state
  isBetPending: boolean;
  isSettlePending: boolean;
  isFreeBetPending: boolean;
  isReceiptLoading: boolean;
  settleIsRejected: boolean;
  
  onPlaceBet: () => Promise<void>;
  onRevealResults: () => Promise<void>;
  onClaimFreeBet: () => Promise<void>;
  onPlayAgain: () => void;
  
  // computed values
  pendingBetAmount: number;
  getTransactionStatusText: () => string | null;
  betTxHash?: Address;
  
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
  address: Address | undefined;
  isConnected: boolean;
}

export function GameProvider({ children, address, isConnected }: GameProviderProps) {
  // ####################### STATE DEFINITIONS #######################
  // UI state
  const [currentView, setCurrentView] = useState('betting');
  const [selectedChoice, setSelectedChoice] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showFreeBetModal, setShowFreeBetModal] = useState(true);
  
  // Transaction state
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isRecordingBet, setIsRecordingBet] = useState(false);
  const lastRecordedBetRef = useRef<string | null>(null);
 
  // ####################### CONTRACT HANDLER SETUP #######################
  const {
    allowedBetAmounts,
    pendingBet,
    betDetails,
    betHistory,
    isWhitelisted,
    hasUsedFreeBet,
    placeBet,
    handleSettle,
    handleFreeBet,
    refetchBetAmounts,
    refetchPendingBet,
    refetchBetDetails,
    refetchIsWhitelisted,
    refetchHasUsedFreeBet,
    betTxHash,
    settleTxHash,
    freeBetTxHash,
    isBetPending,
    isSettlePending,
    isFreeBetPending,
    isBetSuccess,
    isSettleSuccess,
    isFreeBetSuccess,
    lastTxType,
    setLastTxType,
    settleIsRejected
  } = useContractHandler(address as Address, isConnected);

  const { data: receipt, error: receiptError, isLoading: isReceiptLoading } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}` | undefined,
      query: {
        enabled: Boolean(txHash),
      }
    });

  // ####################### TRANSACTION TRACKING #######################
  useEffect(() => {
    if (betTxHash) {
      setTxHash(betTxHash);
      setLastTxType('bet');
      setCurrentView("revealing")
    }
  }, [betTxHash]);

  useEffect(() => {
    if (settleTxHash) {
      setTxHash(settleTxHash);
      setLastTxType('settle');
    }
  }, [settleTxHash]);

  useEffect(() => {
    if (freeBetTxHash) {
      setTxHash(freeBetTxHash);
      setLastTxType('freeBet');
      setCurrentView("revealing");
    }
  }, [freeBetTxHash]);

  // refetch bet details when transaction is confirmed
  useEffect(() => {
    if (receipt) {
      refetchBetDetails();
      refetchPendingBet();
      // Clear txHash so this effect doesn't repeatedly run
      setTxHash(null);
    }
    if (receiptError) {
      console.error("Transaction failed:", receiptError);
      setTxHash(null);
    }
  }, [receipt, receiptError, refetchBetDetails, refetchPendingBet]);

  // ####################### HANDLE NORMAL BETS #######################
  // Handle auto-refetch when transaction states change
  useEffect(() => {
    if (isBetSuccess) {
      refetchPendingBet();
    }
  }, [isBetSuccess, refetchPendingBet]);

  // local wrapper to place a bet
  const onPlaceBet = async () => {
    if (!isConnected || selectedAmount <= 0) {
      console.error('No bet amount selected or wallet not connected');
      return;
    }
    setIsFlipping(true);
    setGameResult(null); 

    try {
      await placeBet(selectedChoice, selectedAmount.toString());
      // wait for confirmation before changing view
    } catch (error) {
      console.error("Error placing bet:", error);
      setIsFlipping(false);
      setCurrentView('betting'); // Return to betting view on error
    }
  };

  // ####################### HANDLE SETTLING BETS #######################
  useEffect(() => {
    if (isSettleSuccess) {
      refetchBetDetails();
    }
  }, [isSettleSuccess, refetchBetDetails]);

  // Local wrapper to reveal bet results (i.e. settle the bet)
  const onRevealResults = async () => {
    if (!isConnected || !pendingBet?.hasBet) {
      console.error('No pending bet to settle or wallet not connected');
      return;
    }
    setIsFlipping(true);
    setGameResult(null);
    try {
      await handleSettle();
      setLastTxType('settle');
      // txHash useEffect will handle updating views if successful
    } catch (error) {
      console.error("Error settling bet:", error);
      // stop the animation, but STAY in revealing view
      setIsFlipping(false);
    }
  };

  useEffect(() => {
    if (settleIsRejected) {
      setIsFlipping(false);
      
      // Don't change currentView - keep them in revealing
      console.log('Settlement rejected - user can try again');
    }
  }, [settleIsRejected]);

  // update game result after settling
  useEffect(() => {
    // Only update game result if:
      // 1. The bet is settled
      // 2. not currently flipping the coin (still processing)
      // 3. The last transaction was a settlement transaction
    if (betDetails && betDetails.isSettled && !isFlipping && lastTxType === 'settle') {
      const result = betDetails.playerWon ? "win" : "lose";
      setGameResult(result);
    }
  }, [betDetails, isFlipping, lastTxType]);


  // ####################3################ HANDLE FREE BETS ######################################
  useEffect(() => {
    if (isFreeBetSuccess) {
      refetchPendingBet();
      refetchHasUsedFreeBet();
    }
  }, [isFreeBetSuccess, refetchPendingBet, refetchHasUsedFreeBet]);

  // wrapper for claiming a free bet
  const onClaimFreeBet = async () => {
    if (!isConnected) {
      console.error('Wallet not connected');
      return;
    }
    
    if (pendingBet?.hasBet) {
      console.error('User already has a pending bet');
      return;
    }
    
    console.log('CLAIMING FREE BET: Choice:', selectedChoice === 0 ? 'Heads' : 'Tails');
    console.log('Current whitelist status:', isWhitelisted);
    console.log('Has used free bet status:', hasUsedFreeBet);
    
    setIsFlipping(true);
    try {
      await refetchIsWhitelisted(); // refresh right before attempting
      
      if (!isWhitelisted) {
        throw new Error('Not currently whitelisted for free bet');
      }
      
       await handleFreeBet(selectedChoice);
      
      setLastTxType('freeBet');
    } catch (error: any) {
      // Detect specific errors related to whitelist
      if (error.message?.includes('whitelist') || error.message?.includes('Whitelist')) {
        console.error("Free bet whitelist error:", error);
        // Maybe show specific message to user about whitelist issue
      } else {
        console.error("Error placing free bet:", error);
      }
      setIsFlipping(false);
    }
  };

  // handle case when transaction was submitted but failed later
  useEffect(() => {
    if (isFreeBetPending === false && lastTxType === 'freeBet' && isFlipping && isFreeBetSuccess === false) {
        setIsFlipping(false);
    }
    if (isFreeBetSuccess === true) {
        setCurrentView("revealing")
    }
  }, [isFreeBetSuccess, isFreeBetPending, lastTxType, isFlipping]);

  useEffect(() => {
    if (isFreeBetPending === false && lastTxType === 'freeBet' && !freeBetTxHash) {
      setIsFlipping(false);
    }
  }, [isFreeBetPending, lastTxType, freeBetTxHash]);


  // ########################################## GAME FLOW MANAGEMENT #####################################
  useEffect(() => {
    if (pendingBet && pendingBet.hasBet === true) {
        setCurrentView("revealing")
    }
  }, [pendingBet])

  // reset game state
  const onPlayAgain = () => {
    setGameResult(null);
    setSelectedAmount(0);
    setIsFlipping(false);
    setCurrentView('betting'); 
  };

  useEffect(() => {
    // If no transaction is pending, the coin shouldn't be flipping
    if (!isBetPending && !isSettlePending && !isFreeBetPending && isFlipping) {
      setIsFlipping(false);
    }
  }, [isBetPending, isSettlePending, isFreeBetPending, isFlipping]);

  // update view from betting to revealing (also here to ensure view is always revealing when a pending bet exists)
  useEffect(() => {
    if (pendingBet?.hasBet && !betDetails?.isSettled && betTxHash && currentView === 'betting') {
      setCurrentView('revealing');
    }
  }, [pendingBet, betDetails, betTxHash, currentView]);

  // update gameResult and view after settling
  useEffect(() => {
    if (betDetails && betDetails.isSettled && !isFlipping && lastTxType === 'settle') {
      const result = betDetails.playerWon ? "win" : "lose";
      setGameResult(result);
      setCurrentView('result');
    }
  }, [betDetails, isFlipping, lastTxType]);

  // ############################################### DATA FETCHING #########################################3########
  useEffect(() => {
    if (isConnected && address) {
      refetchIsWhitelisted();
      refetchHasUsedFreeBet();
      refetchBetAmounts();
      refetchPendingBet();
      refetchBetDetails();
    }
  }, [
    isConnected,
    address,
    refetchIsWhitelisted,
    refetchHasUsedFreeBet,
    refetchBetAmounts,
    refetchPendingBet,
    refetchBetDetails,
  ]);

  // ####################### BET RECORDING #######################
  // Monitor betDetails for completed bets to record in DB
  useEffect(() => {
    if (betDetails && betDetails.isSettled && !isRecordingBet && lastTxType === 'settle') {
      const betId = `${address?.toLowerCase()}_${betDetails.placedAt.toString()}`;
      
      // skip if bet already recorded
      if (isBetRecorded(betId) || lastRecordedBetRef.current === betId) {
        console.log('🔍 Bet already recorded, skipping DB update:', betId);
        return;
      }
      
      setIsRecordingBet(true);
      lastRecordedBetRef.current = betId;
      
      const recordBetInDB = async () => {
        try {
          let validAmount = roundBet(betDetails.amount);
          
          if (!validAmount) {
            console.error('Invalid bet amount');
            return;
          }
          
          const response = await fetch('/api/bet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_address: address,
              wager_amount: validAmount,
              is_win: betDetails.playerWon,
              placed_at: betDetails.placedAt.toString(),
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to record bet');
          }
          
          await response.json();
          recordBet(betId);

        } catch (error) {
          //console.error('Error recording bet:', error);
        } finally {
          setIsRecordingBet(false);
        }
      };

      recordBetInDB();
    }
  }, [betDetails, address, isRecordingBet, lastTxType]);

  // #####################3############### COMPUTED VALUES ###########################################
  // get the pending bet amount for display
  const pendingBetAmount = betDetails && betDetails.amount ? Number(betDetails.amount) / 1e18 : 0;

  //  function to show transaction status with details
  const getTransactionStatusText = () => {
    const txTypeLabels = {
      'bet': 'Bet',
      'settle': 'Settle',
      'freeBet': 'Free Bet'
    };
    
    if (isReceiptLoading) {
      return `Waiting for ${lastTxType ? txTypeLabels[lastTxType as keyof typeof txTypeLabels] : ''} confirmation...`;
    }
    if (isBetPending) return "Bet transaction pending in wallet...";
    if (isSettlePending) return "Settlement transaction pending in wallet...";
    if (isFreeBetPending) return "Free bet transaction pending in wallet...";
    return null;
  };

  const value: GameContextType = {
    // State
    currentView,
    selectedChoice,
    selectedAmount,
    isFlipping,
    gameResult,
    showFreeBetModal,
    
    // Setters
    setCurrentView,
    setSelectedChoice,
    setSelectedAmount,
    setIsFlipping,
    setGameResult,
    setShowFreeBetModal,
    
    // Contract data
    allowedBetAmounts,
    pendingBet,
    betDetails,
    betHistory,
    isWhitelisted,
    hasUsedFreeBet,
    
    // Transaction state
    isBetPending,
    isSettlePending,
    isFreeBetPending,
    isReceiptLoading,
    settleIsRejected,
    
    // Actions
    onPlaceBet,
    onRevealResults,
    onClaimFreeBet,
    onPlayAgain,
    
    // Computed values
    pendingBetAmount,
    getTransactionStatusText,

    isConnected,
    address,
    betTxHash
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === null) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
