'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CircularIndicator, StatsCard, ProfileCard } from '@/components/Profile';
import { UserProvider, useUserProvider } from '@/providers/UserProvider';
import Navbar from '@/components/Layout/Navbar';
import FuturisticBackground from '@/components/Layout/FuturisticBackground';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimeSince = (timestamp: number | null) => {
    if (!timestamp) return "never";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background-dark text-white">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-primary-dark">
          <div className="w-full px-16 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="h-8 w-28 bg-primary-light rounded"></div>
            </div>
            <div className="h-10 w-32 bg-primary-light rounded"></div>
          </div>
        </div>
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative">
          <div className="flex items-center justify-center mb-8">
            <div className="h-10 w-56 bg-primary-light rounded"></div>
          </div>
          <div className="bg-background-dark/30 rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <UserProvider initialAddress={address}>
      <ProfileContent 
        formatTimeSince={formatTimeSince} 
        formatAddress={formatAddress} 
      />
    </UserProvider>
  );
}

function ProfileContent({ formatTimeSince, formatAddress }: { 
  formatTimeSince: (timestamp: number | null) => string; 
  formatAddress: (address: string | undefined) => string;
}) {
  const { 
    walletAddress: address,
    numBets: totalBets,
    numWins: wins,
    numLosses: losses,
    netGain: totalProfit,
    totalWagered,
    winPercentage,
    numPoints,
    isLoading: loading,
    lastRefreshed,
    refreshUserData,
    isRefreshNeeded,
  } = useUserProvider();

  // Debug logging
  useEffect(() => {
    console.log('Profile data:', {
      address,
      totalBets,
      wins,
      losses,
      totalProfit,
      totalWagered,
      winPercentage,
      numPoints,
      loading,
      lastRefreshed
    });
  }, [address, totalBets, wins, losses, totalProfit, totalWagered, winPercentage, numPoints, loading, lastRefreshed]);

  useEffect(() => {
    if (address) {
      refreshUserData(true);
    }
  }, [address, refreshUserData]);
  
  const displayTotalWagered = totalWagered || 0;

  const displayWinRate = winPercentage !== undefined 
    ? Math.round(winPercentage * 100) 
    : (totalBets && totalBets > 0 ? Math.round((wins || 0) / totalBets * 100) : 0);
  
  // const renderLastUpdated = () => {
  //   if (typeof window === 'undefined' || !lastRefreshed) return null;
    
  //   const formattedTime = formatTimeSince(lastRefreshed);
    
  //   return (
  //     <div className="text-sm text-gray-400 mt-1 sm:mt-0 flex items-center justify-end">
  //       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  //       </svg>
  //       Updated: {formattedTime}
  //       <button 
  //         onClick={() => refreshUserData(true)}
  //         className={`ml-2 text-primary hover:text-primary/80 transition-colors ${isRefreshNeeded ? 'animate-pulse' : ''}`}
  //         title={isRefreshNeeded ? "Update available" : "Check for updates"}
  //         disabled={loading}
  //       >
  //         <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //         </svg>
  //       </button>
  //     </div>
  //   );
  // };

  return (
    <FuturisticBackground>
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-4 mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary tracking-wider flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 mr-3 text-primary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
            PROFILE
          </h1>
          <Link 
            href="/" 
            className="text-primary bg-primary-light hover:bg-primary-medium px-4 py-2 rounded-md border border-primary-dark transition-all duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Game
          </Link>
        </div>
        
        {!address ? (
          <div className="card-glow p-8 text-center">
            <div className="inline-block p-4 rounded-full bg-primary-light mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xl mb-6 text-primary">No profile data found</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-gradient-primary text-black rounded-lg font-bold hover:shadow-glow-lg transition-all transform hover:-translate-y-0.5"
            >
              Start Flipping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <ProfileCard 
              title={
                <div className="w-full flex flex-start">
                  <div className="w-8 h-8 rounded-full bg-primary-light border border-primary-dark flex items-center justify-center mr-3">
                    <span className="text-primary text-sm">ID</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    <span className="font-mono text-sm text-primary">{address}</span>
                  </h2>
                </div>
              }
              headerContent={<></>
                // <div className="flex-col w-full justify-end items-center">
                //   {renderLastUpdated()}
                // </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Total Bets">
                  <span className="text-2xl font-bold text-white">{totalBets || 0}</span>
                  <div className="flex space-x-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-400">Wins</span>
                      <span className="text-success font-bold">{wins || 0}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-400">Losses</span>
                      <span className="text-error font-bold">{losses || 0}</span>
                    </div>
                  </div>
                </StatsCard>
                
                <StatsCard title="Win Rate">
                  <span className="text-2xl font-bold text-white">{displayWinRate}%</span>
                  <CircularIndicator percentage={displayWinRate} />
                </StatsCard>
                
                <StatsCard title="Total Wagered">
                  <span className="text-2xl font-bold text-primary">{displayTotalWagered.toFixed(2)} HYPE</span>
                </StatsCard>
              </div>
              
              <div className="mt-4 bg-background-dark/40 p-5 rounded-lg border border-primary-light hover:border-primary-dark transition-all duration-300 hover:shadow-glow">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-400 text-sm">Profit & Loss</div>
                  <div className={`text-lg font-bold ${totalProfit && totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
                    {totalProfit && totalProfit >= 0 ? '+' : ''}{totalProfit?.toFixed(2)} HYPE
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-xs">ROI:</div>
                  <div className={`text-sm font-medium ${totalProfit && totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
                    {displayTotalWagered > 0 
                      ? `${((totalProfit || 0) / displayTotalWagered * 100).toFixed(2)}%` 
                      : '0.00%'}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-background-dark/40 p-5 rounded-lg border border-primary-light hover:border-primary-dark transition-all duration-300 hover:shadow-glow">
                <div className="flex justify-between items-center">
                  <div className="text-gray-400 text-sm">Total Points</div>
                  <div className="text-lg font-bold text-primary">
                    {numPoints || 0} pts
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  You earn 100 points for each bet you complete
                </div>
              </div>
            </ProfileCard>

            <div className="bg-background-dark/50 border border-primary-light p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-400">May take a couple minutes for your profile to update. Visit the <Link href="/leaderboard" className="text-primary hover:underline">leaderboard</Link> to see how you rank against other players!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </FuturisticBackground>
  );
}

