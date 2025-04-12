import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  className?: string;
  children: ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  className = '', 
  children 
}) => {
  return (
    <div className={`bg-background-dark/40 p-5 rounded-lg border border-primary-dark transition-all duration-300 hover:shadow-glow ${className}`}>
      <div className="text-gray-400 text-sm mb-1">{title}</div>
      <div className="flex justify-between items-end">
        {children}
      </div>
    </div>
  );
};

export default StatsCard; 