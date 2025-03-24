import { CatCoinSVG, TailCoinSVG } from "./CoinSVG";
import { motion, useAnimation } from "framer-motion";
import React, { useState, useEffect } from "react";


interface CoinInputProps {
  isFlipping: boolean; 
  result: string | null; 
  selectedChoice?: number;
}

const xKeyframes = [0.0, 1.55, 2.94, 4.05, 4.76, 5.0, 4.76, 4.05, 2.94, 1.55, 0.0, -1.55, -2.94, -4.05, -4.76, -5.0, -4.76, -4.05, -2.94, -1.55, 0.0];
const yKeyframes = [0.0, -1.88, -3.71, -5.45, -7.05, -8.49, -9.71, -10.69, -11.41, -11.85, -12.0, -11.85, -11.41, -10.69, -9.71, -8.49, -7.05, -5.45, -3.71, -1.88, 0.0];


const Coin: React.FC<CoinInputProps> = ({ isFlipping, result, selectedChoice = 0 }) => {
  // (0 = heads/false, 1 = tails/true)
  const choiceAsBool = selectedChoice === 1;

  const [isMounted, setisMounted] = useState<boolean>(false);

  useEffect(() => {
    setisMounted(true)
  }, [])
  
  // Function to determine which side should be displayed
  const getCoinSide = () => {
    if (result === null) {
      return choiceAsBool 
        ? <TailCoinSVG className="w-full h-full object-contain" /> 
        : <CatCoinSVG className="w-full h-full object-contain" />;
    } else if (result === 'win') {
      return choiceAsBool 
        ? <TailCoinSVG className="w-full h-full object-contain" /> 
        : <CatCoinSVG className="w-full h-full object-contain" />;
    } else if (result === 'lose') {
      return choiceAsBool 
        ? <CatCoinSVG className="w-full h-full object-contain" /> 
        : <TailCoinSVG className="w-full h-full object-contain" />;
    }
  };

  const [displaySide, setDisplaySide] = useState(getCoinSide());

  const flipControls = useAnimation();

  useEffect(() => {
    if (isMounted && !isFlipping) {
      flipControls
        .start({ rotateY: 90, transition: { duration: 0.4, ease: "easeInOut" } })
        .then(() => {
          setDisplaySide(getCoinSide());
          // Immediately set rotation to -90 to simulate the coin being edge-on
          flipControls.set({ rotateY: -90 });
          return flipControls.start({ rotateY: 0, transition: { duration: 0.4, ease: "easeInOut" } });
        });
    } else {
      setDisplaySide(getCoinSide());
    }
  }, [selectedChoice, result, isFlipping, flipControls]);

  
  // If continuously flipping, use your existing animation
  if (isMounted && isFlipping) {
    return (
      <div className="flex justify-center items-center w-full -my-10">
        <div className="w-[250px] h-[350px]">
          <motion.div
            className="w-full h-full flex items-center justify-center"
            animate={{
              rotateX: [0, 720, 1440, 2160, 2880],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <motion.div
              className="absolute w-[250px] h-[250px] flex items-center justify-center"
              animate={{ opacity: [1, 0, 1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CatCoinSVG className="w-full h-full object-contain" />
            </motion.div>
            <motion.div
              className="absolute w-[320px] h-[320px] flex items-center justify-center"
              animate={{ opacity: [0, 1, 0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <TailCoinSVG className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full -my-10" style={{ perspective: 1000 }}>
      <div className="w-[250px] h-[350px]">
        {/* handles continuous */}
        <motion.div
          className="w-[250px] h-[250px] flex items-center justify-center"
          animate={{ x: xKeyframes, y: yKeyframes }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        >
          {/* handles the flip */}
          <motion.div
            className="w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={flipControls}
            initial={{ rotateY: 0 }}
          >
            {displaySide}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Coin;
