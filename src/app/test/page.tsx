"use client"
import React, { useState, useEffect } from 'react';
import CoinTest from '@/components/CoinFlip/CoinTest';

export default function Test() {
  return (
    <CoinTest 
      isFlipping={false}
      result={null}
      side={0}
      onSpinningComplete={() => {}}
    />
  );
} 