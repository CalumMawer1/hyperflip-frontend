'use client';

import {useReadContract, useWriteContract, useWatchContractEvent, useAccount} from 'wagmi';
import { parseEther, Log } from 'viem';
import {useState, useEffect, useCallback} from 'react';
import crypto from 'crypto';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract';
import { recordBet } from '../services/apiService';
import { SettledBetResult } from '../utils/interfaces';
import { useBetHistory, NewBet } from '../providers/BetHistoryContext';
import { useUserProvider } from '../providers/UserProvider';


// Add logging utility
const logBet = (action: string, data: any) => {
  console.log(`[PlaceBet] ${action}:`, data);
};

// Define the event structure to match contract events
type BetSettledEvent = Log & {
    args: {
        player: string;
        amount: bigint;
        won: boolean;
        result: number;
    }
};

// Track bets in progress to ensure we match settled bets with their choices
interface PendingBet {
    choice: number;  // 0 = Heads, 1 = Tails
    amount: string;
    timestamp: number;
    isFreeBet: boolean;
}

// Global Set to track processed events across all hook instances
const processedBetEvents = new Set<string>();

type UsePlaceBetResult = {
    settledBetResult: SettledBetResult | null;
    error: Error | null;
    betIsPending: boolean;
    betPlaced: boolean;
    resultIsPending: boolean;
    placeBetError: Error | null;
    placeBet: (amount: string, choice: number) => void;
    placeFreeBet: (choice: number) => void;
    setSettledBetResult: (betDetails: SettledBetResult | null) => void;
    currPythFee: bigint | null;
    refetchPythFee: () => void;
}

const generateRandomNumber = () => {
    const randomBytesData = crypto.randomBytes(32);
    const randomHex = `0x${randomBytesData.toString('hex')}`;
    return randomHex;
}

function calculateTotalValue(betAmount: string, pythFee: bigint) {
    if (!pythFee || betAmount === null) return null;
    
    const betAmountWei = parseEther(betAmount);
    
    // Calculate deployer fee (3.5% of bet amount)
    const deployerFee = (betAmountWei * BigInt(350)) / BigInt(10000);
    
    // Total = bet amount + Pyth fee + deployer fee
    const totalValueWei = betAmountWei + pythFee + deployerFee;
    
    logBet("Calculated Total Bet Value", { 
        betAmount, 
        betAmountWei: betAmountWei.toString(),
        pythFeeWei: pythFee.toString(),
        deployerFeeWei: deployerFee.toString(), // Log the deployer fee too
        totalValueWei: totalValueWei.toString(),
        betAmountEther: Number(betAmountWei) / 1e18,
        pythFeeEther: Number(pythFee) / 1e18,
        deployerFeeEther: Number(deployerFee) / 1e18, // Log in HYPE
        totalValueEther: Number(totalValueWei) / 1e18
    });
    
    return totalValueWei.toString();
}


export function usePlaceBet(options = { watchEvents: true }): UsePlaceBetResult {
    const { address } = useAccount();
    const { handleNewBet } = useUserProvider();


    const [betIsPending, setBetIsPending] = useState<boolean>(false);
    const [resultIsPending, setResultIsPending] = useState<boolean>(false);
    const [settledBetResult, setSettledBetResult] = useState<SettledBetResult | null>(null);
    const [placeBetError, setPlaceBetError] = useState<Error | null>(null);
    const [currPythFee, setCurrPythFee] = useState<bigint | null>(null);


    // Get bet history context
    const { addBet: addBetToHistory } = useBetHistory();
    // get pyth fee 
    const { data: pythFee, refetch: refetchPythFee } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCurrentPythFee'
    })
    
    useEffect(() => {
        if (pythFee) {
            logBet("Received Pyth Fee", { 
                pythFeeWei: pythFee.toString(),
                pythFeeEther: Number(pythFee) / 1e18 
            });
            setCurrPythFee(pythFee as bigint);
        }
    }, [pythFee]);

    // check if there is currently a pending bet (really just so that if the user refreshes the page, they will still go back to the right view)
    const { data: contractHasPendingBet } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'hasPendingBet'
    })

    useEffect(() => {
        if (contractHasPendingBet) {
            setResultIsPending(true);
        }
    }, [contractHasPendingBet]);
    

    // execute contract write 
    const {
        writeContract: executeBet,
        data: betTxHash,
        isPending: placeBetIsPending,
        isSuccess: betPlaced,
        error: betError,
    } = useWriteContract();

    

    // place regular bet 
    const placeBet = useCallback((amount: string, choice: number) => {
        logBet("Placing Regular Bet", { amount, choice });
        setBetIsPending(true);
        setSettledBetResult(null);
        
        // Store this bet's details to match with outcome later
        const newBet: PendingBet = {
            choice,
            amount,
            timestamp: Date.now(),
            isFreeBet: false
        };
        
        logBet("Added to pending bets", { pendingBet: newBet });
        
        const newRandomNumber = generateRandomNumber();

        const betAmountWei = parseEther(amount); // Convert to wei once
        const totalValue = calculateTotalValue(amount, pythFee as bigint);

        if (!totalValue) {
            setBetIsPending(false);
            // Remove from pending bets if it fails
            console.error("failed to calculate total bet value or it was 0");
            return;
        }
        
        executeBet(
            {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'placeBet',
                args: [betAmountWei, choice, newRandomNumber],
                value: BigInt(totalValue),
            },
            { 
                onSuccess: () => {
                    console.log("[usePlaceBet] Bet placed successfully");
                    setBetIsPending(false);
                    setResultIsPending(true);
                },
                onError: () => {
                    console.log("[usePlaceBet] Bet placement failed");
                    setBetIsPending(false);
                }
            }
        )

    }, [pythFee, executeBet])


    const placeFreeBet = useCallback((choice: number) => {
        logBet("Placing Free Bet", { choice });
        setBetIsPending(true);
        setSettledBetResult(null);
        
        // Store this bet's details to match with outcome later
        const newBet: PendingBet = {
            choice,
            amount: "0",
            timestamp: Date.now(),
            isFreeBet: true
        };
        
        logBet("Added free bet to pending bets", { pendingBet: newBet});
        
        // generate new random number for each bet 
        const newRandomNumber = generateRandomNumber();
    
        logBet("Executing Free Bet Contract Call", { 
            functionName: 'placeFreeBet',
            choice,
            randomNumber: newRandomNumber.substring(0, 18) + '...' // Log partial for privacy
        });
        
        executeBet(
            {
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'placeFreeBet',
                args: [choice, newRandomNumber],
                value: BigInt(0),
            },
            {
                onError: () => {
                    console.log("[usePlaceBet] Failed to place free bet");
                    setBetIsPending(false);
                    setPlaceBetError(new Error("Failed to place free bet"));
                },
                onSuccess: () => {
                    console.log("[usePlaceBet] Free bet placed successfully");
                    setBetIsPending(false);
                    setResultIsPending(true);
                }
            }
        )
    }, [executeBet])

    // Watch for bet settlement events - only if watchEvents is true
    if (options.watchEvents) {
        useWatchContractEvent({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            eventName: 'BetSettled',
            poll: true,
            pollingInterval: 1000,
            strict: false,
            batch: false,
            onError: (error) => {
                console.error("[usePlaceBet] Error watching BetSettled event", error);
            },
            onLogs: (logs) => {
                logs.forEach(log => {
                    // Create unique event ID that persists across hook instances
                    const eventId = `${log.transactionHash}-${log.logIndex}`;
                    
                    // Skip if we've already processed this event in any hook instance
                    if (processedBetEvents.has(eventId)) {
                        logBet("[usePlaceBet] Skipping already processed event", { eventId });
                        return;
                    }
                    
                    // Add to global processed set
                    processedBetEvents.add(eventId);
                    
                    const typedLog = log as unknown as BetSettledEvent;
                    const {args} = typedLog;
                    
                    logBet("[usePlaceBet] BetSettled Event Received", {
                        player: args.player,
                        amount: Number(args.amount) / 1e18,
                        won: args.won,
                        result: args.result,
                        currentAddress: address,
                    });
                    
                    if (args.player.toLowerCase() === address?.toLowerCase()) {
                        console.log("[usePlaceBet] BetSettled event received for current user");
                        
                        const betAmount = Number(args.amount) / 1e18; 
                        
                        const betDetails: SettledBetResult = {
                            amount: betAmount,
                            placedAt: Math.floor(Date.now() / 1000),
                            playerWon: args.won,
                            landedOn: args.result
                        };
                        
                        setSettledBetResult(betDetails);
                        
                        const newBet: NewBet = {
                            amount: betAmount,
                            playerChoice: args.result,
                            result: args.result,
                            isFreeBet: betAmount === 0 || betAmount === null || betAmount === undefined,
                            playerWon: args.won
                        };
                        
                        addBetToHistory(newBet);
                        
                        recordBet(address, betDetails.amount, betDetails.playerWon, betDetails.placedAt.toString());

                        handleNewBet(betDetails.amount, betDetails.playerWon ? 1 : 0);
                    }
                });
                setResultIsPending(false);
            }
        });
    }

    return {
        placeBet,
        placeFreeBet,
        betIsPending,
        resultIsPending,
        betPlaced,
        error: betError,
        settledBetResult,
        setSettledBetResult,
        placeBetError,
        currPythFee,
        refetchPythFee
    }
}
