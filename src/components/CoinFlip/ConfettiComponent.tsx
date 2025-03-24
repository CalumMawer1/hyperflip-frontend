import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false,
});

const ConfettiComponent = () => {
    const [windowSize, setWindowSize] = useState<{
        width: number | undefined,
        height: number | undefined,
    }>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: Number(window.innerWidth),
                height: Number(window.innerHeight),
            });
        }
        
        // Add event listener
        window.addEventListener("resize", handleResize);
        
        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    
    // Only render Confetti on client-side when dimensions are available
    if (typeof window === 'undefined' || !windowSize.width || !windowSize.height) {
      return null;
    }
    
    return (
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
      />
    );
  };

  export default ConfettiComponent;