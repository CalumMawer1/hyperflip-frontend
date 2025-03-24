import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080'
const API_KEY = process.env.API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const playerAddress = searchParams.get('player_address');
    const sortBy = searchParams.get('sort_by');
    const forceRefresh = searchParams.has('t') || searchParams.has('_debug');
    
    console.log(`API Route received sort_by: ${sortBy}`);
    
    if (!API_KEY) {
      console.error('API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    let apiUrl = `${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}`;
    if (playerAddress) {
      apiUrl += `&player_address=${playerAddress}`;
    }
    
    if (sortBy && (sortBy === 'net_gain' || sortBy === 'total_bets')) {
      apiUrl += `&sort_by=${sortBy}`;
      console.log(`Adding sort_by=${sortBy} to API URL`);
    }
    
    if (forceRefresh) {
      apiUrl += `&_t=${Date.now()}`;
    }

    console.log(`Calling backend API with URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: forceRefresh ? 'no-store' : 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const responseData = NextResponse.json(data);
    
    // Always set cache control to no-cache to prevent caching issues with sort parameter
    responseData.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseData.headers.set('Pragma', 'no-cache');
    responseData.headers.set('Expires', '0');
    
    return responseData;
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
