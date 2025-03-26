// import React from 'react';
// import { useGame } from '../../providers/GameProvider';
// import Coin from './Coin';


// export default function ResultView() {
//   const {
//     isFlipping,
//     gameResult,
//     selectedChoice,
//     pendingBetAmount,
//     onPlayAgain,
//     isReceiptLoading,
//     isBetPending,
//     isSettlePending,
//     isFreeBetPending,
//   } = useGame();

//   return (
//     <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full max-w-md mx-auto">
//       <h2 className="text-2xl font-semibold text-[#04e6e0] glow-text mb-6">
//         It Landed on: <span className={gameResult === 'win' ? 'text-green-500' : 'text-red-500'}>
//           {gameResult === "win" ? (selectedChoice === 0 ? "Heads" : "Tails") : (selectedChoice !== 0 ? "Heads" : "Tails")}
//         </span>
//       </h2>
      
//       <div className="relative w-56 h-48 pointer-events-none">
//         <Coin
//           isFlipping={isFlipping}
//           result={gameResult}
//           selectedChoice={selectedChoice}
//         />
//       </div>
      
//       <div className="space-y-5 text-center relative">
//         <h2
//           className={`text-3xl font-bold ${
//             gameResult === 'win' 
//               ? 'text-[#04e6e0] glow-text' 
//               : 'text-red-500'
//           }`}
//         >
//           {gameResult === 'win'
//             ? `You Won ${pendingBetAmount} HYPE!`
//             : 'You Lost'}
//         </h2>
        
//         <button
//           onClick={onPlayAgain}
//           className={`relative px-10 py-4 rounded-full font-bold transition-all ${
//             isReceiptLoading || isBetPending || isSettlePending || isFreeBetPending
//               ? 'bg-gray-800/60 cursor-not-allowed text-gray-400 border border-gray-700'
//               : gameResult === 'win'
//                 ? 'bg-[#04e6e0]/80 hover:bg-[#04e6e0] text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
//                 : 'bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]'
//           }`}
//           disabled={isReceiptLoading || isBetPending || isSettlePending || isFreeBetPending}
//         >
//           {gameResult === 'win' ? 'Keep Flipping!' : 'Double or Nothing?'}
//         </button>
//       </div>
//     </div>
//   );
// }
