'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import DiamondTrophySVG from '@/components/Icons/DiamondTrophySVG';
import { LeaderboardContent } from '@/components/Leaderboard';
import { UserProvider } from '@/providers/UserProvider';


const LoadingFallback = () => {  
  return (
    <div className="min-h-screen bg-background-dark text-white pt-24 pb-12 px-4">
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-wider flex items-center">
            <DiamondTrophySVG className="mr-3 text-5xl text-primary" />
            <span className="text-gradient-primary">LEADERBOARD</span>
          </h1>
          <Link href="/" className="text-primary bg-primary-light hover:bg-primary-medium px-4 py-2 rounded-md border border-primary-dark transition-all duration-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Game
          </Link>
        </div>
        
        <div className="mt-8 text-center text-gray-400">
          <p>Loading leaderboard data...</p>
        </div>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <UserProvider initialAddress={address}>
        <LeaderboardContent />
      </UserProvider>
    </Suspense>
  );
}
