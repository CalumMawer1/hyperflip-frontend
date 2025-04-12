'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePlaceBet } from '../hooks/usePlaceBet';
import { useFreeBetStatus } from '../hooks/useFreeBetStatus';
import { useAccount } from 'wagmi';
import { SettledBetResult } from '../utils/interfaces';


// Add logging utility
const logGameState = (action: string, data: any) => {
  console.log(`[GameState] ${action}:`, data);
};

export type GameView = 'BETTING' | 'FLIPPING' | 'RESULT';

export type GameState = {
    // Core state
    view: GameView;
    choice: number | null;
    amount: number | null; 

    // UI Controls
    isLoading: boolean;
    betIsPending: boolean;
    resultIsPending: boolean;
    // Results
    settledBetResult: SettledBetResult | null;
    placeBetError: Error | null;
    

    // Methods
    setChoice: (choice: number) => void;
    setAmount: (amount: number) => void;
    placeBet: (choice: number, amount: string) => void;
    placeFreeBet: (choice: number) => void;
    playAgain: () => void;

    // Additional states for UI
    canClaimFreeBet: boolean;
    isConnected: boolean;
};


const GameStateContext = createContext<GameState | null>(null);


export function GameStateProvider({ children }: { children: ReactNode }) {
    const { isConnected } = useAccount();

    
    // Hooks
    const {
        placeBet: executePlaceBet,
        placeFreeBet: executePlaceFreeBet,
        betIsPending,
        resultIsPending,
        betPlaced,
        settledBetResult,
        setSettledBetResult,
        placeBetError
    } = usePlaceBet({ watchEvents: true });

    const {
        isFreeBetEligible,
        refreshFreeBetStatus
    } = useFreeBetStatus();

    // Game state
    const [choice, setChoice] = useState<number | null>(settledBetResult?.landedOn ?? null);
    const [amount, setAmount] = useState<number | null>(null);


    // Derived states
    const canClaimFreeBet = isFreeBetEligible && !betIsPending;
    const isLoading = betIsPending;

    // Track bet amount
    const betAmount = settledBetResult?.amount || 0;

    // Log state changes
    useEffect(() => {
      logGameState("[GameStateProvider] Current State", {
        choice,
        amount,
        betIsPending,
        settledBetResult,
        betAmount,
        canClaimFreeBet,
        isLoading,
        isConnected,
      });
    }, [choice, amount, betIsPending, 
        betAmount, canClaimFreeBet, isLoading, isConnected, settledBetResult]);

    // Calculate the current view based on game state
    const calculateView = useCallback((): GameView => {
        if (settledBetResult !== null) return 'RESULT';
        if (resultIsPending) return 'FLIPPING';

        return 'BETTING';
        
    }, [settledBetResult, resultIsPending]);

    // Current view
    const view = calculateView();


    const placeBet = useCallback((choice: number, amount: string) => {
        logGameState("[GameStateProvider] Placing Bet", { choice, amount });

        setChoice(choice);
        setAmount(Number(amount));

        executePlaceBet(amount, choice);
    }, [executePlaceBet]);

    
    const placeFreeBet = useCallback((choice: number) => {
        logGameState("[GameStateProvider] Placing Free Bet", { choice });
        setChoice(choice);
        executePlaceFreeBet(choice);
        refreshFreeBetStatus();
    }, [executePlaceFreeBet, refreshFreeBetStatus]);  


    const playAgain = useCallback(() => {
        logGameState("[GameStateProvider] Playing Again", { actions: "hiding result, setting view to BETTING, resetting amount" });
        
        setChoice(null);
        setAmount(null);
        
        setSettledBetResult(null);
         
    }, [settledBetResult]);

    const gameState: GameState = {
        // Core state
        view,
        choice,
        amount,

        // UI controls
        isLoading,

        // Results
        settledBetResult,
        betIsPending,
        placeBetError,
        
        // Methods
        setChoice,
        setAmount,
        placeBet,
        placeFreeBet,
        playAgain,
        resultIsPending,

        // Additional states
        canClaimFreeBet,
        isConnected
    };

    return (
        <GameStateContext.Provider value={gameState}>
            {children}
        </GameStateContext.Provider>
    );
}

// Hook for consuming the context
export function useGameState(): GameState {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
} 