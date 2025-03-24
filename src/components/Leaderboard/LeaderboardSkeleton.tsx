

const LeaderboardSkeleton: React.FC<{ itemsPerPage: number }> = ({ itemsPerPage }) => {
    return (
      <div className="w-full mt-4 bg-black/60 border border-[#04e6e0]/30 rounded-xl overflow-hidden backdrop-blur-md shadow-[0_0_15px_rgba(4,230,224,0.15)]">
        <div className="border-b border-[#04e6e0]/20 py-3 px-4 sm:px-6 bg-gradient-to-r from-[#04e6e0]/10 to-transparent">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl font-semibold text-[#04e6e0]">Top Players</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: "680px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-[#04e6e0]/10 to-black/70">
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
              {Array(itemsPerPage).fill(0).map((_, index) => {
                const animationDelay = `${0.1 + index * 0.05}s`;
                
                return (
                  <tr 
                    key={`skeleton-${index}`}
                    className={`border-b border-[#04e6e0]/10 h-[48px]
                      ${index % 2 === 0 ? 'bg-black/40' : 'bg-black/20'}`}
                    style={{ animationDelay }}
                  >
                    <td className="py-2 px-3">
                      <div className="h-6 w-6 rounded-full bg-[#04e6e0]/50 animate-pulse"></div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="h-4 w-32 rounded bg-[#04e6e0]/50 animate-pulse"></div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="h-4 w-8 rounded bg-[#04e6e0]/50 animate-pulse ml-auto"></div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="h-4 w-12 rounded bg-[#04e6e0]/50 animate-pulse ml-auto"></div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="h-4 w-16 rounded bg-[#04e6e0]/50 animate-pulse ml-auto"></div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="h-4 w-14 rounded bg-[#04e6e0]/50 animate-pulse ml-auto"></div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="h-4 w-20 rounded bg-[#04e6e0]/50 animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  export default LeaderboardSkeleton;