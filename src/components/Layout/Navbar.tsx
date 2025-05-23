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
    <div className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 hover:bg-[#04e6e0]/10 hover:shadow-glow group mr-2 sm:mr-4">
      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#04e6e0]/10 to-[#8B5CF6]/10 flex items-center justify-center group-hover:from-[#04e6e0]/20 group-hover:to-[#8B5CF6]/20 transition-all duration-300">
        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#04e6e0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9z"></path>
          <path d="M11 3L8 9l4 13 4-13-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      </div>
      <div className="ml-1 sm:ml-2 flex items-center font-primary">
        <span className="text-green text-xs sm:text-sm font-medium">Points:</span>
        {showLoadingIndicator ? (
          <div className="ml-1.5 sm:ml-2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#04e6e0] animate-pulse shadow-[0_0_8px_rgba(4,230,224,0.7)]"></div>
        ) : (
          <span className="text-white text-xs sm:text-sm font-bold ml-1 sm:ml-1.5 group-hover:text-[#04e6e0] transition-colors">{numberWithCommas(points) || 0}</span>
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
  
  useEffect(() => {
    if (!mounted) return;
    
    refetchPythFee?.();
    
    const intervalId = setInterval(() => {
      refetchPythFee?.();
    }, 20000);
    
    return () => clearInterval(intervalId);
  }, [mounted, refetchPythFee]);
  
  if (!mounted) return null;
  
  const showLoadingIndicator = currPythFee === null;
  const formattedFee = currPythFee ? Number(currPythFee) / 1e18 : 0;
  
  return (
    <div className="hidden md:inline-flex items-center px-3 py-2 rounded-full transition-all duration-300 hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] group mr-4">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#8B5CF6]/10 to-[#04e6e0]/10 flex items-center justify-center group-hover:from-[#8B5CF6]/20 group-hover:to-[#04e6e0]/20 transition-all duration-300">
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

function NavLink({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`font-primary text-[#E6FFFE] hover:text-green transition-all duration-200 ${mobile ? 'text-base' : 'mr-6 lg:mr-8'}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[rgb(15, 26, 31)]/50
        backdrop-blur-lg border-b border-[#04e6e0]/20 shadow-lg shadow-black/20`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <TextMark className="h-6 sm:h-8 w-auto text-[#04e6e0] drop-shadow-[0_0_10px_rgba(4,230,224,0.3)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(4,230,224,0.5)]" />
            </Link>
            
            <div className="hidden md:flex ml-8 lg:ml-12 space-x-1">
              <NavLink href="/profile"><TextSlide text="Profile"/></NavLink>
              <NavLink href="/leaderboard"><TextSlide text="Leaderboard"/></NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {mounted && isConnected && (
              <>
                <PythFee />
                <UserPoints />
              </>
            )}
            <div className="scale-75 sm:scale-90 origin-right">
              {mounted ? connectButtonRef : <div className="h-8 sm:h-10 w-32 sm:w-36"></div>}
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden ml-2 p-1.5 text-[#04e6e0] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        <div 
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? 'max-h-40 border-t border-[#04e6e0]/10' : 'max-h-0'
          }`}
        >
          <div className="px-4 py-3 space-y-3 flex flex-col items-center">
            <NavLink href="/profile" mobile>Profile</NavLink>
            <NavLink href="/leaderboard" mobile>Leaderboard</NavLink>
          </div>
        </div>
        
        <LoadingBar />
      </div>
      
      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-14 sm:h-16 md:h-[4.5rem]"></div>
    </>
  );
}