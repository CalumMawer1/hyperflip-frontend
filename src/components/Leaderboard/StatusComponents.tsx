import React from 'react';

export const LoadingState: React.FC = () => (
  <div className="text-center py-16 bg-[#04e6e0]/5 backdrop-blur-sm rounded-xl border border-[#04e6e0]/20">
    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#04e6e0] border-r-transparent relative">
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#04e6e0]/20 animate-ping"></div>
    </div>
    <p className="mt-6 text-lg text-[#04e6e0]">Loading leaderboard data...</p>
  </div>
);

export const ErrorState: React.FC<{ errorMessage: string }> = ({ errorMessage }) => (
  <div className="bg-red-900/30 border border-red-500 p-8 rounded-xl text-center backdrop-blur-md">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="mt-4 text-lg">{errorMessage}</p>
  </div>
);

export const NoDataState: React.FC = () => (
  <div className="bg-gray-900/50 border border-gray-700 p-12 rounded-xl text-center backdrop-blur-md">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#04e6e0]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className="text-2xl mt-4 text-[#04e6e0]">No data available yet.</p>
    <p className="mt-4 text-gray-400 text-lg">Be the first to place a bet and appear on the leaderboard!</p>
  </div>
);

export const InfoFooter: React.FC = () => (
  <div className="mt-4 sm:mt-6 text-sm text-gray-400 bg-black/30 p-3 sm:p-4 rounded-lg border border-[#04e6e0]/10 backdrop-blur-sm">
    <div className="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#04e6e0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>Rankings are based on net gain.</p>
    </div>
  </div>
); 