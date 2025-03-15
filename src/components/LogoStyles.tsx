'use client';

import { Orbitron } from 'next/font/google';
import { createGlobalStyle } from 'styled-components';

const orbitron = Orbitron({ subsets: ['latin'] });

const GlobalStyle = createGlobalStyle`
  .logo-text {
    font-family: ${orbitron.style.fontFamily};
  }
`;

export function LogoStyles() {
  return <GlobalStyle />;
} 