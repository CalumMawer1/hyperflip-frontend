"use client"

import { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Address } from "viem";
import { useAccount } from 'wagmi';
import { getUserData } from '../services/apiService';


const PENDING_POINTS_KEY_PREFIX = 'hyperflip_pending_points_';

interface UserData {
    numBets: number;
    numWins: number;
    numLosses: number;
    netGain: number;
    numPoints: number;
    totalWagered: number;
    winPercentage: number;
    playerRankByNetGain: number | null;
    playerRankByTotalWagered?: number | null;
}

interface UserContextType {
    walletAddress?: Address;
    userData: UserData;
    isLoading: boolean;
    points: number;
    updateUserData: (data: Partial<UserData>) => void;
    getPlayerRankBySortOption: (sortOption: 'net_gain' | 'total_wagered') => number | null;
    refreshUserData: (forceRefresh?: boolean) => Promise<void>;
    incrementPoints: (amount?: number) => void;
    handleNewBet: (amountBet: number, outcome: 0 | 1) => void;
}

const defaultUserData: UserData = {
    numPoints: 0,
    numBets: 0,
    numWins: 0,
    numLosses: 0,
    netGain: 0,
    totalWagered: 0,
    winPercentage: 0,
    playerRankByNetGain: null,
    playerRankByTotalWagered: null
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


export function UserProvider({ children }: UserProviderInput) {
    const {address: walletAddress} = useAccount();
    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [numPoints, setNumPoints] = useState<number>(0);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // load pending points
    useEffect(() => {
        if (walletAddress) {
            refreshUserData();
        }
    }, [walletAddress]);

    const updateUserData = useCallback((data: Partial<UserData>) => {
        setUserData(prev => ({ ...prev, ...data }));
    }, []);

    const refreshUserData = useCallback(async () => {
        if (!walletAddress) {
            return;
        }

        setIsLoading(true);

        try {
            const data = await getUserData(walletAddress);

            if (data !== null) {
                const serverPoints = (data.totalWagered || 0) * 100;
                console.log("User data received:", data); 

                setUserData({
                    numBets: data.totalBets || 0,
                    numWins: data.wins || 0,
                    numLosses: data.losses || 0,
                    netGain: data.totalProfit || 0,
                    totalWagered: data.totalWagered || 0,
                    winPercentage: data.winPercentage || 0,
                    numPoints: serverPoints,
                    playerRankByNetGain: data.playerRankByNetGain,
                    playerRankByTotalWagered: data.playerRankByTotalWagered
                });
                setNumPoints(serverPoints);

            } else {
                console.log("User data received: null");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress, userData.numPoints]);

    // ############ State Mutations & Utility Functions ############
    const incrementPoints = useCallback((amount = 100) => {
        setUserData(prev => ({
            ...prev,
            numPoints: (prev.numPoints === undefined ? amount : prev.numPoints + amount)
        }));
        
    }, [walletAddress]);

    const handleNewBet = useCallback((amountBet: number, outcome: 0 | 1) => {
        if (!walletAddress) return;
        

        setUserData(prev => {
            const newNumPoints = prev.numPoints + 100 * amountBet;
            const newTotBets = prev.numBets + 1;
            const newTotWagered = prev.totalWagered + amountBet;
            const newWinPercentage = prev.winPercentage + (outcome === 1 ? 1 : -1);
            const newTotWins = prev.numWins + (outcome === 1 ? 1 : 0);
            const newTotLosses = prev.numLosses + (outcome === 0 ? 1 : 0);

            return {
                ...prev,
                numBets: newTotBets,
                numWins: newTotWins,
                numLosses: newTotLosses,
                numPoints: newNumPoints,
                totalWagered: newTotWagered,
                winPercentage: newWinPercentage
            };
        });
        setNumPoints((prev) => prev + 100 * amountBet);
    }, [walletAddress, incrementPoints]);

    const getPlayerRankBySortOption = useCallback((sortOption: 'net_gain' | 'total_wagered'): number | null => {
        const rank = sortOption === 'net_gain' ? userData.playerRankByNetGain : userData.playerRankByTotalWagered;
        return rank !== undefined ? rank : null;
    }, [userData.playerRankByNetGain, userData.playerRankByTotalWagered]);

    const value: UserContextType = {
        walletAddress,
        userData,
        isLoading,
        updateUserData,
        getPlayerRankBySortOption,
        refreshUserData,
        incrementPoints,
        handleNewBet,
        points: numPoints
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
