import React from 'react';
import { useGame } from '../../providers/GameProvider';



const StatusToast = () => {
    const { getTransactionStatusText, isReceiptLoading, isBetPending, isSettlePending, isFreeBetPending } = useGame();
  
    const message = getTransactionStatusText();
    const isVisible = isReceiptLoading || isBetPending || isSettlePending || isFreeBetPending;

    return (
        <div className={`fixed left-4 bottom-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-black/90 text-[#04e6e0] px-4 py-3 rounded-lg border border-[#04e6e0]/30 shadow-[0_0_15px_rgba(4,230,224,0.3)] backdrop-blur-sm flex items-center max-w-md">
            <div className="animate-pulse mr-2 w-3 h-3 rounded-full bg-[#04e6e0]"></div>
            <span>{message}</span>
            </div>
        </div>
    );
}

export default StatusToast;