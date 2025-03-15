export const CONTRACT_ADDRESS = '0x06AaE6001FB69dC506B919e693d9B510113BE5A8' as const;

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint8", "name": "choice", "type": "uint8" }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "settleBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint8", "name": "choice", "type": "uint8" }
    ],
    "name": "placeFreeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "isWhitelistedForFreeBet",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "hasUsedFreeBet",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllowedBetAmounts",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "hasPendingBet",
    "outputs": [
      { "internalType": "bool", "name": "hasBet", "type": "bool" },
      { "internalType": "uint256", "name": "targetBlock", "type": "uint256" },
      { "internalType": "uint256", "name": "currentBlock", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getBetDetails",
    "outputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "blockNumber", "type": "uint256" },
      { "internalType": "uint256", "name": "placedAt", "type": "uint256" },
      { "internalType": "bool", "name": "isSettled", "type": "bool" },
      { "internalType": "bool", "name": "playerWon", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLeaderboard",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "totalBets", "type": "uint256" },
          { "internalType": "uint256", "name": "wins", "type": "uint256" },
          { "internalType": "uint256", "name": "totalWagered", "type": "uint256" },
          { "internalType": "int256", "name": "totalProfit", "type": "int256" }
        ],
        "internalType": "struct HyperFlip.LeaderboardEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "feePaid", "type": "uint256" }
    ],
    "name": "BetSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "BetRefunded",
    "type": "event"
  }
] as const; 