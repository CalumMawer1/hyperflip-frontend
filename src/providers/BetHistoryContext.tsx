'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

// Local storage key for bet history
const BET_HISTORY_STORAGE_KEY = 'hyperflip_bet_history';

// Define bet history types
export type FormattedBetHistory = {
    betId: string;
    amount: string;
    amountInHype: string;
    placedAt: Date;
    playerChoice: 'Heads' | 'Tails';
    result: 'Heads' | 'Tails';
    playerWon: boolean;
    isFreeBet: boolean;
    winnings: string;
    winningsInHype: string;
};

// Type for adding a new bet
export type NewBet = {
    amount: number;
    playerChoice: number; // 0 = Heads, 1 = Tails
    result: number; // 0 = Heads, 1 = Tails
    isFreeBet: boolean;
    playerWon: boolean;
};

// Context type definition
interface BetHistoryContextType {
    betHistory: FormattedBetHistory[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<void>;
    addBet: (bet: NewBet) => FormattedBetHistory;
    clearHistory: () => void;
}

// Create context with default values
const BetHistoryContext = createContext<BetHistoryContextType>({
    betHistory: [],
    isLoading: true,
    isError: false,
    refetch: async () => {},
    addBet: () => ({} as FormattedBetHistory),
    clearHistory: () => {},
});

// Provider component
export const BetHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [betHistory, setBetHistory] = useState<FormattedBetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Use the address from useAccount for storage key
  const getStorageKey = useCallback(() => {
      return `${BET_HISTORY_STORAGE_KEY}_${address || 'guest'}`;
  }, [address]);

  // Load bet history from local storage
  const loadBetHistory = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const storageKey = getStorageKey();
      const storedHistory = localStorage.getItem(storageKey);
      
      if (storedHistory) {
          // Parse stored history and convert date strings back to Date objects
          const parsedHistory = JSON.parse(storedHistory);
          const formattedHistory = parsedHistory.map((bet: any) => ({
            ...bet,
            placedAt: new Date(bet.placedAt)
        }));
        
        setBetHistory(formattedHistory);
      } else {
        setBetHistory([]);
      }
    } catch (error) {
        console.error('Error loading bet history from local storage:', error);
        setIsError(true);
        setBetHistory([]);
    }
    
    setIsLoading(false);
    return Promise.resolve();

  }, [getStorageKey]);

  // Save bet history to local storage
  const saveBetHistory = useCallback((history: FormattedBetHistory[]) => {
    try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving bet history to local storage:', error);
        setIsError(true);
    }
  }, [getStorageKey]);

  // Add a new bet to history
  const addBet = useCallback((bet: NewBet) => {
    const playerChoiceStr = bet.playerChoice === 0 ? 'Heads' : 'Tails';
    const resultStr = bet.result === 0 ? 'Heads' : 'Tails';
    
    const newBet: FormattedBetHistory = {
      betId: Date.now().toString(),
      amount: bet.amount.toString(),
      amountInHype: bet.amount.toString(),
      placedAt: new Date(),
      playerChoice: playerChoiceStr,
      result: resultStr,
      playerWon: bet.playerWon,
      isFreeBet: bet.isFreeBet,
      winnings: playerChoiceStr === resultStr 
        ? (bet.isFreeBet ? bet.amount.toString() : (bet.amount * 2).toString()) 
        : '0',
      winningsInHype: playerChoiceStr === resultStr 
        ? (bet.isFreeBet ? bet.amount.toString() : (bet.amount * 2).toString()) 
        : '0'
    };
    
    setBetHistory(prevHistory => {
      const updatedHistory = [newBet, ...prevHistory];
      saveBetHistory(updatedHistory);
      return updatedHistory;
    });
    
    return newBet;
  }, [saveBetHistory]);

  // Clear bet history
  const clearHistory = useCallback(() => {
    setBetHistory([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  }, [getStorageKey]);

  // Load history on initial render and when address changes
  useEffect(() => {
    loadBetHistory();
  }, [loadBetHistory]);

  // Context value
  const value = {
    betHistory,
    isLoading,
    isError,
    refetch: loadBetHistory,
    addBet,
    clearHistory
  };

  return (
    <BetHistoryContext.Provider value={value}>
      {children}
    </BetHistoryContext.Provider>
  );
};

// Custom hook to use the bet history context
export const useBetHistory = () => useContext(BetHistoryContext); 