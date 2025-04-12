import React from 'react';

interface CircularIndicatorProps {
  percentage: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelClassName?: string;
  className?: string;
}

const CircularIndicator: React.FC<CircularIndicatorProps> = ({
  percentage,
  size = 64,
  color = 'var(--color-primary)',
  backgroundColor = 'rgb(55, 65, 81)', 
  showLabel = true,
  labelClassName = 'text-xs font-bold',
  className = '',
}) => {

  const safePercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }}
    >
      <div 
        className={`w-full h-full rounded-full relative overflow-hidden shadow-lg transition-all duration-300 hover:shadow-glow`} 
        style={{ backgroundColor }}
      >
        {/* Track background with subtle gradient */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-900/50"
        ></div>
        
        {/* Progress fill with conic gradient - replacing complex clip-path */}
        <div 
          className="absolute w-full h-full origin-center"
          style={{ 
            background: `conic-gradient(${color} 0% ${safePercentage}%, transparent ${safePercentage}% 100%)`,
            filter: 'drop-shadow(0 0 3px rgba(var(--color-primary-rgb), 0.5))'
          }}
        />
        
        {/* Inner circle with subtle border */}
        <div 
          className="absolute rounded-full bg-black/90 border border-gray-800/50" 
          style={{ 
            inset: size/10,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.05)'
          }}
        ></div>
        
        {/* Percentage label with improved styling */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={`${labelClassName} font-primary font-mono tracking-tight transition-all duration-300`}
              style={{ 
                textShadow: '0 0 5px rgba(var(--color-primary-rgb), 0.7)'
              }}
            >
              {safePercentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularIndicator; 