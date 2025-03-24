export const StdHeadsSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className}>
      {/* Coin background */}
      <circle cx="100" cy="100" r="95" fill="#000000" />
      
      {/* Coin ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="#04e6e0" strokeWidth="5" />
      
      {/* Shine effect */}
      <circle cx="70" cy="70" r="20" fill="rgba(255, 255, 255, 0.1)" />
      
      {/* H letter */}
      <text
        x="100"
        y="115"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#04e6e0"
        fontSize="120"
        fontWeight="bold"
        fontFamily="Arial"
      >
        H
      </text>
    </svg>
  );

export const StdTailsSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className}>
      {/* Coin background */}
      <circle cx="100" cy="100" r="95" fill="#000000" />
      
      {/* Coin ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="#04e6e0" strokeWidth="5" />
      
      {/* Shine effect */}
      <circle cx="70" cy="70" r="20" fill="rgba(255, 255, 255, 0.1)" />
      
      {/* T letter */}
      <text
        x="100"
        y="115"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#04e6e0"
        fontSize="120"
        fontWeight="bold"
        fontFamily="Arial"
      >
        T
      </text>
    </svg>
  );
  
export const CatCoinSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="90 95 195 200" className={className}>
    <image href="/cat-heads.svg" x="0" y="0" width="375" height="375" preserveAspectRatio="xMidYMid meet" />
  </svg>
);

export const TailCoinSVG = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="90 95 195 200" className={className}>
    <image href="/cat-tails.svg" x="0" y="0" width="375" height="375" preserveAspectRatio="xMidYMid meet" />
  </svg>
);
