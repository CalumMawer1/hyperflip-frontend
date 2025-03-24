export interface PlayerStats {
  player_address: string;
  wins: number;
  losses: number;
  total_wagered: number;
  net_gain: number;
  win_percentage: number;
  is_user?: boolean;
  rank_by_net_gain?: number;
  rank_by_total_bets?: number;
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