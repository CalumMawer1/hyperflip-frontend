import { CachedBlock, LeaderboardResponse } from './types';

export const BLOCK_SIZE = 50;
export const CACHE_EXPIRATION = 20 * 60 * 1000;


export function getCachedBlock(key: string): CachedBlock | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const parsed: CachedBlock = JSON.parse(cached);
    if (Date.now() - parsed.refreshed_at < CACHE_EXPIRATION) {
      return parsed;
    }
  } catch (err) {
    console.error("Cache parse error:", err);
  }
  return null;
}

export function storeCachedBlock(key: string, block: CachedBlock) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(block));
}

export async function fetchBlock(blockIndex: number, address?: string, sortBy?: string): Promise<CachedBlock> {
  const cacheKey = `leaderboard_block_${blockIndex}${address ? `_a${address}` : ''}${sortBy ? `_s${sortBy}` : ''}`;
  const cached = getCachedBlock(cacheKey);
  if (cached) return cached;

  let url = `/api/leaderboard?page=${blockIndex + 1}&limit=${BLOCK_SIZE}`;
  if (address) {
    url += `&player_address=${address}`;
  }
  if (sortBy && (sortBy === 'net_gain' || sortBy === 'total_bets')) {
    url += `&sort_by=${sortBy}`;
  }
  
  console.log(`Fetching leaderboard with URL: ${url}`);
  
  const resp = await fetch(url, {
    // Add cache busting parameter to prevent caching issues
    cache: 'no-cache'
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch leaderboard block");
  }
  const responseData: LeaderboardResponse = await resp.json();
  const block: CachedBlock = {
    ...responseData,
    refreshed_at: Date.now(),
  };
  storeCachedBlock(cacheKey, block);
  return block;
}

export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
};

export const formatTimeSince = (timestamp: number | null | undefined) => {
  if (timestamp === null || timestamp === undefined) {
    return '0 seconds ago';
  }
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}; 