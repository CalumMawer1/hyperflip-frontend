import React from 'react';

interface ResultProps {
    gameResult: "win" | "lose" | null;
    resultDisplay: number;
    betAmount: number;
    onPlayAgain: () => void;
}

export default function ResultView({
    gameResult,
    resultDisplay,
    betAmount,
    onPlayAgain,
}: ResultProps
) {
  return (
    <div className="space-y-5 text-center relative">
      <h2 className="text-2xl font-semibold text-[#04e6e0] glow-text mb-6">
        It Landed on:{' '}
        <span className={gameResult === 'win' ? 'text-green-500' : 'text-red-500'}>
          {resultDisplay === 0 ? 'Heads' : 'Tails'}
        </span>
      </h2>
      <h2
        className={`text-3xl font-bold ${
          gameResult === 'win' ? 'text-emerald-500 glow-text' : 'text-red-500'
        }`}
      >
        {gameResult === 'win'
          ? `You Won ${betAmount} HYPE!`
          : 'You Lost'}
      </h2>
      <button
        onClick={onPlayAgain}
        className={`relative px-10 py-4 rounded-full font-bold transition-all ${
          gameResult === 'win'
            ? 'bg-[#04e6e0]/80 hover:bg-[#04e6e0] text-black shadow-[0_0_15px_rgba(4,230,224,0.4)]'
            : 'bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]'
        }`}
      >
        {gameResult === 'win' ? 'Keep Flipping!' : 'Double or Nothing?'}
      </button>
    </div>
  );
}
