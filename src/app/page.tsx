'use client';

import NewCoinFlip from "@/components/CoinFlip/NewCoinFlip";
// import DummyCoinFlip from "@/components/CoinFlip/DummyCoinFlip";
// import { CoinFlip } from "@/components/CoinFlip/CoinFlip";
//export default function Home() {
//  return (
//        <NewCoinFlip />
//  )
//}
import React from "react";
import Head from "next/head";


// export default function Home() {
//   return (
//       <>
//       <Head>
//         <title>HyperFlip - Maintenance</title>
//       </Head>
//       <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
//         {/* Background gradients */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[#04e6e0]/10 via-transparent to-[#8B5CF6]/10 z-0"></div>
//         <div className="absolute -left-40 top-20 w-[500px] h-[500px] rounded-full bg-[#04e6e0]/10 blur-[120px] z-0"></div>
        
//         {/* Maintenance message */}
//         <div className="z-10 text-center px-4">
//           <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#04e6e0] mb-4 tracking-wide">
//             🚧 Site Under Maintenance
//           </h1>
//           <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
//             We're making improvements to bring you a better experience. Please check back soon!
//           </p>
//         </div>
//       </div>
//     </>  
//   );
// }

export default function Home() {
  return (
    <>
      <Head>
        <title>HyperFlip - Maintenance</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#04e6e0]/10 via-transparent to-[#8B5CF6]/10 z-0"></div>
        <div className="absolute -left-40 top-20 w-[500px] h-[500px] rounded-full bg-[#04e6e0]/10 blur-[120px] z-0"></div>

        {/* Maintenance message */}
        <div className="z-10 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#04e6e0] mb-4 tracking-wide">
            🚧 Site Under Maintenance
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
            We're making improvements to bring you a better experience. Please check back soon!
          </p>
        </div>
      </div>
    </>
  );
}  