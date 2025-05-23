import React from 'react';

const debug = process.env.NODE_ENV === 'development';

interface PlayerRankProps {
  playerRank?: number | string | null;
  totalPlayers: number;
}

const PlayerRank: React.FC<PlayerRankProps> = ({ playerRank, totalPlayers }) => {
  const rankNumber = playerRank === null || playerRank === undefined 
    ? null
    : typeof playerRank === 'string' 
      ? parseInt(playerRank, 10) 
      : playerRank;

  if (debug) {
    console.log("PlayerRank Component - Processed Rank:", rankNumber);
  }

  if (!rankNumber) return null;
  
  return (
    <div className="inline-flex items-center px-3 py-2.5 rounded-full bg-black/40 border border-[#04e6e0]/30 backdrop-blur-sm 
    transition-all duration-300 hover:bg-[#04e6e0]/10 hover:shadow-glow group font-primary">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#04e6e0]/10 to-[#8B5CF6]/10 flex items-center
       justify-center border border-[#04e6e0]/20 group-hover:from-[#04e6e0]/20 group-hover:to-[#8B5CF6]/20 transition-all duration-300">
        {/* Crown Icon */}
        <svg className="h-3.5 w-3.5 text-[#04e6e0]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      </div>
      <div className="ml-2 flex items-center">
        <span className="text-[#04e6e0] text-sm font-medium">Rank:</span>
        <span className="text-white font-bold ml-1.5 group-hover:text-[#04e6e0] transition-colors">{rankNumber}</span>
        <span className="text-gray-400 text-xs ml-1">of {totalPlayers}</span>
      </div>
    </div>
  );
};

export default PlayerRank;