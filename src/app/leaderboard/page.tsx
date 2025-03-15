'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Separate component that uses searchParams
function LeaderboardContent() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        setLoading(true);
        
        // First try to get data from localStorage
        let data = [];
        const LEADERBOARD_STORAGE_KEY = 'hyperflip_leaderboard_data';
        
        try {
          const storedData = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
          if (storedData) {
            data = JSON.parse(storedData);
            console.log('Loaded data from localStorage:', data);
          }
        } catch (e) {
          console.error('Error reading from localStorage:', e);
        }
        
        // If no data in localStorage, try the API
        if (data.length === 0) {
          try {
            const response = await fetch('/api/leaderboard');
            if (!response.ok) throw new Error('Failed to fetch leaderboard data');
            data = await response.json();
            console.log('Fetched data from API:', data);
            
            // Save API data to localStorage for future use
            localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
          } catch (apiError) {
            console.error('API fetch failed:', apiError);
            // If both localStorage and API fail, show error
            if (data.length === 0) {
              throw new Error('Failed to load leaderboard data');
            }
          }
        }
        
        // Sort by total profit (highest first)
        const sortedData = [...data].sort((a, b) => b.totalProfit - a.totalProfit);
        
        setLeaderboard(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchLeaderboardData();
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle back to game with reset
  const handleBackToGame = () => {
    // Clear game state in localStorage
    localStorage.removeItem('gameResult');
    localStorage.removeItem('lastProcessedBet');
    
    // Force a full page reload to clear all state
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#04e6e0]">Leaderboard</h1>
          <button 
            onClick={handleBackToGame}
            className="text-[#04e6e0] hover:underline"
          >
            Back to Game
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#04e6e0] border-r-transparent"></div>
            <p className="mt-4">Loading leaderboard data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg text-center">
            <p>{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-gray-900/30 border border-gray-700 p-8 rounded-lg text-center">
            <p className="text-xl">No data available yet.</p>
            <p className="mt-2 text-gray-400">Be the first to place a bet and appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="w-full bg-black/80 border border-[#04e6e0]/20 p-6 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#04e6e0]/20">
                    <th className="py-3 px-4 text-left">#</th>
                    <th className="py-3 px-4 text-left">Player</th>
                    <th className="py-3 px-4 text-right">Total Bets</th>
                    <th className="py-3 px-4 text-right">Win Rate</th>
                    <th className="py-3 px-4 text-right">Total Wagered</th>
                    <th className="py-3 px-4 text-right">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const isCurrentUser = address && player.address.toLowerCase() === address.toLowerCase();
                    
                    return (
                      <tr 
                        key={player.address}
                        className={`border-b border-[#04e6e0]/10 ${isCurrentUser ? 'bg-[#04e6e0]/10' : ''} hover:bg-[#04e6e0]/5 transition-colors`}
                      >
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 font-mono">
                          {isCurrentUser ? (
                            <span className="font-bold text-[#04e6e0]">You ({formatAddress(player.address)})</span>
                          ) : (
                            formatAddress(player.address)
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">{player.totalBets}</td>
                        <td className="py-3 px-4 text-right">{player.winRate}%</td>
                        <td className="py-3 px-4 text-right">{player.totalWagered.toFixed(2)} HYPE</td>
                        <td className={`py-3 px-4 text-right font-bold ${player.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit.toFixed(2)} HYPE
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-400">
          <p>Note: Leaderboard data is stored in your browser. To see data from other users, they must share their results.</p>
        </div>
      </div>
    </div>
  );
}

// Main component with suspense boundary
export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#04e6e0]">Leaderboard</h1>
            <Link href="/" className="text-[#04e6e0] hover:underline">
              Back to Game
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#04e6e0] border-r-transparent"></div>
            <p className="mt-4">Loading leaderboard data...</p>
          </div>
        </div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
} 