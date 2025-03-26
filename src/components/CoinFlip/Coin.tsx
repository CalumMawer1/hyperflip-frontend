import { CatCoinSVG, TailCoinSVG } from "./CoinSVG";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

const xKeyframes = [
  0.0, 1.55, 2.94, 4.05, 4.76, 5.0, 4.76, 4.05, 2.94, 1.55, 0.0,
  -1.55, -2.94, -4.05, -4.76, -5.0, -4.76, -4.05, -2.94, -1.55, 0.0
];
const yKeyframes = [
  0.0, -1.88, -3.71, -5.45, -7.05, -8.49, -9.71, -10.69, -11.41, -11.85, -12.0,
  -11.85, -11.41, -10.69, -9.71, -8.49, -7.05, -5.45, -3.71, -1.88, 0.0
];

interface CoinInputProps {
  isFlipping: boolean;
  result: number | null;
  side: number; // 0 for heads, 1 for tails
  onSpinningComplete: () => void;
}

const Coin: React.FC<CoinInputProps> = ({
  isFlipping,
  result,
  side,
  onSpinningComplete,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  const [displayFace, setDisplayFace] = useState<number>(side);
  console.log("result is being initialized to", result);

  console.log('[Coin] isFlipping:', isFlipping, 
            'isAnimating:', isAnimating, 
            'isLanding:', isLanding, 
            'displayFace:', displayFace, 
            'result:', result);

  const continuousFlipControls = useAnimation();
  const flipControls = useAnimation();
  const rotateXValue = useMotionValue(0);

  const isFlippingRef = useRef(isFlipping);
  const resultRef = useRef(result);
  const totalRotationRef = useRef(0);

  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // continuous flip loop
  const spinLoop = async () => {
    setIsAnimating(true);
    while (isFlippingRef.current && resultRef.current === null) {
      const currentRotation = totalRotationRef.current;
      await continuousFlipControls.start({
        rotateX: currentRotation + 360,
        transition: { duration: 0.25, ease: "linear" },
      });
      totalRotationRef.current = currentRotation + 360;
    }

    if (resultRef.current !== null) {
      setIsLanding(true);
      const currentRotation = totalRotationRef.current;
      const currentMod = currentRotation % 360;
      let targetRotation = 0;
      // Compare the result with the provided side directly.
      if (resultRef.current === side) {
        //console.log('current == side', 'currentRotation:', currentRotation, 'currentMod', currentMod)
        targetRotation = currentRotation + ((360 - currentMod) % 360 || 360);
      } else {
        if (currentMod < 180) {
          //console.log('current != side', 'currentRotation:', currentRotation, 'currentMod', currentMod)
          targetRotation = currentRotation + (180 - currentMod);
        } else {
          //console.log('current != side', 'currentRotation:', currentRotation, 'currentMod', currentMod)
          targetRotation = currentRotation + (540 - currentMod);
        }
      }
      // smooth landing
      targetRotation += 720;
      totalRotationRef.current = targetRotation;

      await continuousFlipControls.start({
        rotateX: targetRotation,
        transition: { duration: 1.5, ease: "circOut" },
      });
      //console.log("stopping spin")
      setIsAnimating(false);
      setIsLanding(false);
      onSpinningComplete();
    }
  };

  useEffect(() => {
    if (isMounted && isFlipping && result === null && !isAnimating) {
      spinLoop();
    }
  }, [isFlipping, result, isMounted, isAnimating, side]);

  // discrete flip
  useEffect(() => {
    if (result === null && !isFlipping && !isAnimating && !isLanding) {
      if (side !== displayFace) {
        flipControls
          .start({
            rotateY: 90,
            transition: { duration: 0.25, ease: "easeInOut" },
          })
          .then(() => {
            setDisplayFace(side);
            flipControls.set({ rotateY: -90 });
            return flipControls.start({
              rotateY: 0,
              transition: { duration: 0.25, ease: "easeInOut" },
            });
          });
      }
    }
  }, [side, isFlipping, isAnimating, isLanding, displayFace, flipControls, result]);

  // render continuous flip
  if (isMounted && (isFlipping || isAnimating || isLanding)) {
    return (
      <div
        className="flex justify-center items-start w-full -my-10"
        style={{ perspective: 1000 }}
      >
        <div className="w-[250px] h-[350px]">
          <motion.div
            className="w-full h-full"
            style={{ transformStyle: "preserve-3d", rotateX: rotateXValue }}
            animate={continuousFlipControls}
          >
            {side === 0 ? (
              <>
                {/* Front face: Heads */}
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <CatCoinSVG className="w-full h-full object-contain" />
                </div>
                {/* Back face: Tails */}
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <TailCoinSVG className="w-full h-full object-contain" />
                </div>
              </>
            ) : (
              <>
                {/* Front face: Tails */}
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <TailCoinSVG className="w-full h-full object-contain" />
                </div>
                {/* Back face: Heads */}
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <CatCoinSVG className="w-full h-full object-contain" />
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // render static coin
  const finalFace = result !== null ? result : displayFace;
  return (
    <div
      className="flex justify-center items-center w-full -my-10"
      style={{ perspective: 1000 }}
    >
        <div className="w-[250px] h-[350px]">
            <motion.div
              className="w-[250px] h-[350px] flex items-center justify-center"
              animate={{ x: xKeyframes, y: yKeyframes }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            >
              <motion.div
                style={{ transformStyle: "preserve-3d" }}
                animate={flipControls}
                initial={{ rotateY: 0 }}
                className="relative w-full h-full"
              >
                <div className="absolute w-full h-full flex items-center justify-center">
                  {finalFace === 0 ? (
                    <CatCoinSVG className="w-full h-full object-contain" />
                  ) : (
                    <TailCoinSVG className="w-full h-full object-contain" />
                  )}
                </div>
              </motion.div>
            </motion.div>     
        </div>
    </div>
  );
};

export default Coin;
