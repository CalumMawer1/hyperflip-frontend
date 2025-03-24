import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import AnimatedDiamondTrophySVG from '../Icons/AnimatedDiamondTrophySVG';
import { Leaderboard } from './types';
import { fetchBlock, getCachedBlock, BLOCK_SIZE } from './utils';
import LeaderboardTable from './LeaderboardTable';
import Pagination from './Pagination';
import { ErrorState, NoDataState } from './StatusComponents';
import Navbar from '@/components/Layout/Navbar';
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import { useUserProvider } from '@/providers/UserProvider';


const LeaderboardContent: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { playerRank, refreshUserData, isLoading: isUserLoading } = useUserProvider();
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [sortBy, setSortBy] = useState<'net_gain' | 'total_bets'>('net_gain');

  useEffect(() => {
      setIsWalletLoaded(true);
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      // determine which block(s) are needed based on the current page
      const firstItemIndex = (currentPage - 1) * itemsPerPage;
      const blockIndex = Math.floor(firstItemIndex / BLOCK_SIZE);
      const offsetInBlock = firstItemIndex % BLOCK_SIZE;

      const primaryBlock = await fetchBlock(blockIndex, isConnected ? address : undefined, sortBy);

      let pageData = primaryBlock.data.slice(offsetInBlock, offsetInBlock + itemsPerPage);

      // If threr aren't enough items in the primary block and there are more records overall,
      // fetch the next block and merge
      if (pageData.length < itemsPerPage && primaryBlock.pagination.total > (blockIndex * BLOCK_SIZE + offsetInBlock + pageData.length)) {
        const nextBlock = await fetchBlock(blockIndex + 1, isConnected ? address : undefined, sortBy);
        const remainingNeeded = itemsPerPage - pageData.length;
        const nextItems = nextBlock.data.slice(0, remainingNeeded);
        pageData = pageData.concat(nextItems);
      }

      // calc total pages for the UI (using itemsPerPage, not block size)
      const total = primaryBlock.pagination.total;
      const totalPages = Math.ceil(total / itemsPerPage);

      const newLeaderboard: Leaderboard = {
        leaders: pageData,
        pagination: {
          total,
          page: currentPage,
          limit: itemsPerPage,
          total_pages: totalPages,
        },
        refreshed_at: primaryBlock.refreshed_at,
      };

      setLeaderboard(newLeaderboard);

      // prefetch next block in the background
      const nextBlockCacheKey = `leaderboard_block_${blockIndex + 1}${isConnected ? `_a${address}` : ''}${sortBy ? `_s${sortBy}` : ''}`;
      if (!getCachedBlock(nextBlockCacheKey)) {
        fetchBlock(blockIndex + 1, isConnected ? address : undefined, sortBy).catch(err =>
          console.error("Prefetch next block error:", err)
        );
      }
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      setError("Failed to load leaderboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, isConnected, address, refreshUserData, sortBy]);

  useEffect(() => {
    if (isWalletLoaded) {
      fetchLeaderboardData();
      refreshUserData(true);
    }
  }, [isWalletLoaded, fetchLeaderboardData, isConnected, address, refreshUserData]);

  useEffect(() => {
    if (isConnected && address) {
      refreshUserData(true);
    }
  }, [isConnected, address, refreshUserData]);

  useEffect(() => {
    if (isWalletLoaded) {
      fetchLeaderboardData();
    }
  }, [sortBy, fetchLeaderboardData]);

  const handlePageChange = (newPage: number) => {
    if (leaderboard && newPage >= 1 && newPage <= leaderboard.pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: 'net_gain' | 'total_bets') => {
    if (sortBy !== newSortBy) {
      // clear localStorage when sort option changes
      if (typeof window !== 'undefined') {

        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('leaderboard_block_')) {
            localStorage.removeItem(key);
          }
        });
        console.log('Cleared leaderboard cache for new sort option');
      }
      
      setSortBy(newSortBy);
      setCurrentPage(1);
      // Fetch data will be triggered by useEffect
    }
  };

  return (
    <div className="min-h-screen text-white pb-12 px-4 sm:px-4 w-full">
      <Navbar />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-[#04e6e0]/5 via-transparent to-[#8B5CF6]/5"></div>
          <div className="absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-gradient-to-br from-[#04e6e0]/15 via-transparent to-[#8B5CF6]/15 blur-[2px]"></div>
          </div>
        </div>
        <div className="absolute -left-40 top-20 w-[500px] h-[500px] rounded-full bg-[#04e6e0]/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#04e6e0] tracking-wider flex items-center">
            <AnimatedDiamondTrophySVG />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#04e6e0] to-[#8B5CF6]">LEADERBOARD</span>
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!loading && isConnected && !playerRank && (
              <button 
                onClick={() => refreshUserData(true)}
                className="text-xs text-[#04e6e0] hover:underline transition-colors"
              >
                Refresh Rank
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex rounded-md overflow-hidden border border-[#04e6e0]/30">
                <button 
                  onClick={() => handleSortChange('net_gain')}
                  className={`px-3 py-1 text-xs ${sortBy === 'net_gain' 
                    ? 'bg-[#04e6e0]/30 text-[#04e6e0]' 
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  } transition-colors`}
                >
                  Net Gain
                </button>
                <button 
                  onClick={() => handleSortChange('total_bets')}
                  className={`px-3 py-1 text-xs ${sortBy === 'total_bets' 
                    ? 'bg-[#04e6e0]/30 text-[#04e6e0]' 
                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                  } transition-colors`}
                >
                  Points
                </button>
              </div>
              <Link href="/">
                <div className="text-[#04e6e0] bg-[#04e6e0]/10 hover:bg-[#04e6e0]/20 px-4 py-2 rounded-md border border-[#04e6e0]/30 transition-all 
                duration-300 flex items-center w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Game
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {loading ? (
          <LeaderboardSkeleton itemsPerPage={itemsPerPage} />
        ) : error ? (
          <ErrorState errorMessage={error} />
        ) : !leaderboard || leaderboard.leaders.length === 0 ? (
          <NoDataState />
        ) : (
          <>
            <LeaderboardTable 
              players={leaderboard.leaders}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              userAddress={address}
              isConnected={isConnected}
              totalPlayers={leaderboard.pagination.total}
              sortBy={sortBy}
            />
            
            <Pagination 
              pagination={leaderboard.pagination}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
            
            {/* <InfoFooter /> */}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardContent; 