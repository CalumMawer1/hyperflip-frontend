'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

// Define the type for leaderboard entries
type LeaderboardEntry = {
  address: string;
  totalBets: number;
  totalWagered: number;
  totalProfit: number;
  winRate: number;
};

// Add CSS for the futuristic background
const backgroundStyles = `
  .futuristic-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #000, #001a1a);
    z-index: -1;
    overflow: hidden;
  }
  
  .futuristic-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 35%, rgba(4, 230, 224, 0.15) 0%, transparent 25%),
      radial-gradient(circle at 80% 10%, rgba(4, 230, 224, 0.1) 0%, transparent 20%);
  }
  
  .grid-lines {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: 
      linear-gradient(rgba(4, 230, 224, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(4, 230, 224, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: perspective(500px) rotateX(60deg);
    animation: gridMove 60s linear infinite;
    opacity: 0.4;
  }
  
  .glow-circle {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(4, 230, 224, 0.2) 0%, transparent 70%);
    filter: blur(20px);
    opacity: 0.5;
    animation: pulse 10s ease-in-out infinite;
  }
  
  .glow-circle:nth-child(1) {
    top: 20%;
    left: 70%;
    animation-delay: 0s;
  }
  
  .glow-circle:nth-child(2) {
    top: 60%;
    left: 30%;
    width: 200px;
    height: 200px;
    animation-delay: -5s;
  }
  
  @keyframes gridMove {
    0% {
      transform: perspective(500px) rotateX(60deg) translateY(0);
    }
    100% {
      transform: perspective(500px) rotateX(60deg) translateY(50px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }
`;

// Local storage key for leaderboard data
const LEADERBOARD_STORAGE_KEY = 'hyperflip_leaderboard_data';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  // Load leaderboard data from local storage only
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setIsLoading(true);
      
      try {
        // Only load data from local storage
        let storedData: LeaderboardEntry[] = [];
        if (typeof window !== 'undefined') {
          const storedDataString = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
          if (storedDataString) {
            storedData = JSON.parse(storedDataString);
            console.log('Loaded data from local storage:', storedData);
            
            // Sort by total profit (highest first)
            storedData.sort((a, b) => b.totalProfit - a.totalProfit);
          }
          
          // Update the leaderboard state with the local storage data
          setLeaderboard(storedData);
        }
      } catch (err) {
        console.error('Error loading leaderboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeaderboardData();
  }, []);

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="futuristic-background">
        <div className="grid-lines"></div>
        <div className="glow-circle"></div>
        <div className="glow-circle"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <h1 className="logo-text text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#04e6e0] to-[#03a8a3] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)] cursor-pointer">
            HyperFlip
          </h1>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-4xl mx-auto px-4 pt-24 pb-8">
        <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>
        
        {isLoading ? (
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-[#04e6e0]/20">
                    <th className="py-3 px-4 text-left">Rank</th>
                    <th className="py-3 px-4 text-left">Player</th>
                    <th className="py-3 px-4 text-right">Total Bets</th>
                    <th className="py-3 px-4 text-right">Win Rate</th>
                    <th className="py-3 px-4 text-right">Total Wagered</th>
                    <th className="py-3 px-4 text-right">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = address && entry.address.toLowerCase() === address.toLowerCase();
                    
                    return (
                      <tr 
                        key={entry.address} 
                        className={`border-b border-[#04e6e0]/10 ${isCurrentUser ? 'bg-[#04e6e0]/10' : ''} hover:bg-[#04e6e0]/5 transition-colors`}
                      >
                        <td className="py-3 px-4">
                          {index === 0 ? (
                            <span className="text-yellow-400 font-bold">🏆 1</span>
                          ) : index === 1 ? (
                            <span className="text-gray-300 font-bold">🥈 2</span>
                          ) : index === 2 ? (
                            <span className="text-amber-600 font-bold">🥉 3</span>
                          ) : (
                            <span className="text-gray-400">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {isCurrentUser ? (
                            <span className="font-bold text-[#04e6e0]">You ({formatAddress(entry.address)})</span>
                          ) : (
                            formatAddress(entry.address)
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">{entry.totalBets}</td>
                        <td className="py-3 px-4 text-right">{entry.winRate.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">{entry.totalWagered.toFixed(2)} HYPE</td>
                        <td className={`py-3 px-4 text-right font-bold ${entry.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.totalProfit >= 0 ? '+' : ''}{entry.totalProfit.toFixed(2)} HYPE
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg text-center">
            <p className="text-white text-lg">No leaderboard data available yet. Start playing to be the first on the leaderboard!</p>
          </div>
        )}
        
        <div className="mt-8">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                // Force a full page reload to clear all state
                window.location.href = '/';
              }
            }}
            className="px-6 py-3 bg-[#04e6e0] text-black rounded-lg font-bold hover:bg-[#04e6e0]/80 transition-all"
          >
            Back to Game
          </button>
        </div>
      </div>

      <style jsx>{backgroundStyles}</style>
    </div>
  );
} 