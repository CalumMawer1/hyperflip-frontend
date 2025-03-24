import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  props?: any;
}

const Logo: React.FC<LogoProps> = ({className, width, height, props}) => {
  return (
    <Image
      src="./logo-blue.png"
      alt="Logo"
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Logo;
