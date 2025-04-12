export interface PlayerStats {
  player_address: string;
  wins: number;
  losses: number;
  total_wagered: number;
  net_gain: number;
  win_percentage: number;
  is_user?: boolean;
  rank: number;
}

export type PlayerDataResponse = {
    totalBets: number;
    wins: number;
    losses: number;
    totalProfit: number;
    winPercentage: number;
    totalWagered: number;
    playerRankByNetGain: number;
    playerRankByTotalWagered: number;
    isSuccess: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LeaderboardResponse {
  data: PlayerStats[];
  pagination: PaginationInfo;
}

export interface Leaderboard {
  leaders: PlayerStats[];
  pagination: PaginationInfo;
  refreshed_at: number;
}

export interface CachedBlock extends LeaderboardResponse {
  refreshed_at: number;
} 

export const BLOCK_SIZE = 50;
export const CACHE_EXPIRATION = 20 * 60 * 1000;


type RecordBetReturn = {
    isSuccess: boolean;
}

export async function recordBet(walletAddr: string, amount: number, playerWon: boolean, placedAt: string): Promise<RecordBetReturn> {
    let res: RecordBetReturn = {isSuccess: false};
    try {
        const response = await fetch('/api/bet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_address: walletAddr,
              wager_amount: amount,
              is_win: playerWon,
              placed_at: placedAt
            }),
          });
        if (response.ok) {
            res = {isSuccess: true}
        }
    } catch (error) {
        console.error("Error recording bet:", error);
    }

    return res;
}


export async function fetchBlock(blockIndex: number, address?: string, sortBy?: string): Promise<CachedBlock> {
    const cacheKey = `leaderboard_block_${blockIndex}${address ? `_a${address}` : ''}${sortBy ? `_s${sortBy}` : ''}`;
    const cached = getCachedBlock(cacheKey);
    if (cached) return cached;

    let url = `/api/leaderboard?page=${blockIndex + 1}&limit=${BLOCK_SIZE}`;
    if (address) {
        url += `&player_address=${address}`;
    }
    if (sortBy && (sortBy === 'net_gain' || sortBy === 'total_wagered')) {
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


export async function getUserData(walletAddr: string): Promise<PlayerDataResponse | null>  {
    const url = `/api/user/${walletAddr}`;
        const fetchOptions: RequestInit = { 
            method: 'GET',
            // Add cache-busting header
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            cache: 'no-store'
        };

    const timestampedUrl = `${url}?_t=${Date.now()}`;
    const response = await fetch(timestampedUrl, fetchOptions);

    if (response.ok) {
        const data = await response.json();
        return {...data, isSuccess: true};
    } else {
        return null;
    }
}
