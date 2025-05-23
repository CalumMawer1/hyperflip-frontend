'use client';

import {useAccount, useReadContract } from 'wagmi';
import {CONTRACT_ABI, CONTRACT_ADDRESS} from '../config/contract';
import { formatEther } from 'viem';
import { useCallback } from 'react';


type FreeBetStatus = {
    isFreeBetEligible: boolean;
    freeBetAmount: string;
    refreshFreeBetStatus: () => void;
}

export function useFreeBetStatus(): FreeBetStatus {
    const { address } = useAccount()

    // do these functions need to be re-run somehow when the user actually uses a free bet?
    
    const { data: isWhitelisted, refetch: refetchIsWhitelisted } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'isWhitelisted',
      args: [address],
      query: {
        enabled: Boolean(address)
      }
    })
    
    const { data: hasUsedFreeBet, refetch: refetchHasUsedFreeBet } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'hasUsedFreeBet',
      args: [address],
      query: {
        enabled: Boolean(address)
      }
    })
    
    const { data: freeBetAmount, refetch: refetchFreeBetAmount } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'freeBetAmount',
      query: {
        enabled: Boolean(address)
      }
    })

    const refreshFreeBetStatus = useCallback(() => {
      refetchIsWhitelisted();
      refetchHasUsedFreeBet();
      refetchFreeBetAmount();
    }, [refetchIsWhitelisted, refetchHasUsedFreeBet, refetchFreeBetAmount]);
    
    return {
      isFreeBetEligible: Boolean(isWhitelisted && !hasUsedFreeBet),
      freeBetAmount: freeBetAmount ? formatEther(freeBetAmount as bigint) : '0',
      refreshFreeBetStatus
    }
  }
