'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TextMark from '@/components/Icons/TextMark';
import { useUserProvider } from '@/providers/UserProvider';
import LoadingBar from '../utils/LoadingBar';
import TextSlide from '../utils/TextSlide';
import { usePlaceBet } from '@/hooks/usePlaceBet';

function numberWithCommas(x: number | undefined) {
  if (!x) return x;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function UserPoints() {
  const { isLoading, points } = useUserProvider();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const showLoadingIndicator = isLoading && points === undefined;
  
  return (
    <div className="inline-flex items-center px-3 py-2 rounded-full transition-all duration-300 hover:bg-[#04e6e0]/10 hover:shadow-glow group mr-4">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#04e6e0]/10 to-[#8B5CF6]/10 flex items-center justify-center group-hover:from-[#04e6e0]/20 group-hover:to-[#8B5CF6]/20 transition-all duration-300">
        {/* Diamond/Gem Icon */}
        <svg className="h-3.5 w-3.5 text-[#04e6e0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9z"></path>
          <path d="M11 3L8 9l4 13 4-13-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      </div>
      <div className="ml-2 flex items-center font-primary">
        <span className="text-green text-sm font-medium">Points:</span>
        {showLoadingIndicator ? (
          <div className="ml-2 w-2 h-2 rounded-full bg-[#04e6e0] animate-pulse shadow-[0_0_8px_rgba(4,230,224,0.7)]"></div>
        ) : (
          <span className="text-white font-bold ml-1.5 group-hover:text-[#04e6e0] transition-colors">{numberWithCommas(points) || 0}</span>
        )}
      </div>
    </div>
  );
}

function PythFee() {
  const { currPythFee, refetchPythFee } = usePlaceBet({ watchEvents: false });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Add periodic refresh of Pyth fee every 20 seconds
  useEffect(() => {
    if (!mounted) return;
    
    // Initial fetch
    refetchPythFee?.();
    
    // Set up interval for refreshing fee
    const intervalId = setInterval(() => {
      refetchPythFee?.();
    }, 20000); // 20 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [mounted, refetchPythFee]);
  
  if (!mounted) return null;
  
  const showLoadingIndicator = currPythFee === null;
  const formattedFee = currPythFee ? Number(currPythFee) / 1e18 : 0;
  
  return (
    <div className="inline-flex items-center px-3 py-2 rounded-full transition-all duration-300 hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] group mr-4">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#8B5CF6]/10 to-[#04e6e0]/10 flex items-center justify-center group-hover:from-[#8B5CF6]/20 group-hover:to-[#04e6e0]/20 transition-all duration-300">
        {/* Fee Icon */}
        <svg className="h-3.5 w-3.5 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <div className="ml-2 flex items-center font-primary">
        <span className="text-purple-400 text-sm font-medium">Current Pyth Fee:</span>
        {showLoadingIndicator ? (
          <div className="ml-2 w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.7)]"></div>
        ) : (
          <span className="text-white font-bold ml-1.5 group-hover:text-[#8B5CF6] transition-colors">{formattedFee.toFixed(5)} HYPE</span>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="font-primary mr-8 text-[#E6FFFE] hover:text-green transition-all duration-200"
    >
      {
      children
      
      }
    </Link>
  );
}

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();
  const connectButtonRef = useMemo(() => <ConnectButton />, []);

  const {refreshUserData} = useUserProvider();

  useEffect(() => {
    setMounted(true);
    
    
  }, []);

  useEffect(() => {
    if (mounted && address) {
      refreshUserData(true);
    }
  }, [mounted, address, refreshUserData]);

  const navbarContent = (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[rgb(15, 26, 31)]/50
      isScrolled backdrop-blur-lg border-b border-[#04e6e0]/20 shadow-lg shadow-black/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <TextMark className="h-8 w-auto text-[#04e6e0] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(4,230,224,0.5)]" />
          </Link>
          
          <div className="hidden sm:flex ml-12 space-x-1">
            <NavLink href="/profile"><TextSlide text="Profile"/></NavLink>
            <NavLink href="/leaderboard"><TextSlide text="Leaderboard"/></NavLink>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {mounted && isConnected && (
            <>
              <PythFee />
              <UserPoints />
            </>
          )}
          <div className="scale-90 origin-right">
            {mounted ? connectButtonRef : <div className="h-10 w-36"></div>}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-[#04e6e0]/10 px-4 py-1.5 flex justify-center space-x-6">
        <NavLink href="/profile">Profile</NavLink>
        <NavLink href="/leaderboard">Leaderboard</NavLink>
      </div>
      
      <LoadingBar />
    </div>
  );

  return navbarContent;
}