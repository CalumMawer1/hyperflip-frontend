// Type definitions for contract function return values

/**
 * Return type for getAllowedBetAmounts function
 * An array of allowed bet amounts in wei (raw bigint values)
 */
export type AllowedBetAmounts = readonly bigint[];

/**
 * Return type for hasPendingBet function
 * Contains information about a player's pending bet status
 */
export interface PendingBetStatus {
  /** Whether the player has an active bet waiting to be settled */
  hasBet: boolean;
  /** The blockchain block number when the bet can be settled */
  targetBlock: bigint;
  /** The current blockchain block number */
  currentBlock: bigint;
}

/**
 * Return type for getBetDetails function
 * Contains information about a specific bet
 */
export interface BetDetails {
  /** The amount of the bet in wei */
  amount: bigint;
  /** The block number when the bet was placed */
  blockNumber: bigint;
  /** Timestamp when the bet was placed */
  placedAt: bigint;
  /** Whether the bet has been settled */
  isSettled: boolean;
  /** Whether the player won the bet (only valid if isSettled is true) */
  playerWon: boolean;
}

/**
 * Return type for isWhitelistedForFreeBet function
 * Indicates if the player is eligible for a free bet
 */
export type IsWhitelistedForFreeBet = boolean;

/**
 * Return type for hasUsedFreeBet function
 * Indicates if the player has already used their free bet
 */
export type HasUsedFreeBet = boolean;

/**
 * Type definition for a leaderboard entry struct
 */
export interface LeaderboardEntry {
  /** Player wallet address */
  player: string;
  /** Total number of bets placed */
  totalBets: bigint;
  /** Number of winning bets */
  wins: bigint;
  /** Total amount wagered in wei */
  totalWagered: bigint;
  /** Net profit/loss in wei (can be negative) */
  totalProfit: bigint;
}

/**
 * Return type for getLeaderboard function
 * An array of leaderboard entries
 */
export type Leaderboard = LeaderboardEntry[];

export interface CoinSelectorProps {
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

export type BetHistoryItem = {
  result: 'win' | 'lose';
  amount: number;
  timestamp: number;
  formattedTimestamp: string;
  isFree?: boolean;
  choice: boolean; // false for heads, true for tails
};