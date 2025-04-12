import React from 'react';

interface FlipViewProps {
  pendingBetAmount: number;
}

export default function FlipView({
  pendingBetAmount,
}: FlipViewProps
) {
  return (
    <div className="w-full space-y-6">
      <div className="mb-3 text-3xl font-medium text-[#04e6e0] text-center relative">
        <span className="relative z-10">Your bet: {pendingBetAmount} HYPE</span>
        <div className="absolute -inset-4 bg-[#04e6e0]/5 blur-md rounded-full -z-10"></div>
      </div>
      
      <div className="w-full max-w-md mb-6 text-center">
        <div className="text-[#04e6e0] font-semibold flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] mr-2 animate-pulse"></div>
          Determining result...
          <div className="w-1.5 h-1.5 rounded-full bg-[#04e6e0] ml-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 