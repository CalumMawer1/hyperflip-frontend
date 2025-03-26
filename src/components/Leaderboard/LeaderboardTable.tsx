import React from 'react';
import { PlayerStats } from './types';
import { useUserProvider } from '@/providers/UserProvider';
import PlayerRank from './PlayerRank';

interface LeaderboardTableProps {
  players: PlayerStats[];
  currentPage: number;
  itemsPerPage: number;
  userAddress?: string;
  isConnected: boolean;
  totalPlayers?: number;
  sortBy: 'net_gain' | 'total_bets';
  handleSortChange: (newSortBy: 'net_gain' | 'total_bets') => void;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  players, 
  currentPage, 
  itemsPerPage, 
  isConnected,
  totalPlayers = 0,
  sortBy,
  handleSortChange
}) => {
  const { getPlayerRankBySortOption, isLoading } = useUserProvider();
  
  const playerRank = getPlayerRankBySortOption(sortBy);
  
  return (
    <div className="w-full mt-4 card-glow">
      <div className="border-b border-primary-dark py-3 px-4 sm:px-6 bg-gradient-to-r from-primary-light to-transparent">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold text-primary">Top Players</h2>
          
          <div className="flex items-center">
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
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {players && players.length > 0 ? (
          <table className="w-full border-collapse text-sm" style={{ minWidth: "680px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-primary-light to-background-dark/70">
                <th className="py-3 px-3 text-left font-semibold text-gray-300 w-12">#</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-300">Player</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300">Total Bets</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300">Win Rate</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300">Total Wagered</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300">Total Points</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-300">Net Gain</th>
              </tr>
            </thead>
            <tbody>
              {players?.map((player, index) => {
                const isCurrentUser = player?.is_user;
                const totalBets = player?.wins + player?.losses;
                const isTop3 = index < 3 && currentPage === 1;
                
                const playerRowRank = player?.rank || ((currentPage - 1) * itemsPerPage + index + 1);
                
                const animationDelay = `${0.1 + index * 0.05}s`;
                return (
                  <tr 
                    key={player?.player_address}
                    className={`border-b border-primary-dark/10 h-[48px] fall-in-row
                      ${isCurrentUser ? 'bg-primary-light' : index % 2 === 0 ? 'bg-background-dark/40' : 'bg-background-dark/20'} 
                      hover:bg-background-hover transition-colors`}
                    style={{ animationDelay }}
                  >
                    <td className="py-2 px-3 relative w-12 text-center">
                      {isTop3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-primary-dark bg-gradient-to-br from-background-dark to-primary-light text-primary font-bold text-xs">
                          {playerRowRank}
                        </span>
                      ) : (
                        playerRowRank
                      )}
                    </td>
                    <td className="py-2 px-4 font-mono text-xs whitespace-normal break-all">
                      {isCurrentUser ? (
                        <span className="font-bold text-primary flex items-center">
                          <span className="inline-block mr-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0"></span>
                          <span>You ({player?.player_address})</span>
                        </span>
                      ) : (
                        <span className="truncate block max-w-[180px]">{player?.player_address}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">{totalBets}</td>
                    <td className="py-2 px-4 text-right">
                      {typeof player?.win_percentage === 'number' ? (100 * player?.win_percentage).toFixed(1) : '0.0'}%
                    </td>
                    <td className="py-2 px-4 text-right text-primary">
                      {typeof player?.total_wagered === 'number' ? player?.total_wagered.toFixed(2) : '0.00'} HYPE
                    </td> 
                    <td className="py-2 px-4 text-right text-primary">
                      {typeof totalBets === 'number' ? totalBets * 100 : '0.00'}
                    </td>
                    <td className={`py-2 px-4 text-right font-bold ${(player?.net_gain || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                      <div className="inline-flex items-center">
                        {(player?.net_gain || 0) >= 0 ? 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg> :
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        }
                        {(player?.net_gain || 0) >= 0 ? '+' : ''}{typeof player?.net_gain === 'number' ? player?.net_gain.toFixed(2) : '0.00'} HYPE
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-gray-400">
            No players found
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable; 
