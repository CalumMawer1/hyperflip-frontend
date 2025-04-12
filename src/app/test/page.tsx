"use client"
import CoinTest from '@/components/CoinFlip/CoinTest';
import React, { useState } from 'react';


function ToggleButtons() {
  const [isOn, setIsOn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Toggle function that delays the actual state change by 1 second:
  const toggleDelayed = (state: boolean) => {
    // If a transition is already happening, ignore additional clicks.
    if (isTransitioning) return;

    // Set the transitioning flag so UI can reflect pending action.
    setIsTransitioning(true);

    // Optionally, you might update the UI immediately to show that a transition is in progress.
    setTimeout(() => {
      // Use the functional update to ensure correctness even if multiple events occurred.
      setIsOn(state);

      // Transition is complete.
      setIsTransitioning(false);
    }, 1000);  // delay set to 1 second
  };

  return (
    <div>
      <button onClick={() => {
        toggleDelayed(true);
        setIsSelected(true);
      }} disabled={isTransitioning} className={`text-white p-2 rounded-md ${isSelected ? 'bg-emerald-500' : ''}`}>
        Turn On {isTransitioning}
      </button>
      <button onClick={() => {
        toggleDelayed(false);
        setIsSelected(false);
      }} disabled={isTransitioning} className={`text-white p-2 rounded-md ${!isSelected ? 'bg-emerald-500' : ''}`}>
        Turn Off {isTransitioning}
      </button>
      <p>The state is {isOn ? 'ON' : 'OFF'}</p>
    </div>
  );
}





export default function Test() {
  return (
          // <CoinTest />
          <ToggleButtons />
  );
} 
