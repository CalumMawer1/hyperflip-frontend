import React, { ReactNode } from 'react';

interface ProfileCardProps {
  title?: ReactNode;
  headerContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  headerContent,
  children,
  className = ''
}) => {
  return (
    <div className={`card-glow ${className}`}>
      <div className="border-b border-primary-dark py-3 px-6 bg-gradient-to-r from-primary-light via-primary-light/30 to-transparent backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background-dark/30 opacity-30"></div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center relative z-10">
          {title}
          {headerContent}
        </div>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ProfileCard; 