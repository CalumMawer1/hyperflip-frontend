"use client"

import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { Address } from "viem";

// #################### Constants & Interfaces ####################
const PENDING_POINTS_KEY_PREFIX = 'hyperflip_pending_points_';
const LAST_REFRESH_KEY_PREFIX = 'hyperflip_last_refresh_';
const USER_DATA_KEY_PREFIX = 'hyperflip_user_data_';
const USER_ETAG_KEY_PREFIX = 'hyperflip_user_etag_';

interface UserContextType {
    walletAddress?: Address;
    numBets?: number;
    numWins?: number;
    numLosses?: number;
    netGain?: number;
    numPoints?: number; // just numBets * 100
    totalWagered?: number;
    winPercentage?: number;
    playerRankByNetGain?: number | string | null;
    playerRankByTotalBets?: number | string | null;
    playerRank?: number | string | null; // For backward compatibility
    isLoading: boolean;
    lastRefreshed: number | null;
    isRefreshNeeded: boolean;

    setWalletAddress: (addr: Address) => void;
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


export function UserProvider({ children, initialAddress }: UserProviderInput) {
    const [walletAddress, setWalletAddress] = useState<Address | undefined>(initialAddress);
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

    // #################### Key Generators ####################
    const getLastRefreshKey = useCallback((address?: Address) => {
        return address ? `${LAST_REFRESH_KEY_PREFIX}${address.toLowerCase()}` : null;
    }, []);

    const getPendingPointsKey = useCallback((address?: Address) => {
        return address ? `${PENDING_POINTS_KEY_PREFIX}${address.toLowerCase()}` : null;
    }, []);

    const getUserDataKey = useCallback((address?: Address) => {
        return address ? `${USER_DATA_KEY_PREFIX}${address.toLowerCase()}` : null;
    }, []);

    const getETagKey = useCallback((address?: Address) => {
        return address ? `${USER_ETAG_KEY_PREFIX}${address.toLowerCase()}` : null;
    }, []);

    // ############################ Local Storage #############################
    // last refresh
    const saveLastRefreshTime = useCallback((timestamp: number, address?: Address) => {
        if (!address || typeof window === 'undefined') return;
        const key = getLastRefreshKey(address);
        if (!key) return;
        try {
            localStorage.setItem(key, timestamp.toString());
        } catch (e) {
            console.error('Error saving last refresh time:', e);
        }
    }, [getLastRefreshKey]);

    const loadLastRefreshTime = useCallback((address?: Address) => {
        if (!address || typeof window === 'undefined') return null;
        const key = getLastRefreshKey(address);
        if (!key) return null;
        try {
            const stored = localStorage.getItem(key);
            return stored ? parseInt(stored, 10) : null;
        } catch (e) {
            console.error('Error loading last refresh time:', e);
            return null;
        }
    }, [getLastRefreshKey]);

    // pending points
    const loadPendingPoints = useCallback((address?: Address) => {
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
    }, [getPendingPointsKey]);

    const savePendingPoints = useCallback((points: number, address?: Address) => {
        if (!address || typeof window === 'undefined') return;
        const key = getPendingPointsKey(address);
        if (!key) return;
        try {
            localStorage.setItem(key, points.toString());
        } catch (e) {
            console.error('Error saving pending points:', e);
        }
    }, [getPendingPointsKey]);

    // user data
    const saveUserData = useCallback((data: any, address?: Address) => {
        if (!address || typeof window === 'undefined') return;
        const key = getUserDataKey(address);
        if (!key) return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving user data to localStorage:', e);
        }
    }, [getUserDataKey]);

    const loadUserData = useCallback((address?: Address) => {
        if (!address || typeof window === 'undefined') return null;
        const key = getUserDataKey(address);
        if (!key) return null;
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Error loading user data from localStorage:', e);
            return null;
        }
    }, [getUserDataKey]);

    // handle ETags
    const saveETag = useCallback((etag: string, address?: Address) => {
        if (!address || typeof window === 'undefined') return;
        const key = getETagKey(address);
        if (!key) return;
        try {
            localStorage.setItem(key, etag);
        } catch (e) {
            console.error('Error saving ETag:', e);
        }
    }, [getETagKey]);

    const loadETag = useCallback((address?: Address) => {
        if (!address || typeof window === 'undefined') return null;
        const key = getETagKey(address);
        if (!key) return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error loading ETag:', e);
            return null;
        }
    }, [getETagKey]);

    // ############################### Load Cached Data ###################################
    useEffect(() => {
        if (walletAddress) {
            const points = loadPendingPoints(walletAddress);
            setPendingPoints(points);

            const lastRefresh = loadLastRefreshTime(walletAddress);
            if (lastRefresh) {
                setLastRefreshed(lastRefresh);
            }

            const userData = loadUserData(walletAddress);
            if (userData) {
                setNumBets(userData.numBets);
                setNumWins(userData.numWins);
                setNumLosses(userData.numLosses);
                setNetGain(userData.netGain);
                setTotalWagered(userData.totalWagered);
                setWinPercentage(userData.winPercentage);
                setNumPoints(userData.numPoints);
                setPlayerRankByNetGain(userData.playerRankByNetGain);
                setPlayerRankByTotalBets(userData.playerRankByTotalBets);

                if (lastRefresh && Date.now() - lastRefresh > 5 * 60 * 1000) {
                    setIsRefreshNeeded(true);
                }
            } else {
                setIsRefreshNeeded(true);
            }
        }
    }, [walletAddress, loadPendingPoints, loadLastRefreshTime, loadUserData]);

    // ############################## Data Refresh ####################################
    const refreshUserData = useCallback(async (forceRefresh = false) => {
        if (!walletAddress) return;

        console.log('RefreshUserData called for wallet:', walletAddress);
        setIsLoading(true);
        try {
            // get the stored ETag unless forcing a refresh
            const etag = forceRefresh ? null : loadETag(walletAddress);
            const fetchOptions: RequestInit = { method: 'GET', headers: {} };

            if (etag) {
                fetchOptions.headers = { 'If-None-Match': etag };
            }

            const response = await fetch(`/api/user/${walletAddress}`, fetchOptions);

            if (response.status === 304) {
                const userData = loadUserData(walletAddress);
                if (userData) {
                    const pendingPoints = loadPendingPoints(walletAddress);
                    setNumBets(userData.numBets);
                    setNumWins(userData.numWins);
                    setNumLosses(userData.numLosses);
                    setNetGain(userData.netGain);
                    setTotalWagered(userData.totalWagered);
                    setWinPercentage(userData.winPercentage);
                    setNumPoints(userData.numPoints + pendingPoints);
                    setPlayerRankByNetGain(userData.playerRankByNetGain);
                    setPlayerRankByTotalBets(userData.playerRankByTotalBets);

                    const now = Date.now();
                    setLastRefreshed(now);
                    setIsRefreshNeeded(false);
                    saveLastRefreshTime(now, walletAddress);
                }
                setIsLoading(false);
                return;
            }

            if (response.ok) {
                const newEtag = response.headers.get('ETag');
                if (newEtag) {
                    saveETag(newEtag, walletAddress);
                }

                const data = await response.json();

                const serverPoints = (data.totalBets || 0) * 100;
                const now = Date.now();
                const totalPoints = serverPoints

                setNumBets(data.totalBets || 0);
                setNumWins(data.wins || 0);
                setNumLosses(data.losses || 0);
                setNetGain(data.totalProfit || 0);
                setTotalWagered(data.totalWagered || 0);
                setWinPercentage(data.winPercentage || 0);
                setNumPoints(totalPoints);

                if (data.playerRankByNetGain !== undefined) {
                    setPlayerRankByNetGain(data.playerRankByNetGain);
                } 

                if (data.playerRankByTotalBets !== undefined) {
                    setPlayerRankByTotalBets(data.playerRankByTotalBets);
                } 

                setLastRefreshed(now);
                setIsRefreshNeeded(false);
                saveLastRefreshTime(now, walletAddress);

                // save to local storage
                const userData = {
                    numBets: data.totalBets || 0,
                    numWins: data.wins || 0,
                    numLosses: data.losses || 0,
                    netGain: data.totalProfit || 0,
                    totalWagered: data.totalWagered || 0,
                    winPercentage: data.winPercentage || 0,
                    numPoints: totalPoints,
                    playerRankByNetGain: data.playerRankByNetGain,
                    playerRankByTotalBets: data.playerRankByTotalBets
                };
                saveUserData(userData, walletAddress);

                if (forceRefresh) {
                    setPendingPoints(0);
                    savePendingPoints(0, walletAddress);
                }
            } else {
                console.error(`Failed to fetch profile data: Status ${response.status}`);
                setIsRefreshNeeded(true);
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            setIsRefreshNeeded(true);
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress, loadPendingPoints, savePendingPoints, saveLastRefreshTime, saveUserData, loadUserData, loadETag, saveETag]);

    useEffect(() => {
        if (walletAddress) {
            setIsRefreshNeeded(true);
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
        }
    }, [walletAddress]);

    // #################### State Mutations & Utility Functions ####################
    const forceRefreshData = useCallback(async () => {
        if (!walletAddress) return;
        // Clear pending points and force refresh API call
        setPendingPoints(0);
        savePendingPoints(0, walletAddress);
        await refreshUserData(true);
    }, [walletAddress, refreshUserData, savePendingPoints]);

    const incrementPoints = useCallback((amount = 100) => {
        // Update overall points and persist changes
        setNumPoints(prev => {
            const updatedPoints = prev === undefined ? amount : prev + amount;
            if (walletAddress) {
                const userData = loadUserData(walletAddress);
                if (userData) {
                    userData.numPoints = updatedPoints;
                    saveUserData(userData, walletAddress);
                }
            }
            return updatedPoints;
        });

        setPendingPoints(prev => {
            const newPendingPoints = prev + amount;
            savePendingPoints(newPendingPoints, walletAddress);
            return newPendingPoints;
        });

        // Update bets count when default amount is added
        if (amount === 100) {
            setNumBets(prev => (prev === undefined ? 1 : prev + 1));
        }
    }, [walletAddress, savePendingPoints, loadUserData, saveUserData]);

    const getPlayerRankBySortOption = useCallback((sortOption: 'net_gain' | 'total_bets') => {
        return sortOption === 'net_gain'
            ? (playerRankByNetGain !== undefined ? playerRankByNetGain : null)
            : (playerRankByTotalBets !== undefined ? playerRankByTotalBets : null);
    }, [playerRankByNetGain, playerRankByTotalBets]);

    // #################### Context Value & Provider ####################
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
        setWalletAddress,
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
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserProvider(): UserContextType {
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error("User Context is null");
    }
    return context;
}
