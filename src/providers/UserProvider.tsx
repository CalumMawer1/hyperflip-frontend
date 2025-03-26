"use client"

import { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Address } from "viem";
import { useAccount } from 'wagmi';


const PENDING_POINTS_KEY_PREFIX = 'hyperflip_pending_points_';

interface UserContextType {
    walletAddress?: Address;
    numBets?: number;
    numWins?: number;
    numLosses?: number;
    netGain?: number;
    numPoints?: number;
    totalWagered?: number;
    winPercentage?: number;
    playerRankByNetGain?: number | string | null;
    playerRankByTotalBets?: number | string | null;
    playerRank?: number | string | null;
    isLoading: boolean;
    lastRefreshed: number | null;
    isRefreshNeeded: boolean;

    setNumBets: (numBets: number) => void;
    setNumWins: (numWins: number) => void;
    setNumLosses: (numLosses: number) => void;
    setNetGain: (netGain: number) => void;
    setNumPoints: (numPoints: number) => void;
    setTotalWagered: (totalWagered: number) => void;
    setWinPercentage: (winPercentage: number) => void;
    setPlayerRankByNetGain: (rank: number | string | null) => void;
    setPlayerRankByTotalBets: (rank: number | string | null) => void;
    getPlayerRankBySortOption: (sortOption: 'net_gain' | 'total_bets') => number | string | null;
    refreshUserData: (forceRefresh?: boolean) => Promise<void>;
    incrementPoints: (amount?: number) => void;
    forceRefreshData: () => Promise<void>;
}

interface UserProviderInput {
    children: ReactNode;
    initialAddress?: Address;
}

const UserContext = createContext<UserContextType | null>(null);

const getPendingPointsKey = (address?: Address) => {
    return address ? `${PENDING_POINTS_KEY_PREFIX}${address.toLowerCase()}` : null;
};

const loadPendingPoints = (address?: Address) => {
    if (!address || typeof window === 'undefined') return 0;
    const key = getPendingPointsKey(address);
    if (!key) return 0;
    try {
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
        console.error('Error loading pending points:', e);
        return 0;
    }
};

const savePendingPoints = (points: number, address?: Address) => {
    if (!address || typeof window === 'undefined') return;
    const key = getPendingPointsKey(address);
    if (!key) return;
    try {
        localStorage.setItem(key, points.toString());
    } catch (e) {
        console.error('Error saving pending points:', e);
    }
};


export function UserProvider({ children, initialAddress }: UserProviderInput) {
    const {address: walletAddress} = useAccount();
    const [numBets, setNumBets] = useState<number>();
    const [numWins, setNumWins] = useState<number>();
    const [numLosses, setNumLosses] = useState<number>();
    const [netGain, setNetGain] = useState<number>();
    const [numPoints, setNumPoints] = useState<number>();
    const [totalWagered, setTotalWagered] = useState<number>();
    const [winPercentage, setWinPercentage] = useState<number>();
    const [playerRankByNetGain, setPlayerRankByNetGain] = useState<number | string | null>();
    const [playerRankByTotalBets, setPlayerRankByTotalBets] = useState<number | string | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);
    const [pendingPoints, setPendingPoints] = useState<number>(0);
    const [isRefreshNeeded, setIsRefreshNeeded] = useState<boolean>(false);
    
    // Track last time forceRefreshData was called
    const lastForceRefreshTimeRef = useRef<number>(0);

    // load pending points
    useEffect(() => {
        if (walletAddress) {
            const storedPoints = loadPendingPoints(walletAddress);
            setPendingPoints(storedPoints);
        }
    }, [walletAddress]);

    const refreshUserData = useCallback(async (forceRefresh = true) => {
        if (!walletAddress) {
            return;
        }

        // Prevent frequent re-fetches unless explicitly forced
        if (!forceRefresh && lastRefreshed && Date.now() - lastRefreshed < 60000) {
            return;
        }

        const isFirstLoad = numPoints === undefined
        if (isFirstLoad) {
            setIsLoading(true);
        }

        try {
            console.log("Fetching user data for:", walletAddress);
            const url = `/api/user/${walletAddress}`;
            const fetchOptions: RequestInit = { method: 'GET' };
            const response = await fetch(url, fetchOptions);

            if (response.ok) {
                const data = await response.json();
                const serverPoints = (data.totalBets || 0) * 100;
                const now = Date.now();

                setNumBets(data.totalBets || 0);
                setNumWins(data.wins || 0);
                setNumLosses(data.losses || 0);
                setNetGain(data.totalProfit || 0);
                setTotalWagered(data.totalWagered || 0);
                setWinPercentage(data.winPercentage || 0);
                setNumPoints(serverPoints);
                if (data.playerRankByNetGain !== undefined) {
                    setPlayerRankByNetGain(data.playerRankByNetGain);
                }
                if (data.playerRankByTotalBets !== undefined) {
                    setPlayerRankByTotalBets(data.playerRankByTotalBets);
                }
                setLastRefreshed(now);
                setIsRefreshNeeded(false);

                setPendingPoints(0);
                savePendingPoints(0, walletAddress);
            } else {
                setIsRefreshNeeded(true);
            }
        } catch (error) {
            setIsRefreshNeeded(true);
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress]);

    // wallet address changes - simplified to just fetch data without tracking initialFetch
    useEffect(() => {
        if (walletAddress) {
            refreshUserData(true);
        } else {
            setNumBets(undefined);
            setNumWins(undefined);
            setNumLosses(undefined);
            setNetGain(undefined);
            setNumPoints(undefined);
            setTotalWagered(undefined);
            setWinPercentage(undefined);
            setPlayerRankByNetGain(undefined);
            setPlayerRankByTotalBets(undefined);
            setLastRefreshed(null);
            setPendingPoints(0);
        }
    }, [walletAddress, refreshUserData]);

    // ############ State Mutations & Utility Functions ############
    const forceRefreshData = useCallback(async () => {
        if (!walletAddress) return;
        
        // Prevent rapid consecutive force refreshes
        const now = Date.now();
        if (now - lastForceRefreshTimeRef.current < 5000) { // 5 second debounce
            console.log("Prevented rapid force refresh", { 
                elapsed: now - lastForceRefreshTimeRef.current 
            });
            return;
        }
        
        lastForceRefreshTimeRef.current = now;
        await refreshUserData(true);
    }, [walletAddress, refreshUserData]);

    const incrementPoints = useCallback((amount = 100) => {
        setNumPoints(prev => (prev === undefined ? amount : prev + amount));
        setPendingPoints(prev => {
            const newPendingPoints = prev + amount;
            savePendingPoints(newPendingPoints, walletAddress);
            return newPendingPoints;
        });
    }, [walletAddress]);

    const getPlayerRankBySortOption = useCallback((sortOption: 'net_gain' | 'total_bets') => {
        return sortOption === 'net_gain'
            ? (playerRankByNetGain !== undefined ? playerRankByNetGain : null)
            : (playerRankByTotalBets !== undefined ? playerRankByTotalBets : null);
    }, [playerRankByNetGain, playerRankByTotalBets]);

    const value: UserContextType = {
        walletAddress,
        numBets,
        numWins,
        numLosses,
        netGain,
        numPoints,
        totalWagered,
        winPercentage,
        playerRankByNetGain,
        playerRankByTotalBets,
        playerRank: playerRankByNetGain,
        isLoading,
        lastRefreshed,
        isRefreshNeeded,
        setNumBets,
        setNumWins,
        setNumLosses,
        setNetGain,
        setNumPoints,
        setTotalWagered,
        setWinPercentage,
        setPlayerRankByNetGain,
        setPlayerRankByTotalBets,
        getPlayerRankBySortOption,
        refreshUserData,
        incrementPoints,
        forceRefreshData,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserProvider(): UserContextType {
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error("User Context is null");
    }
    return context;
}
