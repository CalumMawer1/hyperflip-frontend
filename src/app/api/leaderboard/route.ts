import { NextResponse } from 'next/server';

// Dummy data for initial state
const initialData = [
  {
    address: '0x5de0c18ad34e2895aa6b7088e4e42305909d409d',
    totalBets: 14,
    totalWagered: 3.3775,
    totalProfit: -2.895,
    wins: 1,
    losses: 13,
    winRate: 7
  },
  {
    address: '0x80dd007cf9f0e7231dbec52e39c28a74a804c69c',
    totalBets: 7,
    totalWagered: 1.68875,
    totalProfit: 1.68875,
    wins: 7,
    losses: 0,
    winRate: 100
  }
];

// Get leaderboard data
export async function GET() {
  try {
    // In production, return the initial data
    // This is just a placeholder - in a real app, you would use a database
    return NextResponse.json(initialData);
  } catch (error) {
    console.error('Error reading leaderboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}

// Update specific player stats
export async function PUT(request: Request) {
  try {
    // Get update data from request
    const { address, betAmount, playerWon } = await request.json();
    console.log('PUT: Received update data:', { address, betAmount, playerWon });
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    
    // In a real app, you would update a database here
    // For now, just return success with the data that was sent
    return NextResponse.json({ 
      success: true, 
      message: 'In production, please use the client-side leaderboard implementation',
      playerData: {
        address,
        betAmount,
        playerWon
      }
    });
  } catch (error) {
    console.error('Error updating player stats:', error);
    return NextResponse.json({ error: 'Failed to update player stats' }, { status: 500 });
  }
} 