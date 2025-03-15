'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

type ProfileData = {
  address: string;
  totalBets: number;
  totalWagered: number;
  totalProfit: number;
  wins: number;
  losses: number;
  winRate: number;
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      const PROFILE_STORAGE_KEY = `hyperflip_profile_${address.toLowerCase()}`;
      const storedData = localStorage.getItem(PROFILE_STORAGE_KEY);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setProfileData(parsedData);
        console.log('Loaded profile data:', parsedData);
      } else {
        // Initialize with empty profile
        const emptyProfile = {
          address: address.toLowerCase(),
          totalBets: 0,
          totalWagered: 0,
          totalProfit: 0,
          wins: 0,
          losses: 0,
          winRate: 0
        };
        setProfileData(emptyProfile);
        console.log('No profile data found, using empty profile');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#04e6e0]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="logo-text text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#04e6e0] to-[#03a8a3] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)]">
              HyperFlip
            </Link>
          </div>
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#04e6e0] mb-8 text-center">Your Profile</h1>

        {!isConnected ? (
          <div className="bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg text-center">
            <p className="text-xl mb-4">Connect your wallet to view your profile</p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : isLoading ? (
          <div className="bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : profileData ? (
          <div className="bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/50 border border-[#04e6e0]/10 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-[#04e6e0] mb-2">Betting Stats</h2>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Total Bets:</span>
                    <span className="font-medium">{profileData.totalBets}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Total Wagered:</span>
                    <span className="font-medium">{profileData.totalWagered.toFixed(2)} HYPE</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Win/Loss Record:</span>
                    <span className="font-medium">{profileData.wins}W - {profileData.losses}L</span>
                  </p>
                </div>
              </div>

              <div className="bg-black/50 border border-[#04e6e0]/10 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-[#04e6e0] mb-2">Performance</h2>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="font-medium">{profileData.winRate}%</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Total Profit/Loss:</span>
                    <span className={`font-medium ${profileData.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profileData.totalProfit >= 0 ? '+' : ''}{profileData.totalProfit.toFixed(2)} HYPE
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">ROI:</span>
                    <span className={`font-medium ${profileData.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profileData.totalWagered > 0 
                        ? `${((profileData.totalProfit / profileData.totalWagered) * 100).toFixed(2)}%` 
                        : '0.00%'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-black/50 border border-[#04e6e0]/10 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-[#04e6e0] mb-4">Betting History</h2>
              {profileData.totalBets > 0 ? (
                <div className="overflow-x-auto">
                  <p className="text-center text-gray-400">
                    You've placed {profileData.totalBets} bets with a win rate of {profileData.winRate}%.
                    <br />
                    Check the main page to see your recent bet history.
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-400">You haven't placed any bets yet. Head back to the main page to start flipping!</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="inline-block px-6 py-3 bg-[#04e6e0] text-black rounded-lg font-bold hover:bg-[#04e6e0]/80 transition-all"
                onClick={() => {
                  // COMPLETE RESET: Clear ALL game state in localStorage
                  localStorage.removeItem('gameState');
                  localStorage.removeItem('gameResult');
                  localStorage.removeItem('lastProcessedBet');
                  localStorage.removeItem('pendingBetAmount');
                  
                  // Clear any other game-related state
                  localStorage.removeItem('currentBetAmount');
                  
                  // Set a flag with timestamp to force a complete reset
                  const timestamp = Date.now();
                  sessionStorage.setItem('force_reset', 'true');
                  sessionStorage.setItem('reset_timestamp', timestamp.toString());
                  console.log('Set force_reset flag with timestamp:', timestamp);
                }}
              >
                Back to Flipping
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg text-center">
            <p className="text-xl mb-4">No profile data found</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-[#04e6e0] text-black rounded-lg font-bold hover:bg-[#04e6e0]/80 transition-all"
            >
              Start Flipping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 