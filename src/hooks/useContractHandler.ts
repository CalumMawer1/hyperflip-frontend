import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';
import { PendingBetStatus, BetDetails } from '../utils/interfaces';
import { Address, parseEther } from 'viem';
import { BetHistoryItem } from '../utils/interfaces';
import { useUserProvider } from '../providers/UserProvider';


const BET_HISTORY_STORAGE_KEY = 'bet_history';

const getStoredBetHistory = (): BetHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(BET_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error reading bet history from storage:', e);
    return [];
  }
};

const saveBetHistory = (history: BetHistoryItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BET_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving bet history to storage:', e);
  }
};

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


export const useContractHandler = (address: Address, isConnected: boolean) => {
  const [allowedBetAmounts, setAllowedBetAmounts] = useState<bigint[]>([]);
  const [pendingBet, setPendingBet] = useState<PendingBetStatus | null>(null);
  const [betDetails, setBetDetails] = useState<BetDetails | null>(null);
  const [betResult, setBetResult] = useState<{ amount: bigint; result: boolean; placedAt: bigint } | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [hasUsedFreeBet, setHasUsedFreeBet] = useState<boolean | null>(null);
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>(getStoredBetHistory());
  const [currChoice, setCurrChoice] = useState<boolean | null>(null)
  const [lastTxType, setLastTxType] = useState<string | null>(null);
  const [settleIsRejected, setSettleIsRejected] = useState<boolean>(false)
  
  const { incrementPoints } = useUserProvider();

  // ################ set up misc contract interractions ###############################
  // allowed bet amounts
  const { data: betAmounts, refetch: refetchBetAmounts } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllowedBetAmounts',
  });

  // pending bet status
  const { data: pendingBetData, refetch: refetchPendingBet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasPendingBet',
    args: [address],
    query: {
      enabled: Boolean(address)
    }
  });

  // bet details
  const { data: betDetailsData, refetch: refetchBetDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getBetDetails',
    args: [address],
    query: {
      enabled: Boolean(address)
    }
  });

 
  // ####################### Track Misc. State ###############################3
  // allowed bet amounts
  useEffect(() => {
    if (betAmounts) {
      setAllowedBetAmounts([...betAmounts]);
    }
  }, [betAmounts]);

  // pending bet status
  useEffect(() => {
    if (pendingBetData) {
      const [hasBet, targetBlock, currentBlock] = pendingBetData;
      setPendingBet({ hasBet, targetBlock, currentBlock });
    }
  }, [pendingBetData]);

  
  // ####################### Handle Normal Bets ######################################
  
  const { 
    writeContract: placeBetWrite, 
    data: betTxHash, 
    isPending: isBetPending, 
    isSuccess: isBetSuccess,
    reset: resetBetState
  } = useWriteContract();

  const placeBet = useCallback(
    async (choice: number, amount: string) => {
      try {
        resetBetState();
        placeBetWrite({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'placeBet',
          args: [choice],
          value: parseEther(amount),
        });
        setCurrChoice(choice === 0 ? false : true);
        setLastTxType('bet');
        
        return true;
      } catch (error) {
        throw error; 
      }
    },
    [placeBetWrite, resetBetState]
  );
  // update bet details/betHistory and derive bet result if bet is settled
  useEffect(() => {
    if (betDetailsData) {
      const [amount, blockNumber, placedAt, isSettled, playerWon] = betDetailsData;
      const normalizedAmount = roundBet(amount);
      const isFreebet = !!(normalizedAmount === 0.25 && hasUsedFreeBet === false && isWhitelisted);
      const actualAmount = (isFreebet && !playerWon) ? 0 : normalizedAmount; // account for losing a free bet
      
      const details = { amount: BigInt(Math.round(actualAmount * 1e18)), blockNumber, placedAt, isSettled, playerWon };
      setBetDetails(details);

      // Only set result and update history if:
      // 1. The bet is actually settled
      // 2. the player's choice is recorded
      // 3. This transaction was for settling a bet (not placing a new one)
      if (isSettled === true && currChoice !== null && lastTxType === 'settle') {
        // Update bet result (includes placedAt for uniqueness)
        setBetResult({ amount, result: playerWon, placedAt });
        
        const currentTimestamp = Date.now();
        const formattedDate = new Date(currentTimestamp).toLocaleString();
        
        const newBet: BetHistoryItem = {
          result: playerWon ? 'win' : 'lose',
          amount: actualAmount,
          timestamp: currentTimestamp,
          formattedTimestamp: formattedDate,
          isFree: isFreebet,
          choice: Boolean(currChoice), 
        };
                
        setBetHistory(prev => {
          const exists = prev.some(bet => 
            bet.timestamp === currentTimestamp && 
            bet.amount === normalizedAmount &&
            bet.result === (playerWon ? 'win' : 'lose')
          );
          
          if (exists) return prev;
          
          const updatedHistory = [newBet, ...prev];
          // save to local storage
          saveBetHistory(updatedHistory);
          
          return updatedHistory;
        });
      }
    }
  }, [betDetailsData, currChoice, hasUsedFreeBet, lastTxType, isWhitelisted]);



  // ######################## Handle Settling Bets ###################3########
  // get new instance of writeContract for settling pending bets
  const { 
    writeContract: settleBetWrite, 
    data: settleTxHash,
    isPending: isSettlePending,
    isSuccess: isSettleSuccess,
    reset: resetSettleState,
    error: settleError
  } = useWriteContract();

  useEffect(() => {
    if (settleError) {
        setSettleIsRejected(true);
    }
  }, [settleError]);
  
  const handleSettle = useCallback(async () => {
    try {
      // Reset any previous state
      resetSettleState();
      settleBetWrite({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'settleBet',
      });
      setLastTxType('settle');
      return true;
    } catch (error) {
      throw error;
    }
  }, [settleBetWrite, resetSettleState, isSettlePending]);

  useEffect(() => {
    if (isSettleSuccess && settleTxHash) {
      // Clear the rejection state when settlement succeeds
      setSettleIsRejected(false);
      incrementPoints(100);
    }
  }, [isSettleSuccess, settleTxHash]);



  // ################### Handle Free Bets ##############################3
  // free bet eligibility
  const { data: isWhitelistedData, refetch: refetchIsWhitelisted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isWhitelistedForFreeBet',
    args: [address],
    query: {
      enabled: Boolean(address)
    }
  });

  // hasUsedFreeBet
  const { data: hasUsedFreeBetData, refetch: refetchHasUsedFreeBet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasUsedFreeBet',
    args: [address],
    query: {
      enabled: Boolean(address)
    }
  });

  // get new instance of writeContract for creating new free bets
  const { 
    writeContract: placeFreeBetWrite,
    data: freeBetTxHash,
    isPending: isFreeBetPending,
    isSuccess: isFreeBetSuccess,
    reset: resetFreeBetState
  } = useWriteContract();
  
  const handleFreeBet = useCallback(
    async (choice: number) => {
      try {
        await refetchIsWhitelisted();
        await refetchHasUsedFreeBet();
        
        if (!isWhitelisted) {
          console.error('User is no longer whitelisted for free bet');
          throw new Error('Not whitelisted for free bet');
        }
        
        if (hasUsedFreeBet) {
          console.error('User has already used their free bet');
          throw new Error('Free bet already used');
        }
        
        setCurrChoice(choice === 0 ? false : true);
        setLastTxType('freeBet');
        
        placeFreeBetWrite({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'placeFreeBet',
          args: [choice],
        });
        
        return true;
      } catch (error) {
        console.error('Error placing free bet:', error);
        throw error;
      }
    },
    [placeFreeBetWrite, resetFreeBetState, refetchIsWhitelisted, refetchHasUsedFreeBet, isWhitelisted, hasUsedFreeBet, address]
  );

  // free bet transaction success and update state
  useEffect(() => {
    if (isFreeBetSuccess && freeBetTxHash) {
      setHasUsedFreeBet(true);
    }
  }, [isFreeBetSuccess, freeBetTxHash]);

  // free bet eligibility
  useEffect(() => {
    if (isWhitelistedData !== undefined) {
      setIsWhitelisted(isWhitelistedData);
    }
  }, [isWhitelistedData]);

  // free bet usage status
  useEffect(() => {
    if (hasUsedFreeBetData !== undefined) {
      setHasUsedFreeBet(hasUsedFreeBetData);
    }
  }, [hasUsedFreeBetData]);

 
  return {
    allowedBetAmounts,
    pendingBet,
    betDetails,
    betResult,
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
    setBetHistory,
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
    settleIsRejected,
  };
};
